import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PERSONAS_META = [
  {
    key: 'ramesh',
    name: 'Ramesh Kumar',
    role: 'Auto-rickshaw Driver',
    city: 'Pune, Maharashtra',
    lang: 'Hindi',
    langCode: 'hi',
    avatar: '🚖',
    score: 718,
    grade: 'B+',
    delta: '+124',
    color: '#3b82f6',
    story: 'Drives 12 hours a day. Pays UPI everywhere. Never missed an electricity bill. CIBIL: No History.',
    signals: [
      { label: 'UPI Active', val: '18 months', icon: '📱' },
      { label: 'Gig Platform', val: 'Ola (14 months, 4.6★)', icon: '🚖' },
      { label: 'Bill Payments', val: 'Usually on time', icon: '⚡' },
      { label: 'SHG', val: 'Not a member', icon: '🤝' },
    ],
    outcome: 'Pre-Approved ₹80,000 at 14.5% p.a. from MicroFirst Finance',
    challenge: 'No formal bank loans. 3 loan rejections from PSU banks.',
    journey: [
      'Downloaded BehaviorCredit app (Hindi UI)',
      'Completed onboarding in 4 minutes',
      'Score generated: 718 — "Good Credit Profile"',
      'AI explains score in Hindi',
      '3 NBFC offers received instantly',
      'Applied and got ₹80,000 disbursed in 48 hours',
    ],
  },
  {
    key: 'priya',
    name: 'Priya Lakshmi',
    role: 'Freelance Tailor & SHG Leader',
    city: 'Chennai, Tamil Nadu',
    lang: 'English / Tamil',
    langCode: 'ta',
    avatar: '🧵',
    score: 762,
    grade: 'A',
    delta: '+203',
    color: '#10b981',
    story: 'Runs a tailoring business from home. 4-year SHG member, savings champion. CIBIL: Thin File.',
    signals: [
      { label: 'SHG Membership', val: '48 months, Regular savings', icon: '🤝' },
      { label: 'UPI Active', val: '36 months, diverse merchants', icon: '📱' },
      { label: 'Bill Payments', val: 'Always on time', icon: '⚡' },
      { label: 'Electricity Streak', val: '36 consecutive months', icon: '🏠' },
    ],
    outcome: 'Approved ₹1,20,000 at 12.5% p.a. — Prime borrower status',
    challenge: 'Never took a formal loan. Bank asked for income proof she couldn\'t provide.',
    journey: [
      'Chose Tamil language on first screen',
      'SHG records verified via BehaviorCredit API',
      'Score: 762 — "Excellent Credit Profile"',
      'AI explanation generated in Tamil',
      'Pre-approved by 2 NBFCs simultaneously',
      '₹1.2L disbursed. Planning workshop expansion.',
    ],
  },
  {
    key: 'meena',
    name: 'Meena Devi',
    role: 'Vegetable Vendor',
    city: 'Jaipur, Rajasthan',
    lang: 'Kannada / Hindi',
    langCode: 'kn',
    avatar: '🥬',
    score: 681,
    grade: 'B',
    delta: '+156',
    color: '#8b5cf6',
    story: 'Sells vegetables at the local market. Pays electricity on time for 8 years. CIBIL: Invisible.',
    signals: [
      { label: 'Electricity Streak', val: '96 months! (8 years)', icon: '⚡' },
      { label: 'SHG Membership', val: '24 months active', icon: '🤝' },
      { label: 'UPI Active', val: '24 months, small daily txns', icon: '📱' },
      { label: 'Bill Payments', val: 'Always on time', icon: '🏠' },
    ],
    outcome: 'Eligible ₹75,000 at 15.5% p.a. — Score improving every month',
    challenge: 'No smartphone until 6 months ago. Son helped her onboard. Zero credit history.',
    journey: [
      'Son helped onboard in Kannada',
      '8-year electricity record became her superpower',
      'Score: 681 — still "Good" despite being credit-invisible',
      'AI explanation generated in Kannada',
      '2 NBFC offers unlocked immediately',
      'Score projected to reach 720 in 3 months',
    ],
  },
];

