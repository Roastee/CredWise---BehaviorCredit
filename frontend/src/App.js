import React, { useState, Suspense, lazy } from 'react';
import './index.css';
import Navbar from './components/Navbar';

// ── Lazy-loaded pages (code splitting for < 3s load) ──────────
const LandingPage  = lazy(() => import('./pages/LandingPage'));
const Onboarding   = lazy(() => import('./pages/Onboarding'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const ScoreEngine  = lazy(() => import('./pages/ScoreEngine'));
const ChatBot      = lazy(() => import('./pages/ChatBot'));
const NBFCPortal   = lazy(() => import('./pages/NBFCPortal'));
const PersonaDemo  = lazy(() => import('./pages/PersonaDemo'));

// ── 3 pre-loaded demo personas ─────────────────────────────────
export const PERSONAS = {
  ramesh: {
    user: { name: 'Ramesh Kumar', phone: '9876543210', occupation: 'Gig Worker', lang: 'hi', state: 'Maharashtra' },
    scoreData: {
      score: 718,
      breakdown: { paymentHistory: 251, incomeStability: 165, socialCapital: 0, utilityConsistency: 143 },
      signals: { upiMonths: 18, gigPlatform: 'Ola', gigTenure: 14, billsOnTime: 'Usually', shgMember: 'No', merchantDiversity: 'Medium' },
      explanation_en: 'Ramesh demonstrates strong UPI payment discipline over 18 months with consistent Ola platform earnings. His diverse merchant payments and regular electricity bills show genuine financial responsibility.',
      explanation_hi: 'रमेश ने 18 महीनों में मजबूत UPI भुगतान दिखाया है। उनकी Ola कमाई और नियमित बिल भुगतान वित्तीय जिम्मेदारी दर्शाते हैं।',
    },
  },
  priya: {
    user: { name: 'Priya Lakshmi', phone: '9876543211', occupation: 'SHG Member', lang: 'ta', state: 'Tamil Nadu' },
    scoreData: {
      score: 762,
      breakdown: { paymentHistory: 285, incomeStability: 178, socialCapital: 135, utilityConsistency: 164 },
      signals: { upiMonths: 36, shgMember: 'Yes', shgMonths: 48, billsOnTime: 'Always', merchantDiversity: 'Low' },
      explanation_en: 'Priya\'s 4-year SHG commitment combined with perfect utility bill payments makes her a prime borrower. Her community accountability and savings discipline are exceptional credit signals.',
      explanation_ta: 'பிரியாவின் 4 ஆண்டு SHG உறுப்பினர்த்துவம் மற்றும் தொடர்ச்சியான பில் செலுத்துதல் அவரை சிறந்த கடன் வாங்குபவராக்குகிறது.',
    },
  },
  meena: {
    user: { name: 'Meena Devi', phone: '9876543212', occupation: 'Street Vendor', lang: 'kn', state: 'Rajasthan' },
    scoreData: {
      score: 681,
      breakdown: { paymentHistory: 235, incomeStability: 145, socialCapital: 90, utilityConsistency: 162 },
      signals: { upiMonths: 24, shgMember: 'Yes', shgMonths: 24, billsOnTime: 'Always', merchantDiversity: 'Low' },
      explanation_en: 'Meena has built a solid credit foundation through 8 years of timely electricity payments and 2 years of SHG participation. Her score is actively improving each month.',
      explanation_kn: 'ಮೀನಾ 8 ವರ್ಷಗಳ ಸಮಯಕ್ಕೆ ಬಿಲ್ ಪಾವತಿ ಮತ್ತು SHG ಭಾಗವಹಿಸುವಿಕೆಯ ಮೂಲಕ ಉತ್ತಮ ಕ್ರೆಡಿಟ್ ಅಡಿಪಾಯ ನಿರ್ಮಿಸಿದ್ದಾರೆ.',
    },
  },
};

// ── Page loader skeleton ────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 animate-pulse flex items-center justify-center text-xl">◈</div>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser]         = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [activePersona, setActivePersona] = useState(null);

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = (userData, score) => {
    setUser(userData);
    setScoreData(score);
    setActivePersona(null);
    navigate('dashboard');
  };

  // Load a pre-built persona (for demo / NBFC presentation)
  const loadPersona = (personaKey) => {
    const p = PERSONAS[personaKey];
    if (!p) return;
    setUser(p.user);
    setScoreData(p.scoreData);
    setActivePersona(personaKey);
    navigate('dashboard');
  };

  const showNav = !['landing', 'onboarding'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':   return <LandingPage navigate={navigate} loadPersona={loadPersona} />;
      case 'onboarding':return <Onboarding navigate={navigate} onComplete={handleOnboardingComplete} />;
      case 'dashboard': return <Dashboard navigate={navigate} user={user} scoreData={scoreData} activePersona={activePersona} />;
      case 'score':     return <ScoreEngine navigate={navigate} />;
      case 'chat':      return <ChatBot navigate={navigate} user={user} scoreData={scoreData} />;
      case 'nbfc':      return <NBFCPortal navigate={navigate} />;
      case 'persona':   return <PersonaDemo navigate={navigate} loadPersona={loadPersona} />;
      default:          return <LandingPage navigate={navigate} loadPersona={loadPersona} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 text-white relative">
      {/* Ambient mesh */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 20% 20%,rgba(59,130,246,0.06) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(139,92,246,0.05) 0%,transparent 60%)' }}
      />
      {showNav && <Navbar currentPage={currentPage} navigate={navigate} user={user} />}
      <div className="relative z-10">
        <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
      </div>
    </div>
  );
}

export default App;
