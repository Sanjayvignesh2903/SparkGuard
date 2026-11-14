# IntelliClaim | Automated Vehicle Claim Adjudication Pipeline

An enterprise multi-modal AI claim adjudication system built with **Django REST Framework (DRF)**, **Neon DB (PostgreSQL)**, **OpenCV Computer Vision**, **Groq Llama 3 8B NLP**, and **React 19 (TypeScript + Tailwind CSS)**.

---

## 🏛️ System Architecture

```
[ Policyholder UI ]               [ Adjuster Command Center ]
       │                                     ▲
       │ Multipart (Image + Narrative)        │ Real-time Adjudication
       ▼                                     │
[ Django REST API Gateway (/api/claims/assess/) ]
       │
       ├──► [ In-Memory OpenCV Pipeline ]
       │     1. Grayscale Conversion
       │     2. Gaussian Blur (7x7, σ=0)
       │     3. Canny Edge Detection (50, 150)
       │     4. Edge Density = Non-Zero Edges / Total Pixels
       │     5. Rule Classification:
       │        • Density > 0.08  ➔ Critical (₹85,000)
       │        • Density > 0.03  ➔ High (₹45,000)
       │        • Density <= 0.03 ➔ Low (₹12,500)
       │
       ├──► [ Groq Cloud Llama 3 8B NLP Pipeline ]
       │     1. Zero-shot prompt cross-referencing CV severity & narrative
       │     2. Physical impossibility & staged collision detection
       │     3. Strict JSON output: {"fraud_risk": "Low"|"Medium"|"High", "reasoning": "..."}
       │
       └──► [ Neon DB PostgreSQL ]
             Atomic persistence of User, Claim, Edge Density, Payout & Status
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & npm
- Free **Neon DB** PostgreSQL instance: [https://neon.tech](https://neon.tech)
- Free **Groq Cloud** API Key: [https://console.groq.com/keys](https://console.groq.com/keys)

---

### 2. Backend Setup (Django & DRF)

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and paste your Neon DB DATABASE_URL and GROQ_API_KEY
```

#### Run Migrations & Seed Demo Accounts:
```bash
python manage.py makemigrations claims
python manage.py migrate

# Seed built-in demo credentials
python manage.py seed_demo_data
```

#### Start Django Development Server:
```bash
python manage.py runserver 8000
```
Backend API will be live at `http://127.0.0.1:8000/api/`

---

### 3. Frontend Setup (React 19, Vite, Tailwind CSS)

```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
Frontend Portal will be live at `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Username | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Claims Adjuster** | `adjuster_raj` | `Adjuster@123` | Inspect all claims, CV edge analytics, Approve/Reject claims, KPI overview |
| **Policyholder** | `policyholder_priya` | `Claim@123` | File vehicle claim with dropzone, instant multi-modal assessment modal, claims history |

*Note: The login screen also features 1-click demo buttons for instant access.*

---

## ⚙️ Core Configuration (`backend/intelliclaim/settings.py`)

- **Database:** Uses `dj-database-url` to dynamically parse PostgreSQL connection strings from Neon DB with SSL enforcement (`sslmode=require`). Falls back to SQLite for instant local debugging if `DATABASE_URL` is unset.
- **CORS:** Configured with `django-cors-headers` to support Vite (`http://localhost:5173`).
- **Auth:** `rest_framework_simplejwt` with `UserRole` (`POLICYHOLDER` vs `ADJUSTER`).
- **Media Uploads:** Multi-part images stored in `media/claims/%Y/%m/%d/`.

---

## 🔬 Multi-Modal AI Logic

### 1. OpenCV Contour & Edge Density Pipeline (`claims/ai_pipeline.py`)
```python
# Grayscale -> Gaussian Blur (7x7) -> Canny (50, 150)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (7, 7), 0)
edges = cv2.Canny(blurred, 50, 150)

# Edge Density Calculation
edge_density = float(np.count_nonzero(edges) / edges.size)

# Adjudication Rules
if edge_density > 0.08:
    cv_risk_score = 'Critical'
    estimated_payout = 85000.00
elif edge_density > 0.03:
    cv_risk_score = 'High'
    estimated_payout = 45000.00
else:
    cv_risk_score = 'Low'
    estimated_payout = 12500.00
```

### 2. Groq Llama 3 8B NLP Fraud Verification
- Zero-shot prompt detecting temporal contradictions, impossible impact physics, unwitnessed phantom collisions, or staged damage.
- Enforced JSON response schema:
```json
{
  "fraud_risk": "Low" | "Medium" | "High",
  "reasoning": "Forensic analysis narrative..."
}
```
- Includes fallback heuristics if `GROQ_API_KEY` is not configured, guaranteeing 100% server uptime.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Returns JWT tokens (`access`, `refresh`) and user role |
| `POST` | `/api/auth/register/` | Register new policyholder or adjuster |
| `GET` | `/api/auth/me/` | Current user profile |
| `POST` | `/api/claims/assess/` | **Core AI Endpoint:** Multipart form (`image` + `description`), runs OpenCV + Groq, records claim |
| `GET` | `/api/claims/` | List claims (Adjuster sees all; Policyholder sees own) |
| `GET` | `/api/claims/<id>/` | Detailed claim diagnostics and edge metrics |
| `PATCH` | `/api/claims/<id>/status/` | Adjuster adjudicates claim (`APPROVED`, `REJECTED`, `UNDER_REVIEW`) |
| `GET` | `/api/health/` | Service health and DB connection check |

