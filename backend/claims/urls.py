from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ClaimAssessView,
    ClaimListView,
    ClaimDetailView,
    ClaimStatusUpdateView,
    CustomTokenObtainPairView,
    RegisterView,
    CurrentUserView,
    HealthCheckView,
)

urlpatterns = [
    # Authentication Endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),

    # Claim Assessment & Management Endpoints
    path('claims/assess/', ClaimAssessView.as_view(), name='claim_assess'),
    path('claims/', ClaimListView.as_view(), name='claim_list'),
    path('claims/<int:id>/', ClaimDetailView.as_view(), name='claim_detail'),
    path('claims/<int:id>/status/', ClaimStatusUpdateView.as_view(), name='claim_update_status'),

    # Diagnostics
    path('health/', HealthCheckView.as_view(), name='health_check'),
]

