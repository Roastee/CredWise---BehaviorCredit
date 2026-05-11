// Firebase config — replace with your real project credentials
// Get from: https://console.firebase.google.com → Project Settings → Your Apps
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, get, push, onValue, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || "demo-api-key",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || "behaviorcredit-demo.firebaseapp.com",
  databaseURL:       process.env.REACT_APP_FIREBASE_DATABASE_URL       || "https://behaviorcredit-demo-default-rtdb.firebaseio.com",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || "behaviorcredit-demo",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || "behaviorcredit-demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID|| "000000000000",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || "1:000000000000:web:demo",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// ── Auth helpers ──────────────────────────────────────────────
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
export const onAuth = (cb) => onAuthStateChanged(auth, cb);

// ── Realtime DB helpers ───────────────────────────────────────
export const saveUserProfile = async (uid, data) => {
  try { await set(ref(db, `users/${uid}`), { ...data, updatedAt: serverTimestamp() }); }
  catch { /* offline / demo mode */ }
};

export const saveScoreToFirebase = async (uid, scoreData) => {
  try { await push(ref(db, `scores/${uid}`), { ...scoreData, ts: serverTimestamp() }); }
  catch { /* offline / demo mode */ }
};

export const getUserScores = async (uid) => {
  try {
    const snap = await get(ref(db, `scores/${uid}`));
    if (snap.exists()) return Object.values(snap.val());
  } catch { /* offline / demo mode */ }
  return [];
};

export const subscribeToScore = (uid, cb) => {
  try { return onValue(ref(db, `scores/${uid}`), snap => { if (snap.exists()) cb(Object.values(snap.val())); }); }
  catch { return () => {}; }
};
