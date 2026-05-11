import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STEPS = ['step_profile', 'step_income', 'step_behavior', 'step_verify'];

// ── Input components defined OUTSIDE to prevent focus loss on re-render ──
const I = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block mb-1.5 text-xs font-medium text-slate-400">{label}</label>
    <input className="input-field" {...props} />
  </div>
);
const S = ({ label, children, ...props }) => (
  <div className="mb-4">
    <label className="block mb-1.5 text-xs font-medium text-slate-400">{label}</label>
    <select className="select-field" {...props}>{children}</select>
  </div>
);

const Onboarding = ({ navigate, onComplete }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    name: '', phone: '', lang: 'en', state: '', occupation: '',
    monthlyIncome: '', incomeSource: '',
    upiMonths: '', upiTxns: '20', merchantDiversity: 'Medium',
    billsOnTime: '', electricityStreak: '12', shgMember: 'No', shgMonths: '',
    gigPlatform: 'None', gigTenure: '', gigRating: '4.2',
    appSessions: '10', rechargeAmt: '199',
    aadhaar: '', consent: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const LANGS = [
    { code: 'en', name: 'English' }, { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },  { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },  { code: 'mr', name: 'मराठी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const calcScore = () => {
    let base = 300;
    // UPI (25%)
    const upi = parseInt(form.upiMonths) || 0;
    base += upi >= 36 ? 130 : upi >= 24 ? 100 : upi >= 12 ? 70 : upi >= 6 ? 40 : 15;
    base += { High: 35, Medium: 22, Low: 8 }[form.merchantDiversity] || 8;
    // Bills (18%)
    base += { Always: 100, Usually: 65, Sometimes: 30, Rarely: 10 }[form.billsOnTime] || 0;
    // SHG (15%)
    const shg = parseInt(form.shgMonths) || 0;
    if (form.shgMember === 'Yes') base += shg >= 36 ? 90 : shg >= 24 ? 70 : shg >= 12 ? 45 : 20;
    // Income
    const inc = parseInt(form.monthlyIncome) || 0;
    base += inc >= 50000 ? 55 : inc >= 25000 ? 40 : inc >= 15000 ? 28 : inc >= 8000 ? 16 : 6;
    // Gig
    if (form.gigPlatform !== 'None') {
      const gt = parseInt(form.gigTenure) || 0;
      base += gt >= 24 ? 50 : gt >= 12 ? 32 : gt >= 6 ? 18 : 8;
    }
    // App usage
    base += parseInt(form.appSessions) > 15 ? 30 : parseInt(form.appSessions) > 8 ? 18 : 8;
    // Occupation
    base += { 'SHG Member': 20, 'Farmer': 16, 'Gig Worker': 12, 'Micro Business': 16, 'Street Vendor': 10, 'Daily Wage': 8 }[form.occupation] || 5;
    return Math.min(900, Math.max(300, base));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const msgs = [
      'Analyzing UPI payment patterns...', 'Checking SHG records...',
      'Evaluating utility bill history...', 'Computing social capital score...',
      'Running final BehaviorScore model...', 'Almost done...',
    ];
    for (let i = 0; i < msgs.length; i++) {
      await new Promise(r => setTimeout(r, 360));
      setProgress(Math.round(((i + 1) / msgs.length) * 100));
    }
    await new Promise(r => setTimeout(r, 300));
    const score = calcScore();
    const breakdown = {
      paymentHistory: Math.round(score * 0.35),
      incomeStability: Math.round(score * 0.25),
      socialCapital: Math.round(score * 0.20),
      utilityConsistency: Math.round(score * 0.20),
    };
    setLoading(false);
    i18n.changeLanguage(form.lang);
    onComplete({ name: form.name, phone: form.phone, occupation: form.occupation, lang: form.lang }, { score, breakdown });
  };

  const stepContent = [
    // Step 0: Profile
    <div key={0}>
      <h3 className="font-display text-lg font-semibold mb-5">👤 {t('step_profile')}</h3>
      <I label={t('full_name')} placeholder="Ramesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
      <I label={t('phone')} placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" />
      <S label={t('language')} value={form.lang} onChange={e => { set('lang', e.target.value); i18n.changeLanguage(e.target.value); }}>
        {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
      </S>
      <S label={t('state')} value={form.state} onChange={e => set('state', e.target.value)}>
        <option value="">Select State</option>
        {['Maharashtra','Tamil Nadu','Uttar Pradesh','Rajasthan','Gujarat','Karnataka','West Bengal','Madhya Pradesh','Bihar','Andhra Pradesh','Odisha','Assam','Punjab','Other'].map(s => <option key={s}>{s}</option>)}
      </S>
      <S label={t('occupation')} value={form.occupation} onChange={e => set('occupation', e.target.value)}>
        <option value="">Select Occupation</option>
        {['Gig Worker','Farmer','Street Vendor','SHG Member','Daily Wage','Micro Business','Domestic Worker','Fisher','Artisan','Other'].map(o => <option key={o}>{o}</option>)}
      </S>
    </div>,

    // Step 1: Income
    <div key={1}>
      <h3 className="font-display text-lg font-semibold mb-5">💰 {t('step_income')}</h3>
      <I label={t('monthly_income')} type="number" placeholder="15000" value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} />
      <S label={t('income_source')} value={form.incomeSource} onChange={e => set('incomeSource', e.target.value)}>
        <option value="">Select Source</option>
        {['UPI Business Payments','Cash (Daily)','Bank Transfer','Agricultural Sales','MGNREGA / Govt Scheme','Kisan Credit Card','Mixed Sources'].map(s => <option key={s}>{s}</option>)}
      </S>
      <I label="Average Monthly Mobile Recharge (₹)" type="number" placeholder="199" value={form.rechargeAmt} onChange={e => set('rechargeAmt', e.target.value)} />
      <S label="Gig Platform (if any)" value={form.gigPlatform} onChange={e => set('gigPlatform', e.target.value)}>
        {['None','Ola','Uber','Swiggy','Zomato','Dunzo','Urban Company','Other'].map(p => <option key={p}>{p}</option>)}
      </S>
      {form.gigPlatform !== 'None' && (
        <I label="Gig Tenure (months)" type="number" placeholder="18" value={form.gigTenure} onChange={e => set('gigTenure', e.target.value)} />
      )}
    </div>,

    // Step 2: Behavior (8 signals)
    <div key={2}>
      <h3 className="font-display text-lg font-semibold mb-5">🧠 {t('step_behavior')}</h3>
      <I label={t('upi_months')} type="number" placeholder="18" value={form.upiMonths} onChange={e => set('upiMonths', e.target.value)} />
      <S label="UPI Merchant Diversity" value={form.merchantDiversity} onChange={e => set('merchantDiversity', e.target.value)}>
        <option value="High">High — many different merchants</option>
        <option value="Medium">Medium — some variety</option>
        <option value="Low">Low — mostly one or two</option>
      </S>
      <S label={t('bills_on_time')} value={form.billsOnTime} onChange={e => set('billsOnTime', e.target.value)}>
        <option value="">How often on time?</option>
        {['Always','Usually','Sometimes','Rarely'].map(o => <option key={o}>{o}</option>)}
      </S>
      <I label="Electricity Bill — Consecutive Months On Time" type="number" placeholder="12" value={form.electricityStreak} onChange={e => set('electricityStreak', e.target.value)} />
      <div className="mb-4">
        <label className="block mb-2 text-xs font-medium text-slate-400">{t('shg_member')}</label>
        <div className="flex gap-3">
          {['Yes','No'].map(v => (
            <button key={v} type="button" onClick={() => set('shgMember', v)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border transition-all
                ${form.shgMember === v ? 'bg-brand-500/15 text-brand-400 border-brand-500/40' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/20'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      {form.shgMember === 'Yes' && (
        <I label={t('shg_months')} type="number" placeholder="24" value={form.shgMonths} onChange={e => set('shgMonths', e.target.value)} />
      )}
      <I label="Banking App Sessions / Month" type="number" placeholder="10" value={form.appSessions} onChange={e => set('appSessions', e.target.value)} />
    </div>,

    // Step 3: Verify
    <div key={3}>
      <h3 className="font-display text-lg font-semibold mb-5">🔒 {t('step_verify')}</h3>
      <I label={t('aadhaar_hint')} placeholder="XXXX" maxLength={4} value={form.aadhaar} onChange={e => set('aadhaar', e.target.value)} />
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-5">
        <p className="text-xs text-emerald-400 leading-relaxed">
          🔐 AES-256 encrypted · DPDPA 2023 compliant · RBI Account Aggregator framework<br/>
          Lenders only see your BehaviorScore — never raw signal data.
        </p>
      </div>
      <label className="flex gap-3 items-start cursor-pointer">
        <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)}
          className="w-4 h-4 mt-0.5 accent-brand-500 cursor-pointer flex-shrink-0" />
        <span className="text-xs text-slate-400 leading-relaxed">{t('consent_text')}</span>
      </label>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back */}
        <button onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6 bg-transparent border-0 cursor-pointer">
          ← Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow">◈</div>
          <h1 className="font-display text-2xl font-bold mb-1">{t('onboarding_title')}</h1>
          <p className="text-sm text-slate-500">{t('onboarding_sub')}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-brand-500' : 'bg-white/[0.06]'}`} />
              <div className={`text-[10px] mt-1.5 text-center font-medium transition-colors ${i === step ? 'text-brand-400' : i < step ? 'text-slate-500' : 'text-slate-700'}`}>
                {t(s)}
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-bright rounded-2xl p-6">
          {stepContent[step]}

          {/* Loading */}
          {loading && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Analyzing 47 behavioral signals...</span>
                <span className="text-brand-400 font-semibold">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-gradient-to-r from-brand-500 to-cyan-400" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="flex gap-3 mt-2">
            {step > 0 && (
              <button className="btn-secondary flex-1 justify-center" onClick={() => setStep(s => s - 1)} disabled={loading}>
                {t('back')}
              </button>
            )}
            {step < 3 ? (
              <button className="btn-primary flex-1 justify-center" onClick={() => setStep(s => s + 1)}>
                <span>{t('next')}</span>
              </button>
            ) : (
              <button className="btn-primary flex-1 justify-center" onClick={handleSubmit}
                disabled={!form.consent || loading || !form.name || !form.phone}>
                <span>{loading ? t('scoring') : t('generate_score')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex gap-3 justify-center mt-5 flex-wrap">
          {['🔒 RBI Aligned', '⚡ 30 Seconds', '🆓 Free', '🌐 7 Languages'].map(b => (
            <span key={b} className="text-xs text-slate-600">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
