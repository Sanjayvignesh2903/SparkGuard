from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Claim, ClaimStatus, CVRiskScore, NLPFraudRisk, UserRole

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'policy_number']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'phone_number', 'policy_number']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', UserRole.POLICYHOLDER),
            phone_number=validated_data.get('phone_number', ''),
            policy_number=validated_data.get('policy_number', ''),
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that injects user metadata (role, username, email)
    into both token payload and the direct login response body.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'policy_number': self.user.policy_number,
        }
        return data


class ClaimSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Claim
        fields = [
            'id',
            'claim_id',
            'user',
            'user_details',
            'description',
            'image',
            'image_url',
            'cv_risk_score',
            'edge_density',
            'estimated_payout',
            'nlp_fraud_risk',
            'nlp_reasoning',
            'status',
            'adjuster_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'claim_id',
            'user',
            'cv_risk_score',
            'edge_density',
            'estimated_payout',
            'nlp_fraud_risk',
            'nlp_reasoning',
            'created_at',
            'updated_at',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ClaimAssessInputSerializer(serializers.Serializer):
    """
    Validates multipart/form-data received by /api/claims/assess/
    """
    description = serializers.CharField(
        required=True,
        min_length=10,
        error_messages={'min_length': 'Please describe the incident in at least 10 characters.'}
    )
    image = serializers.ImageField(required=True)
    policy_number = serializers.CharField(required=False, allow_blank=True, max_length=64)


class ClaimStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['status', 'adjuster_notes']

    def validate_status(self, value):
        if value not in ClaimStatus.values:
            raise serializers.ValidationError(f"Invalid status '{value}'. Allowed: {ClaimStatus.values}")
        return value

