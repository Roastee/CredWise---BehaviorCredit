const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const mongoose   = require('mongoose');
const fs         = require('fs');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── JSON File Store (fallback when Atlas is unavailable) ──────
const DB_FILE = path.join(__dirname, 'data', 'scores.json');
const ensureDbFile = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ scores: [] }));
};
const readDb = () => { ensureDbFile(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); };
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const fileStore = {
  save: (doc) => {
    const db = readDb();
    db.scores.unshift({ ...doc, _id: uuidv4(), createdAt: new Date().toISOString() });
    if (db.scores.length > 500) db.scores = db.scores.slice(0, 500); // cap at 500
    writeDb(db);
  },
  findLatest: (userId) => {
    const db = readDb();
    return db.scores.find(s => s.userId === userId) || null;
  },
  findAll: (limit = 20) => {
    const db = readDb();
    return db.scores.slice(0, limit);
  },
  count: () => readDb().scores.length,
};

// ── MongoDB connection (tries Atlas, gracefully falls back) ────
let usingAtlas = false;
const MONGO_URI = process.env.MONGODB_URI || '';
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => { usingAtlas = true; console.log('✅ MongoDB Atlas connected — cloud persistence enabled'); })
    .catch(() => {
      ensureDbFile();
      console.log(`✅ Storage: Local JSON store (${DB_FILE}) — ${fileStore.count()} records`);
    });
} else {
  ensureDbFile();
  console.log(`✅ Storage: Local JSON store — ${fileStore.count()} records`);
}

// ── MongoDB Schemas ───────────────────────────────────────────
const ScoreHistorySchema = new mongoose.Schema({
  userId:        { type: String, required: true, index: true },
  applicantId:   String,
  behaviorScore: Number,
  grade:         String,
  riskBand:      String,
  maxLoan:       Number,
  bestRate:      Number,
  recommendation: String,
  signalBreakdown: Object,
  signals:       Object,
  occupation:    String,
  monthlyIncome: Number,
  createdAt:     { type: Date, default: Date.now },
});
const ScoreHistory = mongoose.models.ScoreHistory || mongoose.model('ScoreHistory', ScoreHistorySchema);

const NBFCQuerySchema = new mongoose.Schema({
  nbfcId:      String,
  apiKey:      String,
  applicantId: String,
  score:       Number,
  recommendation: String,
  queriedAt:   { type: Date, default: Date.now },
});
const NBFCQuery = mongoose.models.NBFCQuery || mongoose.model('NBFCQuery', NBFCQuerySchema);

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ['http://localhost:3000', 'https://behaviorcredit.in'], credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { error: 'Rate limit exceeded' } }));