const PersonaDemo = ({ navigate, loadPersona }) => {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [journeyStep, setJourneyStep] = useState(0);

  const handleLoadJourney = (p) => {
    setSelected(p);
    setJourneyStep(0);
  };

  const handleLaunch = (key, langCode) => {
    i18n.changeLanguage(langCode);
    loadPersona(key);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-12">
        <div className="badge badge-purple mb-4">Demo Personas</div>
        <h1 className="font-display text-4xl font-bold mb-3">
          3 Real Journeys, <span className="gradient-text">Live Demo</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Click a persona to load their full pre-scored journey into the app.
          Switch languages, view their score, ask the AI chatbot.
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {PERSONAS_META.map((p) => (
          <div key={p.key} className={`card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${selected?.key === p.key ? 'border-2' : ''}`}
            style={{ borderColor: selected?.key === p.key ? p.color : undefined }}
            onClick={() => handleLoadJourney(p)}>
            <div className="text-5xl mb-4">{p.avatar}</div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-display font-bold text-lg">{p.name}</div>
                <div className="text-xs text-slate-500">{p.role}</div>
                <div className="text-xs text-slate-600">{p.city}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-extrabold text-3xl" style={{ color: p.color }}>{p.score}</div>
                <div className="text-xs" style={{ color: p.color }}>{p.delta} pts</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4 italic">"{p.story}"</p>
            <div className="text-xs text-slate-600 mb-4">🌐 Language: <span className="text-white">{p.lang}</span></div>
            <div className="flex gap-2">
              <button className="btn-primary !py-2 !px-4 !text-xs flex-1 justify-center"
                onClick={e => { e.stopPropagation(); handleLaunch(p.key, p.langCode); }}>
                <span>▶ Launch Journey</span>
              </button>
              <button className="btn-secondary !py-2 !px-3 !text-xs"
                onClick={e => { e.stopPropagation(); handleLoadJourney(p); }}>
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Journey Detail Panel */}
      {selected && (
        <div className="glass-bright rounded-2xl p-8 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Profile */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{selected.avatar}</div>
                <div>
                  <h2 className="font-display text-2xl font-bold">{selected.name}</h2>
                  <div className="text-sm text-slate-500">{selected.role} · {selected.city}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-display font-extrabold text-3xl" style={{ color: selected.color }}>{selected.score}</span>
                    <span className="badge text-xs" style={{ background: selected.color + '18', color: selected.color, border: `1px solid ${selected.color}30` }}>{selected.grade}</span>
                    <span className="text-xs" style={{ color: selected.color }}>{selected.delta} vs CIBIL baseline</span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Challenge</div>
                <p className="text-sm text-slate-400 leading-relaxed">{selected.challenge}</p>
              </div>

              <div className="mb-5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Key Signals</div>
                <div className="grid grid-cols-2 gap-3">
                  {selected.signals.map((s, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-xl p-3">
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-[10px] text-slate-500 mb-0.5">{s.label}</div>
                      <div className="text-xs font-semibold">{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-emerald-400 mb-1">Outcome</div>
                <div className="text-sm">{selected.outcome}</div>
              </div>
            </div>

            {/* Right: Journey steps */}
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-4">6-Step Journey</div>
              <div className="space-y-3">
                {selected.journey.map((step, i) => (
                  <div key={i}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 cursor-pointer ${i <= journeyStep ? 'bg-brand-500/8 border border-brand-500/20' : 'bg-white/[0.02] border border-white/[0.04]'}`}
                    onClick={() => setJourneyStep(i)}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${i <= journeyStep ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-600'}`}>
                      {i < journeyStep ? '✓' : i + 1}
                    </div>
                    <div className={`text-sm transition-all ${i <= journeyStep ? 'text-white' : 'text-slate-600'}`}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button className="btn-ghost !py-2 !px-4 !text-xs" disabled={journeyStep === 0}
                  onClick={() => setJourneyStep(s => Math.max(0, s - 1))}>← Prev</button>
                <button className="btn-secondary !py-2 !px-4 !text-xs flex-1 justify-center"
                  disabled={journeyStep >= selected.journey.length - 1}
                  onClick={() => setJourneyStep(s => Math.min(selected.journey.length - 1, s + 1))}>
                  Next Step →
                </button>
                <button className="btn-primary !py-2 !px-4 !text-xs"
                  onClick={() => handleLaunch(selected.key, selected.langCode)}>
                  <span>▶ Live Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaDemo;
