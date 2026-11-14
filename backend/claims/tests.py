import io
import numpy as np
import cv2
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from PIL import Image

from claims.models import Claim, ClaimStatus, UserRole
from claims.ai_pipeline import process_image_opencv, analyze_description_groq

User = get_user_model()


def generate_test_image(edge_mode: str = 'low') -> io.BytesIO:
    """Creates an in-memory JPEG image with synthetic patterns for test coverage."""
    if edge_mode == 'critical':
        # Dense 12x12 checkerboard produces edge density > 0.08
        arr = np.zeros((300, 300, 3), dtype=np.uint8)
        for i in range(0, 300, 12):
            for j in range(0, 300, 12):
                if (i // 12 + j // 12) % 2 == 0:
                    arr[i:i+12, j:j+12] = 255
    elif edge_mode == 'high':
        # 24x24 checkerboard produces edge density between 0.03 and 0.08
        arr = np.zeros((300, 300, 3), dtype=np.uint8)
        for i in range(0, 300, 24):
            for j in range(0, 300, 24):
                if (i // 24 + j // 24) % 2 == 0:
                    arr[i:i+24, j:j+24] = 255
    else:
        # Plain smooth solid produces low edge density (< 0.03)
        arr = np.ones((300, 300, 3), dtype=np.uint8) * 128

    image = Image.fromarray(arr)
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG')
    buffer.name = 'test_vehicle.jpg'
    buffer.seek(0)
    return buffer


class AIPipelineTestCase(TestCase):
    def test_opencv_low_density_assessment(self):
        buf = generate_test_image('low')
        result = process_image_opencv(buf.read())
        self.assertEqual(result['cv_risk_score'], 'Low')
        self.assertEqual(result['estimated_payout'], 12500.00)
        self.assertLessEqual(result['edge_density'], 0.03)

    def test_opencv_critical_density_assessment(self):
        buf = generate_test_image('critical')
        result = process_image_opencv(buf.read())
        self.assertEqual(result['cv_risk_score'], 'Critical')
        self.assertEqual(result['estimated_payout'], 85000.00)
        self.assertGreater(result['edge_density'], 0.08)

    def test_nlp_fraud_analysis_plausible(self):
        narrative = "I was parked outside the grocery store when a reversing sedan lightly bumped my rear bumper."
        result = analyze_description_groq(narrative, cv_risk="Low", estimated_payout=12500.00)
        self.assertIn(result['fraud_risk'], ['Low', 'Medium', 'High'])
        self.assertTrue(len(result['reasoning']) > 0)


class ClaimAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.policyholder = User.objects.create_user(
            username='test_user',
            password='password123',
            role=UserRole.POLICYHOLDER
        )

    def test_claim_assessment_endpoint(self):
        img_buf = generate_test_image('critical')
        payload = {
            'image': img_buf,
            'description': 'Vehicle suffered heavy structural collision impact against a concrete divider.',
        }
        url = reverse('claim_assess')
        response = self.client.post(url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('claim', response.data)
        self.assertIn('ai_diagnostics', response.data)
        self.assertEqual(response.data['claim']['cv_risk_score'], 'Critical')
        self.assertEqual(float(response.data['claim']['estimated_payout']), 85000.00)
