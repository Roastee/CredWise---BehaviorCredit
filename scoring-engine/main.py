"""
BehaviorCredit Scoring Engine v2.1 — FastAPI
8-Signal AI scoring model → 300-900 BehaviorScore™
Team AntiGravity #108 | AAVISHKAR PRAVAH 2.0
Target: < 800ms response time
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import uuid, math, json, asyncio, os

# ── Optional: Google Generative AI for explainer ─────────────
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
try:
    import google.generativeai as genai
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        gemini_model = genai.GenerativeModel("gemini-pro")
    else:
        gemini_model = None
except ImportError:
    gemini_model = None

app = FastAPI(
    title="BehaviorCredit Scoring Engine",
    description="8-signal AI alternative credit scoring for 190M credit-invisible Indians",
    version="2.1.0",
)

app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ══════════════════════════════════════════════════════════════
# SIGNAL MODELS
# ══════════════════════════════════════════════════════════════

class UPISignal(BaseModel):
    months_active:       int   = Field(0, ge=0, le=120, description="Months with active UPI transactions")
    avg_monthly_txns:    int   = Field(0, ge=0, description="Average monthly UPI transaction count")
    merchant_diversity:  str   = Field("Low", description="High/Medium/Low")
    payment_failure_pct: float = Field(0.05, ge=0, le=1, description="Fraction of failed UPI payments")

class BillSignal(BaseModel):
    electricity_streak:  int = Field(0, ge=0, description="Months electricity paid on time consecutively")
    water_on_time_pct:   float = Field(0.5, ge=0, le=1)
    mobile_recharge_reg: str = Field("Irregular", description="Regular/Occasional/Irregular")

class RechargeSignal(BaseModel):
    monthly_recharge_amt: float = Field(0, ge=0, description="Average monthly mobile recharge spend in ₹")
    recharge_gap_days:    int   = Field(30, ge=0, description="Average gap between recharges in days")
    data_pack_upgrade:    bool  = Field(False, description="Has upgraded data plan in last 6 months")

class EcommerceSignal(BaseModel):
    emi_payments_on_time: str = Field("None", description="Always/Usually/Sometimes/Never/None")
    bnpl_usage:           bool  = Field(False, description="Uses Buy Now Pay Later")
    bnpl_repaid:          bool  = Field(False, description="Has repaid BNPL on time")

class RentalSignal(BaseModel):
    rent_payment_streak: int  = Field(0, ge=0, description="Consecutive months rent paid on time")
    rent_method:         str  = Field("Cash", description="UPI/Bank/Cash")
    has_rental_agreement: bool = Field(False)

class SHGSignal(BaseModel):
    months_member:        int   = Field(0, ge=0, le=120)
    savings_consistency:  str   = Field("Irregular", description="Regular/Occasional/Irregular")
    attendance_pct:       float = Field(0, ge=0, le=1)
    leadership_role:      bool  = Field(False)

class GigSignal(BaseModel):
    platform:             str = Field("None", description="Ola/Uber/Swiggy/Zomato/Dunzo/None")
    tenure_months:        int = Field(0, ge=0)
    rating:               float = Field(0, ge=0, le=5)
    completion_rate:      float = Field(0, ge=0, le=1)

class AppUsageSignal(BaseModel):
    banking_app_sessions_monthly: int   = Field(0, ge=0)
    fintech_apps_count:           int   = Field(0, ge=0)
    upi_app_active_days_monthly:  int   = Field(0, ge=0, le=31)
    consistent_usage_streak_months: int = Field(0, ge=0)

class AllSignals(BaseModel):
    upi:       UPISignal       = UPISignal()
    bills:     BillSignal      = BillSignal()
    recharge:  RechargeSignal  = RechargeSignal()
    ecommerce: EcommerceSignal = EcommerceSignal()
    rental:    RentalSignal    = RentalSignal()
    shg:       SHGSignal       = SHGSignal()
    gig:       GigSignal       = GigSignal()
    app_usage: AppUsageSignal  = AppUsageSignal()

class ScoreRequest(BaseModel):
    applicant_id:  Optional[str] = None
    consent_token: str
    signals:       AllSignals
    occupation:    str   = "Other"
    monthly_income: float = 0
    language:      str   = "en"

class ExplainRequest(BaseModel):
    score:     int
    breakdown: Dict[str, Any]
    language:  str = "en"
    name:      str = "User"
    occupation: str = "Worker"


# ══════════════════════════════════════════════════════════════
# 8-SIGNAL SCORING ENGINE
# Weights: UPI 25% | Bills 18% | Recharge 8% | Ecom 8%
#          Rental 8% | SHG 15% | Gig 10% | App 8%
# ══════════════════════════════════════════════════════════════

def score_upi(s: UPISignal) -> float:
    """Signal 1: UPI Frequency & Consistency (max 225)"""
    # Tenure score
    tenure = min(100, s.months_active * 4.5) if s.months_active <= 22 else 100
    # Volume score
    vol = min(60, s.avg_monthly_txns * 1.2)
    # Diversity
    div = {"High": 40, "Medium": 25, "Low": 10}.get(s.merchant_diversity, 10)
    # Reliability (penalize failures)
    reliability = max(0, 25 * (1 - s.payment_failure_pct * 4))
    return min(225, tenure + vol + div + reliability)

def score_bills(s: BillSignal) -> float:
    """Signal 2: Bill Payment Consistency (max 162)"""
    elec  = min(80, s.electricity_streak * 3.2)
    water = min(50, s.water_on_time_pct * 50)
    mob   = {"Regular": 32, "Occasional": 18, "Irregular": 0}.get(s.mobile_recharge_reg, 0)
    return min(162, elec + water + mob)

def score_recharge(s: RechargeSignal) -> float:
    """Signal 3: Recharge Patterns (max 72)"""
    amt_score = min(30, s.monthly_recharge_amt / 10) if s.monthly_recharge_amt <= 300 else 30
    gap_score = max(0, 30 - s.recharge_gap_days)  # shorter gap = better
    upgrade   = 12 if s.data_pack_upgrade else 0
    return min(72, amt_score + gap_score + upgrade)

def score_ecommerce(s: EcommerceSignal) -> float:
    """Signal 4: E-commerce EMI behavior (max 72)"""
    emi = {"Always": 50, "Usually": 35, "Sometimes": 15, "Never": -10, "None": 10}.get(s.emi_payments_on_time, 0)
    bnpl = 22 if (s.bnpl_usage and s.bnpl_repaid) else (5 if s.bnpl_usage else 0)
    return min(72, max(0, emi + bnpl))

def score_rental(s: RentalSignal) -> float:
    """Signal 5: Rental Payment Proxy (max 72)"""
    streak = min(40, s.rent_payment_streak * 2.5)
    method = {"UPI": 20, "Bank": 15, "Cash": 5}.get(s.rent_method, 5)
    agreement = 12 if s.has_rental_agreement else 0
    return min(72, streak + method + agreement)

def score_shg(s: SHGSignal) -> float:
    """Signal 6: SHG Participation (max 135)"""
    if s.months_member == 0: return 0
    tenure  = min(60, s.months_member * 1.8)
    savings = {"Regular": 40, "Occasional": 22, "Irregular": 0}.get(s.savings_consistency, 0)
    attend  = min(25, s.attendance_pct * 25)
    lead    = 10 if s.leadership_role else 0
    return min(135, tenure + savings + attend + lead)

def score_gig(s: GigSignal) -> float:
    """Signal 7: Gig Platform Tenure (max 90)"""
    if s.platform == "None": return 0
    platform_prem = {"Ola": 1.0, "Uber": 1.0, "Swiggy": 0.9, "Zomato": 0.9, "Dunzo": 0.85}.get(s.platform, 0.8)
    tenure = min(40, s.tenure_months * 2.0) * platform_prem
    rating = min(30, (s.rating / 5) * 30) if s.rating > 0 else 0
    completion = min(20, s.completion_rate * 20)
    return min(90, tenure + rating + completion)

def score_app_usage(s: AppUsageSignal) -> float:
    """Signal 8: App Usage Regularity (max 72)"""
    sessions = min(25, s.banking_app_sessions_monthly * 1.5)
    apps     = min(20, s.fintech_apps_count * 5)
    days     = min(15, s.upi_app_active_days_monthly * 0.5)
    streak   = min(12, s.consistent_usage_streak_months * 2)
    return min(72, sessions + apps + days + streak)

def compute_full_score(s: AllSignals, occupation: str = "Other", income: float = 0) -> Dict:
    """Main scoring function — normalizes 8 signals to 300-900."""
    raw = {
        "upi":       score_upi(s.upi),
        "bills":     score_bills(s.bills),
        "recharge":  score_recharge(s.recharge),
        "ecommerce": score_ecommerce(s.ecommerce),
        "rental":    score_rental(s.rental),
        "shg":       score_shg(s.shg),
        "gig":       score_gig(s.gig),
        "app_usage": score_app_usage(s.app_usage),
    }
    max_vals = {"upi": 225, "bills": 162, "recharge": 72, "ecommerce": 72, "rental": 72, "shg": 135, "gig": 90, "app_usage": 72}
    total_max = sum(max_vals.values())  # 900

    # Income bonus (up to +30 base points)
    income_bonus = min(30, income / 5000) if income > 0 else 0
    occ_bonus    = {"SHG Member": 15, "Farmer": 12, "Gig Worker": 10, "Micro Business": 12, "Street Vendor": 8}.get(occupation, 5)

    raw_sum = sum(raw.values()) + income_bonus + occ_bonus
    # Normalize raw_sum to 300-900
    final_score = int(300 + (raw_sum / (total_max + 35)) * 600)
    final_score = min(900, max(300, final_score))

    grade = "A+" if final_score >= 820 else "A" if final_score >= 760 else "B+" if final_score >= 700 else "B" if final_score >= 640 else "C+" if final_score >= 580 else "C" if final_score >= 520 else "D"
    risk_band = "Very Low" if final_score >= 760 else "Low" if final_score >= 660 else "Medium" if final_score >= 560 else "High"
    credit_band = "Prime" if final_score >= 760 else "Near-Prime" if final_score >= 640 else "Sub-Prime" if final_score >= 520 else "Thin-File"
    max_loan = (250000 if final_score >= 820 else 150000 if final_score >= 760 else 100000 if final_score >= 700 else 75000 if final_score >= 640 else 40000 if final_score >= 580 else 20000 if final_score >= 520 else 10000)
    best_rate = (11.5 if final_score >= 820 else 12.5 if final_score >= 760 else 14.0 if final_score >= 700 else 15.5 if final_score >= 640 else 17.5 if final_score >= 580 else 20.0)

    # Top drivers
    pcts = {k: round(raw[k] / max_vals[k] * 100) for k in raw}
    sorted_drivers = sorted(pcts.items(), key=lambda x: x[1], reverse=True)
    top_drivers = [{"signal": k, "score": raw[k], "max": max_vals[k], "pct": v, "weight": {"upi": "25%","bills": "18%","shg": "15%","gig": "10%","recharge": "8%","ecommerce": "8%","rental": "8%","app_usage": "8%"}.get(k, "?%")} for k, v in sorted_drivers[:3]]

    # Improvement tips
    tips = []
    if pcts["upi"] < 60: tips.append({"action": "Increase UPI usage — more daily transactions", "impact": "+35 pts", "signal": "upi"})
    if pcts["bills"] < 70: tips.append({"action": "Pay all utility bills on time every month", "impact": "+28 pts", "signal": "bills"})
    if pcts["shg"] < 50 and s.shg.months_member == 0: tips.append({"action": "Join a local SHG group", "impact": "+50 pts", "signal": "shg"})
    if pcts["rental"] < 40: tips.append({"action": "Pay rent via UPI and get a rental agreement", "impact": "+22 pts", "signal": "rental"})
    if pcts["gig"] < 30 and s.gig.platform == "None": tips.append({"action": "Register on a gig platform (Ola/Swiggy)", "impact": "+40 pts", "signal": "gig"})
    if pcts["app_usage"] < 50: tips.append({"action": "Use banking apps daily for 3+ months", "impact": "+18 pts", "signal": "app_usage"})

    recommended_products = []
    if final_score >= 760: recommended_products = ["Prime Personal Loan", "Working Capital Loan", "Agri-Gold Loan"]
    elif final_score >= 640: recommended_products = ["Micro Business Loan", "Two-Wheeler Loan", "Education Loan"]
    elif final_score >= 520: recommended_products = ["Microfinance Loan", "SHG Group Loan", "Emergency Credit"]
    else: recommended_products = ["Credit Builder Loan", "Savings-Linked Credit"]

    data_completeness = sum(1 for k, v in pcts.items() if v > 0) / len(pcts)
    confidence = round(0.5 + data_completeness * 0.45, 3)

    return {
        "score": final_score,
        "grade": grade,
        "risk_band": risk_band,
        "credit_band": credit_band,
        "max_eligible_loan": max_loan,
        "best_rate": best_rate,
        "recommendation": "PRE_APPROVE" if final_score >= 660 else "APPROVE_WITH_CONDITIONS" if final_score >= 560 else "REFER_TO_UNDERWRITER" if final_score >= 460 else "DECLINE",
        "confidence": confidence,
        "percentile": min(99, max(1, int((final_score - 300) / 6))),
        "recommended_products": recommended_products,
        "signal_breakdown": raw,
        "signal_percentages": pcts,
        "top_drivers": top_drivers,
        "improvement_tips": tips[:4],
        "income_bonus": round(income_bonus),
        "occupation_bonus": occ_bonus,
    }


def generate_explanation_local(score: int, breakdown: Dict, language: str, name: str, occupation: str) -> Dict[str, str]:
    """Fallback explanation when no Gemini API key."""
    grade = "A+" if score >= 820 else "A" if score >= 760 else "B+" if score >= 700 else "B" if score >= 640 else "C+"
    top_signal = max(breakdown.get("signal_percentages", {}).items(), key=lambda x: x[1], default=("upi", 0))[0] if breakdown.get("signal_percentages") else "upi"
    signal_names = {"upi": "UPI payment history", "bills": "utility bill payments", "shg": "SHG participation", "gig": "gig platform tenure", "rental": "rental payments", "ecommerce": "e-commerce behavior", "recharge": "mobile recharge patterns", "app_usage": "app usage consistency"}

    en_text = f"Congratulations {name}! Your BehaviorScore of {score} ({grade}) reflects your {signal_names.get(top_signal, 'consistent financial behavior')}. You're in the {'top 30%' if score >= 720 else 'top 50%'} of first-time credit applicants — far better than what traditional CIBIL would show. Keep your {signal_names.get(top_signal, 'payment habits')} strong and your score will continue to grow."
    hi_text = f"बधाई हो {name}! आपका BehaviorScore {score} ({grade}) आपके {signal_names.get(top_signal, 'वित्तीय व्यवहार')} को दर्शाता है। आप पहली बार आवेदन करने वालों में {'शीर्ष 30%' if score >= 720 else 'शीर्ष 50%'} में हैं।"

    return {"en": en_text, "hi": hi_text}


# ══════════════════════════════════════════════════════════════
# API ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"service": "BehaviorCredit Scoring Engine", "version": "2.1.0", "signals": 8, "status": "operational"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat(), "gemini_connected": gemini_model is not None}

@app.post("/v2/score")
async def score_endpoint(req: ScoreRequest):
    """
    Generate BehaviorScore™ from 8 alternative behavioral signals.
    Target: < 800ms response time.
    """
    if not req.consent_token.startswith("ct_"):
        raise HTTPException(400, "Invalid consent token. Issue one via POST /v2/consent")

    result = compute_full_score(req.signals, req.occupation, req.monthly_income)

    # Auto-generate explanation
    explanation = generate_explanation_local(
        result["score"], result, req.language, "User", req.occupation
    )

    if gemini_model:
        try:
            prompt = f"BehaviorScore {result['score']} for a {req.occupation}. Top signal: {result['top_drivers'][0]['signal'] if result['top_drivers'] else 'upi'}. Write ONE warm, empowering sentence in English (max 25 words) that celebrates their financial discipline without being condescending."
            response = gemini_model.generate_content(prompt)
            explanation["en"] = response.text.strip()
        except Exception:
            pass  # Fall back to local explanation

    return {
        "request_id":       str(uuid.uuid4()),
        "applicant_id":     req.applicant_id or str(uuid.uuid4()),
        "behavior_score":   result["score"],
        "grade":            result["grade"],
        "risk_band":        result["risk_band"],
        "credit_band":      result["credit_band"],
        "max_eligible_loan": result["max_eligible_loan"],
        "best_rate":        result["best_rate"],
        "recommendation":   result["recommendation"],
        "confidence":       result["confidence"],
        "percentile":       result["percentile"],
        "recommended_products": result["recommended_products"],
        "signal_breakdown": result["signal_breakdown"],
        "signal_percentages": result["signal_percentages"],
        "top_drivers":      result["top_drivers"],
        "improvement_tips": result["improvement_tips"],
        "explanation_en":   explanation.get("en", ""),
        "explanation_hi":   explanation.get("hi", ""),
        "generated_at":     datetime.utcnow().isoformat(),
        "valid_until":      (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "api_version":      "v2.1",
        "powered_by":       "BehaviorCredit AI · Team AntiGravity #108",
    }

@app.post("/v2/score/simple")
async def score_simple(req: dict):
    """
    Simplified endpoint — accepts flat dict of basic signals for quick integration.
    Maps to AllSignals internally.
    """
    signals = AllSignals(
        upi=UPISignal(
            months_active=int(req.get("upiMonths", 0)),
            avg_monthly_txns=int(req.get("upiTxnsMonthly", 20)),
            merchant_diversity=req.get("merchantDiversity", "Low"),
            payment_failure_pct=float(req.get("upiFailurePct", 0.05)),
        ),
        bills=BillSignal(
            electricity_streak=int(req.get("electricityStreak", 0)),
            water_on_time_pct=0.8 if req.get("billsOnTime") == "Always" else 0.5,
            mobile_recharge_reg="Regular" if req.get("billsOnTime") == "Always" else "Occasional",
        ),
        shg=SHGSignal(
            months_member=int(req.get("shgMonths", 0)),
            savings_consistency=req.get("savingsConsistency", "Irregular"),
            attendance_pct=0.85 if int(req.get("shgMonths", 0)) > 0 else 0,
        ),
        recharge=RechargeSignal(
            monthly_recharge_amt=float(req.get("monthlyRechargeAmt", 149)),
            recharge_gap_days=int(req.get("rechargeGapDays", 28)),
        ),
        app_usage=AppUsageSignal(
            banking_app_sessions_monthly=int(req.get("appSessions", 8)),
            upi_app_active_days_monthly=int(req.get("upiMonths", 0)) > 0 and 20 or 5,
        ),
    )
    result = compute_full_score(signals, req.get("occupation", "Other"), float(req.get("monthlyIncome", 0)))
    return {"behavior_score": result["score"], "grade": result["grade"], "risk_band": result["risk_band"],
            "max_eligible_loan": result["max_eligible_loan"], "best_rate": result["best_rate"],
            "recommendation": result["recommendation"], "signal_breakdown": result["signal_breakdown"],
            "improvement_tips": result["improvement_tips"][:3]}

@app.post("/v2/bulk-score")
async def bulk_score(applicants: List[ScoreRequest]):
    if len(applicants) > 500:
        raise HTTPException(400, "Max 500 applicants per batch")
    results = []
    for a in applicants:
        r = compute_full_score(a.signals, a.occupation, a.monthly_income)
        results.append({"applicant_id": a.applicant_id or str(uuid.uuid4()), **r})
    approved = sum(1 for r in results if r["recommendation"] in ["PRE_APPROVE", "APPROVE_WITH_CONDITIONS"])
    return {"batch_id": str(uuid.uuid4()), "total": len(results), "approved": approved,
            "approval_rate": round(approved / len(results) * 100, 1) if results else 0,
            "avg_score": round(sum(r["score"] for r in results) / len(results)) if results else 0,
            "results": results, "generated_at": datetime.utcnow().isoformat()}

@app.post("/v2/explain")
async def explain_score(req: ExplainRequest):
    """Generate persona-aware AI explanation of the score."""
    explanation = generate_explanation_local(req.score, req.breakdown, req.language, req.name, req.occupation)
    if gemini_model:
        try:
            lang_map = {"hi": "Hindi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi", "kn": "Kannada", "en": "English"}
            lang = lang_map.get(req.language, "English")
            prompt = f"""You are BehaviorCredit AI. Generate a warm, empowering 3-sentence explanation in {lang} for:
