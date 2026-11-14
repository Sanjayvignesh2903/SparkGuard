import logging
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Claim, ClaimStatus, UserRole
from .serializers import (
    ClaimSerializer,
    ClaimAssessInputSerializer,
    ClaimStatusUpdateSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    RegisterSerializer,
)
from .ai_pipeline import process_image_opencv, analyze_description_groq

logger = logging.getLogger(__name__)
User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Returns JWT access & refresh tokens along with user profile and role.
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Registers a new Policyholder or Adjuster.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Returns current authenticated user profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ClaimAssessView(APIView):
    """
    POST /api/claims/assess/
    Multi-modal AI Adjudication Endpoint.
    
    Accepts multipart/form-data containing:
      - 'image': Vehicle damage photograph
      - 'description': Textual narrative of the accident
      - 'policy_number' (optional)
      
    Pipeline:
      1. OpenCV: In-memory image processing -> Grayscale -> Gaussian Blur (7x7) ->
                 Canny (50, 150) -> Edge density calculation -> Damage severity & repair payout.
      2. Groq LLM: Zero-shot prompt with Llama 3 8B -> Fraud anomaly detection & reasoning.
      3. Persistence: Atomically saves claim record in PostgreSQL database.
      4. Response: Returns complete multi-modal assessment payload.
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]  # Allows authenticated users or demo guest submissions

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = ClaimAssessInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        image_file = validated_data['image']
        description = validated_data['description']

        # Determine user context (Authenticated or Demo Policyholder fallback)
        if request.user and request.user.is_authenticated:
            claim_user = request.user
        else:
            # Create or get demo policyholder user for convenience in tests/evaluations
            claim_user, _ = User.objects.get_or_create(
                username='demo_policyholder',
                defaults={
                    'email': 'policyholder@intelliclaim.ai',
                    'role': UserRole.POLICYHOLDER,
                    'first_name': 'Demo',
                    'last_name': 'Policyholder',
                    'policy_number': 'POL-IND-884920'
                }
            )

        try:
            # 1. OpenCV In-Memory Pipeline
            image_file.seek(0)
            image_bytes = image_file.read()
            cv_results = process_image_opencv(image_bytes)

            cv_risk_score = cv_results.get('cv_risk_score', 'Low')
            estimated_payout = cv_results.get('estimated_payout', 12500.00)
            edge_density = cv_results.get('edge_density', 0.0)

            # 2. Groq Llama 3 NLP Fraud Detection Pipeline
            nlp_results = analyze_description_groq(
                description=description,
                cv_risk=cv_risk_score,
                estimated_payout=estimated_payout
            )

            nlp_fraud_risk = nlp_results.get('fraud_risk', 'Low')
            nlp_reasoning = nlp_results.get('reasoning', '')

            # 3. Save Claim into PostgreSQL database
            image_file.seek(0)
            claim = Claim.objects.create(
                user=claim_user,
                description=description,
                image=image_file,
                cv_risk_score=cv_risk_score,
                edge_density=edge_density,
                estimated_payout=estimated_payout,
                nlp_fraud_risk=nlp_fraud_risk,
                nlp_reasoning=nlp_reasoning,
                status=ClaimStatus.PENDING,
            )

            output_serializer = ClaimSerializer(claim, context={'request': request})

            return Response({
                "message": "Claim successfully assessed and registered into adjudication pipeline.",
                "claim": output_serializer.data,
                "ai_diagnostics": {
                    "opencv_metrics": {
                        "cv_risk_score": cv_risk_score,
                        "edge_density": edge_density,
                        "estimated_payout": estimated_payout,
                        "raw_edge_count": cv_results.get('raw_edge_count'),
                        "total_pixels": cv_results.get('total_pixels'),
                    },
                    "nlp_metrics": {
                        "fraud_risk": nlp_fraud_risk,
                        "reasoning": nlp_reasoning,
                        "model": getattr(settings, 'GROQ_MODEL', 'llama3-8b-8192')
                    }
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as exc:
            logger.error(f"Adjudication pipeline error: {exc}", exc_info=True)
            return Response(
                {"error": "Failed to complete AI adjudication.", "details": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ClaimListView(generics.ListAPIView):
    """
    GET /api/claims/
    Returns list of claims.
    - Adjusters and Admins see all claims.
    - Policyholders see only their own claims.
    """
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_adjuster:
            return Claim.objects.all().select_related('user')
        return Claim.objects.filter(user=user).select_related('user')


class ClaimDetailView(generics.RetrieveAPIView):
    """
    GET /api/claims/<id>/
    Fetches full metadata and AI breakdown of a specific claim.
    """
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_adjuster:
            return Claim.objects.all()
        return Claim.objects.filter(user=user)


class ClaimStatusUpdateView(APIView):
    """
    PATCH /api/claims/<id>/status/
    Allows an Adjuster to adjudicate a claim (Approve, Reject, Under Review)
    and append optional notes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        if not request.user.is_adjuster:
            return Response(
                {"error": "Permission denied. Only claims adjusters can update claim status."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            claim = Claim.objects.get(id=id)
        except Claim.DoesNotExist:
            return Response({"error": "Claim not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClaimStatusUpdateSerializer(claim, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": f"Claim status updated to '{claim.status}'.",
                "claim": ClaimSerializer(claim, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HealthCheckView(APIView):
    """
    GET /api/health/
    System diagnostics checking database connectivity and AI service readiness.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db import connection
        db_ok = True
        db_error = None
        try:
            connection.ensure_connection()
        except Exception as e:
            db_ok = False
            db_error = str(e)

        payload = {
            "status": "online",
            "service": "IntelliClaim AI Adjudication Engine",
            "database_connected": db_ok,
            "groq_configured": bool(getattr(settings, 'GROQ_API_KEY', False)),
        }
        if db_error:
            payload["database_error"] = db_error

        return Response(payload)

