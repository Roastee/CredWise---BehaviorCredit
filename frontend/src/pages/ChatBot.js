import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const LANG_NAMES = { en:'English', hi:'Hindi', ta:'Tamil', te:'Telugu', bn:'Bengali', mr:'Marathi', kn:'Kannada' };

// Multilingual answers keyed by intent then language
const ANSWERS = {
  score: {
    en: (s) => `Your BehaviorScore of **${s}** reflects your real financial behaviour — UPI usage, bill payments, and community participation. You're ranked better than 65% of first-time applicants. Pay one utility bill via UPI today to boost it further.`,
    hi: (s) => `आपका BehaviorScore **${s}** आपके UPI भुगतान, बिल और SHG भागीदारी से बना है। आज UPI से बिजली बिल भरें और स्कोर बढ़ाएं।`,
    ta: (s) => `உங்கள் BehaviorScore **${s}** உங்கள் UPI கட்டணம் மற்றும் பில் செலுத்துதலை பிரதிபலிக்கிறது. இன்று UPI மூலம் மின் கட்டணம் செலுத்துங்கள்.`,
    te: (s) => `మీ BehaviorScore **${s}** మీ UPI చెల్లింపులు మరియు బిల్లులను ప్రతిబింబిస్తుంది. నేడు UPI ద్వారా విద్యుత్ బిల్లు చెల్లించండి.`,
    kn: (s) => `ನಿಮ್ಮ BehaviorScore **${s}** ನಿಮ್ಮ UPI ಪಾವತಿ ಮತ್ತು ಬಿಲ್‌ಗಳನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ. ಇಂದು UPI ಮೂಲಕ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಸಿ.`,
    bn: (s) => `আপনার BehaviorScore **${s}** আপনার UPI পেমেন্ট ও বিল প্রতিফলিত করে। আজ UPI দিয়ে বিদ্যুৎ বিল দিন।`,
    mr: (s) => `तुमचा BehaviorScore **${s}** तुमच्या UPI पेमेंट आणि बिलांचे प्रतिबिंब आहे. आज UPI ने वीज बिल भरा.`,
  },
  improve: {
    en: () => `**Top 4 ways to grow your score:**\n\n1. 📱 Pay electricity bill via UPI → +8 pts\n2. 🤝 Maintain SHG savings → +12 pts/month\n3. ⚡ Recharge via UPI → +5 pts\n4. 📊 Use the app monthly → +3 pts\n\nFollowing all 4 could add **28+ points in 30 days**.`,
    hi: () => `**स्कोर बढ़ाने के 4 तरीके:**\n\n1. 📱 UPI से बिजली बिल → +8 अंक\n2. 🤝 SHG बचत → +12 अंक/माह\n3. ⚡ UPI से रिचार्ज → +5 अंक\n4. 📊 ऐप मासिक खोलें → +3 अंक`,
    ta: () => `**மதிப்பெண் அதிகரிக்க 4 வழிகள்:**\n\n1. 📱 UPI மின் கட்டணம் → +8\n2. 🤝 SHG சேமிப்பு → +12/மாதம்\n3. ⚡ UPI ரீசார்ஜ் → +5\n4. 📊 மாதம் ஒரு முறை ஆப் → +3`,
    kn: () => `**ಸ್ಕೋರ್ ಹೆಚ್ಚಿಸಲು 4 ವಿಧಾನಗಳು:**\n\n1. 📱 UPI ವಿದ್ಯುತ್ ಬಿಲ್ → +8\n2. 🤝 SHG ಉಳಿತಾಯ → +12/ತಿಂಗಳು\n3. ⚡ UPI ರಿಚಾರ್ಜ್ → +5\n4. 📊 ಮಾಸಿಕ ಆ್ಯಪ್ → +3`,
    te: () => `**స్కోర్ పెంచే 4 మార్గాలు:**\n\n1. 📱 UPI విద్యుత్ బిల్లు → +8\n2. 🤝 SHG పొదుపు → +12/నెల\n3. ⚡ UPI రీచార్జ్ → +5\n4. 📊 నెలకు ఒకసారి యాప్ → +3`,
    bn: () => `**স্কোর বাড়ানোর 4 উপায়:**\n\n1. 📱 UPI বিদ্যুৎ বিল → +8\n2. 🤝 SHG সঞ্চয় → +12/মাস\n3. ⚡ UPI রিচার্জ → +5\n4. 📊 মাসে একবার অ্যাপ → +3`,
    mr: () => `**स्कोर वाढवण्याचे 4 मार्ग:**\n\n1. 📱 UPI वीज बिल → +8\n2. 🤝 SHG बचत → +12/महिना\n3. ⚡ UPI रिचार्ज → +5\n4. 📊 मासिक अॅप → +3`,
  },
  loan: {
    en: (s) => `With score **${s}** you qualify for:\n\n| NBFC | Amount | Rate |\n|------|--------|------|\n| MicroFirst | ₹${s>=750?'1,50,000':'80,000'} | ${s>=750?'12.5':'14.5'}% |\n| Jan Sahyog | ₹50,000 | 16.2% |\n| Grameen Credit | ₹30,000 | 18.0% |\n\nApply from the **NBFC Portal** tab.`,
    hi: (s) => `स्कोर **${s}** पर आप ₹${s>=750?'1,50,000':'80,000'} तक के लोन के योग्य हैं। **NBFC पोर्टल** टैब से आवेदन करें।`,
    ta: (s) => `**${s}** மதிப்பெண்ணில் நீங்கள் ₹${s>=750?'1,50,000':'80,000'} வரை தகுதியானவர். **NBFC போர்டல்** தாவலில் விண்ணப்பிக்கவும்.`,
    kn: (s) => `**${s}** ಸ್ಕೋರ್‌ನಲ್ಲಿ ನೀವು ₹${s>=750?'1,50,000':'80,000'} ವರೆಗೆ ಅರ್ಹರು. **NBFC ಪೋರ್ಟಲ್** ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.`,
    te: (s) => `**${s}** స్కోర్‌తో ₹${s>=750?'1,50,000':'80,000'} వరకు అర్హులు. **NBFC పోర్టల్** ట్యాబ్‌లో దరఖాస్తు చేయండి.`,
    bn: (s) => `**${s}** স্কোরে আপনি ₹${s>=750?'1,50,000':'80,000'} পর্যন্ত যোগ্য। **NBFC পোর্টাল** ট্যাবে আবেদন করুন।`,
    mr: (s) => `**${s}** स्कोरवर तुम्ही ₹${s>=750?'1,50,000':'80,000'} पर्यंत पात्र आहात. **NBFC पोर्टल** टॅबमध्ये अर्ज करा.`,
  },
  safe: {
    en: () => `🔐 Your data is fully protected:\n\n• **AES-256 encryption** — end-to-end\n• **DPDPA 2023 compliant** — India's data law\n• **RBI AA framework** — lenders see score only\n• **Right to deletion** — anytime\n\nWe never sell or share your raw data.`,
    hi: () => `🔐 आपका डेटा पूरी तरह सुरक्षित है। AES-256 एन्क्रिप्शन, DPDPA 2023 अनुपालन। बैंकों को केवल स्कोर दिखता है।`,
    ta: () => `🔐 உங்கள் தரவு முழுமையாக பாதுகாக்கப்படுகிறது. AES-256 குறியாக்கம், DPDPA 2023 இணக்கம்.`,
    kn: () => `🔐 ನಿಮ್ಮ ಡೇಟಾ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ. AES-256 ಎನ್‌ಕ್ರಿಪ್ಶನ್, DPDPA 2023 ಅನುಸರಣೆ.`,
    te: () => `🔐 మీ డేటా పూర్తిగా సురక్షితం. AES-256 గుప్తీకరణ, DPDPA 2023 అనుసరణ.`,
    bn: () => `🔐 আপনার ডেটা সম্পূর্ণ সুরক্ষিত। AES-256 এনক্রিপশন, DPDPA 2023 মেনে চলা।`,
    mr: () => `🔐 तुमचा डेटा पूर्णपणे सुरक्षित आहे. AES-256 एन्क्रिप्शन, DPDPA 2023 अनुपालन.`,
  },
  cibil: {
    en: () => `**BehaviorCredit vs CIBIL:**\n\n| Feature | CIBIL | BehaviorCredit |\n|---------|-------|---------------|\n| Data | Bank loans | 8 alt signals |\n| Coverage | 400M | 600M+ |\n| Speed | Weeks | **30 sec** |\n| Cost | ₹550 | **Free** |\n| Languages | English | **7 Indian** |`,
    hi: () => `**BehaviorCredit बनाम CIBIL:**\n\nCIBIL सिर्फ बैंक लोन देखता है। हम UPI, SHG, बिजली बिल — 8 संकेत देखते हैं। 19 करोड़ जो CIBIL नहीं देख सकता, हम उन्हें स्कोर करते हैं।`,
    ta: () => `CIBIL வங்கி கடன்களை மட்டும் பார்க்கும். BehaviorCredit UPI, SHG, பில் உட்பட 8 சமிக்ஞைகளை பார்க்கும்.`,
    kn: () => `CIBIL ಬ್ಯಾಂಕ್ ಸಾಲಗಳನ್ನು ಮಾತ್ರ ನೋಡುತ್ತದೆ. BehaviorCredit UPI, SHG, ಬಿಲ್ ಸೇರಿ 8 ಸಂಕೇತಗಳನ್ನು ನೋಡುತ್ತದೆ.`,
    te: () => `CIBIL బ్యాంక్ రుణాలు మాత్రమే చూస్తుంది. BehaviorCredit UPI, SHG, బిల్లులతో సహా 8 సంకేతాలు చూస్తుంది.`,
    bn: () => `CIBIL শুধু ব্যাংক ঋণ দেখে। BehaviorCredit UPI, SHG, বিল সহ 8 সংকেত দেখে।`,
    mr: () => `CIBIL फक्त बँक कर्ज पाहतो. BehaviorCredit UPI, SHG, बिल सह 8 संकेत पाहतो.`,
  },
  shg: {
    en: () => `🤝 **SHG is your hidden superpower:**\n\n• Each month of SHG = **+3.5 points**\n• 36+ months can add up to **90 points**\n• Regular savings signal income discipline\n• Group accountability reduces default risk\n\nBehaviorCredit is one of the **first** scoring systems to formally recognise SHG participation.`,
    hi: () => `🤝 SHG सदस्यता आपका छुपा हुआ सुपरपावर है। हर महीने +3.5 अंक। 36 महीने में 90 अंक तक जोड़ सकते हैं।`,
    ta: () => `🤝 SHG உறுப்பினர்த்துவம் உங்கள் மறைக்கப்பட்ட வலிமை. ஒவ்வொரு மாதமும் +3.5 புள்ளிகள்.`,
    kn: () => `🤝 SHG ಸದಸ್ಯತ್ವ ನಿಮ್ಮ ಅಡಗಿದ ಶಕ್ತಿ. ಪ್ರತಿ ತಿಂಗಳು +3.5 ಅಂಕಗಳು.`,
    te: () => `🤝 SHG సభ్యత్వం మీ దాచిన శక్తి. ప్రతి నెల +3.5 పాయింట్లు.`,
    bn: () => `🤝 SHG সদস্যপদ আপনার লুকানো শক্তি। প্রতি মাসে +3.5 পয়েন্ট।`,
    mr: () => `🤝 SHG सदस्यत्व तुमची छुपी ताकद. दर महिना +3.5 गुण.`,
  },
  upi: {
    en: () => `📱 **UPI = 25% of your score** (biggest signal)\n\n• More merchant diversity = higher score\n• Consistent monthly transactions = strong signal\n• Even small daily payments count\n\n💡 **Tip:** Pay at 3+ different merchants via UPI this week.`,
    hi: () => `📱 UPI आपके स्कोर का 25% है — सबसे बड़ा संकेत। विभिन्न मर्चेंट को भुगतान करें। इस हफ्ते 3+ जगह UPI से पेमेंट करें।`,
    ta: () => `📱 UPI உங்கள் மதிப்பெண்ணின் 25% — மிகப்பெரிய சமிக்ஞை. இந்த வாரம் 3+ வணிகர்களிடம் UPI செலுத்துங்கள்.`,
    kn: () => `📱 UPI ನಿಮ್ಮ ಸ್ಕೋರಿನ 25% — ಅತಿ ದೊಡ್ಡ ಸಂಕೇತ. ಈ ವಾರ 3+ ವ್ಯಾಪಾರಿಗಳಿಗೆ UPI ಪಾವತಿಸಿ.`,
    te: () => `📱 UPI మీ స్కోర్‌లో 25% — అతి పెద్ద సంకేతం. ఈ వారం 3+ వ్యాపారులకు UPI చెల్లించండి.`,
    bn: () => `📱 UPI আপনার স্কোরের 25% — সবচেয়ে বড় সংকেত। এই সপ্তাহে 3+ ব্যবসায়ীকে UPI পাঠান।`,
    mr: () => `📱 UPI तुमच्या स्कोरचे 25% — सर्वात मोठे संकेत. या आठवड्यात 3+ व्यापाऱ्यांना UPI करा.`,
  },
};

