from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Claim


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'policy_number', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('IntelliClaim Roles & Policy Details', {
            'fields': ('role', 'phone_number', 'policy_number')
        }),
    )


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        'claim_id',
        'user',
        'cv_risk_score',
        'edge_density',
        'estimated_payout',
        'nlp_fraud_risk',
        'status',
        'created_at'
    )
    list_filter = ('status', 'cv_risk_score', 'nlp_fraud_risk', 'created_at')
    search_fields = ('claim_id', 'user__username', 'description', 'nlp_reasoning')
    readonly_fields = (
        'claim_id',
        'cv_risk_score',
        'edge_density',
        'estimated_payout',
        'nlp_fraud_risk',
        'nlp_reasoning',
        'created_at',
        'updated_at'
    )

