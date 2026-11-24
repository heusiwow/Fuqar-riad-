import { Language } from '../types/ironlog';

const AUTH_ERROR_MAP: Record<string, { en: string; ar: string }> = {
  'auth/invalid-credential': {
    en: 'Incorrect email or password. Please check your credentials and try again.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مجدداً.',
  },
  'auth/wrong-password': {
    en: 'Incorrect password. Please try again or reset your password.',
    ar: 'كلمة المرور غير صحيحة. حاول مجدداً أو استخدم خيار استعادة كلمة المرور.',
  },
  'auth/user-not-found': {
    en: 'No account found with this email address.',
    ar: 'لا يوجد حساب مسجّل بهذا البريد الإلكتروني.',
  },
  'auth/email-already-in-use': {
    en: 'An account already exists with this email address.',
    ar: 'هذا البريد الإلكتروني مسجّل بالفعل. يمكنك تسجيل الدخول مباشرة.',
  },
  'auth/weak-password': {
    en: 'Password is too weak. Please use at least 6 characters.',
    ar: 'كلمة المرور ضعيفة جداً. يُرجى اختيار كلمة مرور من 6 أحرف على الأقل.',
  },
  'auth/invalid-email': {
    en: 'Please enter a valid email address.',
    ar: 'يُرجى إدخال بريد إلكتروني صحيح.',
  },
  'auth/too-many-requests': {
    en: 'Too many attempts. Please wait a moment before trying again.',
    ar: 'تم تجاوز عدد المحاولات المسموح بها مؤقتاً. انتظر قليلاً ثم أعد المحاولة.',
  },
  'auth/network-request-failed': {
    en: 'Network connection error. Please check your internet connection.',
    ar: 'تعذّر الاتصال بالشبكة. تحقق من اتصالك بالإنترنت وحاول مجدداً.',
  },
  'auth/popup-blocked': {
    en: 'Sign-in popup was blocked by the browser. Please allow popups and try again.',
    ar: 'حظر المتصفح نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم حاول مجدداً.',
  },
  'auth/operation-not-allowed': {
    en: 'Email/Password sign-in is not yet enabled in Firebase Console. You can continue immediately with Google or enable it in Firebase.',
    ar: 'تسجيل الدخول بالبريد الإلكتروني غير مفعّل حالياً في Firebase Console. يمكنك المتابعة فوراً عبر Google أو تفعيله من إعدادات Firebase.',
  },
  'auth/requires-recent-login': {
    en: 'For security reasons, please sign out and sign back in before performing this action.',
    ar: 'لأسباب أمنية، يُرجى تسجيل الخروج ثم إعادة تسجيل الدخول لإتمام هذا الإجراء.',
  },
  'auth/user-disabled': {
    en: 'This account has been disabled.',
    ar: 'تم تعطيل هذا الحساب.',
  },
};

const APP_MESSAGE_MAP: { match: string; en: string; ar: string }[] = [
  {
    match: 'Invalid invite code',
    en: 'Invalid invite code.',
    ar: 'كود الدعوة غير صالح.',
  },
  {
    match: 'Invite code not found',
    en: 'Invite code not found. Please double-check the code from your coach.',
    ar: 'لم يتم العثور على كود الدعوة. تأكد من كتابته كما أرسله المدرب.',
  },
  {
    match: 'Invite code has already been used',
    en: 'This invite code has already been claimed.',
    ar: 'تم استخدام كود الدعوة هذا مسبقاً.',
  },
  {
    match: 'GEMINI_API_KEY is not configured',
    en: 'AI Coaching service is not configured on this server.',
    ar: 'خدمة المدرب الذكي غير مهيأة حالياً على الخادم.',
  },
  {
    match: 'No coach program selected',
    en: 'Please select a coaching program first.',
    ar: 'يرجى اختيار برنامج تدريبي أولاً.',
  },
];

export function formatAppError(err: unknown, language: Language, fallback: string): string {
  const code = (err as { code?: string })?.code || '';
  if (code && AUTH_ERROR_MAP[code]) {
    return AUTH_ERROR_MAP[code][language];
  }

  const rawMsg =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : '';

  if (rawMsg) {
    for (const key of Object.keys(AUTH_ERROR_MAP)) {
      if (rawMsg.includes(key)) {
        return AUTH_ERROR_MAP[key][language];
      }
    }
    for (const item of APP_MESSAGE_MAP) {
      if (rawMsg.includes(item.match)) {
        return language === 'ar' ? item.ar : item.en;
      }
    }
    // If Arabic UI is active and raw error is purely ASCII English technical text, show friendly fallback
    if (language === 'ar' && /^[\x00-\x7F\s]+$/.test(rawMsg)) {
      return fallback;
    }
    return rawMsg;
  }

  return fallback;
}