- Name: {req.name}
- Occupation: {req.occupation}  
- BehaviorScore: {req.score}
- Top strength: {list(req.breakdown.get('signal_percentages', {}).items())[0][0] if req.breakdown.get('signal_percentages') else 'payment consistency'}
Tone: celebrate their discipline, mention the score improvement potential, end with encouragement. Never condescending."""
            resp = gemini_model.generate_content(prompt)
            explanation[req.language[:2]] = resp.text.strip()
        except Exception:
            pass
    return {"explanation": explanation.get(req.language[:2], explanation.get("en", "")),
            "explanation_en": explanation.get("en", ""), "language": req.language}

@app.post("/v2/consent")
async def issue_consent(body: dict):
    applicant_id = body.get("applicant_id")
    if not applicant_id: raise HTTPException(400, "applicant_id required")
    return {
        "consent_token": f"ct_{uuid.uuid4().hex[:20]}",
        "applicant_id": applicant_id,
        "scopes": body.get("scopes", ["upi", "bills", "shg", "recharge", "ecommerce", "rental", "gig", "app_usage"]),
        "issued_at": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        "dpdpa_compliant": True,
        "rbi_aa_framework": True,
    }

@app.get("/v2/nbfc/score/{applicant_id}")
async def nbfc_score_endpoint(applicant_id: str, api_key: str = ""):
    """NBFC Partner endpoint — returns full BehaviorScore JSON for a user_id."""
    # Demo: generate deterministic score based on ID hash
    score = 550 + (hash(applicant_id) % 320)
    grade = "A+" if score >= 820 else "A" if score >= 760 else "B+" if score >= 700 else "B" if score >= 640 else "C+"
    return {
        "applicant_id": applicant_id,
        "behavior_score": score,
        "grade": grade,
        "credit_band": "Near-Prime" if score >= 640 else "Sub-Prime",
        "risk_tier": "Low" if score >= 660 else "Medium",
        "max_eligible_loan": 80000 if score >= 700 else 40000,
        "best_rate": 14.5 if score >= 700 else 18.0,
        "recommendation": "PRE_APPROVE" if score >= 660 else "APPROVE_WITH_CONDITIONS",
        "recommended_products": ["Micro Business Loan", "Two-Wheeler Loan"],
        "explanation_en": f"This applicant shows consistent financial behavior with a BehaviorScore of {score}. Their payment patterns and social capital indicate low default risk.",
        "explanation_hi": f"इस आवेदक का BehaviorScore {score} है और वे कम जोखिम वाले हैं।",
        "valid_until": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "generated_at": datetime.utcnow().isoformat(),
    }

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 BehaviorCredit Scoring Engine v2.1")
    print("   8-Signal AI Model | Target < 800ms")
    print("   Docs: http://localhost:8000/docs\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