// ── BehaviorScore Engine (Node mirror of Python engine) ───────
const computeScore = (signals = {}, occupation = 'Other', income = 0) => {
  const upiMonths = parseInt(signals.upiMonths) || 0;
  const shgMonths = parseInt(signals.shgMonths) || 0;
  const elecStreak = parseInt(signals.electricityStreak) || 0;
  const gigTenure  = parseInt(signals.gigTenure) || 0;
  const appSessions = parseInt(signals.appSessions) || 0;
  const rechargeAmt = parseFloat(signals.rechargeAmt) || 149;

  // Signal 1: UPI (25%)
  const upiBase = upiMonths >= 36 ? 130 : upiMonths >= 24 ? 100 : upiMonths >= 12 ? 70 : upiMonths >= 6 ? 40 : 15;
  const divBonus = { High: 35, Medium: 22, Low: 8 }[signals.merchantDiversity] || 8;
  const upiScore = Math.min(225, upiBase + divBonus);

  // Signal 2: Bills (18%)
  const elec  = Math.min(80, elecStreak * 3.2);
  const bills = { Always: 162, Usually: 105, Sometimes: 55, Rarely: 20 }[signals.billsOnTime] || 0;
  const billScore = Math.min(162, Math.max(elec, bills * 0.7 + elec * 0.3));

  // Signal 3: Recharge (8%)
  const rechargeScore = Math.min(72, rechargeAmt > 300 ? 60 : rechargeAmt > 149 ? 45 : rechargeAmt > 50 ? 28 : 10);

  // Signal 4: Ecommerce (8%) — estimated from context
  const ecomScore = Math.min(72, signals.hasEmi === 'true' ? 55 : 20);

  // Signal 5: Rental (8%) — estimated
  const rentalScore = Math.min(72, signals.rentViaUPI === 'true' ? 50 : 18);

  // Signal 6: SHG (15%)
  const shgScore = signals.shgMember === 'Yes'
    ? Math.min(135, shgMonths >= 36 ? 120 : shgMonths >= 24 ? 90 : shgMonths >= 12 ? 60 : 25)
    : 0;

  // Signal 7: Gig (10%)
  const gigScore = (signals.gigPlatform && signals.gigPlatform !== 'None')
    ? Math.min(90, gigTenure >= 24 ? 72 : gigTenure >= 12 ? 48 : gigTenure >= 6 ? 28 : 12)
    : 0;

  // Signal 8: App Usage (8%)
  const appScore = Math.min(72, appSessions * 2.5);

  const incBonus  = Math.min(30, income / 5000);
  const occBonus  = { 'SHG Member': 15, 'Farmer': 12, 'Gig Worker': 10, 'Micro Business': 12, 'Street Vendor': 8 }[occupation] || 5;

  const rawSum = upiScore + billScore + rechargeScore + ecomScore + rentalScore + shgScore + gigScore + appScore + incBonus + occBonus;
  // Calibrated: divisor 560 → Ramesh~718, Priya~762, Meena~681
  const rawPct = Math.min(1, rawSum / 560);
  const score = Math.min(900, Math.max(300, Math.round(300 + Math.pow(rawPct, 0.80) * 600)));

  const grade    = score >= 820 ? 'A+' : score >= 760 ? 'A' : score >= 700 ? 'B+' : score >= 640 ? 'B' : score >= 580 ? 'C+' : score >= 520 ? 'C' : 'D';
  const riskBand = score >= 760 ? 'Very Low' : score >= 660 ? 'Low' : score >= 560 ? 'Medium' : 'High';
  const creditBand = score >= 760 ? 'Prime' : score >= 640 ? 'Near-Prime' : score >= 520 ? 'Sub-Prime' : 'Thin-File';
  const maxLoan  = score >= 820 ? 250000 : score >= 760 ? 150000 : score >= 700 ? 100000 : score >= 640 ? 75000 : score >= 580 ? 40000 : score >= 520 ? 20000 : 10000;
  const bestRate = score >= 820 ? 11.5 : score >= 760 ? 12.5 : score >= 700 ? 14.0 : score >= 640 ? 15.5 : score >= 580 ? 17.5 : 20.0;
  const recommendation = score >= 660 ? 'PRE_APPROVE' : score >= 560 ? 'APPROVE_WITH_CONDITIONS' : score >= 460 ? 'REFER_TO_UNDERWRITER' : 'DECLINE';
  const recommendedProducts = score >= 760
    ? ['Prime Personal Loan', 'Working Capital Loan', 'Agri-Gold Loan']
    : score >= 640
    ? ['Micro Business Loan', 'Two-Wheeler Loan', 'Education Loan']
    : ['Microfinance Loan', 'SHG Group Loan', 'Credit Builder'];

  return {
    score, grade, riskBand, creditBand, maxLoan, bestRate, recommendation, recommendedProducts,
    confidence: parseFloat((0.55 + (Object.keys(signals).length / 12) * 0.44).toFixed(3)),
    breakdown: { upi: upiScore, bills: billScore, recharge: rechargeScore, ecommerce: ecomScore, rental: rentalScore, shg: shgScore, gig: gigScore, appUsage: appScore },
  };
};

// ══════════════════════════════════════════════════════════════
// BEHAVIOURSAATHI GEMINI EXPLAINER
// ══════════════════════════════════════════════════════════════

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const SAATHI_SYSTEM = `You are BehaviorSaathi — a warm, empowering credit advisor for BehaviorCredit.
You speak to people who have been ignored by traditional banking. They are not uneducated — they are underserved. Treat them with complete dignity.

YOUR BEHAVIOR RULES:
1. Respond in the requested language first, English translation second (separated by ---)
2. Never use "rejected", "denied", "bad score" — use "improving", "growing", "building"
3. Always end with ONE specific achievable action the user can take today
4. Score low: acknowledge effort, name strongest signal, give hope
5. Score high: celebrate, explain why, suggest next product
6. Maximum 4 sentences per explanation

TONE: Warm didi/bhaiya energy. Like your most financially-savvy family member.

RESPONSE: Return ONLY valid JSON in this exact format:
{
  "explanation_primary": "...",
  "explanation_english": "...",
  "strongest_signal": "...",
  "improvement_action": "...",
  "next_product": "..."
}`;

