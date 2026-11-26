import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Link2,
  Megaphone,
  MessageSquare,
  Send,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  acceptCoachAssignment,
  claimCoachInviteCode,
  dismissCoachAssignment,
  markCoachMessageRead,
  sendCoachMessage,
} from '../../services/firestoreService';
import { CoachMessage } from '../../types/ironlog';
import { formatAppError } from '../../utils/errorMessages';

type MessageFilter = 'all' | 'direct' | 'checkin' | 'announcement';

export const MessagingView: React.FC = () => {
  const {
    firebaseUser,
    isLocalDeviceMode,
    profile,
    isCoach,
    language,
    t,
    coachRoster,
    athleteCoachLink,
    coachAssignments,
    coachMessages,
    selectedChatAthleteUid,
    clearSelectedChatAthlete,
    pendingJoinCode,
    clearPendingJoinCode,
    showToast,
  } = useApp();

  const [inviteCode, setInviteCode] = useState(() => pendingJoinCode || '');
  const [joining, setJoining] = useState(false);

  const activeAthletes = useMemo(
    () => coachRoster.filter((l) => l.status === 'active' && l.athleteUid),
    [coachRoster]
  );

  const [selectedAthleteUid, setSelectedAthleteUid] = useState<string>(
    () => selectedChatAthleteUid || ''
  );
  const [msgType, setMsgType] = useState<CoachMessage['type']>('direct');
  const [typeFilter, setTypeFilter] = useState<MessageFilter>('all');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (pendingJoinCode && !inviteCode) {
      setInviteCode(pendingJoinCode);
    }
  }, [pendingJoinCode]);

  useEffect(() => {
    if (selectedChatAthleteUid) {
      setSelectedAthleteUid(selectedChatAthleteUid);
      clearSelectedChatAthlete();
    }
  }, [selectedChatAthleteUid, clearSelectedChatAthlete]);

  const effectiveAthleteUid = isCoach
    ? selectedAthleteUid || activeAthletes[0]?.athleteUid || ''
    : firebaseUser?.uid || '';

  const unreadByAthlete = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of coachMessages) {
      if (!m.read && m.senderId !== firebaseUser?.uid && m.athleteUid) {
        map.set(m.athleteUid, (map.get(m.athleteUid) || 0) + 1);
      }
    }
    return map;
  }, [coachMessages, firebaseUser?.uid]);

  const threadMessages = useMemo(() => {
    const filtered = coachMessages.filter((m) => {
      if (isCoach && m.athleteUid !== effectiveAthleteUid) return false;
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      return true;
    });
    return [...filtered].reverse();
  }, [coachMessages, isCoach, effectiveAthleteUid, typeFilter]);

  // Mark incoming messages in the active thread as read cleanly in an effect (never during render)
  useEffect(() => {
    if (!firebaseUser) return;
    const unreadIncoming = threadMessages.filter(
      (m) => !m.read && m.senderId !== firebaseUser.uid
    );
    if (unreadIncoming.length === 0) return;
    unreadIncoming.forEach((m) => {
      markCoachMessageRead(m.id).catch(() => {});
    });
  }, [threadMessages, firebaseUser]);

  const pendingAssignments = useMemo(
    () => (!isCoach ? coachAssignments.filter((a) => a.status === 'assigned') : []),
    [coachAssignments, isCoach]
  );

  const handleJoinCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !inviteCode.trim()) return;
    setJoining(true);
    try {
      await claimCoachInviteCode(
        firebaseUser.uid,
        profile?.displayName || (language === 'ar' ? 'رياضي' : 'Athlete'),
        inviteCode.trim()
      );
      setInviteCode('');
      clearPendingJoinCode();
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setJoining(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !text.trim()) return;
    const targetCoachId = isCoach ? firebaseUser.uid : athleteCoachLink?.coachId;
    const targetAthleteUid = isCoach ? effectiveAthleteUid : firebaseUser.uid;
    if (!targetCoachId || !targetAthleteUid) return;

    setSending(true);
    try {
      await sendCoachMessage({
        coachId: targetCoachId,
        athleteUid: targetAthleteUid,
        senderId: firebaseUser.uid,
        senderName:
          profile?.displayName ||
          (isCoach
            ? language === 'ar'
              ? 'المدرب'
              : 'Coach'
            : language === 'ar'
              ? 'رياضي'
              : 'Athlete'),
        senderRole: isCoach ? 'coach' : 'athlete',
        type: isCoach ? msgType : 'direct',
        text: text.trim(),
      });
      setText('');
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptAssignment = async (id: string) => {
    if (!firebaseUser) return;
    const item = coachAssignments.find((a) => a.id === id);
    if (!item) return;
    try {
      await acceptCoachAssignment(firebaseUser.uid, item);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDismissAssignment = async (id: string) => {
    try {
      await dismissCoachAssignment(id);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const quickChips = isCoach
    ? language === 'ar'
      ? ['أحسنت في جلسة اليوم!', 'كيف مستوى الاستشفاء؟', 'التزم بـ RPE 8 هذا الأسبوع']
      : ['Great session today!', 'How is recovery feeling?', 'Keep compound sets at RPE 8']
    : language === 'ar'
      ? ['أتممت التمرين بنجاح', 'أشعر بإجهاد خفيف اليوم', 'هل يمكننا تعديل الوزن؟']
      : ['Completed today’s workout!', 'Feeling slightly fatigued today', 'Can we adjust the weight?'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.nav.messaging}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {isCoach
            ? language === 'ar'
              ? 'تواصل مع متدرّبيك، وأرسل متابعات دورية وإعلانات.'
              : 'Direct coach-to-athlete messaging, check-ins, and updates.'
            : language === 'ar'
              ? 'اربط حسابك بمدربك وتواصل معه مباشرة.'
              : 'Connect with your coach, receive program updates, and message directly.'}
        </p>
      </div>

      {/* Athlete Invite Code Link Card */}
      {!isCoach && !athleteCoachLink && (
        <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-500">
            <Link2 className="w-4 h-4" />
            <h2 className="text-base font-bold">{t.apex.coachInviteTitle}</h2>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {language === 'ar'
              ? 'أدخل رمز الدعوة الذي أرسله لك مدربك لربط حسابك واستقبال البرامج والملاحظات.'
              : 'Enter the invite code shared by your coach to link your account and receive custom programs.'}
            {isLocalDeviceMode && (
              <span className="block mt-1 font-mono text-emerald-600 dark:text-emerald-400">
                {language === 'ar' ? 'رمز تجريبي متاح: APEX-DEMO' : 'Demo code available: APEX-DEMO'}
              </span>
            )}
          </p>
          <form onSubmit={handleJoinCoach} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t.apex.coachInvitePlaceholder}
              className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-sm uppercase"
            />
            <button
              type="submit"
              disabled={joining}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shrink-0"
            >
              {joining ? t.common.loading : t.apex.joinCoachBtn}
            </button>
          </form>
        </section>
      )}

      {/* Pending Assignments Quick Banner for Athlete */}
      {pendingAssignments.length > 0 && (
        <section className="bg-emerald-500/8 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {t.apex.pendingAssignments}
          </p>
          {pendingAssignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#121417] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="text-xs min-w-0">
                <strong className="text-sm block truncate">{a.programName}</strong>
                <span className="text-neutral-500">{a.coachName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAcceptAssignment(a.id)}
                  className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.apex.acceptAssignment}
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissAssignment(a.id)}
                  className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  {t.apex.dismissAssignment}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Chat Workspace */}
      {(isCoach ? activeAthletes.length > 0 : Boolean(athleteCoachLink)) ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {isCoach && (
            <aside className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 space-y-1.5 h-fit">
              <p className="px-2 py-1 text-xs font-semibold text-neutral-500">
                {t.apex.athleteRoster}
              </p>
              {activeAthletes.map((ath) => {
                const isSel = ath.athleteUid === effectiveAthleteUid;
                const unread = unreadByAthlete.get(ath.athleteUid) || 0;
                return (
                  <button
                    key={ath.id}
                    type="button"
                    onClick={() => setSelectedAthleteUid(ath.athleteUid)}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-start flex items-center justify-between gap-2 text-xs font-medium cursor-pointer ${
                      isSel
                        ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span className="truncate">{ath.athleteName}</span>
                    {unread > 0 ? (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    )}
                  </button>
                );
              })}
            </aside>
          )}

          <div
            className={`${
              isCoach ? 'lg:col-span-2' : 'lg:col-span-3'
            } bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-[64vh] min-h-[440px]`}
          >
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>
                  {isCoach
                    ? activeAthletes.find((a) => a.athleteUid === effectiveAthleteUid)?.athleteName
                    : athleteCoachLink?.coachName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-100 dark:bg-[#090A0B] text-[11px]">
                  {(
                    [
                      ['all', t.common.all],
                      ['direct', language === 'ar' ? 'مباشر' : 'Direct'],
                      ['checkin', language === 'ar' ? 'متابعة' : 'Check-in'],
                      ['announcement', language === 'ar' ? 'إعلان' : 'Announcements'],
                    ] as [MessageFilter, string][]
                  ).map(([k, lbl]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setTypeFilter(k)}
                      className={`px-2.5 py-1 rounded-md font-medium cursor-pointer whitespace-nowrap ${
                        typeFilter === k
                          ? 'bg-white dark:bg-[#1A1D22] text-neutral-900 dark:text-neutral-100 shadow-xs'
                          : 'text-neutral-500'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {isCoach && (
                  <select
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value as CoachMessage['type'])}
                    className="min-h-[34px] px-2.5 rounded-lg bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    <option value="direct">{language === 'ar' ? 'رسالة مباشرة' : 'Direct'}</option>
                    <option value="checkin">{language === 'ar' ? 'متابعة أسبوعية' : 'Check-in'}</option>
                    <option value="announcement">{language === 'ar' ? 'إعلان' : 'Announcement'}</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {threadMessages.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-12">
                  {language === 'ar'
                    ? 'لا توجد رسائل بعد. ابدأ المحادثة أدناه.'
                    : 'No messages yet. Start the conversation below.'}
                </p>
              ) : (
                threadMessages.map((m) => {
                  const isMine = m.senderId === firebaseUser?.uid;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm space-y-1 ${
                          isMine
                            ? 'bg-emerald-600 text-white'
                            : m.type === 'announcement'
                              ? 'bg-amber-500/12 border border-amber-500/35 text-neutral-900 dark:text-neutral-100'
                              : 'bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        {m.type !== 'direct' && (
                          <p className="text-[11px] font-bold opacity-85 flex items-center gap-1">
                            <Megaphone className="w-3 h-3" />
                            {m.type === 'announcement'
                              ? language === 'ar'
                                ? 'إعلان'
                                : 'Announcement'
                              : language === 'ar'
                                ? 'متابعة أسبوعية'
                                : 'Check-in'}
                          </p>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 sm:px-4 pt-2 flex flex-wrap gap-1.5 border-t border-neutral-100 dark:border-neutral-800/80">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setText(chip)}
                  className="min-h-[30px] px-2.5 rounded-lg bg-neutral-100 dark:bg-[#090A0B] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 flex items-center gap-2"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Write a message...'}
                className="flex-1 min-h-[44px] px-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                aria-label={language === 'ar' ? 'إرسال' : 'Send'}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </form>
          </div>
        </div>
      ) : isCoach ? (
        <div className="bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-10 text-center text-sm text-neutral-500">
          {language === 'ar'
            ? 'بانتظار انضمام أول متدرّب إليك عبر رمز الدعوة لبدء المحادثة.'
            : 'Messages unlock once at least one athlete links their account using an invite code.'}
        </div>
      ) : null}
    </div>
  );
};
