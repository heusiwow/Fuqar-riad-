import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Archive,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Edit3,
  FolderPlus,
  Megaphone,
  MessageSquare,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  Send,
  Share2,
  Sparkles,
  Target,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURATED_PROGRAM_TEMPLATES, localizeTemplateNote } from '../../data/programTemplates';
import { DIFFICULTY_LABELS, formatArabicCount, tLabel, WEEKDAYS } from '../../i18n/translations';
import {
  addSessionCoachFeedback,
  createCoachingLinkInvite,
  deleteCoachGroup,
  deleteCoachingLink,
  deletePerformanceGoal,
  fetchLinkedAthleteData,
  generateSafeId,
  saveCoachGroup,
  savePerformanceGoal,
  sendCoachAssignment,
  sendCoachMessage,
  updateCoachingLink,
} from '../../services/firestoreService';
import { seedLocalCoachDemoCohort } from '../../services/localDeviceStore';
import {
  CoachingLink,
  DifficultyLevel,
  PerformanceGoal,
  PersonalRecord,
  TrainingProgram,
  WorkoutSessionHistory,
  WorkoutTemplate,
} from '../../types/ironlog';
import { formatDuration, formatVolume, formatWeight, toStorageKg } from '../../utils/calculations';
import { formatAppError } from '../../utils/errorMessages';

type RosterStatusFilter = 'all' | 'active' | 'pending' | 'attention' | 'archived';