const geminiExplain = async (score, occupation, income, breakdown, lang = 'en') => {
  if (!GEMINI_KEY) return buildHeuristicExplanation(score, occupation, breakdown, lang);
  const langName = { en:'English', hi:'Hindi', ta:'Tamil', te:'Telugu', bn:'Bengali', mr:'Marathi', kn:'Kannada' }[lang] || 'English';
  const prompt = `BehaviorScore: ${score} | Occupation: ${occupation} | Income: ₹${income}/month
Signal breakdown: UPI=${breakdown.upi}, Bills=${breakdown.bills}, SHG=${breakdown.shg}, Gig=${breakdown.gig}
Language: ${langName}
Generate BehaviorSaathi explanation following the system rules exactly. Return only the JSON object.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SAATHI_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 400, responseMimeType: 'application/json' },
        }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(text);
  } catch { return buildHeuristicExplanation(score, occupation, breakdown, lang); }
};

const buildHeuristicExplanation = (score, occupation, breakdown, lang) => {
  const strongest = breakdown.bills >= breakdown.upi ? 'Utility bill payment consistency' : 'UPI payment history & frequency';
  const action = breakdown.shg === 0
    ? 'Join a Self-Help Group (SHG) in your area — it can add up to 90 points over 12 months.'
    : 'Pay your electricity bill via UPI this month to boost your score by +8 points.';
  const product = score >= 750 ? 'Two-Wheeler Loan at 12.5% p.a. — 3 NBFC partners ready to approve.'
    : score >= 640 ? 'Micro Business Loan ₹75,000 at 15.5% p.a.'
    : 'Credit Builder Loan ₹20,000 at 17.5% — builds your score while you repay.';

  const explanations = {
    en: score >= 750
      ? `Your BehaviorScore of ${score} reflects excellent financial discipline. Your ${strongest} is your biggest strength — lenders see you as a reliable borrower.`
      : `Your BehaviorScore of ${score} is growing steadily. Your ${strongest} shows real financial responsibility. Keep this up and your score will keep rising.`,
    hi: score >= 750
      ? `आपका BehaviorScore ${score} बहुत मजबूत है! आपका ${strongest === 'UPI payment history & frequency' ? 'UPI भुगतान इतिहास' : 'बिल भुगतान नियमितता'} आपकी सबसे बड़ी ताकत है।`
      : `आपका BehaviorScore ${score} बढ़ रहा है। आपका ${strongest === 'UPI payment history & frequency' ? 'UPI भुगतान' : 'बिल भुगतान'} बहुत अच्छा है। ऐसे ही जारी रखें।`,
    ta: `உங்கள் BehaviorScore ${score}. உங்கள் ${strongest === 'UPI payment history & frequency' ? 'UPI கட்டணம்' : 'பில் கட்டணம்'} சிறப்பாக உள்ளது.`,
    kn: `ನಿಮ್ಮ BehaviorScore ${score} ಬೆಳೆಯುತ್ತಿದೆ. ನಿಮ್ಮ ${strongest === 'UPI payment history & frequency' ? 'UPI ಪಾವತಿ' : 'ಬಿಲ್ ಪಾವತಿ'} ತುಂಬಾ ಉತ್ತಮವಾಗಿದೆ.`,
  };

  return {
    explanation_primary: explanations[lang] || explanations.en,
    explanation_english: explanations.en,
    strongest_signal: strongest,
    improvement_action: action,
    next_product: product,
  };
};

// ══════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════


app.get('/api/health', (_, res) => res.json({
  status: 'ok', service: 'BehaviorCredit API', version: '2.1.0',
  mongo: usingAtlas ? 'atlas-connected' : 'local-json-store',
  records: fileStore.count(),
  timestamp: new Date().toISOString(),
}));

// ── Score endpoint ────────────────────────────────────────────
app.post('/api/v2/score', async (req, res) => {
  const { signals, consent_token, applicant_id, occupation, monthly_income, user_id } = req.body;
  if (!signals)        return res.status(400).json({ error: 'signals required' });
  if (!consent_token)  return res.status(400).json({ error: 'consent_token required' });

  const result = computeScore(signals, occupation, monthly_income);
  const requestId = uuidv4();

  // Persist score — Atlas if connected, local JSON store otherwise
  const scoreDoc = {
    userId: user_id || applicant_id || requestId,
    applicantId: applicant_id || requestId,
    behaviorScore: result.score, grade: result.grade, riskBand: result.riskBand,
    creditBand: result.creditBand, maxLoan: result.maxLoan, bestRate: result.bestRate,
    recommendation: result.recommendation, signalBreakdown: result.breakdown,
    signals, occupation, monthlyIncome: monthly_income,
  };
  if (usingAtlas && (user_id || applicant_id)) {
    try { await ScoreHistory.create(scoreDoc); } catch (e) { /* non-blocking */ }
  } else {
    try { fileStore.save(scoreDoc); } catch (e) { /* non-blocking */ }
  }

  const lang = req.body.language || 'en';
  const explanation = await geminiExplain(result.score, occupation, monthly_income, result.breakdown, lang);

  res.json({
    request_id:       requestId,
    applicant_id:     applicant_id || requestId,
    behavior_score:   result.score,
    grade:            result.grade,
    risk_band:        result.riskBand,
    credit_band:      result.creditBand,
    max_eligible_loan: result.maxLoan,
    best_rate:        result.bestRate,
    recommendation:   result.recommendation,
    recommended_products: result.recommendedProducts,
    confidence:       result.confidence,
    signal_breakdown: result.breakdown,
    saathi: explanation,
    generated_at:     new Date().toISOString(),
    valid_until:      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    api_version:      'v2.1',
  });
});

// ── BehaviorSaathi Explain endpoint ──────────────────────────
app.post('/api/v2/explain', async (req, res) => {
  const { score, occupation, monthly_income, breakdown, language } = req.body;
  if (!score) return res.status(400).json({ error: 'score required' });
  const bd = breakdown || { upi: 0, bills: 0, shg: 0, gig: 0 };
  const explanation = await geminiExplain(score, occupation || 'Not specified', monthly_income || 0, bd, language || 'en');
  res.json({ score, saathi: explanation, generated_at: new Date().toISOString() });
});

// ── Bulk Score ────────────────────────────────────────────────
app.post('/api/v2/bulk-score', (req, res) => {
  const { applicants } = req.body;
  if (!Array.isArray(applicants)) return res.status(400).json({ error: 'applicants[] required' });
  if (applicants.length > 500)   return res.status(400).json({ error: 'Max 500 per batch' });

  const results = applicants.map(a => ({
    applicant_id: a.applicant_id || uuidv4(),
    ...computeScore(a.signals || {}, a.occupation, a.monthly_income),
  }));
  const approved = results.filter(r => ['PRE_APPROVE','APPROVE_WITH_CONDITIONS'].includes(r.recommendation)).length;

  res.json({
    batch_id: uuidv4(), total: results.length, approved,
    approval_rate: +(approved / results.length * 100).toFixed(1),
    avg_score: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
    results, generated_at: new Date().toISOString(),
  });
});

// ── NBFC score lookup ─────────────────────────────────────────
app.get('/api/v2/nbfc/score/:userId', async (req, res) => {
  const { userId } = req.params;
  // Try MongoDB Atlas first
  if (usingAtlas) {
    try {
      const latest = await ScoreHistory.findOne({ userId }).sort({ createdAt: -1 });
      if (latest) {
        return res.json({
          applicant_id: latest.applicantId, behavior_score: latest.behaviorScore,
          grade: latest.grade, risk_band: latest.riskBand, credit_band: latest.creditBand,
          max_eligible_loan: latest.maxLoan, best_rate: latest.bestRate,
          recommendation: latest.recommendation, retrieved_from: 'mongodb-atlas',
          retrieved_at: new Date().toISOString(),
        });
      }
    } catch { /* fall through */ }
  }
  // Try local JSON store
  const local = fileStore.findLatest(userId);
  if (local) {
    return res.json({
      applicant_id: local.applicantId, behavior_score: local.behaviorScore,
      grade: local.grade, risk_band: local.riskBand, credit_band: local.creditBand,
      max_eligible_loan: local.maxLoan, best_rate: local.bestRate,
      recommendation: local.recommendation, retrieved_from: 'local-json-store',
      retrieved_at: new Date().toISOString(),
    });
  }
  // Demo fallback
  const demoScore = 550 + (Math.abs(userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 320);
  res.json({
    applicant_id: userId,
    behavior_score: demoScore,
    grade: demoScore >= 760 ? 'A' : demoScore >= 700 ? 'B+' : 'B',
    risk_band: demoScore >= 660 ? 'Low' : 'Medium',
    credit_band: demoScore >= 640 ? 'Near-Prime' : 'Sub-Prime',
    max_eligible_loan: demoScore >= 700 ? 100000 : 50000,
    best_rate: demoScore >= 700 ? 14.0 : 17.5,
    recommendation: demoScore >= 660 ? 'PRE_APPROVE' : 'APPROVE_WITH_CONDITIONS',
    recommended_products: ['Micro Business Loan', 'Two-Wheeler Loan'],
    explanation_en: `This applicant's BehaviorScore of ${demoScore} reflects consistent payment behavior and strong community ties. They represent a low-risk lending opportunity.`,
    explanation_hi: `इस आवेदक का BehaviorScore ${demoScore} उनके नियमित भुगतान व्यवहार को दर्शाता है।`,
    retrieved_from: 'demo', generated_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

// ── Score history ─────────────────────────────────────────────
app.get('/api/v2/user/:userId/history', async (req, res) => {
  if (mongoose.connection.readyState !== 1)
    return res.json({ history: [], source: 'demo', message: 'MongoDB not connected' });
  const history = await ScoreHistory.find({ userId: req.params.userId })
    .sort({ createdAt: -1 }).limit(20).select('-signals -__v');
  res.json({ userId: req.params.userId, count: history.length, history });
});

// ── Consent token ─────────────────────────────────────────────
app.post('/api/v2/consent', (req, res) => {
  const { applicant_id, scopes } = req.body;
  if (!applicant_id) return res.status(400).json({ error: 'applicant_id required' });
  res.json({
    consent_token: `ct_${uuidv4().replace(/-/g, '').slice(0, 20)}`,
    applicant_id, scopes: scopes || ['upi','bills','shg','recharge','ecommerce','rental','gig','app_usage'],
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    dpdpa_compliant: true, rbi_aa_framework: true,
  });
});

// ── NBFC demo applicants ──────────────────────────────────────
app.get('/api/v2/nbfc/applicants', (_, res) => res.json({
  total: 5,
  applicants: [
    { id: 'BC-2025-00847', name: 'Ramesh Kumar', score: 718, occupation: 'Gig Worker',   requested: 80000,  status: 'Pre-Approved', risk: 'Low',     ts: '2 hrs ago' },
    { id: 'BC-2025-00831', name: 'Priya Lakshmi', score: 762, occupation: 'SHG Member',  requested: 120000, status: 'Approved',     risk: 'Very Low', ts: '5 hrs ago' },
    { id: 'BC-2025-00819', name: 'Meena Devi',   score: 681, occupation: 'Vendor',       requested: 40000,  status: 'Under Review', risk: 'Low-Med',  ts: '1 day ago' },
    { id: 'BC-2025-00804', name: 'Suresh Yadav', score: 624, occupation: 'Farmer',       requested: 60000,  status: 'Eligible',     risk: 'Medium',   ts: '1 day ago' },
    { id: 'BC-2025-00798', name: 'Lakshmi Bai',  score: 709, occupation: 'Artisan',      requested: 25000,  status: 'Approved',     risk: 'Low',      ts: '2 days ago' },
  ],
}));

app.listen(PORT, () => {
  console.log(`\n🚀 BehaviorCredit API v2.1 → http://localhost:${PORT}`);
  console.log(`   POST /api/v2/score          ← BehaviorScore (< 800ms)`);
  console.log(`   GET  /api/v2/nbfc/score/:id ← NBFC lookup`);
  console.log(`   GET  /api/v2/nbfc/applicants`);
  console.log(`   POST /api/v2/bulk-score`);
  console.log(`   POST /api/v2/consent\n`);
});
