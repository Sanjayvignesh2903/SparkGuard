import os
import io
import numpy as np
from PIL import Image
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.conf import settings
from claims.models import Claim, ClaimStatus, CVRiskScore, NLPFraudRisk, UserRole

User = get_user_model()


def generate_synthetic_damage_image(pattern: str) -> ContentFile:
    """Generates synthetic damage imagery with contours for demo visual inspection."""
    arr = np.zeros((360, 480, 3), dtype=np.uint8)

    if pattern == 'critical':
        # Simulate heavy crumpling: alternating high contrast edge blocks
        for i in range(0, 360, 12):
            for j in range(0, 480, 12):
                if (i // 12 + j // 12) % 2 == 0:
                    arr[i:i+12, j:j+12] = [210, 220, 235]
                else:
                    arr[i:i+12, j:j+12] = [40, 45, 60]
    elif pattern == 'high':
        # Simulate medium structural fracture
        for i in range(0, 360, 24):
            for j in range(0, 480, 24):
                if (i // 24 + j // 24) % 2 == 0:
                    arr[i:i+24, j:j+24] = [180, 190, 200]
                else:
                    arr[i:i+24, j:j+24] = [50, 60, 70]
    else:
        # Simulate smooth surface with faint scratch line
        arr[:] = [80, 85, 95]
        for x in range(50, 400):
            y = int(180 + 20 * np.sin(x / 30))
            if 0 <= y < 360:
                arr[y:y+3, x] = [240, 240, 250]

    img = Image.fromarray(arr)
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=90)
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"demo_damage_{pattern}.jpg")


class Command(BaseCommand):
    help = "Seeds initial demo users and baseline claims for IntelliClaim demonstration"

    def handle(self, *args, **options):
        # 1. Adjuster Account
        adjuster, _ = User.objects.get_or_create(
            username='adjuster_raj',
            defaults={
                'email': 'raj.adjuster@intelliclaim.ai',
                'first_name': 'Rajesh',
                'last_name': 'Verma',
                'role': UserRole.ADJUSTER,
                'is_staff': True,
            }
        )
        adjuster.set_password('Adjuster@123')
        adjuster.role = UserRole.ADJUSTER
        adjuster.save()

        # 2. Policyholder Priya
        priya, _ = User.objects.get_or_create(
            username='policyholder_priya',
            defaults={
                'email': 'priya.sharma@gmail.com',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': UserRole.POLICYHOLDER,
                'policy_number': 'POL-DL-2025-44910',
                'phone_number': '+91 98765 43210',
            }
        )
        priya.set_password('Claim@123')
        priya.role = UserRole.POLICYHOLDER
        priya.save()

        # 3. Policyholder Arjun
        arjun, _ = User.objects.get_or_create(
            username='policyholder_arjun',
            defaults={
                'email': 'arjun.mehta@gmail.com',
                'first_name': 'Arjun',
                'last_name': 'Mehta',
                'role': UserRole.POLICYHOLDER,
                'policy_number': 'POL-MH-2025-91823',
                'phone_number': '+91 98112 34567',
            }
        )
        arjun.set_password('Claim@123')
        arjun.role = UserRole.POLICYHOLDER
        arjun.save()

        # 4. Seed Representative Pre-Calculated Vehicle Claims
        demo_claims = [
            {
                'claim_id': 'CLM-2025-001',
                'user': priya,
                'description': 'High-speed collision along expressway concrete divider. Severe structural distortion across front bumper, crumpled radiator grille, and deployed airbag support.',
                'pattern': 'critical',
                'cv_risk_score': CVRiskScore.CRITICAL,
                'edge_density': 0.1344,
                'estimated_payout': 85000.00,
                'nlp_fraud_risk': NLPFraudRisk.LOW,
                'nlp_reasoning': 'Physical impact kinematics align with expressway divider barrier dynamics. No narrative or temporal contradictions detected.',
                'status': ClaimStatus.PENDING,
            },
            {
                'claim_id': 'CLM-2025-002',
                'user': arjun,
                'description': 'Reversing into basement garage at 10 km/h impacted rear support pillar. Rear quarter panel bent and taillight shattered.',
                'pattern': 'high',
                'cv_risk_score': CVRiskScore.HIGH,
                'edge_density': 0.0482,
                'estimated_payout': 45000.00,
                'nlp_fraud_risk': NLPFraudRisk.LOW,
                'nlp_reasoning': 'Low-speed reverse impact pattern is consistent with reported localized damage on rear panel.',
                'status': ClaimStatus.APPROVED,
            },
            {
                'claim_id': 'CLM-2025-003',
                'user': arjun,
                'description': 'Unattended car left at midnight in deserted lot was found completely totaled in mysterious fire, requesting immediate cash settlement without inspection.',
                'pattern': 'low',
                'cv_risk_score': CVRiskScore.LOW,
                'edge_density': 0.0125,
                'estimated_payout': 12500.00,
                'nlp_fraud_risk': NLPFraudRisk.HIGH,
                'nlp_reasoning': 'High anomaly flag: Unwitnessed abandonment scenario, temporal discrepancy, and payout demand with severe narrative/image mismatch.',
                'status': ClaimStatus.REJECTED,
                'adjuster_notes': 'Claim rejected by senior audit team due to flagged staging hallmarks and missing FIR report.',
            },
            {
                'claim_id': 'CLM-2025-004',
                'user': priya,
                'description': 'Stationary vehicle lightly grazed by a passing two-wheeler handle while waiting at traffic signal. Minor clear coat scrape on passenger door.',
                'pattern': 'low',
                'cv_risk_score': CVRiskScore.LOW,
                'edge_density': 0.0085,
                'estimated_payout': 12500.00,
                'nlp_fraud_risk': NLPFraudRisk.LOW,
                'nlp_reasoning': 'Superficial scrape narrative matches minimal edge count metrics. Plausible city traffic occurrence.',
                'status': ClaimStatus.UNDER_REVIEW,
                'adjuster_notes': 'Awaiting physical paint-depth gauge verification from authorized service station.',
            },
        ]

        for item in demo_claims:
            pattern = item.pop('pattern')
            claim_id = item['claim_id']
            if not Claim.objects.filter(claim_id=claim_id).exists():
                claim = Claim(**item)
                claim.image.save(f"{claim_id.lower()}_damage.jpg", generate_synthetic_damage_image(pattern), save=True)

        self.stdout.write(self.style.SUCCESS(
            "Successfully seeded demo database:\n"
            "  • Adjuster Account:     Username: 'adjuster_raj'       | Password: 'Adjuster@123'\n"
            "  • Policyholder Priya:   Username: 'policyholder_priya' | Password: 'Claim@123'\n"
            "  • Policyholder Arjun:   Username: 'policyholder_arjun' | Password: 'Claim@123'\n"
            "  • 4 Sample Pre-Evaluated Multi-Modal Claims loaded with synthetic damage contours!"
        ))