const INTENT_KEYWORDS = {
  score:   ['score','why','reason','explain','what','कितना','क्यों','ஏன்','ಏಕೆ'],
  improve: ['improve','boost','increase','better','tips','बढ़ाएं','सुधार','அதிகரிக்க','ಹೆಚ್ಚಿಸ'],
  loan:    ['loan','borrow','eligible','amount','credit','लोन','ऋण','கடன்','ಸಾಲ'],
  safe:    ['safe','privacy','data','secure','सुरक्षित','பாதுகாப்பு','ಸುರಕ್ಷಿತ'],
  cibil:   ['cibil','traditional','compare','different','अंतर','வித்தியாசம்'],
  shg:     ['shg','self help','group','women','महिला','சுய உதவி','ಮಹಿಳಾ'],
  upi:     ['upi','payment','transaction','gpay','phonepe','पेमेंट','கட்டணம்','ಪಾವತಿ'],
};

const getAnswer = (text, score, lang) => {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      const langFn = ANSWERS[intent][lang] || ANSWERS[intent]['en'];
      return langFn(score);
    }
  }
  return null;
};

// ── BehaviorSaathi System Prompt ──────────────────────────────
const SAATHI_SYSTEM = (score, occupation, lang) => `You are BehaviorSaathi — a warm, empowering credit advisor for BehaviorCredit.
You speak to people who have been ignored or rejected by traditional banking systems.
They are not uneducated — they are underserved. Treat them with complete dignity.

PERSONAS YOU SERVE:
• Ramesh Kumar — delivery partner, 34, Patna, earns ₹25,000/month, no credit history
• Priya Nair — freelance designer, 27, Bengaluru, irregular income, first loan attempt  
• Meena Devi — SHG farmer, 42, Nashik, 8 years perfect community lending, CIBIL invisible

CURRENT USER: BehaviorScore ${score} | Occupation: ${occupation || 'not specified'}

YOUR BEHAVIOR RULES:
1. Always respond in ${lang} first, English translation second (separated by "---")
2. Never use "rejected", "denied", "bad score" — use "improving", "growing", "building"
3. Always end with ONE specific, achievable action the user can take today
4. When score is low: acknowledge effort, name strongest signal, give hope
5. When score is high: celebrate, explain why, suggest next product step
6. Maximum 4 sentences per explanation — mobile users read short text

TONE: Warm didi/bhaiya energy. Like your most financially-savvy family member who genuinely wants you to get that loan.`;


