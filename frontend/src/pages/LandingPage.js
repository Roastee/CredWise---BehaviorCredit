import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LandingPage = ({ navigate }) => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ users: 0, score: 0, partners: 0, accuracy: 0 });
  const [visible, setVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const targets = { users: 190, score: 847, partners: 120, accuracy: 94 };
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1800, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setCounts({ users: Math.round(e * targets.users), score: Math.round(e * targets.score), partners: Math.round(e * targets.partners), accuracy: Math.round(e * targets.accuracy) });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible]);

  const signals = [
    { icon: '📱', title: 'UPI Payments',    desc: 'Frequency, merchant diversity & consistency of digital payments', color: '#3b82f6' },
    { icon: '⚡', title: 'Utility Bills',   desc: 'Electricity, water & mobile recharge payment regularity',         color: '#f59e0b' },
    { icon: '🤝', title: 'SHG Records',     desc: 'Self-Help Group savings discipline & meeting attendance',          color: '#8b5cf6' },
    { icon: '🚖', title: 'Gig Platforms',   desc: 'Ola/Uber/Swiggy tenure, rating & trip completion rate',           color: '#10b981' },
    { icon: '📦', title: 'E-commerce EMI',  desc: 'BNPL repayment & online purchase EMI discipline',                 color: '#06b6d4' },
    { icon: '🏠', title: 'Rental Proxy',    desc: 'UPI-based rent payment consistency & tenure',                     color: '#ec4899' },
    { icon: '📊', title: 'App Usage',       desc: 'Banking app engagement & UPI active days per month',              color: '#a78bfa' },
    { icon: '📱', title: 'Recharge Patterns', desc: 'Mobile recharge regularity and data plan upgrades',             color: '#34d399' },
  ];

  const steps = [
    { n: '01', title: 'Share Your Story',  desc: 'Connect UPI, bills, SHG records — no bank statement needed', icon: '📋' },
    { n: '02', title: 'AI Scores Behavior',desc: '8 behavioral signals analyzed in under 30 seconds',           icon: '🧠' },
    { n: '03', title: 'Get BehaviorScore', desc: 'Receive 300–900 score with multilingual AI explanation',     icon: '◈'  },
    { n: '04', title: 'Access Credit',     desc: 'Matched with NBFCs offering ₹5,000 to ₹2,50,000',           icon: '💳' },
  ];

  const personas = [
    { name: 'Ramesh Kumar',  role: 'Auto-rickshaw Driver, Pune',      score: 718, delta: '+124', avatar: '🚖', quote: '"UPI se roz payment karta hoon, par CIBIL mujhe nahi dekhta tha. BehaviorCredit ne ₹80,000 dilaya."' },
    { name: 'Priya Lakshmi', role: 'SHG Member & Tailor, Chennai',    score: 762, delta: '+203', avatar: '🧵', quote: '"5 years of weekly SHG savings. Finally a lender who recognized that discipline."' },
    { name: 'Meena Devi',    role: 'Vegetable Vendor, Jaipur',        score: 681, delta: '+156', avatar: '🥬', quote: '"8 saal bijli ka bill time pe bhara. BehaviorCredit ne prove kiya — yeh bhi credit hai."' },
  ];

  return (
    <div className="relative">
      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-24 text-center relative overflow-hidden">
        {/* Orbs */}
        <div className="mesh-orb w-96 h-96 -top-20 -left-20 bg-brand-500/6 blur-3xl animate-float" />
        <div className="mesh-orb w-72 h-72 bottom-20 -right-10 bg-purple-500/6 blur-3xl" style={{ animation: 'float 9s ease-in-out infinite reverse' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="badge badge-blue mb-6 text-sm">
            🇮🇳 AAVISHKAR PRAVAH 2.0 · Team AntiGravity #108
          </div>

          <h1 className="section-heading text-5xl sm:text-6xl lg:text-7xl mb-6 text-balance">
            {t('tagline').split("India's")[0]}
            <br />
            <span className="gradient-text">India's Real Heroes</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero_sub')}
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <button className="btn-primary px-8 py-4 text-base" onClick={() => navigate('onboarding')}>
              <span>✦ {t('get_score')}</span>
            </button>
            <button className="btn-secondary px-8 py-4 text-base" onClick={() => navigate('nbfc')}>
              {t('nbfc_portal')} →
            </button>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-600">
            {['🔒 RBI Aligned', '⚡ 30-Second Score', '🌐 7 Languages', '🤝 120+ NBFC Partners', '🆓 Free'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Hero score cards */}
        <div className="relative z-10 mt-20 flex flex-wrap gap-5 justify-center">
          {personas.map((p, i) => (
            <div key={i} className="card-hover px-6 py-5 w-52 text-left cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-4xl mb-3">{p.avatar}</div>
              <div className="font-semibold text-sm mb-0.5">{p.name}</div>
              <div className="text-xs text-slate-500 mb-4">{p.role}</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-3xl text-score-excellent">{p.score}</span>
                <span className="text-xs text-score-excellent bg-emerald-500/10 px-2 py-0.5 rounded-full">{p.delta}</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1">BehaviorScore™</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsRef} className="border-y border-brand-500/10 bg-surface-800/40 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: counts.users + 'M+', label: 'Credit-Invisible Indians', icon: '👥' },
            { val: counts.score,        label: 'Highest BehaviorScore',    icon: '◈' },
            { val: counts.partners + '+', label: 'NBFC Partners',          icon: '🏦' },
            { val: counts.accuracy + '%', label: 'AI Model Accuracy',      icon: '🧠' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-display font-extrabold text-4xl text-brand-400">{s.val}</div>
              <div className="text-xs text-slate-500 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="badge badge-purple mb-4">Process</div>
          <h2 className="section-heading text-4xl sm:text-5xl mb-4">
            {t('invisible_to_investable')} in<br /><span className="gradient-text">4 Steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="card-hover p-8 text-center relative overflow-hidden">
              <span className="absolute top-3 right-4 font-display font-black text-5xl text-brand-500/5">{s.n}</span>
              <div className="text-4xl mb-5">{s.icon}</div>
              <div className="font-display font-bold text-lg mb-3">{s.title}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8 SIGNALS ── */}
      <section className="py-20 px-4 bg-surface-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge badge-amber mb-4">8 Alternative Signals</div>
            <h2 className="section-heading text-4xl sm:text-5xl">
              We See What CIBIL <span className="gradient-text">Can't</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {signals.map((s, i) => (
              <div key={i} className="card p-5 flex gap-4 items-start group cursor-default"
                style={{ '--signal-color': s.color }}
                onMouseEnter={e => e.currentTarget.style.borderColor = s.color + '50'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'}>
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                  style={{ background: s.color + '18', border: `1px solid ${s.color}30` }}>
                  {s.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1.5">{s.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="badge badge-green mb-4">Real People, Real Impact</div>
          <h2 className="section-heading text-4xl sm:text-5xl">
            Stories of <span className="gradient-text">Financial Inclusion</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, i) => (
            <div key={i} className="card-hover p-7">
              <div className="flex gap-4 items-start mb-5">
                <div className="text-5xl">{p.avatar}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.role}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-extrabold text-2xl text-score-excellent">{p.score}</div>
                  <div className="text-xs text-score-excellent">{p.delta} pts</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic">{p.quote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-brand-500/8 to-purple-500/8 border-y border-brand-500/12 text-center">
        <h2 className="section-heading text-4xl sm:text-5xl mb-4">
          Your Behavior Deserves to be<br /><span className="gradient-text">Recognized</span>
        </h2>
        <p className="text-slate-500 text-lg mb-10">Score in 30 seconds. Free forever. 7 Indian languages.</p>
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button className="btn-primary px-10 py-4 text-lg" onClick={() => navigate('onboarding')}>
            <span>✦ {t('get_score')}</span>
          </button>
          <button className="btn-ghost text-base" onClick={() => navigate('score')}>
            Try Score Simulator →
          </button>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {['SDG 1: No Poverty', 'SDG 8: Decent Work', 'SDG 10: Reduced Inequality'].map(s => (
            <div key={s} className="badge badge-green text-xs">🌱 {s}</div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 text-center border-t border-brand-500/8">
        <div className="font-display font-bold text-xl mb-2">
          Behavior<span className="text-brand-400">Credit</span>
        </div>
        <div className="text-xs text-slate-700">
          © 2025 Team AntiGravity #108 · AAVISHKAR PRAVAH 2.0<br />
          India's First AI-Powered Alternative Credit Scoring System
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
