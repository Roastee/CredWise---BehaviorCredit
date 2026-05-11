/**
 * BehaviorCredit — MongoDB Seed Script
 * Seeds 3 demo personas (Ramesh, Priya, Meena) + 50 synthetic applicants
 * Run: node backend/seed.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }

// ── Schemas ────────────────────────────────────────────────────
const ScoreSchema = new mongoose.Schema({
  userId: String, applicantId: String, name: String, occupation: String,
  monthlyIncome: Number, language: String, behaviorScore: Number,
  grade: String, riskBand: String, creditBand: String,
  maxLoan: Number, bestRate: Number, recommendation: String,
  signalBreakdown: Object, signals: Object, persona: String,
  createdAt: { type: Date, default: Date.now },
});
const Score = mongoose.model('ScoreHistory', ScoreSchema);

// ── 3 Hero Personas ────────────────────────────────────────────
const PERSONAS = [
  {
    userId: 'ramesh-kumar-001',
    applicantId: 'BC-2025-00847',
    name: 'Ramesh Kumar',
    occupation: 'Gig Worker',
    monthlyIncome: 18000,
    language: 'hi',
    persona: 'ramesh',
    behaviorScore: 718,
    grade: 'B+',
    riskBand: 'Low',
    creditBand: 'Near-Prime',
    maxLoan: 80000,
    bestRate: 14.5,
    recommendation: 'PRE_APPROVE',
    signals: {
      upiMonths: 18, gigPlatform: 'Ola', gigTenure: 14, gigRating: 4.6,
      billsOnTime: 'Usually', shgMember: 'No', merchantDiversity: 'Medium',
      appSessions: 10, electricityStreak: 8, rechargeAmt: 199,
    },
    signalBreakdown: { upi: 105, bills: 75, shg: 0, gig: 48, recharge: 18, ecommerce: 20, rental: 18, appUsage: 25 },
  },
  {
    userId: 'priya-lakshmi-001',
    applicantId: 'BC-2025-00831',
    name: 'Priya Lakshmi',
    occupation: 'SHG Member',
    monthlyIncome: 12000,
    language: 'ta',
    persona: 'priya',
    behaviorScore: 762,
    grade: 'A',
    riskBand: 'Very Low',
    creditBand: 'Prime',
    maxLoan: 150000,
    bestRate: 12.5,
    recommendation: 'PRE_APPROVE',
    signals: {
      upiMonths: 36, shgMember: 'Yes', shgMonths: 48, billsOnTime: 'Always',
      merchantDiversity: 'Low', appSessions: 6, electricityStreak: 36,
      rechargeAmt: 149, gigPlatform: 'None',
    },
    signalBreakdown: { upi: 140, bills: 162, shg: 135, gig: 0, recharge: 28, ecommerce: 35, rental: 40, appUsage: 32 },
  },
  {
    userId: 'meena-devi-001',
    applicantId: 'BC-2025-00819',
    name: 'Meena Devi',
    occupation: 'Street Vendor',
    monthlyIncome: 9000,
    language: 'kn',
    persona: 'meena',
    behaviorScore: 681,
    grade: 'B',
    riskBand: 'Low',
    creditBand: 'Near-Prime',
    maxLoan: 75000,
    bestRate: 15.5,
    recommendation: 'PRE_APPROVE',
    signals: {
      upiMonths: 24, shgMember: 'Yes', shgMonths: 24, billsOnTime: 'Always',
      merchantDiversity: 'Low', appSessions: 4, electricityStreak: 24,
      rechargeAmt: 99, gigPlatform: 'None',
    },
    signalBreakdown: { upi: 100, bills: 162, shg: 90, gig: 0, recharge: 10, ecommerce: 10, rental: 18, appUsage: 12 },
  },
];

// ── Synthetic applicants ────────────────────────────────────────
const OCCUPATIONS  = ['Gig Worker','Farmer','Street Vendor','SHG Member','Daily Wage','Micro Business','Artisan'];
const GIG_PLATFORMS = ['Ola','Uber','Swiggy','Zomato','None','None','None'];
const NAMES = ['Arjun','Sunita','Bablu','Kavitha','Suresh','Nirmala','Rajesh','Geeta','Mohan','Rekha','Deepak','Savita','Vinod','Anita','Pramod','Usha','Ravi','Lalita','Satish','Pushpa','Ganesh','Manda','Vijay','Sarla','Ashok','Shobha','Sunil','Kamla','Dinesh','Asha'];

function syntheticScore(upi, shg, bills, gig, income) {
  let s = 300;
  s += upi >= 36 ? 130 : upi >= 24 ? 100 : upi >= 12 ? 70 : 40;
  s += shg >= 24 ? 90 : shg >= 12 ? 55 : shg > 0 ? 25 : 0;
  s += { Always: 95, Usually: 65, Sometimes: 32 }[bills] || 10;
  s += gig >= 12 ? 40 : gig > 0 ? 20 : 0;
  s += income >= 25000 ? 42 : income >= 15000 ? 28 : income >= 8000 ? 16 : 6;
  return Math.min(900, Math.max(300, s + Math.floor(Math.random() * 40 - 20)));
}

const synthetic = Array.from({ length: 50 }, (_, i) => {
  const upi   = Math.floor(Math.random() * 48);
  const shg   = Math.random() > 0.5 ? Math.floor(Math.random() * 48) : 0;
  const bills = ['Always','Usually','Sometimes'][Math.floor(Math.random() * 3)];
  const gig   = Math.floor(Math.random() * 24);
  const income = Math.floor((3000 + Math.random() * 47000) / 100) * 100;
  const score  = syntheticScore(upi, shg, bills, gig, income);
  const occ   = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
  const name  = NAMES[i % NAMES.length] + ' ' + ['Kumar','Devi','Singh','Yadav','Sharma','Patel','Reddy'][Math.floor(Math.random() * 7)];
  return {
    userId: `user-synth-${String(i + 1).padStart(3, '0')}`,
    applicantId: `BC-2025-${String(900 + i).padStart(5, '0')}`,
    name, occupation: occ, monthlyIncome: income,
    language: ['en','hi','ta','te','bn','mr','kn'][Math.floor(Math.random() * 7)],
    behaviorScore: score,
    grade: score >= 820 ? 'A+' : score >= 760 ? 'A' : score >= 700 ? 'B+' : score >= 640 ? 'B' : score >= 580 ? 'C+' : 'C',
    riskBand: score >= 760 ? 'Very Low' : score >= 660 ? 'Low' : score >= 560 ? 'Medium' : 'High',
    creditBand: score >= 760 ? 'Prime' : score >= 640 ? 'Near-Prime' : 'Sub-Prime',
    maxLoan: score >= 760 ? 150000 : score >= 660 ? 80000 : score >= 560 ? 40000 : 20000,
    bestRate: score >= 760 ? 12.5 : score >= 660 ? 14.5 : score >= 560 ? 17.5 : 20.0,
    recommendation: score >= 660 ? 'PRE_APPROVE' : score >= 560 ? 'APPROVE_WITH_CONDITIONS' : 'REFER_TO_UNDERWRITER',
    signals: { upiMonths: upi, shgMonths: shg, billsOnTime: bills, gigTenure: gig, gigPlatform: GIG_PLATFORMS[Math.floor(Math.random() * GIG_PLATFORMS.length)] },
    signalBreakdown: { upi: Math.round(upi * 3), bills: Math.round(score * 0.2), shg: Math.round(shg * 2), gig: Math.round(gig * 2), recharge: 18, ecommerce: 15, rental: 12, appUsage: 15 },
    persona: null,
  };
});

// ── Run Seed ───────────────────────────────────────────────────
(async () => {
  console.log('\n🌱 BehaviorCredit — Database Seeder');
  console.log('   Connecting to MongoDB Atlas...\n');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected!\n');

    // Clear existing
    await Score.deleteMany({});
    console.log('🗑️  Cleared existing records\n');

    // Insert personas
    await Score.insertMany(PERSONAS);
    console.log('👥 Inserted 3 hero personas:');
    PERSONAS.forEach(p => console.log(`   ✦ ${p.name} (${p.behaviorScore}) — ${p.recommendation}`));

    // Insert synthetic
    await Score.insertMany(synthetic);
    const avgScore = Math.round(synthetic.reduce((s, a) => s + a.behaviorScore, 0) / synthetic.length);
    console.log(`\n📊 Inserted 50 synthetic applicants (avg score: ${avgScore})`);

    const total = await Score.countDocuments();
    console.log(`\n✅ Database ready: ${total} total records`);
    console.log('\n🚀 Personas loaded:');
    console.log('   → Ramesh Kumar (Gig Worker, Hindi, Score: 718) — http://localhost:3000');
    console.log('   → Priya Lakshmi (SHG Member, Tamil, Score: 762)');
    console.log('   → Meena Devi (Street Vendor, Kannada, Score: 681)\n');
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
})();
