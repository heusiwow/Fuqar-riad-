import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FolderPlus,
  Megaphone,
  MessageSquare,
  Plus,
  Send,
  Target,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURATED_PROGRAM_TEMPLATES, localizeTemplateNote } from '../../data/programTemplates';
import { DIFFICULTY_LABELS, tLabel, WEEKDAYS } from '../../i18n/translations';
import {
  addSessionCoachFeedback,
  createCoachingLinkInvite,
  deleteCoachGroup,
  fetchLinkedAthleteData,
  generateSafeId,
  saveCoachGroup,
  savePerformanceGoal,
  sendCoachAssignment,
  sendCoachMessage,
  updateCoachingLink,
} from '../../services/firestoreService';
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

export const CoachDashboardView: React.FC = () => {
  const {
    firebaseUser,
    profile,
    isCoach,
    language,
    unit,
    t,
    allExercises,
    coachGroups,
    coachRoster,
    programs,
    workouts,
    setActiveSection,
    showToast,
  } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);

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
  const [coachNotesDraft, setCoachNotesDraft] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  // Goal creation for athlete
  const [athGoalTitle, setAthGoalTitle] = useState('');
  const [athGoalExId, setAthGoalExId] = useState('barbell-bench-press');
  const [athGoalWeight, setAthGoalWeight] = useState('100');

  // Assign Program modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSource, setAssignSource] = useState<'curated' | 'my'>('curated');
  const [selectedTplId, setSelectedTplId] = useState(CURATED_PROGRAM_TEMPLATES[0].id);
  const [selectedMyProgId, setSelectedMyProgId] = useState('');
  const [assignProgramTitle, setAssignProgramTitle] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [sendingAssign, setSendingAssign] = useState(false);

  const nowMs = Date.now();
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

  const teamStats = useMemo(() => {
    const active = coachRoster.filter((l) => l.status === 'active');
    const totalSessions = coachRoster.reduce((acc, l) => acc + (l.completedSessionsCount || 0), 0);
    const attentionList = active.filter((l) => {
      if (l.needsAttention) return true;
      if (!l.lastSessionAt) return false;
      return nowMs - new Date(l.lastSessionAt).getTime() > fiveDaysMs;
    });
    return {
      total: coachRoster.length,
      activeCount: active.length,
      totalSessions,
      attentionCount: attentionList.length,
    };
  }, [coachRoster]);

  const filteredRoster = useMemo(() => {
    if (selectedGroupId === 'all') return coachRoster;
    return coachRoster.filter((l) => l.groupId === selectedGroupId);
  }, [coachRoster, selectedGroupId]);

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
          className="min-h-[40px] px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
        >
          {t.nav.profile}
        </button>
      </div>
    );
  }

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !newAthName.trim()) return;
    setCreatingInvite(true);
    try {
      await createCoachingLinkInvite(
        firebaseUser.uid,
        profile?.displayName || (language === 'ar' ? 'المدرب' : 'Coach'),
        newAthName.trim(),
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
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
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
    } catch {
      showToast(t.common.errorGeneric, 'error');
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
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSendingAnn(false);
    }
  };

  const openInspector = async (link: CoachingLink) => {
    setInspectLink(link);
    setCoachNotesDraft(link.privateNotes || '');
    setAthleteData(null);
    if (!link.athleteUid || !firebaseUser) return;
    setInspectLoading(true);
    try {
      const res = await fetchLinkedAthleteData(link.athleteUid, firebaseUser.uid);
      setAthleteData(res);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSaveCoachNotes = async () => {
    if (!inspectLink) return;
    try {
      await updateCoachingLink(inspectLink.id, { privateNotes: coachNotesDraft });
      setInspectLink({ ...inspectLink, privateNotes: coachNotesDraft });
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
    } catch {
      showToast(t.common.errorGeneric, 'error');
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
        prev ? { ...prev, goals: [{ ...goalObj, userId: inspectLink.athleteUid }, ...prev.goals] } : prev
      );
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
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
      } else {
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
      }
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
      showToast(language === 'ar' ? 'تم نسخ كود الدعوة' : 'Invite code copied');
    } catch {
      // ignore
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
              ? 'إدارة اللاعبين، دعوات الربط، المجموعات، تعيين البرامج، ومتابعة الأداء.'
              : 'Manage athlete rosters, invite codes, groups, program assignments, and adherence.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAnnounceOpen(true)}
            className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
            {t.apex.sendAnnouncement}
          </button>
          <button
            type="button"
            onClick={() => setGroupOpen(true)}
            className="min-h-[40px] px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-sky-500" />
            {t.apex.createGroupBtn}
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
            {language === 'ar' ? 'اللاعبون النشطون' : 'Connected Active'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-500 mt-1">
            {teamStats.activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <p className="text-xs text-neutral-500">{t.dashboard.totalSessions}</p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1">{teamStats.totalSessions}</p>
        </div>
        <div className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <p className="text-xs text-neutral-500">{t.apex.needsAttention}</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-500 mt-1">
            {teamStats.attentionCount}
          </p>
        </div>
      </section>

      {/* Group Filter Bar */}
      {coachGroups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedGroupId('all')}
            className={`min-h-[34px] px-3.5 rounded-xl text-xs font-medium border cursor-pointer ${
              selectedGroupId === 'all'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {t.common.all} ({coachRoster.length})
          </button>
          {coachGroups.map((g) => (
            <div key={g.id} className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedGroupId(g.id)}
                className={`min-h-[34px] px-3.5 rounded-xl text-xs font-medium border cursor-pointer ${
                  selectedGroupId === g.id
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-white dark:bg-[#121417] border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {g.name}
              </button>
              <button
                type="button"
                onClick={() => deleteCoachGroup(g.id)}
                className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                aria-label={t.common.delete}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Athlete Roster Grid */}
      {filteredRoster.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#121417] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl px-4 space-y-4">
          <Users className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {language === 'ar'
              ? 'لا يوجد لاعبون في قائمتك بعد. أنشئ كود دعوة وأرسله للاعب لربط حسابه ومتابعة تمارينه.'
              : 'No athletes on your roster yet. Generate an invite code to link an athlete account.'}
          </p>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {t.apex.addAthleteBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoster.map((link) => {
            const overdue =
              Boolean(link.lastSessionAt) &&
              nowMs - new Date(link.lastSessionAt!).getTime() > fiveDaysMs;
            const grp = coachGroups.find((g) => g.id === link.groupId);
            return (
              <div
                key={link.id}
                className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold truncate">{link.athleteName}</h3>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            link.status === 'active'
                              ? 'bg-emerald-500/12 text-emerald-500'
                              : 'bg-amber-500/12 text-amber-500'
                          }`}
                        >
                          {link.status === 'active'
                            ? language === 'ar'
                              ? 'متصل'
                              : 'Active'
                            : language === 'ar'
                              ? 'بانتظار الانضمام'
                              : 'Pending'}
                        </span>
                        {(link.needsAttention || overdue) && (
                          <span className="text-[11px] font-semibold text-amber-500 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {overdue ? t.apex.missedSessions : t.apex.needsAttention}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {link.experienceLevel
                          ? tLabel(DIFFICULTY_LABELS[link.experienceLevel], language)
                          : ''}{' '}
                        {grp ? `· ${grp.name}` : ''}
                        {link.assignedProgramName ? ` · ${link.assignedProgramName}` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCode(link.inviteCode)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>{link.inviteCode}</span>
                      <Copy className="w-3 h-3 text-neutral-400" />
                    </button>
                  </div>

                  {link.goalSummary && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">{link.goalSummary}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-mono tabular-nums">
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

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => openInspector(link)}
                    className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'إدارة اللاعب' : 'Inspect & Coach'}
                  </button>

                  {link.athleteUid && (
                    <button
                      type="button"
                      onClick={() => setActiveSection('messaging')}
                      className="min-h-[38px] px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t.nav.messaging}
                    </button>
                  )}
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
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvite} className="space-y-3">
              <input
                type="text"
                required
                value={newAthName}
                onChange={(e) => setNewAthName(e.target.value)}
                placeholder={language === 'ar' ? 'اسم اللاعب' : 'Athlete Full Name'}
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newAthLevel}
                  onChange={(e) => setNewAthLevel(e.target.value as DifficultyLevel)}
                  className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
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
                  className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                />
              </div>
              {coachGroups.length > 0 && (
                <select
                  value={newAthGroupId}
                  onChange={(e) => setNewAthGroupId(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <option value="">{language === 'ar' ? 'بدون مجموعة' : 'No group'}</option>
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
                className="w-full min-h-[40px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
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
                className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                {creatingInvite ? t.common.loading : t.common.create}
              </button>
            </form>
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
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
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
                placeholder={language === 'ar' ? 'اسم المجموعة (مثال: فريق القوة)' : 'Group Name (e.g., Hypertrophy Squad)'}
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
                className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
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
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <select
                value={annGroupId}
                onChange={(e) => setAnnGroupId(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                <option value="all">{language === 'ar' ? 'جميع اللاعبين النشطين' : 'All Active Athletes'}</option>
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
                className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
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
          <div className="w-full max-w-3xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{inspectLink.athleteName}</h3>
                <p className="text-xs font-mono text-neutral-500">
                  {inspectLink.inviteCode} ·{' '}
                  {inspectLink.status === 'active'
                    ? language === 'ar'
                      ? 'متصل'
                      : 'Active'
                    : language === 'ar'
                      ? 'بانتظار تفعيل اللاعب للكود'
                      : 'Waiting for athlete to enter invite code'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {inspectLink.athleteUid && (
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(true)}
                    className="min-h-[36px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    {t.apex.assignTemplate}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectLink(null)}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Private Coaching Notes + Attention Flag */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold">{t.apex.privateCoachNotes}</label>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(inspectLink.needsAttention)}
                      onChange={async (e) => {
                        const nextVal = e.target.checked;
                        await updateCoachingLink(inspectLink.id, { needsAttention: nextVal });
                        setInspectLink({ ...inspectLink, needsAttention: nextVal });
                      }}
                      className="accent-amber-500"
                    />
                    {t.apex.needsAttention}
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={coachNotesDraft}
                  onChange={(e) => setCoachNotesDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveCoachNotes}
                    className="min-h-[34px] px-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold cursor-pointer"
                  >
                    {t.common.save}
                  </button>
                </div>
              </div>

              {!inspectLink.athleteUid ? (
                <p className="text-xs text-neutral-500 text-center py-6">
                  {language === 'ar'
                    ? `أرسل الكود (${inspectLink.inviteCode}) للاعب لإدخاله من صفحة الرسائل، وستظهر بياناته وتقاريره هنا فوراً.`
                    : `Share invite code (${inspectLink.inviteCode}) with the athlete to link their account in Messages.`}
                </p>
              ) : inspectLoading ? (
                <p className="text-xs text-neutral-500 text-center py-8">{t.common.loading}</p>
              ) : athleteData ? (
                <>
                  {/* Planned vs Completed Execution (Last 28 Days) */}
                  {(() => {
                    const activeAthProg =
                      athleteData.programs.find((p) => p.status === 'active') ||
                      athleteData.programs[0];
                    const weeklyPlan = activeAthProg?.weeklyFrequency || inspectLink.weeklyTarget || 4;
                    const planned28 = weeklyPlan * 4;
                    const cutoff28 = Date.now() - 28 * 24 * 60 * 60 * 1000;
                    const completed28 = athleteData.sessions.filter(
                      (s) => new Date(s.completedAt).getTime() >= cutoff28
                    ).length;
                    const missed28 = Math.max(0, planned28 - completed28);
                    const adherencePct = Math.min(
                      100,
                      Math.round((completed28 / Math.max(1, planned28)) * 100)
                    );
                    return (
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-bold">{t.apex.plannedVsCompletedTitle}</h4>
                          {activeAthProg && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {activeAthProg.name}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                          <div className="p-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.plannedLabel}
                            </span>
                            <strong>{planned28}</strong>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.completedLabel}
                            </span>
                            <strong className="text-emerald-600 dark:text-emerald-400">{completed28}</strong>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.missedLabel}
                            </span>
                            <strong className={missed28 > 2 ? 'text-amber-500' : ''}>{missed28}</strong>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[10px] font-sans text-neutral-500 block">
                              {t.apex.adherenceLabel}
                            </span>
                            <strong>{adherencePct}%</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Set Individual Goal */}
                  <form
                    onSubmit={handleAddAthleteGoal}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 space-y-2.5"
                  >
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      {language === 'ar' ? 'تحديد هدف فردي للاعب' : 'Set Individual Target'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        required
                        value={athGoalTitle}
                        onChange={(e) => setAthGoalTitle(e.target.value)}
                        placeholder={language === 'ar' ? 'الهدف' : 'Goal Title'}
                        className="sm:col-span-2 min-h-[36px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                      />
                      <select
                        value={athGoalExId}
                        onChange={(e) => setAthGoalExId(e.target.value)}
                        className="min-h-[36px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
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
                          className="w-full min-h-[36px] px-2 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
                        />
                        <button
                          type="submit"
                          className="min-h-[36px] px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </form>

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
                            <span className="font-mono font-semibold text-emerald-500 shrink-0">
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
                              <span className="text-neutral-500 ms-2 font-mono">
                                {new Date(s.completedAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-EG' : 'en-US'
                                )}{' '}
                                · {formatDuration(s.durationSeconds)} · {s.totalSets} {t.common.sets} ·{' '}
                                {formatVolume(s.totalVolumeKg, unit, language)} {unitText}
                                {s.sessionRpe ? ` · RPE ${s.sessionRpe}` : ''}
                              </span>
                            </div>
                          </div>

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
                              className="flex-1 min-h-[36px] px-3 rounded-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendSessionFeedback(s.id)}
                              aria-label={language === 'ar' ? 'إرسال' : 'Send'}
                              className="min-h-[36px] px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3 rtl:-scale-x-100" />
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

      {/* Assign Program Modal */}
      {assignModalOpen && inspectLink && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{t.apex.assignProgramTitle}</h3>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendProgramAssignment} className="space-y-3">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#090A0B]">
                <button
                  type="button"
                  onClick={() => setAssignSource('curated')}
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
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
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                    assignSource === 'my'
                      ? 'bg-white dark:bg-[#1A1D22] shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  {t.apex.myProgramsTab}
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
              ) : (
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
              )}

              <input
                type="text"
                value={assignProgramTitle}
                onChange={(e) => setAssignProgramTitle(e.target.value)}
                placeholder={
                  language === 'ar' ? 'اسم مخصص للبرنامج (اختياري)' : 'Custom program title (optional)'
                }
                className="w-full min-h-[40px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <textarea
                rows={3}
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                placeholder={language === 'ar' ? 'توجيهات المدرب للاعب...' : 'Coach instructions for the athlete...'}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <button
                type="submit"
                disabled={sendingAssign || (assignSource === 'my' && programs.length === 0)}
                className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
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
