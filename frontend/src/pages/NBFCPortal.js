import React, { useState } from 'react';

const NBFCPortal = ({ navigate }) => {
  const [tab, setTab] = useState('dashboard');

  const applicants = [
    { id: 'BC-2025-00847', name: 'Ramesh Kumar', score: 718, occ: 'Gig Worker',   amt: 80000,  status: 'Pre-Approved', risk: 'Low',      ts: '2 hrs ago' },
    { id: 'BC-2025-00831', name: 'Priya Lakshmi',score: 762, occ: 'SHG Member',   amt: 120000, status: 'Approved',     risk: 'Very Low', ts: '5 hrs ago' },
    { id: 'BC-2025-00819', name: 'Meena Devi',   score: 681, occ: 'Vendor',       amt: 40000,  status: 'Under Review', risk: 'Med',      ts: '1 day ago' },
    { id: 'BC-2025-00804', name: 'Suresh Yadav', score: 624, occ: 'Farmer',       amt: 60000,  status: 'Eligible',     risk: 'Medium',   ts: '1 day ago' },
    { id: 'BC-2025-00798', name: 'Lakshmi Bai',  score: 709, occ: 'Artisan',      amt: 25000,  status: 'Approved',     risk: 'Low',      ts: '2 days ago' },
  ];

  const kpis = [
    { label: 'Applications', val: '2,847', delta: '+12% MTD', icon: '📋', c: '#3b82f6' },
    { label: 'Avg Score',    val: '694',   delta: '+8 pts avg', icon: '◈', c: '#10b981' },
    { label: 'Approval Rate',val: '73%',   delta: '+5% MoM',   icon: '✅', c: '#8b5cf6' },
    { label: 'Disbursed',    val: '₹4.2Cr',delta: '+₹0.8Cr MTD',icon:'💳',c: '#f59e0b' },
  ];

  const riskColors = { 'Very Low': 'badge-green', 'Low': 'badge-blue', 'Med': 'badge-amber', 'Medium': 'badge-amber', 'High': 'badge-red' };
  const statusColors = { 'Approved': '#10b981', 'Pre-Approved': '#3b82f6', 'Eligible': '#8b5cf6', 'Under Review': '#f59e0b' };

  const TABS = [
    { id: 'dashboard',   label: 'Dashboard' },
    { id: 'applicants',  label: 'Applicants' },
    { id: 'api',         label: 'API Docs' },
    { id: 'analytics',   label: 'Analytics' },
  ];

  const apiExample = `POST /api/v2/score
Authorization: Bearer YOUR_API_KEY

{
  "consent_token": "ct_a4f8e2b1c9d7",
  "occupation": "Gig Worker",
  "monthly_income": 18000,
  "signals": {
    "upi":      { "months_active": 18, "avg_monthly_txns": 45, "merchant_diversity": "High" },
    "bills":    { "electricity_streak": 12, "mobile_recharge_reg": "Regular" },
    "shg":      { "months_member": 0 },
    "gig":      { "platform": "Ola", "tenure_months": 14, "rating": 4.6 },
    "app_usage":{ "banking_app_sessions_monthly": 10, "upi_app_active_days_monthly": 22 }
  }
}`;

  const apiResponse = `{
  "behavior_score": 718,
  "grade": "B+",
  "credit_band": "Near-Prime",
  "risk_band": "Low",
  "max_eligible_loan": 80000,
  "best_rate": 14.5,
  "recommendation": "PRE_APPROVE",
  "recommended_products": ["Micro Business Loan", "Two-Wheeler Loan"],
  "explanation_en": "Ramesh demonstrates strong UPI payment discipline...",
  "explanation_hi": "रमेश का UPI भुगतान इतिहास मजबूत है...",
  "valid_until": "2026-06-11T00:00:00Z"
}`;

  const months = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const disbursed = [1.2, 1.4, 1.6, 1.8, 2.1, 2.4, 2.7, 3.0, 3.4, 3.7, 4.0, 4.2];
  const maxD = Math.max(...disbursed);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="badge badge-purple mb-2">Partner Portal</div>
          <h1 className="font-display text-3xl font-bold">NBFC Partner Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">BehaviorCredit API v2.1 · Real-time alternative credit scoring</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="badge badge-green">● API Online</div>
          <div className="text-xs text-slate-500 font-mono px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            Key: bc_live_****3f9a
          </div>
        </div>
      </div>

      <div className="tab-bar mb-7">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab-item ${tab === t.id ? 'tab-active' : 'tab-inactive'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {kpis.map((k, i) => (
              <div key={i} className="card p-5">
                <div className="text-2xl mb-3">{k.icon}</div>
                <div className="font-display font-extrabold text-3xl mb-1" style={{ color: k.c }}>{k.val}</div>
                <div className="font-semibold text-sm text-white mb-0.5">{k.label}</div>
                <div className="text-xs text-slate-600">{k.delta}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-6">
              <div className="font-display font-bold text-sm mb-5">Score Distribution</div>
              <div className="space-y-3">
                {[{ label: '750–900 Prime', pct: 28, c: '#10b981' }, { label: '640–749 Near-Prime', pct: 35, c: '#3b82f6' }, { label: '520–639 Sub-Prime', pct: 24, c: '#f59e0b' }, { label: '300–519 Thin-File', pct: 13, c: '#ef4444' }].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">{s.label}</span><span style={{ color: s.c }}>{s.pct}%</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.pct}%`, background: s.c }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <div className="font-display font-bold text-sm mb-5">Monthly Disbursements (₹Cr)</div>
              <div className="flex items-end gap-1.5 h-32">
                {disbursed.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md transition-all duration-700" style={{ height: `${(v / maxD) * 100}%`, background: `linear-gradient(to top, #3b82f6, #06b6d4)`, opacity: i === 11 ? 1 : 0.5 }} />
                    <span className="text-[9px] text-slate-700 hidden sm:block">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicants */}
      {tab === 'applicants' && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-brand-500/10 flex justify-between items-center">
            <div className="font-display font-bold text-sm">Recent Applications</div>
            <div className="badge badge-blue">Live</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID','Applicant','Score','Occupation','Requested','Risk','Status','Time'].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicants.map((a, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">{a.id}</td>
                    <td className="px-5 py-4 text-sm font-medium">{a.name}</td>
                    <td className="px-5 py-4">
                      <span className="font-display font-bold text-lg" style={{ color: a.score >= 750 ? '#10b981' : a.score >= 650 ? '#3b82f6' : '#f59e0b' }}>{a.score}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{a.occ}</td>
                    <td className="px-5 py-4 text-sm font-semibold">₹{a.amt.toLocaleString()}</td>
                    <td className="px-5 py-4"><span className={`badge ${riskColors[a.risk] || 'badge-blue'} text-[10px]`}>{a.risk}</span></td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold" style={{ color: statusColors[a.status] || '#94a3b8' }}>{a.status}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">{a.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Docs */}
      {tab === 'api' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { method: 'POST', path: '/api/v2/score', desc: 'Score single applicant (<800ms)' },
              { method: 'POST', path: '/api/v2/bulk-score', desc: 'Batch score up to 500 applicants' },
              { method: 'GET',  path: '/api/v2/nbfc/score/:id', desc: 'Retrieve score by user ID' },
              { method: 'POST', path: '/api/v2/consent', desc: 'Issue DPDPA consent token' },
              { method: 'GET',  path: '/api/v2/nbfc/applicants', desc: 'List partner applicants' },
              { method: 'POST', path: '/v2/explain', desc: 'Gemini AI explanation in 7 languages' },
            ].map((e, i) => (
              <div key={i} className="card p-4 flex gap-3 items-start">
                <span className={`badge text-[10px] flex-shrink-0 ${e.method === 'POST' ? 'badge-blue' : 'badge-green'}`}>{e.method}</span>
                <div>
                  <div className="font-mono text-xs text-white mb-1">{e.path}</div>
                  <div className="text-[11px] text-slate-500">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Request</div>
              <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto leading-relaxed">{apiExample}</pre>
            </div>
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Response</div>
              <pre className="text-[11px] text-brand-400 font-mono overflow-x-auto leading-relaxed">{apiResponse}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="font-display font-bold text-sm mb-5">Signal Contribution Analysis</div>
            {[
              { label: 'UPI Payment History',   pct: 82, w: '25%', c: '#3b82f6' },
              { label: 'SHG Participation',      pct: 74, w: '15%', c: '#8b5cf6' },
              { label: 'Utility Bill Consistency',pct: 91, w: '18%', c: '#f59e0b' },
              { label: 'Gig Platform Tenure',    pct: 58, w: '10%', c: '#10b981' },
              { label: 'App Usage Regularity',   pct: 67, w: '8%',  c: '#06b6d4' },
            ].map((s, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{s.label} <span className="text-slate-700">({s.w})</span></span>
                  <span style={{ color: s.c }}>{s.pct}% avg</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.pct}%`, background: s.c }} /></div>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <div className="font-display font-bold text-sm mb-5">Occupation Breakdown</div>
            <div className="space-y-3.5">
              {[
                { label: 'SHG Members', pct: 32, c: '#8b5cf6', avg: 742 },
                { label: 'Gig Workers', pct: 28, c: '#3b82f6', avg: 698 },
                { label: 'Farmers',     pct: 20, c: '#10b981', avg: 681 },
                { label: 'Vendors',     pct: 12, c: '#f59e0b', avg: 654 },
                { label: 'Others',      pct: 8,  c: '#06b6d4', avg: 612 },
              ].map((o, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: o.c }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{o.label}</span>
                      <span className="text-slate-500">Avg: <span className="font-semibold" style={{ color: o.c }}>{o.avg}</span></span>
                    </div>
                    <div className="progress-bar h-1"><div className="progress-fill" style={{ width: `${o.pct}%`, background: o.c }} /></div>
                  </div>
                  <span className="text-xs text-slate-600 w-8">{o.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NBFCPortal;
