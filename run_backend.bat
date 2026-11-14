@echo off
echo ========================================================
echo   IntelliClaim Backend Service Runner
echo   Django REST Framework + Neon DB / SQLite + OpenCV + Groq
echo ========================================================

cd /d "%~dp0backend"

REM Check for virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Installing Python requirements...
pip install -r requirements.txt

echo Running Database Migrations...
python manage.py makemigrations claims
python manage.py migrate

echo Seeding Demo Users & Sample Multi-Modal Claims...
python manage.py seed_demo_data

echo.
echo ========================================================
echo   Backend is live at: http://127.0.0.1:8000/api/
echo   Admin Panel at:    http://127.0.0.1:8000/admin/
echo ========================================================
python manage.py runserver 8000

