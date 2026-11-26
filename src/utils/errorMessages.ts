import { Language } from '../types/ironlog';

const AUTH_ERROR_MAP: Record<string, { en: string; ar: string }> = {
  'auth/invalid-credential': {
    en: 'Incorrect email or password. Please check your credentials and try again.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يُرجى التحقق والمحاولة مجدداً.',
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
    ar: 'تعذّر الاتصال بالشبكة. تحقّق من اتصالك بالإنترنت وحاول مجدداً.',
  },
  'auth/popup-blocked': {
    en: 'Sign-in popup was blocked by the browser. Please allow popups and try again.',
    ar: 'حظر المتصفح نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم حاول مجدداً.',
  },
  'auth/operation-not-allowed': {
    en: 'Email/Password sign-in is not yet enabled in Firebase Console. Enable it under Authentication -> Sign-in method, or use Google on web / Offline Mode.',
    ar: 'تسجيل الدخول بالبريد الإلكتروني غير مفعّل حالياً في إعدادات الخدمة. استخدم تسجيل الدخول عبر Google أو الوضع المحلي على الجهاز.',
  },
  'auth/unauthorized-domain': {
    en: 'This web address is not yet added to Firebase Authorized Domains. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains.',
    ar: 'عنوان الموقع الحالي غير مضاف ضمن النطاقات المصرّح بها في إعدادات المصادقة.',
  },
  'auth/operation-not-supported-in-this-environment': {
    en: 'Google popup sign-in is not supported in this browser/WebView environment. Open in Chrome or use Email & Password / Local Device Mode.',
    ar: 'تسجيل الدخول عبر نافذة Google غير مدعوم داخل هذا المتصفح المدمج. افتح التطبيق في Chrome أو استخدم البريد الإلكتروني أو الوضع المحلي على الجهاز.',
  },
  'auth/cancelled-popup-request': {
    en: 'Previous sign-in window was cancelled. Please tap once and complete sign-in in the opened window.',
    ar: 'تم إلغاء نافذة تسجيل الدخول السابقة. اضغط مرة واحدة وأكمل الدخول في النافذة المفتوحة.',
  },
  'auth/web-storage-unsupported': {
    en: 'Browser storage or third-party cookies are blocked here. Allow cookies/storage or use Email & Password / Local Device Mode.',
    ar: 'تخزين المتصفح أو ملفات الارتباط محجوبة حالياً. فعّلها من إعدادات المتصفح أو استخدم البريد الإلكتروني أو الوضع المحلي على الجهاز.',
  },
  'auth/invalid-action-code': {
    en: 'This verification or reset link is invalid or has already been used. Request a fresh link.',
    ar: 'رابط التفعيل أو استعادة كلمة المرور غير صالح أو تم استخدامه مسبقاً. اطلب رابطاً جديداً.',
  },
  'auth/expired-action-code': {
    en: 'This link has expired. Please request a new verification or password reset email.',
    ar: 'انتهت صلاحية هذا الرابط. يُرجى طلب رسالة جديدة.',
  },
  'auth/account-exists-with-different-credential': {
    en: 'An account already exists with this email using a different sign-in method.',
    ar: 'يوجد حساب مسجّل بهذا البريد باستخدام طريقة تسجيل دخول أخرى.',
  },
  'auth/internal-error': {
    en: 'Authentication service encountered a temporary browser error. Try again, open in Chrome, or use Local Device Mode.',
    ar: 'حدث خطأ مؤقت في خدمة المصادقة. أعد المحاولة أو افتح التطبيق في Chrome أو استخدم الوضع المحلي على الجهاز.',
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
    ar: 'رمز الدعوة غير صالح.',
  },
  {
    match: 'Invite code not found',
    en: 'Invite code not found. Please double-check the code from your coach.',
    ar: 'لم يتم العثور على رمز الدعوة. تأكد من كتابته كما أرسله المدرب.',
  },
  {
    match: 'Invite code has already been used',
    en: 'This invite code has already been claimed.',
    ar: 'تم استخدام رمز الدعوة هذا مسبقاً.',
  },
  {
    match: 'GEMINI_API_KEY is not configured',
    en: 'AI Coaching service is not configured on this server.',
    ar: 'خدمة المساعد التدريبي الذكي غير مهيأة حالياً على الخادم.',
  },
  {
    match: 'No coach program selected',
    en: 'Please select a coaching program first.',
    ar: 'يُرجى اختيار برنامج تدريبي أولاً.',
  },
  {
    match: 'Cannot link to your own invite code',
    en: 'Switch to Athlete mode or sign in with an athlete account to claim this code.',
    ar: 'بدّل إلى وضع الرياضي أو سجّل الدخول بحساب لاعب لاستخدام رمز الدعوة.',
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
