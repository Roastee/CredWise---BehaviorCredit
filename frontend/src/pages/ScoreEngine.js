import React, { useState, useCallback } from 'react';
import ScoreGauge from '../components/ScoreGauge';

const ScoreEngine = ({ navigate }) => {
  const [signals, setSignals] = useState({
    upiMonths: 18, monthlyIncome: 20000, shgMonths: 0,
    billsOnTime: 'Always', merchantDiversity: 'Medium', savingsConsistency: 'Regular',
    gigTenure: 0, appSessions: 10, rechargeAmt: 199, electricityStreak: 12,
  });
  const [computing, setComputing] = useState(false);

  const S = (k, v) => setSignals(s => ({ ...s, [k]: v }));

  const compute = useCallback(() => {
    let base = 300;
    const { upiMonths, monthlyIncome, shgMonths, billsOnTime, merchantDiversity, savingsConsistency, gigTenure, appSessions, rechargeAmt, electricityStreak } = signals;
    const upiBase = upiMonths >= 36 ? 130 : upiMonths >= 24 ? 100 : upiMonths >= 12 ? 70 : upiMonths >= 6 ? 40 : 15;
    base += upiBase + ({ High: 35, Medium: 22, Low: 8 }[merchantDiversity] || 8);
    base += monthlyIncome >= 50000 ? 55 : monthlyIncome >= 25000 ? 42 : monthlyIncome >= 15000 ? 30 : monthlyIncome >= 8000 ? 18 : 8;
    base += { Regular: 40, Occasional: 20, Irregular: 0 }[savingsConsistency] || 0;
    base += { Always: 95, Usually: 65, Sometimes: 32, Rarely: 10 }[billsOnTime] || 0;
    base += Math.min(80, electricityStreak * 3.2);
    if (shgMonths > 0) base += shgMonths >= 36 ? 90 : shgMonths >= 24 ? 68 : shgMonths >= 12 ? 45 : 20;
    if (gigTenure > 0) base += gigTenure >= 24 ? 52 : gigTenure >= 12 ? 35 : 18;
    base += appSessions > 15 ? 30 : appSessions > 8 ? 18 : 8;
    base += rechargeAmt > 299 ? 25 : rechargeAmt > 149 ? 18 : 8;
    return Math.min(900, Math.max(300, Math.round(base)));
  }, [signals]);

  const [score, setScore] = useState(compute);
  const [prevScore, setPrev] = useState(score);

  const recalc = () => {
    setComputing(true);
    setPrev(score);
    setTimeout(() => { setScore(compute()); setComputing(false); }, 700);
  };

  const getColor = s => s >= 750 ? '#10b981' : s >= 600 ? '#3b82f6' : s >= 450 ? '#f59e0b' : '#ef4444';
  const diff = score - prevScore;
  const insight = score >= 760 ? '🚀 Prime borrower! Pre-approved for ₹1.5L+ at 12.5% p.a.'
    : score >= 660 ? '✅ Strong profile. Eligible for ₹80K at 14.5% p.a. from 3 NBFCs.'
    : score >= 560 ? '📈 Good progress. ₹40K eligible with conditions. Boost SHG & UPI.'
    : '🌱 Building stage. Focus on UPI consistency and bill payments first.';

  const Slider = ({ label, k, min, max, unit = '' }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-brand-400">{unit === '₹' ? `₹${signals[k].toLocaleString()}` : `${signals[k]}${unit}`}</span>
      </div>
      <input type="range" min={min} max={max} value={signals[k]} onChange={e => S(k, parseInt(e.target.value))}
        className="w-full" style={{ accentColor: '#3b82f6', background: `linear-gradient(to right,#3b82f6 ${((signals[k]-min)/(max-min))*100}%,rgba(255,255,255,0.07) 0%)` }} />
      <div className="flex justify-between text-[10px] text-slate-700 mt-0.5">
        <span>{unit === '₹' ? `₹${min.toLocaleString()}` : `${min}${unit}`}</span>
        <span>{unit === '₹' ? `₹${max.toLocaleString()}` : `${max}${unit}`}</span>
      </div>
    </div>
  );

  const Sel = ({ label, k, opts }) => (
    <div className="mb-4">
      <label className="text-xs text-slate-400 block mb-1.5">{label}</label>
      <select value={signals[k]} onChange={e => S(k, e.target.value)} className="select-field text-xs">
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  const presets = [
    { label: '🚖 Ramesh (Gig)', cfg: { upiMonths: 18, monthlyIncome: 18000, shgMonths: 0, billsOnTime: 'Usually', merchantDiversity: 'Medium', savingsConsistency: 'Occasional', gigTenure: 14, appSessions: 10, rechargeAmt: 199, electricityStreak: 8 } },
    { label: '🧵 Priya (SHG)', cfg: { upiMonths: 36, monthlyIncome: 12000, shgMonths: 48, billsOnTime: 'Always', merchantDiversity: 'Low', savingsConsistency: 'Regular', gigTenure: 0, appSessions: 6, rechargeAmt: 149, electricityStreak: 36 } },
    { label: '🌾 Meena (Farmer)', cfg: { upiMonths: 12, monthlyIncome: 25000, shgMonths: 24, billsOnTime: 'Always', merchantDiversity: 'Low', savingsConsistency: 'Regular', gigTenure: 0, appSessions: 4, rechargeAmt: 99, electricityStreak: 24 } },
    { label: '🏪 Suresh (Vendor)', cfg: { upiMonths: 24, monthlyIncome: 30000, shgMonths: 12, billsOnTime: 'Usually', merchantDiversity: 'High', savingsConsistency: 'Occasional', gigTenure: 0, appSessions: 12, rechargeAmt: 299, electricityStreak: 18 } },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2 mb-1">
          <span className="text-brand-400">◈</span> BehaviorScore Simulator
        </h1>
        <p className="text-sm text-slate-500">Tweak 8 behavioral signals and see the score update live</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="card p-6 h-fit">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Signal Controls</div>
          <Slider label="📱 UPI Active Months" k="upiMonths" min={0} max={60} unit=" mo" />
          <Slider label="💰 Monthly Income" k="monthlyIncome" min={3000} max={100000} unit="₹" />
          <Slider label="🤝 SHG Membership (months)" k="shgMonths" min={0} max={60} unit=" mo" />
          <Slider label="🚖 Gig Tenure (months)" k="gigTenure" min={0} max={48} unit=" mo" />
          <Slider label="📊 App Sessions/month" k="appSessions" min={0} max={30} />
          <Slider label="⚡ Electricity Streak (mo)" k="electricityStreak" min={0} max={60} unit=" mo" />
          <Slider label="🔄 Monthly Recharge (₹)" k="rechargeAmt" min={49} max={999} unit="₹" />
          <Sel label="Bills on Time" k="billsOnTime" opts={['Always','Usually','Sometimes','Rarely']} />
          <Sel label="UPI Merchant Diversity" k="merchantDiversity" opts={['High','Medium','Low']} />
          <Sel label="Savings Consistency" k="savingsConsistency" opts={['Regular','Occasional','Irregular']} />
          <button className="btn-primary w-full justify-center mt-2" onClick={recalc} disabled={computing}>
            <span>{computing ? '⏳ Computing...' : '▶ Calculate Score'}</span>
          </button>
        </div>

        <div className="space-y-5">
          <div className="card p-8 text-center relative overflow-hidden" style={{ borderColor: getColor(score) + '30' }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 0%, ${getColor(score)}06, transparent 70%)` }} />
            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">Live BehaviorScore™</div>
              <div className="flex justify-center"><ScoreGauge score={computing ? prevScore : score} size={200} /></div>
              {diff !== 0 && !computing && (
                <div className={`inline-flex items-center gap-1 mt-4 px-4 py-1.5 rounded-full text-sm font-bold ${diff > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} pts {diff > 0 ? 'gained' : 'lost'}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5 border-brand-500/25">
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">AI Insight</div>
            <p className="text-sm leading-relaxed">{insight}</p>
          </div>

          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Load Preset Profile</div>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((p, i) => (
                <button key={i} onClick={() => { setSignals(p.cfg); setTimeout(recalc, 50); }}
                  className="btn-ghost !py-2.5 !px-4 !text-xs text-left w-full">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreEngine;
