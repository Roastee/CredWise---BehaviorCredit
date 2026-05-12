# BehaviorCredit 🇮🇳
### AI-Powered Alternative Credit Scoring for 190M Credit-Invisible Indians
CiperX

---

## 🚀 Quick Start (2 minutes)

### Prerequisites
- Node.js 18+ · Python 3.11+ · Git

### Clone & Run
```bash
git clone https://github.com/your-org/behaviorcredit.git
cd behaviorcredit

# Terminal 1 — Frontend
cd frontend && npm install --legacy-peer-deps && npm start
# → http://localhost:3000

# Terminal 2 — Backend API
cd backend && npm install && node server.js
# → http://localhost:5000

# Terminal 3 — AI Scoring Engine (optional)
cd scoring-engine && pip install -r requirements.txt && python main.py
# → http://localhost:8000/docs
```

### Or — One-Click Launch
```bash
# Windows
./start-all.bat
```

---

## 🏗️ Architecture

```
behaviorcredit/
├── frontend/          React 18 + Tailwind CSS + react-i18next
│   ├── src/
│   │   ├── pages/     LandingPage · Dashboard · ChatBot · ScoreEngine · NBFCPortal · Onboarding
│   │   ├── components/Navbar · ScoreGauge
│   │   ├── i18n.js    7 languages: EN · HI · TA · TE · BN · MR · KN
│   │   └── firebase.js Firebase Auth + Realtime DB
│   └── .env           See .env.example
│
├── backend/           Node.js + Express API Gateway
│   ├── server.js      8-signal scoring engine + REST API + MongoDB
│   └── .env           MONGODB_URI · GEMINI_API_KEY · PORT
│
└── scoring-engine/    Python 3.11 + FastAPI
    └── main.py        47-signal model · Gemini explainer · Bulk scoring
```

---

## 🔑 Environment Variables

### `frontend/.env`
```bash
# Firebase — https://console.firebase.google.com
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=000000000000
REACT_APP_FIREBASE_APP_ID=1:000:web:abc123

# Gemini Pro AI — https://aistudio.google.com/apikey (FREE)
REACT_APP_GEMINI_API_KEY=your_gemini_key

REACT_APP_API_URL=http://localhost:5000
```

### `backend/.env`
```bash
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/credwise
GEMINI_API_KEY=your_gemini_key
```

### `scoring-engine/.env`
```bash
GEMINI_API_KEY=your_gemini_key
PORT=8000
```

---

## 📡 API Reference

| Method | Endpoint | Description | Response time |
|--------|----------|-------------|---------------|
| `POST` | `/api/v2/score` | Score single applicant (8 signals) | < 800ms |
| `POST` | `/api/v2/bulk-score` | Batch score up to 500 applicants | < 3s |
| `GET`  | `/api/v2/nbfc/score/:id` | NBFC lookup by user ID | < 200ms |
| `POST` | `/api/v2/consent` | Issue DPDPA consent token | < 50ms |
| `GET`  | `/api/v2/nbfc/applicants` | List partner applicants | < 100ms |
| `GET`  | `/api/health` | Service health check | < 10ms |

### Example: Score API
```bash
curl -X POST http://localhost:5000/api/v2/score \
  -H "Content-Type: application/json" \
  -d '{
    "consent_token": "ct_demo123",
    "occupation": "Gig Worker",
    "monthly_income": 18000,
    "signals": {
      "upiMonths": 18,
      "billsOnTime": "Always",
      "shgMonths": 0,
      "merchantDiversity": "High",
      "gigPlatform": "Ola",
      "gigTenure": 14,
      "appSessions": 10,
      "electricityStreak": 12
    }
  }'
```

### Response
```json
{
  "behavior_score": 718,
  "grade": "B+",
  "credit_band": "Near-Prime",
  "risk_band": "Low",
  "max_eligible_loan": 80000,
  "best_rate": 14.5,
  "recommendation": "PRE_APPROVE",
  "recommended_products": ["Micro Business Loan", "Two-Wheeler Loan"],
  "explanation_en": "Ramesh demonstrates strong UPI payment discipline...",
  "explanation_hi": "रमेश का UPI भुगतान इतिहास मजबूत है..."
}
```

---

## 👥 3 Demo Personas

| Persona | Language | Score | Journey |
|---------|----------|-------|---------|
| **Ramesh Kumar** (Auto Driver, Pune) | Hindi | 718 | Gig worker, 18mo UPI, no SHG → Pre-Approved ₹80K |
| **Priya Lakshmi** (Freelance Tailor, Chennai) | English/Tamil | 762 | SHG 4yr, always pays bills → Approved ₹1.2L |
| **Meena Devi** (Vegetable Vendor, Jaipur) | Kannada | 681 | Improving score → 3 NBFC offers unlocked |

---

## 🧠 BehaviorScore™ Algorithm

```
Score = 300 + Σ(signal_i × weight_i) → normalized to [300, 900]

8 Signals:
  Signal 1: UPI Frequency & Consistency     (25%)
  Signal 2: Utility Bill Payment             (18%)
  Signal 3: SHG Participation               (15%)
  Signal 4: Gig Platform Tenure             (10%)
  Signal 5: E-commerce EMI Behavior         ( 8%)
  Signal 6: Rental Payment Proxy            ( 8%)
  Signal 7: App Usage Regularity            ( 8%)
  Signal 8: Mobile Recharge Patterns        ( 8%)
```

---

## 🌐 7 Languages Supported

| Language | Code | Greeting |
|----------|------|---------|
| English  | `en` | Hello! |
| Hindi    | `hi` | नमस्ते! |
| Tamil    | `ta` | வணக்கம்! |
| Telugu   | `te` | నమస్కారం! |
| Bengali  | `bn` | নমস্কার! |
| Marathi  | `mr` | नमस्कार! |
| Kannada  | `kn` | ನಮಸ್ಕಾರ! |

---

## 🌱 SDG Impact

| Goal | How |
|------|-----|
| **SDG 1** No Poverty | Credit for ₹3,000/month earners |
| **SDG 8** Decent Work | Gig workers, daily wage scored fairly |
| **SDG 10** Reduced Inequality | No bank account needed |

**Market:** $4.2B alternative credit scoring market · **Target:** 190M credit-invisible Indians

---

## 🏆 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS 3, react-i18next |
| Backend | Node.js, Express, MongoDB Atlas, Mongoose |
| AI Engine | Python 3.11, FastAPI, Pydantic, Gemini Pro |
| Auth | Firebase Auth (Google + Phone OTP) |
| DB | Firebase Realtime DB (live) + MongoDB Atlas (history) |
| AI/LLM | Google Gemini Pro (streaming + explainer) |

---