const fmt = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>')
    .replace(/[📱⚡🤝📊💡✅🔐📋🏛️]/gu, m => `<span class="mr-1">${m}</span>`);

// ── Structured Saathi Card ────────────────────────────────────
const SaathiCard = ({ data }) => (
  <div className="space-y-3 w-full">
    <div className="bg-brand-500/8 border border-brand-500/20 rounded-xl p-4">
      <div className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-2">📣 BehaviorSaathi</div>
      <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: fmt(data.primary) }} />
      {data.english && data.primary !== data.english && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed italic border-t border-white/10 pt-2"
          dangerouslySetInnerHTML={{ __html: fmt(data.english) }} />
      )}
    </div>
    {data.signal && (
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-0 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase mb-1">💪 Strongest Signal</div>
          <div className="text-xs text-slate-300">{data.signal}</div>
        </div>
        {data.product && (
          <div className="flex-1 min-w-0 bg-purple-500/8 border border-purple-500/20 rounded-xl p-3">
            <div className="text-[10px] text-purple-400 font-semibold uppercase mb-1">🎯 Next Step</div>
            <div className="text-xs text-slate-300">{data.product}</div>
          </div>
        )}
      </div>
    )}
    {data.action && (
      <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-3 flex gap-3 items-start">
        <span className="text-amber-400 text-lg flex-shrink-0">⚡</span>
        <div>
          <div className="text-[10px] text-amber-400 font-semibold uppercase mb-0.5">Action for Today</div>
          <div className="text-xs text-slate-300">{data.action}</div>
        </div>
      </div>
    )}
  </div>
);

