import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'ta', label: 'த',  name: 'Tamil' },
  { code: 'te', label: 'తె', name: 'Telugu' },
  { code: 'bn', label: 'বাং', name: 'Bengali' },
  { code: 'mr', label: 'मर', name: 'Marathi' },
  { code: 'kn', label: 'ಕ',  name: 'Kannada' },
];

const Navbar = ({ currentPage, navigate, user }) => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('navbar_dashboard'), icon: '⬡' },
    { id: 'score',     label: t('navbar_score'),     icon: '◈' },
    { id: 'chat',      label: t('navbar_chat'),      icon: '◎' },
    { id: 'persona',   label: 'Demo',                icon: '▶' },
    { id: 'nbfc',      label: t('navbar_nbfc'),      icon: '◇' },
  ];

  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  return (
    <nav className="sticky top-0 z-50 bg-surface-900/85 backdrop-blur-xl border-b border-brand-500/10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <button onClick={() => navigate('landing')}
          className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-lg font-bold shadow-[0_0_12px_rgba(59,130,246,0.4)]">
            ◈
          </div>
          <span className="font-display font-bold text-lg text-white hidden sm:block">
            Behavior<span className="text-brand-400">Credit</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer border transition-all duration-200
                ${currentPage === item.id
                  ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                }`}>
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: Lang + User */}
        <div className="flex items-center gap-3">

          {/* Language Switcher */}
          <div className="relative">
            <button onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <span className="text-base">{currentLang.label}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-surface-700 border border-brand-500/20 rounded-xl shadow-card overflow-hidden z-50">
                {LANGS.map(lang => (
                  <button key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors cursor-pointer border-0
                      ${i18n.language === lang.code
                        ? 'bg-brand-500/15 text-brand-400'
                        : 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}>
                    <span className="w-6 text-center font-bold text-base">{lang.label}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User pill or CTA */}
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name?.split(' ')[0] || 'User'}</span>
            </div>
          ) : (
            <button className="btn-primary !py-2 !px-4 !text-xs" onClick={() => navigate('onboarding')}>
              Get Score
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-white/5">
        {navItems.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors cursor-pointer border-0 bg-transparent
              ${currentPage === item.id ? 'text-brand-400' : 'text-slate-500'}`}>
            <span>{item.icon}</span>
            <span className="text-[10px]">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
