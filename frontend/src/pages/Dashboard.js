import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ScoreGauge from '../components/ScoreGauge';

const Dashboard = ({ navigate, user, scoreData }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);

  const score     = scoreData?.score || 718;
  const breakdown = scoreData?.breakdown || { paymentHistory: 251, incomeStability: 179, socialCapital: 143, utilityConsistency: 145 };
  const name      = user?.name || 'Ramesh Kumar';

  const getColor = s => s >= 750 ? '#10b981' : s >= 600 ? '#3b82f6' : s >= 450 ? '#f59e0b' : '#ef4444';
  const getLabel = s => s >= 750 ? t('excellent') : s >= 600 ? t('good') : s >= 450 ? t('fair') : t('building');
  const color = getColor(score);

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#050a14', scale: 2 });
      const pdf = new jsPDF({ orientation: 'portrait', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height / canvas.width) * w;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`BehaviorScore-${name.replace(' ', '_')}-${score}.pdf`);
    } catch { alert('PDF generation failed. Try again.'); }
    setPdfLoading(false);
  };

  const signals = [
    { label: t('payment_history'),       key: 'paymentHistory',      icon: '📱', weight: '35%', max: 315, color: '#3b82f6' },
    { label: t('income_stability'),      key: 'incomeStability',     icon: '💰', weight: '25%', max: 225, color: '#8b5cf6' },
    { label: t('social_capital'),        key: 'socialCapital',       icon: '🤝', weight: '20%', max: 180, color: '#10b981' },
    { label: t('utility_consistency'),   key: 'utilityConsistency',  icon: '⚡', weight: '20%', max: 180, color: '#f59e0b' },
  ];

  const loanOffers = [
    { nbfc: 'MicroFirst Finance', logo: '🏦', amount: '₹80,000',  rate: '14.5%', tenure: '24 months', status: 'Pre-Approved', color: '#10b981' },
    { nbfc: 'Jan Sahyog NBFC',    logo: '🤝', amount: '₹50,000',  rate: '16.2%', tenure: '18 months', status: 'Eligible',     color: '#3b82f6' },
    { nbfc: 'Grameen Credit Co.', logo: '🌾', amount: '₹30,000',  rate: '18.0%', tenure: '12 months', status: 'Eligible',     color: '#8b5cf6' },
  ];

  const improvements = [
    { action: 'Link UPI account for auto-tracking',   impact: '+45 pts', icon: '📱', effort: 'Easy',   signal: 'UPI' },
    { action: 'Upload 12 months utility bill records', impact: '+38 pts', icon: '⚡', effort: 'Easy',   signal: 'Bills' },
    { action: 'Join a SHG group in your area',        impact: '+60 pts', icon: '🤝', effort: 'Medium', signal: 'SHG' },
    { action: 'Register on a gig platform',           impact: '+40 pts', icon: '🚖', effort: 'Medium', signal: 'Gig' },
  ];

  const history = [
    { date: 'May 2026', score: 718, event: 'Current BehaviorScore™', delta: '+124', type: 'current' },
    { date: 'Mar 2026', score: 680, event: 'SHG membership verified (+60 pts)', delta: '+60', type: 'positive' },
    { date: 'Jan 2026', score: 620, event: 'UPI consistency improved (+45 pts)', delta: '+45', type: 'positive' },
    { date: 'Nov 2025', score: 575, event: 'Utility bill history linked (+38 pts)', delta: '+38', type: 'positive' },
    { date: 'Sep 2025', score: 537, event: 'Onboarding score generated', delta: 'Base', type: 'base' },
  ];

  const TABS = [
    { id: 'overview', label: t('overview') },
    { id: 'loans',    label: t('loan_offers') },
    { id: 'improve',  label: t('improve_score') },
    { id: 'history',  label: t('history') },
  ];

  const Stat = ({ label, val, sub, icon, c }) => (
    <div className="card p-5 hover:border-brand-500/30 transition-all hover:-translate-y-0.5">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-display font-extrabold text-3xl mb-0.5" style={{ color: c }}>{val}</div>
      <div className="font-semibold text-sm text-white mb-0.5">{label}</div>
      <div className="text-xs text-slate-600">{sub}</div>
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8" ref={reportRef}>
      {/* Welcome */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-sm text-slate-500 mb-1">{t('welcome_back')}</div>
          <h1 className="font-display text-3xl font-bold">{name}</h1>
          <div className="text-sm text-slate-500 mt-1">{t('financial_identity')}</div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-xs !py-2 !px-4" onClick={() => navigate('chat')}>💬 {t('ask_ai')}</button>
          <button className="btn-primary text-xs !py-2 !px-4"  onClick={() => navigate('score')}><span>◈ {t('score_engine')}</span></button>
          <button className="btn-ghost text-xs !py-2 !px-3" onClick={handleExportPDF} disabled={pdfLoading}>
            {pdfLoading ? '⏳' : '↓'} PDF
          </button>
        </div>
      </div>

      {/* Score + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 mb-6">
        {/* Score card */}
        <div className="card p-8 text-center relative overflow-hidden"
          style={{ borderColor: color + '30', background: `radial-gradient(circle at 50% 0%, ${color}06, transparent 60%), rgba(13,31,53,0.9)` }}>
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">{t('score_label')}</div>
          <ScoreGauge score={score} size={180} />
          <div className="mt-5">
            <span className="badge text-sm px-4 py-1.5" style={{ background: color + '18', color, border: `1px solid ${color}40` }}>
              ✦ {getLabel(score)} Credit Profile
            </span>
            <div className="text-xs text-slate-500 mt-3">
              {t('better_than', { pct: 68 })}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <Stat label={t('max_loan')}       val="₹80,000"  sub="Maximum eligible"        icon="💳" c="#10b981" />
          <Stat label={t('interest_rate')}  val="14.5%"    sub="Best available rate"      icon="📊" c="#3b82f6" />
          <Stat label={t('nbfc_matches')}   val="3 Offers"  sub="Ready for application"   icon="🏦" c="#8b5cf6" />
          <Stat label={t('score_change')}   val="+124"     sub="vs CIBIL baseline"        icon="📈" c="#f59e0b" />
        </div>
      </div>

      {/* NBFC Badge */}
      <div className="flex items-center gap-3 p-4 glass-bright rounded-xl mb-6 border-emerald-500/20">
        <span className="text-2xl">✅</span>
        <div className="flex-1">
          <span className="font-semibold text-sm text-emerald-400">NBFC-Ready Score Badge</span>
          <span className="text-xs text-slate-500 ml-2">Share your verified BehaviorScore with any NBFC partner instantly</span>
        </div>
        <div className="font-display font-black text-xl text-emerald-400">{score}</div>
        <div className="text-xs font-semibold px-3 py-1 rounded-full border" style={{ color, background: color + '15', borderColor: color + '40' }}>
          {getLabel(score)}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-6">
        {TABS.map(t2 => (
          <button key={t2.id} onClick={() => setTab(t2.id)}
            className={`tab-item ${tab === t2.id ? 'tab-active' : 'tab-inactive'}`}>
            {t2.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-display font-bold text-base mb-6">Score Breakdown</h3>
            {signals.map((s, i) => {
              const val = breakdown[s.key] || 0;
              const pct = Math.round((val / s.max) * 100);
              return (
                <div key={i} className="mb-5">
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{s.label}</div>
                        <div className="text-[10px] text-slate-600">Weight: {s.weight}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-base" style={{ color: s.color }}>{val}</div>
                      <div className="text-[10px] text-slate-600">/{s.max}</div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-base mb-6">Signal Health</h3>
            {[
              { label: 'UPI Transaction Consistency',  pct: 88, icon: '📱' },
              { label: 'Bill Payment Regularity',      pct: 92, icon: '⚡' },
              { label: 'SHG Participation',            pct: 76, icon: '🤝' },
              { label: 'Gig Platform Performance',     pct: 68, icon: '🚖' },
              { label: 'App Usage Consistency',        pct: 71, icon: '📊' },
              { label: 'Recharge Regularity',          pct: 83, icon: '🔄' },
            ].map((s, i) => {
              const c = s.pct >= 80 ? '#10b981' : s.pct >= 60 ? '#3b82f6' : '#f59e0b';
              return (
                <div key={i} className="flex items-center gap-3 mb-4">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium">{s.label}</span>
                      <span className="text-xs font-semibold" style={{ color: c }}>{s.pct}%</span>
                    </div>
                    <div className="progress-bar h-1">
                      <div className="progress-fill" style={{ width: `${s.pct}%`, background: c }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loan Offers */}
      {tab === 'loans' && (
        <div>
          <p className="text-sm text-slate-500 mb-5">
            Based on your BehaviorScore of <strong style={{ color }}>{score}</strong>, you qualify for {loanOffers.length} loan products:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loanOffers.map((l, i) => (
              <div key={i} className="card p-6 hover:-translate-y-1 transition-all duration-300"
                style={{ borderColor: l.color + '25' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = l.color + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = l.color + '25'}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl">{l.logo}</span>
                    <span className="font-bold text-sm">{l.nbfc}</span>
                  </div>
                  <span className="badge text-[10px]" style={{ background: l.color + '18', color: l.color, border: `1px solid ${l.color}30` }}>{l.status}</span>
                </div>
                <div className="font-display font-extrabold text-4xl mb-5" style={{ color: l.color }}>{l.amount}</div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Rate</div>
                    <div className="font-bold text-sm">{l.rate}</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Tenure</div>
                    <div className="font-bold text-sm">{l.tenure}</div>
                  </div>
                </div>
                <button className="btn-primary w-full justify-center text-sm"><span>Apply Now →</span></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improve */}
      {tab === 'improve' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-2">Follow these actions to boost your score:</p>
          {improvements.map((imp, i) => (
            <div key={i} className="card p-5 flex items-center gap-5 hover:border-brand-500/30 transition-all">
              <span className="text-3xl">{imp.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1.5">{imp.action}</div>
                <div className="flex gap-2">
                  <span className="badge badge-blue text-[10px]">Signal: {imp.signal}</span>
                  <span className="badge badge-purple text-[10px]">Effort: {imp.effort}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 mr-2">
                <div className="font-display font-extrabold text-2xl text-score-excellent">{imp.impact}</div>
                <div className="text-[10px] text-slate-600">est. boost</div>
              </div>
              <button className="btn-primary !py-2 !px-4 !text-xs"><span>Start</span></button>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-base mb-6">Score Journey</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{ background: h.type === 'current' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${h.type === 'current' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.04)'}` }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: h.type === 'current' ? '#3b82f6' : '#10b981' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{h.event}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{h.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-xl">{h.score}</div>
                  <div className="text-xs text-score-excellent">{h.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
