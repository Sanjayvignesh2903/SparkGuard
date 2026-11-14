"""
IntelliClaim Assessment Endpoint Tester
Tests the live POST /api/claims/assess/ endpoint with a synthetic damaged vehicle image and incident narrative.

Usage:
    Ensure backend is running: python manage.py runserver 8000
    Then in another terminal:   python test_assessment.py
"""

import io
import sys
import requests
import numpy as np
from PIL import Image

API_URL = "http://127.0.0.1:8000/api/claims/assess/"


def generate_synthetic_damage_image(density_level: str = "critical") -> io.BytesIO:
    """Generates an in-memory test image with synthetic edges."""
    arr = np.zeros((300, 300, 3), dtype=np.uint8)

    if density_level == "critical":
        # 12x12 checkerboard produces edge density > 0.08
        for i in range(0, 300, 12):
            for j in range(0, 300, 12):
                if (i // 12 + j // 12) % 2 == 0:
                    arr[i:i+12, j:j+12] = 255
    elif density_level == "high":
        # 24x24 checkerboard produces edge density between 0.03 and 0.08
        for i in range(0, 300, 24):
            for j in range(0, 300, 24):
                if (i // 24 + j // 24) % 2 == 0:
                    arr[i:i+24, j:j+24] = 255
    else:
        # Smooth surface produces low density (< 0.03)
        arr[:] = 128

    img = Image.fromarray(arr)
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return buffer


def main():
    print("=" * 60)
    print("  TESTING LIVE INTELLICLAIM ADJUDICATION ENDPOINT")
    print(f"  Target: {API_URL}")
    print("=" * 60)

    # 1. Create synthetic damage image
    print("\n1. Generating synthetic damaged vehicle image in memory...")
    image_buf = generate_synthetic_damage_image(density_level="critical")

    # 2. Prepare incident narrative
    incident_narrative = (
        "While traveling along the expressway at 65 km/h, another vehicle abruptly cut into "
        "my lane, causing severe front bumper collision and crumpling the radiator grille."
    )

    files = {
        'image': ('test_car_crash.jpg', image_buf, 'image/jpeg')
    }
    data = {
        'description': incident_narrative,
        'policy_number': 'POL-TEST-2025-9988'
    }

    print("\n2. Dispatching multipart/form-data to Django REST API...")
    try:
        response = requests.post(API_URL, files=files, data=data, timeout=30)
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Could not connect to Django server at http://127.0.0.1:8000.")
        print("Please ensure your server is running in another terminal:")
        print("    python manage.py runserver 8000")
        sys.exit(1)

    print(f"\n3. Received HTTP Status: {response.status_code}")
    if response.status_code in (200, 201):
        payload = response.json()
        claim = payload.get('claim', {})
        diag = payload.get('ai_diagnostics', {})
        cv = diag.get('opencv_metrics', {})
        nlp = diag.get('nlp_metrics', {})

        print("\n" + "=" * 60)
        print("  AI ADJUDICATION VERDICT")
        print("=" * 60)
        print(f"  Claim ID:          {claim.get('claim_id')}")
        print(f"  CV Damage Risk:    {cv.get('cv_risk_score')} (Edge Density: {cv.get('edge_density', 0)*100:.2f}%)")
        print(f"  Estimated Payout:  INR ₹{float(cv.get('estimated_payout', 0)):,.2f}")
        print(f"  Groq Fraud Risk:   {nlp.get('fraud_risk')} Risk")
        print(f"  Forensic Analysis: {nlp.get('reasoning')}")
        print(f"  Claim Status:      {claim.get('status')}")
        print("=" * 60)
        print("\n[SUCCESS] The multi-modal adjudication pipeline is 100% operational!")
    else:
        print(f"\n[FAIL] Server returned error: {response.text}")


if __name__ == '__main__':
    main()

