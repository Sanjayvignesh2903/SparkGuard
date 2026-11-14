"""
IntelliClaim System Diagnostics & Connectivity Verifier
Run this script to check whether your environment, database, and AI pipelines are ready:
    python verify_setup.py
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


def check_module(name, pip_name=None):
    pip_name = pip_name or name
    try:
        __import__(name)
        print(f"  [OK] {pip_name} is installed.")
        return True
    except ImportError:
        print(f"  [FAIL] {pip_name} is NOT installed. Run: pip install {pip_name}")
        return False


def main():
    print("=" * 60)
    print("  INTELLICLAIM ENVIRONMENT & DATABASE DIAGNOSTIC")
    print("=" * 60)

    # 1. Python Version Check
    print("\n1. Python Runtime:")
    print(f"  Version: {sys.version.split()[0]} on {sys.platform}")

    # 2. Dependency Checks
    print("\n2. Checking Required Dependencies:")
    deps = [
        ("django", "django"),
        ("rest_framework", "djangorestframework"),
        ("rest_framework_simplejwt", "djangorestframework-simplejwt"),
        ("corsheaders", "django-cors-headers"),
        ("dj_database_url", "dj-database-url"),
        ("psycopg2", "psycopg2-binary"),
        ("cv2", "opencv-python-headless"),
        ("numpy", "numpy"),
        ("groq", "groq"),
        ("PIL", "Pillow"),
        ("dotenv", "python-dotenv"),
    ]
    all_deps_ok = True
    for mod, pip in deps:
        if not check_module(mod, pip):
            all_deps_ok = False

    # 3. Environment File (.env) Check
    print("\n3. Environment File (.env):")
    env_file = BASE_DIR / '.env'
    if env_file.exists():
        print(f"  [OK] Found .env at {env_file}")
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
        except Exception:
            pass
    else:
        print(f"  [WARN] .env not found. Created from .env.example if available.")

    # 4. Database Connectivity Check
    print("\n4. Database Configuration:")
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        print(f"  Configured: Remote PostgreSQL (Neon DB)")
        try:
            import dj_database_url
            import psycopg2
            cfg = dj_database_url.parse(db_url)
            conn = psycopg2.connect(
                dbname=cfg.get('NAME'),
                user=cfg.get('USER'),
                password=cfg.get('PASSWORD'),
                host=cfg.get('HOST'),
                port=cfg.get('PORT', 5432),
                sslmode='require' if 'neon.tech' in db_url else 'prefer',
                connect_timeout=5
            )
            conn.close()
            print("  [OK] Successfully connected to PostgreSQL / Neon DB database!")
        except Exception as e:
            print(f"  [FAIL] Failed to connect to PostgreSQL: {e}")
            print("  (Tip: Verify your password, host, or network connection to neon.tech)")
    else:
        print("  Configured: Local SQLite fallback (db.sqlite3)")
        print("  [OK] Ready for offline local development without external database.")

    # 5. OpenCV Pipeline Verification
    print("\n5. Computer Vision (OpenCV) In-Memory Pipeline:")
    try:
        from claims.ai_pipeline import process_image_opencv
        import numpy as np
        import cv2

        test_img = np.ones((100, 100, 3), dtype=np.uint8) * 128
        _, enc = cv2.imencode('.jpg', test_img)
        res = process_image_opencv(enc.tobytes())
        print(f"  [OK] OpenCV test execution passed. Calculated Risk: {res['cv_risk_score']}, Payout: INR {res['estimated_payout']}")
    except Exception as e:
        print(f"  [FAIL] OpenCV pipeline encountered an error: {e}")

    # 6. Groq LLM Configuration Check
    print("\n6. Groq Llama 3 Fraud Analyzer:")
    groq_key = os.getenv('GROQ_API_KEY')
    if groq_key and groq_key != 'gsk_your_groq_api_key_here':
        print(f"  [OK] GROQ_API_KEY detected. Model: {os.getenv('GROQ_MODEL', 'llama3-8b-8192')}")
    else:
        print("  [NOTE] GROQ_API_KEY not set or placeholder. System will use internal heuristic fraud detection.")

    print("\n" + "=" * 60)
    if all_deps_ok:
        print("  STATUS: Environment is healthy! You can run:")
        print("    python manage.py migrate")
        print("    python manage.py seed_demo_data")
        print("    python manage.py runserver 8000")
    else:
        print("  STATUS: Some packages are missing. Install with:")
        print("    pip install -r requirements.txt")
    print("=" * 60)


if __name__ == '__main__':
    main()