export const CoachDashboardView: React.FC = () => {
  const {
    firebaseUser,
    isLocalDeviceMode,
    profile,
    isCoach,
    language,
    unit,
    t,
    allExercises,
    coachGroups,
    coachRoster,
    coachMessages,
    programs,
    workouts,
    setActiveSection,
    openCoachChat,
    showToast,
  } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<RosterStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [qrLink, setQrLink] = useState<CoachingLink | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Group inline editing
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  // Add Athlete / Invite form
  const [newAthName, setNewAthName] = useState('');
  const [newAthGoal, setNewAthGoal] = useState('');
  const [newAthLevel, setNewAthLevel] = useState<DifficultyLevel>('intermediate');
  const [newAthWeeklyTarget, setNewAthWeeklyTarget] = useState(4);
  const [newAthGroupId, setNewAthGroupId] = useState('');
  const [newAthNotes, setNewAthNotes] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);

  // New Group form
  const [grpName, setGrpName] = useState('');
  const [grpDesc, setGrpDesc] = useState('');

  // Broadcast announcement
  const [annText, setAnnText] = useState('');
  const [annGroupId, setAnnGroupId] = useState('all');
  const [sendingAnn, setSendingAnn] = useState(false);

  // Athlete Inspector modal
  const [inspectLink, setInspectLink] = useState<CoachingLink | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [athleteData, setAthleteData] = useState<{
    sessions: WorkoutSessionHistory[];
    programs: TrainingProgram[];
    workouts: WorkoutTemplate[];
    prs: PersonalRecord[];
    goals: PerformanceGoal[];
  } | null>(null);

  // Editable coaching metadata inside Inspector
  const [editAthName, setEditAthName] = useState('');
  const [editAthGroupId, setEditAthGroupId] = useState('');
  const [editAthLevel, setEditAthLevel] = useState<DifficultyLevel>('intermediate');
  const [editAthWeeklyTarget, setEditAthWeeklyTarget] = useState(4);
  const [editAthGoalSummary, setEditAthGoalSummary] = useState('');
  const [coachNotesDraft, setCoachNotesDraft] = useState('');
  const [savingInspectorMeta, setSavingInspectorMeta] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Quick check-in inside Inspector
  const [checkinText, setCheckinText] = useState('');
  const [sendingCheckin, setSendingCheckin] = useState(false);

  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  // Goal creation for athlete
  const [athGoalTitle, setAthGoalTitle] = useState('');
  const [athGoalExId, setAthGoalExId] = useState('barbell-bench-press');
  const [athGoalWeight, setAthGoalWeight] = useState('100');

  // Assign Program modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSource, setAssignSource] = useState<'curated' | 'my' | 'quick'>('curated');
  const [selectedTplId, setSelectedTplId] = useState(CURATED_PROGRAM_TEMPLATES[0].id);
  const [selectedMyProgId, setSelectedMyProgId] = useState('');
  const [selectedQuickWorkoutId, setSelectedQuickWorkoutId] = useState('');
  const [quickCustomWorkoutTitle, setQuickCustomWorkoutTitle] = useState('');
  const [quickSelectedExIds, setQuickSelectedExIds] = useState<string[]>([
    'barbell-bench-press',
    'barbell-bent-over-row',
    'barbell-back-squat',
  ]);
  const [assignProgramTitle, setAssignProgramTitle] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [sendingAssign, setSendingAssign] = useState(false);

  const [nowMs] = useState(() => Date.now());
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

  const unreadByAthlete = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of coachMessages) {
      if (!m.read && m.senderId !== firebaseUser?.uid && m.athleteUid) {
        map.set(m.athleteUid, (map.get(m.athleteUid) || 0) + 1);
      }
    }
    return map;
  }, [coachMessages, firebaseUser?.uid]);

  const getJoinUrl = (code: string) => {
    if (typeof window === 'undefined') return `?join=${code}`;
    const origin = window.location.origin;
    if (!origin || origin === 'null' || origin.startsWith('file:')) {
      return `https://apex.fitness/?join=${code}`;
    }
    return `${origin}/?join=${code}`;
  };

  useEffect(() => {
    if (!qrLink) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(getJoinUrl(qrLink.inviteCode), {
      width: 240,
      margin: 2,
      color: { dark: '#090A0B', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [qrLink]);

  const teamStats = useMemo(() => {
    const nonArchived = coachRoster.filter((l) => l.status !== 'archived');
    const active = nonArchived.filter((l) => l.status === 'active');
    const totalSessions = nonArchived.reduce((acc, l) => acc + (l.completedSessionsCount || 0), 0);
    const attentionList = active.filter((l) => {
      if (l.needsAttention) return true;
      if (!l.lastSessionAt) return false;
      return nowMs - new Date(l.lastSessionAt).getTime() > fiveDaysMs;
    });
    const adherenceVals = active
      .map((l) => l.recentAdherencePct)
      .filter((v): v is number => typeof v === 'number');
    const avgAdherence =
      adherenceVals.length > 0
        ? Math.round(adherenceVals.reduce((a, b) => a + b, 0) / adherenceVals.length)
        : null;

    return {
      total: nonArchived.length,
      activeCount: active.length,
      pendingCount: nonArchived.filter((l) => l.status === 'pending').length,
      archivedCount: coachRoster.filter((l) => l.status === 'archived').length,
      totalSessions,
      attentionCount: attentionList.length,
      avgAdherence,
    };
  }, [coachRoster, nowMs, fiveDaysMs]);

  const filteredRoster = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return coachRoster.filter((l) => {
      if (statusFilter === 'archived') {
        if (l.status !== 'archived') return false;
      } else {
        if (l.status === 'archived') return false;
        if (statusFilter === 'active' && l.status !== 'active') return false;
        if (statusFilter === 'pending' && l.status !== 'pending') return false;
        if (statusFilter === 'attention') {
          const overdue =
            l.status === 'active' &&
            Boolean(l.lastSessionAt) &&
            nowMs - new Date(l.lastSessionAt!).getTime() > fiveDaysMs;
          if (!l.needsAttention && !overdue) return false;
        }
      }
      if (selectedGroupId !== 'all' && l.groupId !== selectedGroupId) return false;
      if (q) {
        const hay = `${l.athleteName} ${l.inviteCode} ${l.goalSummary || ''} ${l.assignedProgramName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [coachRoster, selectedGroupId, statusFilter, searchQuery, nowMs, fiveDaysMs]);

  if (!isCoach) {
    return (
      <div className="py-16 text-center space-y-3 bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <p className="text-sm text-neutral-500">
          {language === 'ar'
            ? 'مركز التدريب متاح لحسابات المدربين. يمكنك التبديل إلى وضع المدرب من الملف والإعدادات.'
            : 'Coach Hub is for Coach accounts. You can switch workspace role in Profile & Settings.'}
        </p>
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className="min-h-[44px] px-5 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
        >
          {t.nav.profile}
        </button>
      </div>
    );
  }

  const handleLoadDemoRoster = () => {
    if (!firebaseUser) return;
    seedLocalCoachDemoCohort(
      firebaseUser.uid,
      profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
      language
    );
    showToast(t.apex.demoRosterLoaded);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    const cleanAthName =
      newAthName.trim() || (language === 'ar' ? 'متدرّب جديد' : 'Walk-In Athlete');
    setCreatingInvite(true);
    try {
      const created = await createCoachingLinkInvite(
        firebaseUser.uid,
        profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
        cleanAthName,
        {
          groupId: newAthGroupId || undefined,
          goalSummary: newAthGoal.trim(),
          experienceLevel: newAthLevel,
          weeklyTarget: newAthWeeklyTarget,
          privateNotes: newAthNotes.trim(),
        }
      );
      setNewAthName('');
      setNewAthGoal('');
      setNewAthNotes('');
      setInviteOpen(false);
      setQrLink(created);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !grpName.trim()) return;
    try {
      await saveCoachGroup(
        firebaseUser.uid,
        {
          id: generateSafeId('grp'),
          name: grpName.trim(),
          description: grpDesc.trim(),
        },
        false
      );
      setGrpName('');
      setGrpDesc('');
      setGroupOpen(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSaveGroupRename = async (groupId: string, description: string) => {
    if (!firebaseUser || !editingGroupName.trim()) return;
    try {
      await saveCoachGroup(
        firebaseUser.uid,
        { id: groupId, name: editingGroupName.trim(), description },
        true
      );
      setEditingGroupId(null);
      setEditingGroupName('');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteCoachGroup(groupId);
      if (selectedGroupId === groupId) setSelectedGroupId('all');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !annText.trim()) return;
    setSendingAnn(true);
    try {
      const targets = coachRoster.filter(
        (l) => l.status === 'active' && l.athleteUid && (annGroupId === 'all' || l.groupId === annGroupId)
      );
      for (const target of targets) {
        await sendCoachMessage({
          coachId: firebaseUser.uid,
          athleteUid: target.athleteUid,
          groupId: annGroupId !== 'all' ? annGroupId : undefined,
          senderId: firebaseUser.uid,
          senderName: profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
          senderRole: 'coach',
          type: 'announcement',
          text: annText.trim(),
        });
      }
      setAnnText('');
      setAnnounceOpen(false);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSendingAnn(false);
    }
  };

  const openInspector = async (link: CoachingLink) => {
    setInspectLink(link);
    setEditAthName(link.athleteName || '');
    setEditAthGroupId(link.groupId || '');
    setEditAthLevel(link.experienceLevel || 'intermediate');
    setEditAthWeeklyTarget(link.weeklyTarget || 4);
    setEditAthGoalSummary(link.goalSummary || '');
    setCoachNotesDraft(link.privateNotes || '');
    setConfirmDeleteId(null);
    setCheckinText('');
    setAthleteData(null);
    if (!link.athleteUid || !firebaseUser) return;
    setInspectLoading(true);
    try {
      const res = await fetchLinkedAthleteData(link.athleteUid, firebaseUser.uid);
      setAthleteData(res);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSaveInspectorMeta = async () => {
    if (!inspectLink) return;
    setSavingInspectorMeta(true);
    try {
      const updates: Partial<CoachingLink> = {
        athleteName: editAthName.trim() || inspectLink.athleteName,
        groupId: editAthGroupId,
        experienceLevel: editAthLevel,
        weeklyTarget: Math.max(1, Math.min(14, Number(editAthWeeklyTarget) || 4)),
        goalSummary: editAthGoalSummary.trim(),
        privateNotes: coachNotesDraft,
      };
      await updateCoachingLink(inspectLink.id, updates);
      setInspectLink({ ...inspectLink, ...updates });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSavingInspectorMeta(false);
    }
  };

  const handleToggleAttention = async (checked: boolean) => {
    if (!inspectLink) return;
    try {
      await updateCoachingLink(inspectLink.id, { needsAttention: checked });
      setInspectLink({ ...inspectLink, needsAttention: checked });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSetLinkStatus = async (nextStatus: 'active' | 'archived') => {
    if (!inspectLink) return;
    try {
      await updateCoachingLink(inspectLink.id, { status: nextStatus });
      setInspectLink({ ...inspectLink, status: nextStatus });
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteCoachingLink(linkId);
      setInspectLink(null);
      setConfirmDeleteId(null);
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSendQuickCheckin = async () => {
    if (!firebaseUser || !inspectLink?.athleteUid) return;
    const msg =
      checkinText.trim() ||
      (language === 'ar'
        ? `مرحباً ${inspectLink.athleteName}، كيف سير التمرين والاستشفاء هذا الأسبوع؟ شاركني ملاحظاتك.`
        : `Hey ${inspectLink.athleteName}, quick weekly check-in: how are energy, soreness, and training sessions feeling?`);
    setSendingCheckin(true);
    try {
      await sendCoachMessage({
        coachId: firebaseUser.uid,
        athleteUid: inspectLink.athleteUid,
        groupId: inspectLink.groupId || undefined,
        senderId: firebaseUser.uid,
        senderName: profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
        senderRole: 'coach',
        type: 'checkin',
        text: msg,
      });
      setCheckinText('');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSendingCheckin(false);
    }
  };

  const handleCopyAthleteReport = () => {
    if (!inspectLink) return;
    const activeAthProg =
      athleteData?.programs.find((p) => p.status === 'active') || athleteData?.programs[0];
    const weeklyPlan = activeAthProg?.weeklyFrequency || inspectLink.weeklyTarget || 4;
    const planned28 = weeklyPlan * 4;
    const cutoff28 = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const completed28 = athleteData
      ? athleteData.sessions.filter((s) => new Date(s.completedAt).getTime() >= cutoff28).length
      : inspectLink.completedSessionsCount || 0;
    const adherencePct = Math.min(100, Math.round((completed28 / Math.max(1, planned28)) * 100));
    const prSummary =
      athleteData && athleteData.prs.length > 0
        ? athleteData.prs
            .slice(0, 4)
            .map(
              (pr) =>
                `- ${language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn}: ${formatWeight(pr.bestWeightKg, unit)} ${unitText} × ${pr.bestWeightReps}`
            )
            .join('\n')
        : inspectLink.recentPrText || '—';

    const report =
      language === 'ar'
        ? `تقرير تقدّم المتدرّب — ${inspectLink.athleteName}\nالبرنامج: ${activeAthProg?.name || inspectLink.assignedProgramName || '—'}\nالالتزام (28 يوماً): ${adherencePct}% (${formatArabicCount(completed28, 'حصة', 'حصتان', 'حصص', 'حصة')} من أصل ${planned28})\nأبرز الأرقام القياسية:\n${prSummary}`
        : `APEX Athlete Progress Summary — ${inspectLink.athleteName}\nProgram: ${activeAthProg?.name || inspectLink.assignedProgramName || '—'}\n28-Day Adherence: ${adherencePct}% (${completed28}/${planned28} sessions)\nTop PRs:\n${prSummary}`;

    try {
      navigator.clipboard?.writeText(report);
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleSendSessionFeedback = async (sessionId: string) => {
    if (!firebaseUser || !inspectLink?.athleteUid) return;
    const text = (feedbackDrafts[sessionId] || '').trim();
    if (!text) return;
    try {
      await addSessionCoachFeedback(
        inspectLink.athleteUid,
        sessionId,
        profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
        text
      );
      setFeedbackDrafts((prev) => ({ ...prev, [sessionId]: '' }));
      setAthleteData((prev) =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions.map((s) =>
                s.id === sessionId ? { ...s, coachFeedback: text } : s
              ),
            }
          : prev
      );
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleAddAthleteGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !inspectLink?.athleteUid || !athGoalTitle.trim()) return;
    try {
      const ex = allExercises.find((item) => item.id === athGoalExId);
      const goalId = generateSafeId('goal');
      const goalObj: Omit<PerformanceGoal, 'userId' | 'createdAt' | 'updatedAt'> = {
        id: goalId,
        title: athGoalTitle.trim(),
        targetType: 'weight',
        exerciseId: ex?.id || athGoalExId,
        exerciseNameEn: ex?.nameEn || '',
        exerciseNameAr: ex?.nameAr || '',
        targetWeightKg: toStorageKg(Number(athGoalWeight) || 100, unit),
        status: 'active',
        assignedByCoachId: firebaseUser.uid,
      };
      await savePerformanceGoal(inspectLink.athleteUid, goalObj, false, firebaseUser.uid);
      setAthGoalTitle('');
      setAthleteData((prev) =>
        prev
          ? { ...prev, goals: [{ ...goalObj, userId: inspectLink.athleteUid }, ...prev.goals] }
          : prev
      );
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleToggleAthleteGoal = async (g: PerformanceGoal) => {
    if (!firebaseUser || !inspectLink?.athleteUid) return;
    const nextStatus = g.status === 'achieved' ? 'active' : 'achieved';
    try {
      await savePerformanceGoal(
        inspectLink.athleteUid,
        { ...g, status: nextStatus },
        true,
        firebaseUser.uid
      );
      setAthleteData((prev) =>
        prev
          ? {
              ...prev,
              goals: prev.goals.map((item) =>
                item.id === g.id ? { ...item, status: nextStatus } : item
              ),
            }
          : prev
      );
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleDeleteAthleteGoal = async (goalId: string) => {
    if (!inspectLink?.athleteUid) return;
    try {
      await deletePerformanceGoal(inspectLink.athleteUid, goalId);
      setAthleteData((prev) =>
        prev ? { ...prev, goals: prev.goals.filter((item) => item.id !== goalId) } : prev
      );
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    }
  };

  const handleSendProgramAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !inspectLink?.athleteUid) return;
    setSendingAssign(true);
    try {
      if (assignSource === 'curated') {
        const tpl =
          CURATED_PROGRAM_TEMPLATES.find((c) => c.id === selectedTplId) ||
          CURATED_PROGRAM_TEMPLATES[0];
        const workoutsData: Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>[] = [];
        const days = WEEKDAYS.map((wd) => ({
          dayIndex: wd.index,
          label: wd.en,
          isRestDay: true,
          workoutId: '',
          workoutName: '',
        }));

        for (const w of tpl.workouts) {
          const wId = generateSafeId('cw');
          const wName = language === 'ar' ? w.workoutNameAr : w.workoutNameEn;
          workoutsData.push({
            id: wId,
            name: wName,
            description: language === 'ar' ? w.descriptionAr : w.descriptionEn,
            exercises: w.exercises.map((ex) => ({
              ...ex,
              itemId: generateSafeId('wex'),
              notes: localizeTemplateNote(ex.notes, language),
            })),
          });
          if (days[w.dayIndex]) {
            days[w.dayIndex] = {
              dayIndex: w.dayIndex,
              label: WEEKDAYS[w.dayIndex].en,
              isRestDay: false,
              workoutId: wId,
              workoutName: wName,
            };
          }
        }

        const pName =
          assignProgramTitle.trim() || (language === 'ar' ? tpl.nameAr : tpl.nameEn);
        await sendCoachAssignment({
          id: generateSafeId('asgn'),
          coachId: firebaseUser.uid,
          coachName: profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
          athleteUid: inspectLink.athleteUid,
          linkId: inspectLink.id,
          groupId: inspectLink.groupId || '',
          programName: pName,
          programData: {
            id: generateSafeId('cp'),
            name: pName,
            durationWeeks: tpl.durationWeeks,
            goal: tpl.goal,
            level: tpl.level,
            weeklyFrequency: tpl.weeklyFrequency,
            splitType: tpl.splitType,
            status: 'active',
            philosophy: tpl.philosophy,
            sourceTemplateId: tpl.id,
            originNote:
              language === 'ar'
                ? `${tpl.originCreatorAr} — ${tpl.apexAdaptationAr}`
                : `${tpl.originCreatorEn} — ${tpl.apexAdaptationEn}`,
            scheduledDays: days,
            completedSessions: 0,
            startDate: new Date().toISOString().slice(0, 10),
            progressionApproach:
              language === 'ar' ? tpl.progressionApproachAr : tpl.progressionApproachEn,
            deloadGuidance: language === 'ar' ? tpl.deloadGuidanceAr : tpl.deloadGuidanceEn,
            intensityGuidance:
              language === 'ar' ? tpl.intensityGuidanceAr : tpl.intensityGuidanceEn,
          },
          workoutsData,
          notes: assignNotes.trim(),
          status: 'assigned',
        });
      } else if (assignSource === 'my') {
        const prog = programs.find((p) => p.id === selectedMyProgId) || programs[0];
        if (!prog) throw new Error('No coach program selected');
        const linkedWorkoutIds = new Set(
          prog.scheduledDays.filter((d) => !d.isRestDay && d.workoutId).map((d) => d.workoutId!)
        );
        const workoutsData = workouts
          .filter((w) => linkedWorkoutIds.has(w.id))
          .map(({ userId: _u, createdAt: _c, updatedAt: _up, ...rest }) => rest);
        const pName = assignProgramTitle.trim() || prog.name;
        const { userId: _pu, createdAt: _pc, updatedAt: _pup, ...progRest } = prog;
        await sendCoachAssignment({
          id: generateSafeId('asgn'),
          coachId: firebaseUser.uid,
          coachName: profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
          athleteUid: inspectLink.athleteUid,
          linkId: inspectLink.id,
          groupId: inspectLink.groupId || '',
          programName: pName,
          programData: { ...progRest, name: pName },
          workoutsData,
          notes: assignNotes.trim(),
          status: 'assigned',
        });
      } else {
        // Quick workout routine assignment (from existing workout template or quick exercise selection)
        const existingWorkout = workouts.find((w) => w.id === selectedQuickWorkoutId);
        const wId = generateSafeId('qw');
        let wPayload: Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'>;
        if (existingWorkout) {
          wPayload = {
            id: wId,
            name: assignProgramTitle.trim() || existingWorkout.name,
            description: existingWorkout.description || '',
            exercises: existingWorkout.exercises.map((ex) => ({
              ...ex,
              itemId: generateSafeId('wex'),
            })),
          };
        } else {
          const picks = quickSelectedExIds
            .map((exId) => allExercises.find((e) => e.id === exId))
            .filter((e): e is NonNullable<typeof e> => Boolean(e));
          if (picks.length === 0) throw new Error('Select at least one exercise');
          wPayload = {
            id: wId,
            name:
              quickCustomWorkoutTitle.trim() ||
              assignProgramTitle.trim() ||
              (language === 'ar' ? 'حصة مخصصة من المدرب' : 'Coach Custom Session'),
            description: assignNotes.trim(),
            exercises: picks.map((ex) => ({
              itemId: generateSafeId('wex'),
              exerciseId: ex.id,
              exerciseNameEn: ex.nameEn,
              exerciseNameAr: ex.nameAr,
              sets: 3,
              warmupSets: 1,
              targetRepsMin: 8,
              targetRepsMax: 12,
              restSeconds: 90,
              technique: 'standard',
              notes: '',
            })),
          };
        }

        const pName = assignProgramTitle.trim() || wPayload.name;
        const days = WEEKDAYS.map((wd) => {
          const isTrain = wd.index === 0 || wd.index === 2 || wd.index === 4;
          return {
            dayIndex: wd.index,
            label: wd.en,
            isRestDay: !isTrain,
            workoutId: isTrain ? wId : '',
            workoutName: isTrain ? wPayload.name : '',
          };
        });

        await sendCoachAssignment({
          id: generateSafeId('asgn'),
          coachId: firebaseUser.uid,
          coachName: profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
          athleteUid: inspectLink.athleteUid,
          linkId: inspectLink.id,
          groupId: inspectLink.groupId || '',
          programName: pName,
          programData: {
            id: generateSafeId('cp'),
            name: pName,
            durationWeeks: 4,
            goal: 'hypertrophy',
            level: inspectLink.experienceLevel || 'intermediate',
            weeklyFrequency: 3,
            splitType: 'full_body',
            status: 'active',
            scheduledDays: days,
            completedSessions: 0,
            startDate: new Date().toISOString().slice(0, 10),
          },
          workoutsData: [wPayload],
          notes: assignNotes.trim(),
          status: 'assigned',
        });
      }

      setInspectLink((prev) =>
        prev
          ? {
              ...prev,
              assignedProgramName:
                assignProgramTitle.trim() || prev.assignedProgramName,
            }
          : prev
      );
      setAssignModalOpen(false);
      setAssignNotes('');
      setAssignProgramTitle('');
      showToast(t.common.savedSuccess);
    } catch (err) {
      showToast(formatAppError(err, language, t.common.errorGeneric), 'error');
    } finally {
      setSendingAssign(false);
    }
  };

  const copyCode = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
      showToast(language === 'ar' ? 'تم نسخ رمز الدعوة' : 'Invite code copied');
    } catch {
      // ignore
    }
  };

  const handleCopyInviteLink = (link: CoachingLink) => {
    try {
      navigator.clipboard?.writeText(getJoinUrl(link.inviteCode));
      showToast(t.apex.shareInviteLink);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    }
  };

  const handleShareInviteMessage = async (link: CoachingLink) => {
    const coachDisplay = profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach');
    const url = getJoinUrl(link.inviteCode);
    const shareBody =
      language === 'ar'
        ? `انضم إلى برنامجي التدريبي على تطبيق APEX مع ${coachDisplay}.\nرمز الربط: ${link.inviteCode}\nالرابط المباشر: ${url}`
        : `Join my training roster on APEX with ${coachDisplay}.\nInvite Code: ${link.inviteCode}\nDirect Link: ${url}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `APEX — ${link.inviteCode}`,
          text: shareBody,
          url,
        });
        return;
      }
      navigator.clipboard?.writeText(shareBody);
      showToast(t.common.savedSuccess);
    } catch {
      try {
        navigator.clipboard?.writeText(shareBody);
        showToast(t.common.savedSuccess);
      } catch {
        // user cancelled share
      }
    }
  };

  const unitText = unit === 'lb' ? t.common.lb : t.common.kg;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.apex.coachDashboardTitle}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {language === 'ar'
              ? 'إدارة المتدرّبين، ورموز الدعوة وQR، والمجموعات، وتعيين البرامج، ومتابعة الأداء.'
              : 'Manage athlete rosters, QR invite codes, squads, program assignments, and adherence.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLocalDeviceMode && coachRoster.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDemoRoster}
              className="min-h-[42px] px-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.apex.loadDemoRosterBtn}
            </button>
          )}
          <button
            type="button"
            onClick={() => setAnnounceOpen(true)}
            className="min-h-[42px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
            {t.apex.sendAnnouncement}
          </button>
          <button
            type="button"
            onClick={() => setGroupOpen(true)}
            className="min-h-[42px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 text-sky-500" />
            {t.apex.createGroupBtn}
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            {t.apex.addAthleteBtn}
          </button>
        </div>
      </div>

      {/* Team KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <p className="text-xs text-neutral-500">{t.apex.athleteRoster}</p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1">{teamStats.total}</p>
        </div>
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <p className="text-xs text-neutral-500">
            {language === 'ar' ? 'المتدرّبون النشطون' : 'Connected Active'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-500 mt-1">
            {teamStats.activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <p className="text-xs text-neutral-500">{t.dashboard.totalSessions}</p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1">
            {teamStats.totalSessions}
          </p>
        </div>
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <p className="text-xs text-neutral-500">{t.apex.needsAttention}</p>
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <p className="text-2xl font-bold font-mono tabular-nums text-amber-500">
              {teamStats.attentionCount}
            </p>
            {teamStats.avgAdherence !== null && (
              <span className="text-xs font-mono tabular-nums text-neutral-500">
                {teamStats.avgAdherence}% {t.apex.adherenceLabel}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Search + Status Filter + Squad Filter Toolbar */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.apex.searchAthletesPlaceholder}
              className="w-full min-h-[42px] ps-10 pe-3.5 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
            {(
              [
                ['all', `${t.apex.statusAll} (${teamStats.total})`],
                ['active', `${t.apex.statusActive} (${teamStats.activeCount})`],
                ['pending', `${t.apex.statusPending} (${teamStats.pendingCount})`],
                ['attention', `${t.apex.needsAttention} (${teamStats.attentionCount})`],
                ['archived', `${t.apex.statusArchived} (${teamStats.archivedCount})`],
              ] as [RosterStatusFilter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  statusFilter === key
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Group Filter Bar */}
        {coachGroups.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedGroupId('all')}
              className={`min-h-[36px] px-3.5 rounded-xl text-xs font-medium border cursor-pointer whitespace-nowrap ${
                selectedGroupId === 'all'
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {t.common.all} ({teamStats.total})
            </button>
            {coachGroups.map((g) => (
              <div key={g.id} className="inline-flex items-center gap-1">
                {editingGroupId === g.id ? (
                  <div className="inline-flex items-center gap-1 bg-white dark:bg-[#121417] border border-emerald-500 rounded-xl px-2 py-1">
                    <input
                      type="text"
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      className="w-32 bg-transparent text-xs focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGroupRename(g.id, g.description)}
                      className="p-1 text-emerald-500 cursor-pointer"
                      aria-label={t.common.save}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGroupId(null)}
                      className="p-1 text-neutral-400 cursor-pointer"
                      aria-label={t.common.cancel}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`min-h-[36px] px-3.5 rounded-xl text-xs font-medium border cursor-pointer whitespace-nowrap ${
                        selectedGroupId === g.id
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {g.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGroupId(g.id);
                        setEditingGroupName(g.name);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-emerald-500 cursor-pointer"
                      aria-label={t.common.edit}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(g.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Athlete Roster Grid */}
      {filteredRoster.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl px-4 space-y-4">
          <Users className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {coachRoster.length === 0
              ? language === 'ar'
                ? 'لا يوجد متدرّبون في قائمتك بعد. أنشئ رمز دعوة أو رمز QR وأرسله للمتدرّب لربط حسابه فوراً، أو حمّل قائمة تجريبية للنادي.'
                : 'No athletes on your roster yet. Generate a QR invite code to onboard an athlete, or load a sample gym roster.'
              : t.common.noResults}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {t.apex.addAthleteBtn}
            </button>
            {isLocalDeviceMode && coachRoster.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemoRoster}
                className="min-h-[44px] px-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {t.apex.loadDemoRosterBtn}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoster.map((link) => {
            const overdue =
              link.status === 'active' &&
              Boolean(link.lastSessionAt) &&
              nowMs - new Date(link.lastSessionAt!).getTime() > fiveDaysMs;
            const grp = coachGroups.find((g) => g.id === link.groupId);
            const unreadCount = link.athleteUid ? unreadByAthlete.get(link.athleteUid) || 0 : 0;

            return (
              <div
                key={link.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold truncate">{link.athleteName}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 mt-0.5">
                        <span
                          className={`font-semibold ${
                            link.status === 'active'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : link.status === 'archived'
                                ? 'text-neutral-500'
                                : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {link.status === 'active'
                            ? t.apex.statusActive
                            : link.status === 'archived'
                              ? t.apex.statusArchived
                              : t.apex.statusPending}
                        </span>
                        {link.experienceLevel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{tLabel(DIFFICULTY_LABELS[link.experienceLevel], language)}</span>
                          </>
                        )}
                        {grp && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{grp.name}</span>
                          </>
                        )}
                        {link.assignedProgramName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[180px]">{link.assignedProgramName}</span>
                          </>
                        )}
                      </div>
                      {(link.needsAttention || overdue) && link.status === 'active' && (
                        <p className="text-xs font-semibold text-amber-500 inline-flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {overdue ? t.apex.missedSessions : t.apex.needsAttention}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyCode(link.inviteCode)}
                        className="min-h-[34px] px-2.5 rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                        title={language === 'ar' ? 'نسخ الرمز' : 'Copy Code'}
                      >
                        <span>{link.inviteCode}</span>
                        <Copy className="w-3 h-3 text-neutral-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrLink(link)}
                        className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 cursor-pointer"
                        title={t.apex.shareQrTitle}
                        aria-label={t.apex.shareQrTitle}
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                      </button>
                    </div>
                  </div>

                  {link.goalSummary && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {link.goalSummary}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-mono tabular-nums">
                    <div>
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.dashboard.totalSessions}
                      </span>
                      <strong>{link.completedSessionsCount || 0}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {language === 'ar' ? 'آخر تمرين' : 'Last Session'}
                      </span>
                      <strong>
                        {link.lastSessionAt
                          ? new Date(link.lastSessionAt).toLocaleDateString(
                              language === 'ar' ? 'ar-EG' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )
                          : '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-neutral-500 block">
                        {t.dashboard.recentPRs}
                      </span>
                      <strong className="truncate block font-sans text-[11px]">
                        {link.recentPrText || '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => openInspector(link)}
                    className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'إدارة المتدرّب' : 'Inspect & Coach'}
                  </button>

                  <div className="flex items-center gap-2">
                    {link.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => setQrLink(link)}
                        className="min-h-[40px] px-3 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'مشاركة QR' : 'Share QR'}
                      </button>
                    )}

                    {link.athleteUid && (
                      <button
                        type="button"
                        onClick={() => openCoachChat(link.athleteUid)}
                        className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t.nav.messaging}</span>
                        {unreadCount > 0 && (
                          <span className="font-mono font-bold text-emerald-500 tabular-nums">
                            ({unreadCount})
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Athlete / Invite Code Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.addAthleteBtn}</h3>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvite} className="space-y-3">
              <input
                type="text"
                value={newAthName}
                onChange={(e) => setNewAthName(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اسم المتدرّب (أو اتركه فارغاً لدعوة سريعة)'
                    : 'Athlete Name (optional for quick walk-in QR)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newAthLevel}
                  onChange={(e) => setNewAthLevel(e.target.value as DifficultyLevel)}
                  className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                    <option key={l} value={l}>
                      {tLabel(DIFFICULTY_LABELS[l], language)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={newAthWeeklyTarget}
                  onChange={(e) => setNewAthWeeklyTarget(Number(e.target.value) || 4)}
                  className="min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs tabular-nums"
                  title={t.profile.weeklyFreq}
                />
              </div>
              {coachGroups.length > 0 && (
                <select
                  value={newAthGroupId}
                  onChange={(e) => setNewAthGroupId(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <option value="">{language === 'ar' ? 'بدون مجموعة' : 'No squad'}</option>
                  {coachGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={newAthGoal}
                onChange={(e) => setNewAthGoal(e.target.value)}
                placeholder={language === 'ar' ? 'ملخص الهدف التدريبي' : 'Goal summary'}
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <textarea
                rows={2}
                value={newAthNotes}
                onChange={(e) => setNewAthNotes(e.target.value)}
                placeholder={t.apex.privateCoachNotes}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <button
                type="submit"
                disabled={creatingInvite}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {creatingInvite
                  ? t.common.loading
                  : language === 'ar'
                    ? 'إنشاء الرمز وعرض QR'
                    : 'Generate Code & QR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share & QR Invite Modal */}
      {qrLink && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQrLink(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-start">
              <div>
                <h3 className="text-base font-bold">{t.apex.shareQrTitle}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{qrLink.athleteName}</p>
              </div>
              <button
                type="button"
                onClick={() => setQrLink(null)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrDataUrl && (
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 inline-block mx-auto">
                <img
                  src={qrDataUrl}
                  alt={`QR ${qrLink.inviteCode}`}
                  className="w-48 h-48 block"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => copyCode(qrLink.inviteCode)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xl font-bold tracking-wider cursor-pointer"
              >
                <span>{qrLink.inviteCode}</span>
                <Copy className="w-4 h-4 text-emerald-500" />
              </button>
              <p className="text-xs text-neutral-500 leading-relaxed">{t.apex.qrScanHint}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyInviteLink(qrLink)}
                className="min-h-[44px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {t.apex.shareInviteLink}
              </button>
              <button
                type="button"
                onClick={() => handleShareInviteMessage(qrLink)}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {t.apex.shareInviteText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {groupOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.createGroupBtn}</h3>
              <button
                type="button"
                onClick={() => setGroupOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <input
                type="text"
                required
                value={grpName}
                onChange={(e) => setGrpName(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اسم المجموعة (مثال: فريق القوة)'
                    : 'Squad Name (e.g., Hypertrophy Squad)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <textarea
                rows={2}
                value={grpDesc}
                onChange={(e) => setGrpDesc(e.target.value)}
                placeholder={t.common.notes}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {t.common.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {announceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.sendAnnouncement}</h3>
              <button
                type="button"
                onClick={() => setAnnounceOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <select
                value={annGroupId}
                onChange={(e) => setAnnGroupId(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                <option value="all">
                  {language === 'ar' ? 'جميع المتدرّبين النشطين' : 'All Active Athletes'}
                </option>
                {coachGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <textarea
                rows={4}
                required
                value={annText}
                onChange={(e) => setAnnText(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اكتب التوجيه أو الإعلان للفريق...'
                    : 'Write your team announcement or weekly check-in prompt...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <button
                type="submit"
                disabled={sendingAnn}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {sendingAnn ? t.common.loading : t.apex.sendAnnouncement}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Athlete Inspector Modal */}
      {inspectLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold truncate">{inspectLink.athleteName}</h3>
                <p className="text-xs font-mono text-neutral-500">
                  {inspectLink.inviteCode} ·{' '}
                  {inspectLink.status === 'active'
                    ? t.apex.statusActive
                    : inspectLink.status === 'archived'
                      ? t.apex.statusArchived
                      : t.apex.statusPending}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {inspectLink.athleteUid && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAssignModalOpen(true)}
                      className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      {t.apex.assignTemplate}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetUid = inspectLink.athleteUid;
                        setInspectLink(null);
                        openCoachChat(targetUid);
                      }}
                      className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t.nav.messaging}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAthleteReport}
                      className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.apex.copyReportBtn}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setInspectLink(null)}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  aria-label={t.common.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Editable Athlete Info + Private Coaching Notes + Lifecycle */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold">{t.apex.editAthleteInfo}</span>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inspectLink.needsAttention)}
                      onChange={(e) => handleToggleAttention(e.target.checked)}
                      className="accent-amber-500"
                    />
                    {t.apex.needsAttention}
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    value={editAthName}
                    onChange={(e) => setEditAthName(e.target.value)}
                    placeholder={t.profile.displayName}
                    className="sm:col-span-2 min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                  <select
                    value={editAthLevel}
                    onChange={(e) => setEditAthLevel(e.target.value as DifficultyLevel)}
                    className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((l) => (
                      <option key={l} value={l}>
                        {tLabel(DIFFICULTY_LABELS[l], language)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={editAthWeeklyTarget}
                    onChange={(e) => setEditAthWeeklyTarget(Number(e.target.value) || 4)}
                    className="min-h-[38px] px-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs tabular-nums"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={editAthGroupId}
                    onChange={(e) => setEditAthGroupId(e.target.value)}
                    className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    <option value="">{language === 'ar' ? 'بدون مجموعة' : 'No squad'}</option>
                    {coachGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editAthGoalSummary}
                    onChange={(e) => setEditAthGoalSummary(e.target.value)}
                    placeholder={language === 'ar' ? 'ملخص الهدف التدريبي' : 'Goal summary'}
                    className="min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-500">
                    {t.apex.privateCoachNotes}
                  </label>
                  <textarea
                    rows={2}
                    value={coachNotesDraft}
                    onChange={(e) => setCoachNotesDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {inspectLink.status === 'archived' ? (
                      <button
                        type="button"
                        onClick={() => handleSetLinkStatus('active')}
                        className="min-h-[34px] px-3 rounded-lg border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t.apex.restoreLinkBtn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetLinkStatus('archived')}
                        className="min-h-[34px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {t.apex.archiveLinkBtn}
                      </button>
                    )}

                    {confirmDeleteId === inspectLink.id ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(inspectLink.id)}
                          className="min-h-[34px] px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          {t.common.delete}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[34px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs cursor-pointer"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(inspectLink.id)}
                        className="min-h-[34px] px-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.apex.deleteLinkBtn}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={savingInspectorMeta}
                    onClick={handleSaveInspectorMeta}
                    className="min-h-[36px] px-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold cursor-pointer"
                  >
                    {savingInspectorMeta ? t.common.loading : t.common.save}
                  </button>
                </div>
              </div>

              {!inspectLink.athleteUid ? (
                <div className="p-6 text-center space-y-3 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-500">
                    {language === 'ar'
                      ? `أرسل الرمز (${inspectLink.inviteCode}) أو رمز QR للمتدرّب لإدخاله داخل التطبيق، وستظهر بياناته وتقاريره هنا فوراً.`
                      : `Share invite code (${inspectLink.inviteCode}) or QR code with the athlete to link their account.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setQrLink(inspectLink)}
                    className="min-h-[40px] px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    {t.apex.shareQrTitle}
                  </button>
                </div>
              ) : inspectLoading ? (
                <p className="text-xs text-neutral-500 text-center py-8">{t.common.loading}</p>
              ) : athleteData ? (
                <>
                  {/* Planned vs Completed Execution (Last 28 Days) + 1-Tap Check-In */}
                  {(() => {
                    const activeAthProg =
                      athleteData.programs.find((p) => p.status === 'active') ||
                      athleteData.programs[0];
                    const weeklyPlan = activeAthProg?.weeklyFrequency || inspectLink.weeklyTarget || 4;
                    const planned28 = weeklyPlan * 4;
                    const cutoff28 = nowMs - 28 * 24 * 60 * 60 * 1000;
                    const completed28 = athleteData.sessions.filter(
                      (s) => new Date(s.completedAt).getTime() >= cutoff28
                    ).length;
                    const missed28 = Math.max(0, planned28 - completed28);
                    const adherencePct = Math.min(
                      100,
                      Math.round((completed28 / Math.max(1, planned28)) * 100)
                    );
                    return (
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-bold">{t.apex.plannedVsCompletedTitle}</h4>
                          {activeAthProg && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              {activeAthProg.name}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.plannedLabel}
                            </span>
                            <strong>{planned28}</strong>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.completedLabel}
                            </span>
                            <strong className="text-emerald-600 dark:text-emerald-400">
                              {completed28}
                            </strong>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.missedLabel}
                            </span>
                            <strong className={missed28 > 2 ? 'text-amber-500' : ''}>
                              {missed28}
                            </strong>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.adherenceLabel}
                            </span>
                            <strong>{adherencePct}%</strong>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <input
                            type="text"
                            value={checkinText}
                            onChange={(e) => setCheckinText(e.target.value)}
                            placeholder={
                              language === 'ar'
                                ? 'رسالة متابعة سريعة (أو اتركه فارغاً للإرسال التلقائي)...'
                                : 'Custom check-in prompt (or leave blank for standard check-in)...'
                            }
                            className="flex-1 min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                          />
                          <button
                            type="button"
                            disabled={sendingCheckin}
                            onClick={handleSendQuickCheckin}
                            className="min-h-[38px] px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
                            {t.apex.sendCheckinBtn}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Athlete Goals Management */}
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      {t.apex.goalsTitle} ({athleteData.goals.length})
                    </h4>

                    {athleteData.goals.length > 0 && (
                      <div className="space-y-2">
                        {athleteData.goals.map((g) => (
                          <div
                            key={g.id}
                            className="p-2.5 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{g.title}</p>
                              <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
                                {language === 'ar' ? g.exerciseNameAr : g.exerciseNameEn}
                                {g.targetWeightKg
                                  ? ` · ${formatWeight(g.targetWeightKg, unit)} ${unitText}`
                                  : ''}
                                {' · '}
                                <span
                                  className={
                                    g.status === 'achieved'
                                      ? 'text-emerald-500 font-semibold'
                                      : 'text-neutral-500'
                                  }
                                >
                                  {g.status === 'achieved' ? t.apex.goalAchieved : t.apex.goalActive}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleAthleteGoal(g)}
                                className="min-h-[30px] px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-[11px] font-medium cursor-pointer"
                              >
                                {g.status === 'achieved' ? t.apex.goalActive : t.apex.goalAchieved}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAthleteGoal(g.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                                aria-label={t.common.delete}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAddAthleteGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        required
                        value={athGoalTitle}
                        onChange={(e) => setAthGoalTitle(e.target.value)}
                        placeholder={language === 'ar' ? 'إضافة هدف جديد...' : 'New target title...'}
                        className="sm:col-span-2 min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                      <select
                        value={athGoalExId}
                        onChange={(e) => setAthGoalExId(e.target.value)}
                        className="min-h-[38px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      >
                        {allExercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {language === 'ar' ? ex.nameAr : ex.nameEn}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          min={5}
                          value={athGoalWeight}
                          onChange={(e) => setAthGoalWeight(e.target.value)}
                          className="w-full min-h-[38px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs tabular-nums"
                        />
                        <button
                          type="submit"
                          className="min-h-[38px] px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer shrink-0"
                          aria-label={t.common.add}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Athlete PRs */}
                  {athleteData.prs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold">{t.dashboard.recentPRs}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {athleteData.prs.slice(0, 6).map((pr) => (
                          <div
                            key={pr.exerciseId}
                            className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                          >
                            <span className="truncate font-medium">
                              {language === 'ar' ? pr.exerciseNameAr : pr.exerciseNameEn}
                            </span>
                            <span className="font-mono tabular-nums font-semibold text-emerald-500 shrink-0">
                              {formatWeight(pr.bestWeightKg, unit)} {unitText} × {pr.bestWeightReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Athlete Sessions + Inline Coach Feedback */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold">
                      {t.history.title} ({athleteData.sessions.length})
                    </h4>
                    {athleteData.sessions.length === 0 ? (
                      <p className="text-xs text-neutral-500">{t.history.noHistory}</p>
                    ) : (
                      athleteData.sessions.slice(0, 8).map((s) => (
                        <div
                          key={s.id}
                          className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div>
                              <strong className="text-sm">{s.workoutName}</strong>
                              <span className="text-neutral-500 ms-2 font-mono tabular-nums">
                                {new Date(s.completedAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-EG' : 'en-US'
                                )}{' '}
                                · {formatDuration(s.durationSeconds)} · {s.totalSets} {t.common.sets} ·{' '}
                                {formatVolume(s.totalVolumeKg, unit, language)} {unitText}
                                {s.sessionRpe ? ` · RPE ${s.sessionRpe}` : ''}
                              </span>
                            </div>
                          </div>

                          {s.exercises.length > 0 && (
                            <p className="text-[11px] text-neutral-500 truncate">
                              {s.exercises
                                .slice(0, 4)
                                .map((ex) => language === 'ar' ? ex.exerciseNameAr : ex.exerciseNameEn)
                                .join(' · ')}
                            </p>
                          )}

                          {s.coachFeedback && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 inline me-1" />
                              {s.coachFeedback}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={feedbackDrafts[s.id] || ''}
                              onChange={(e) =>
                                setFeedbackDrafts((prev) => ({ ...prev, [s.id]: e.target.value }))
                              }
                              placeholder={t.apex.addCoachFeedback}
                              className="flex-1 min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendSessionFeedback(s.id)}
                              aria-label={language === 'ar' ? 'إرسال' : 'Send'}
                              className="min-h-[38px] px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Assign Program / Quick Workout Modal */}
      {assignModalOpen && inspectLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.assignProgramTitle}</h3>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendProgramAssignment} className="space-y-3">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B]">
                <button
                  type="button"
                  onClick={() => setAssignSource('curated')}
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer truncate px-1 ${
                    assignSource === 'curated'
                      ? 'bg-white dark:bg-[#1A1D22] shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  {t.apex.programLibraryTab}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignSource('my')}
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer truncate px-1 ${
                    assignSource === 'my'
                      ? 'bg-white dark:bg-[#1A1D22] shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  {t.apex.myProgramsTab}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignSource('quick')}
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer truncate px-1 ${
                    assignSource === 'quick'
                      ? 'bg-white dark:bg-[#1A1D22] shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  {t.apex.quickAssignWorkoutTab}
                </button>
              </div>

              {assignSource === 'curated' ? (
                <select
                  value={selectedTplId}
                  onChange={(e) => setSelectedTplId(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  {CURATED_PROGRAM_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                    </option>
                  ))}
                </select>
              ) : assignSource === 'my' ? (
                programs.length > 0 ? (
                  <select
                    value={selectedMyProgId || programs[0]?.id || ''}
                    onChange={(e) => setSelectedMyProgId(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-dashed border-neutral-300 dark:border-neutral-800 text-xs text-neutral-500 flex items-center justify-between gap-2">
                    <span>
                      {language === 'ar'
                        ? 'لا تملك برامج شخصية بعد.'
                        : 'You have no custom programs saved yet.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignModalOpen(false);
                        setInspectLink(null);
                        setActiveSection('programs');
                      }}
                      className="text-emerald-500 font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      {t.nav.programs}
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-2.5">
                  {workouts.length > 0 && (
                    <select
                      value={selectedQuickWorkoutId}
                      onChange={(e) => setSelectedQuickWorkoutId(e.target.value)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                    >
                      <option value="">
                        {language === 'ar' ? '— أو اختر تمارين سريعة أدناه —' : '— Or build quick session below —'}
                      </option>
                      {workouts.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.exercises.length})
                        </option>
                      ))}
                    </select>
                  )}

                  {!selectedQuickWorkoutId && (
                    <div className="space-y-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800">
                      <input
                        type="text"
                        value={quickCustomWorkoutTitle}
                        onChange={(e) => setQuickCustomWorkoutTitle(e.target.value)}
                        placeholder={
                          language === 'ar' ? 'اسم الحصة (مثال: يوم علوي متكامل)' : 'Session Name (e.g., Full Upper A)'
                        }
                        className="w-full min-h-[38px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                      <div className="max-h-36 overflow-y-auto space-y-1">
                        {allExercises.slice(0, 18).map((ex) => {
                          const checked = quickSelectedExIds.includes(ex.id);
                          return (
                            <label
                              key={ex.id}
                              className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setQuickSelectedExIds((prev) =>
                                    e.target.checked
                                      ? [...prev, ex.id]
                                      : prev.filter((id) => id !== ex.id)
                                  )
                                }
                                className="accent-emerald-500"
                              />
                              <span className="truncate">
                                {language === 'ar' ? ex.nameAr : ex.nameEn}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                type="text"
                value={assignProgramTitle}
                onChange={(e) => setAssignProgramTitle(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'اسم مخصص للبرنامج (اختياري)'
                    : 'Custom program title (optional)'
                }
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <textarea
                rows={3}
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'توجيهات المدرب للمتدرّب...'
                    : 'Coach instructions for the athlete...'
                }
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <button
                type="submit"
                disabled={
                  sendingAssign ||
                  (assignSource === 'my' && programs.length === 0) ||
                  (assignSource === 'quick' && !selectedQuickWorkoutId && quickSelectedExIds.length === 0)
                }
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
              >
                {sendingAssign ? t.common.loading : t.apex.assignTemplate}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