// ── Main ChatBot Component ─────────────────────────────────────
const ChatBot = ({ navigate, user, scoreData }) => {
  const { i18n } = useTranslation();
  const score = scoreData?.score || 718;
  const lang = i18n.language.split('-')[0];

  const greetData = {
    primary: {
      en: `Hello${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm BehaviorSaathi, your personal credit guide. Your BehaviorScore is **${score}**. Ask me anything — score explanation, loan eligibility, or how to improve.`,
      hi: `नमस्ते${user?.name ? ` ${user.name.split(' ')[0]} जी` : ''}! 👋 मैं BehaviorSaathi हूँ, आपका क्रेडिट गाइड। आपका BehaviorScore **${score}** है। स्कोर, लोन, या सुधार के बारे में कुछ भी पूछें।`,
      ta: `வணக்கம்! 👋 நான் BehaviorSaathi, உங்கள் கிரெடிட் வழிகாட்டி. உங்கள் BehaviorScore **${score}**. மதிப்பெண், கடன் அல்லது மேம்பாடு பற்றி கேளுங்கள்.`,
      kn: `ನಮಸ್ಕಾರ! 👋 ನಾನು BehaviorSaathi, ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಮಾರ್ಗದರ್ಶಿ. ನಿಮ್ಮ BehaviorScore **${score}**. ಸ್ಕೋರ್, ಸಾಲ ಅಥವಾ ಸುಧಾರಣೆ ಬಗ್ಗೆ ಕೇಳಿ.`,
      te: `నమస్కారం! 👋 నేను BehaviorSaathi, మీ క్రెడిట్ గైడ్. మీ BehaviorScore **${score}**. స్కోర్, లోన్ లేదా మెరుగుదల గురించి అడగండి.`,
      bn: `নমস্কার! 👋 আমি BehaviorSaathi, আপনার ক্রেডিট গাইড। আপনার BehaviorScore **${score}**। স্কোর, ঋণ বা উন্নতি সম্পর্কে জিজ্ঞাসা করুন।`,
      mr: `नमस्कार! 👋 मी BehaviorSaathi, तुमचा क्रेडिट मार्गदर्शक. तुमचा BehaviorScore **${score}** आहे. स्कोर, कर्ज किंवा सुधारणाबद्दल विचारा.`,
    },
  };

  const greeting = greetData.primary[lang] || greetData.primary.en;

  const [messages, setMessages] = useState([{ role: 'bot', text: greeting, ts: new Date() }]);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const bottomRef = useRef(null);
  const abortRef  = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'bot', text: greeting, ts: new Date() }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, score]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamText]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || streaming) return;
    setMessages(m => [...m, { role: 'user', text, ts: new Date() }]);
    setInput('');
    setStreaming(true);
    setStreamText('');

    const answer = getAnswer(text, score, lang);

    if (answer || !GEMINI_KEY) {
      await new Promise(r => setTimeout(r, 400));
      const response = answer || (lang === 'en'
        ? 'I can help with your **score**, **loan eligibility**, or **improvement tips**. What would you like to know?'
        : lang === 'hi' ? 'मैं आपकी मदद कर सकता हूँ — स्कोर, लोन, या सुधार के बारे में पूछें।'
        : lang === 'ta' ? 'நான் உங்கள் ஸ்கோர், கடன் அல்லது மேம்பாடு பற்றி உதவலாம். கேளுங்கள்.'
        : lang === 'kn' ? 'ನಾನು ನಿಮ್ಮ ಸ್ಕೋರ್, ಸಾಲ ಅಥವಾ ಸುಧಾರಣೆ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.'
        : lang === 'te' ? 'నేను మీ స్కోర్, లోన్ లేదా మెరుగుదల గురించి సహాయపడగలను.'
        : lang === 'bn' ? 'আমি আপনার স্কোর, ঋণ বা উন্নতি সম্পর্কে সাহায্য করতে পারি।'
        : lang === 'mr' ? 'मी तुमच्या स्कोर, कर्ज किंवा सुधारणाबद्दल मदत करू शकतो.'
        : 'I can help with your score, loan eligibility, or improvement tips.');
      setMessages(m => [...m, { role: 'bot', text: response, ts: new Date() }]);
      setStreaming(false);
      return;
    }

    // Real Gemini API
    try {
      const sysPrompt = SAATHI_SYSTEM(score, user?.occupation, LANG_NAMES[lang] || 'English');
      abortRef.current = new AbortController();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GEMINI_KEY}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: sysPrompt }] },
            contents: [{ role: 'user', parts: [{ text }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 500 },
          }),
        }
      );

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const part = JSON.parse(line.slice(6))?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            full += part;
            setStreamText(full);
          } catch { /* skip */ }
        }
      }
      const parts = full.split('---');
      setMessages(m => [...m, {
        role: 'bot',
        card: { primary: parts[0]?.trim() || full, english: parts[1]?.trim() || '' },
        ts: new Date(),
      }]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        const fallback = getAnswer(text, score, lang) || (lang === 'en' ? 'Sorry, something went wrong. Please try again.' : lang === 'hi' ? 'माफ़ करें, कुछ गड़बड़ हुई। फिर से पूछें।' : 'Sorry, something went wrong. Please try again.');
        setMessages(m => [...m, { role: 'bot', text: fallback, ts: new Date() }]);
      }
    } finally { setStreaming(false); setStreamText(''); }
  }, [streaming, score, user, lang]);

  const quickReplies = [
    { label: `📊 ${lang==='hi'?'स्कोर क्यों?':lang==='ta'?'மதிப்பெண் ஏன்?':lang==='kn'?'ಸ್ಕೋರ್ ಏಕೆ?':lang==='te'?'స్కోర్ ఎందుకు?':lang==='bn'?'স্কোর কেন?':lang==='mr'?'स्कोर का?':`Score ${score}?`}`, text: `Why is my score ${score}? Explain.` },
    { label: `📈 ${lang==='hi'?'स्कोर बढ़ाएं':lang==='ta'?'மதிப்பெண் அதிகரிக்க':lang==='kn'?'ಸ್ಕೋರ್ ಹೆಚ್ಚಿಸಿ':lang==='te'?'స్కోర్ పెంచు':lang==='bn'?'স্কোর বাড়ান':lang==='mr'?'स्कोर वाढवा':'Improve score'}`, text: 'How can I improve my score?' },
    { label: `💳 ${lang==='hi'?'लोन कितना?':lang==='ta'?'கடன் தகுதி':lang==='kn'?'ಸಾಲ ಅರ್ಹತೆ':lang==='te'?'రుణ అర్హత':lang==='bn'?'ঋণ যোগ্যতা':lang==='mr'?'कर्ज पात्रता':'Loan eligibility'}`, text: 'What loan am I eligible for?' },
    { label: `🔒 ${lang==='hi'?'डेटा सुरक्षित?':lang==='ta'?'தரவு பாதுகாப்பு?':lang==='kn'?'ಡೇಟಾ ಸುರಕ್ಷಿತ?':lang==='te'?'డేటా సురక్షితమా?':lang==='bn'?'ডেটা নিরাপদ?':lang==='mr'?'डेटा सुरक्षित?':'Data safety'}`, text: 'Is my data safe?' },
    { label: `📱 UPI`, text: 'How does UPI affect my score?' },
    { label: `🤝 SHG`, text: 'How does SHG help my score?' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <span className="text-brand-400">◎</span> BehaviorSaathi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Warm · Empowering · {LANG_NAMES[lang] || 'English'} · 7 Languages
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {GEMINI_KEY
            ? <span className="badge badge-green">● Gemini 1.5 Flash</span>
            : <span className="badge badge-amber">● Smart Local Mode</span>}
          <span className="text-[10px] text-slate-600">Score: {score}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 glass rounded-2xl p-4 overflow-y-auto flex flex-col gap-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold
              ${m.role === 'bot' ? 'bg-gradient-to-br from-brand-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
              {m.role === 'bot' ? '◎' : (user?.name?.[0] || 'U')}
            </div>
            <div className={`max-w-[80%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              {m.card ? (
                <SaathiCard data={m.card} />
              ) : (
                <div className={`px-4 py-3 text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-[18px_18px_4px_18px]'
                    : 'bg-white/[0.05] border border-white/[0.08] rounded-[18px_18px_18px_4px]'}`}>
                  <p dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />
                </div>
              )}
              <span className="text-[10px] text-slate-700 px-1">
                {m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {streaming && (
          <div className="flex items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-sm font-bold">◎</div>
            <div className="max-w-[80%] px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-[18px_18px_18px_4px] text-sm">
              {streamText
                ? <p dangerouslySetInnerHTML={{ __html: fmt(streamText) }} />
                : <div className="flex gap-1.5 py-1">{[0,1,2].map(d => <div key={d} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}</div>}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0">
        {quickReplies.map((qr, i) => (
          <button key={i} onClick={() => sendMessage(qr.text)} disabled={streaming}
            className="px-3 py-1.5 bg-brand-500/8 border border-brand-500/20 rounded-full text-xs text-slate-400 hover:text-white hover:bg-brand-500/15 transition-all disabled:opacity-40">
            {qr.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="अपना सवाल यहाँ लिखें / Type your question..."
          className="flex-1 input-field" disabled={streaming} />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}
          className="btn-primary !px-5 disabled:opacity-50">
          {streaming
            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : <span>↑</span>}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
