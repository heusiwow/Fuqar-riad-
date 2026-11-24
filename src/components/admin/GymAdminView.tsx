import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Flag, Plus, Shield, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  reviewExerciseFlag,
  saveGymOrganization,
  saveOrganizationMember,
  subscribeExerciseFlags,
  subscribeGymOrganizations,
  subscribeOrganizationMembers,
} from '../../services/firestoreService';
import {
  ExerciseFlag,
  GymOrganization,
  Language,
  OrganizationMember,
  UserRole,
} from '../../types/ironlog';

export const GymAdminView: React.FC = () => {
  const { firebaseUser, isAdmin, language, t, showToast } = useApp();

  const [orgs, setOrgs] = useState<GymOrganization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [flags, setFlags] = useState<ExerciseFlag[]>([]);

  // Org settings draft
  const [orgName, setOrgName] = useState('APEX Performance Club');
  const [orgLang, setOrgLang] = useState<Language>('en');
  const [allowSelfProgram, setAllowSelfProgram] = useState(true);
  const [requireYouthApproval, setRequireYouthApproval] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);

  // Add member form
  const [memUid, setMemUid] = useState('');
  const [memName, setMemName] = useState('');
  const [memRole, setMemRole] = useState<UserRole>('coach');
  const [savingMember, setSavingMember] = useState(false);

  useEffect(() => {
    if (!firebaseUser || !isAdmin) return;
    const unsubOrgs = subscribeGymOrganizations(firebaseUser.uid, (list) => {
      setOrgs(list);
      if (list[0]) {
        setOrgName(list[0].name);
        setOrgLang(list[0].defaultLanguage);
        setAllowSelfProgram(list[0].allowAthleteSelfProgram);
        setRequireYouthApproval(list[0].requireCoachApprovalForYouth);
      }
    });
    const unsubFlags = subscribeExerciseFlags(true, firebaseUser.uid, setFlags);
    return () => {
      unsubOrgs();
      unsubFlags();
    };
  }, [firebaseUser, isAdmin]);

  const activeOrg = orgs[0] ?? null;

  useEffect(() => {
    if (!activeOrg || !isAdmin) return;
    return subscribeOrganizationMembers(activeOrg.id, setMembers);
  }, [activeOrg?.id, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="py-16 text-center bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <Shield className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <p className="text-sm text-neutral-500">
          {language === 'ar'
            ? 'صلاحية مدير النادي غير متاحة لهذا الحساب.'
            : 'Gym Admin console requires administrator privileges.'}
        </p>
      </div>
    );
  }

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setSavingOrg(true);
    try {
      const orgId = activeOrg ? activeOrg.id : `org-${firebaseUser.uid.slice(0, 12)}`;
      await saveGymOrganization(
        {
          id: orgId,
          name: orgName.trim() || 'APEX Performance Club',
          ownerUid: firebaseUser.uid,
          defaultLanguage: orgLang,
          allowAthleteSelfProgram: allowSelfProgram,
          requireCoachApprovalForYouth: requireYouthApproval,
        },
        Boolean(activeOrg)
      );
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !memUid.trim() || !memName.trim()) return;
    setSavingMember(true);
    try {
      await saveOrganizationMember(
        {
          uid: memUid.trim(),
          organizationId: activeOrg.id,
          displayName: memName.trim(),
          role: memRole,
          status: 'active',
        },
        members.some((m) => m.uid === memUid.trim())
      );
      setMemUid('');
      setMemName('');
      showToast(t.common.savedSuccess);
    } catch {
      showToast(t.common.errorGeneric, 'error');
    } finally {
      setSavingMember(false);
    }
  };

  const handleMarkReviewed = async (flagId: string) => {
    await reviewExerciseFlag(flagId);
    showToast(t.common.savedSuccess);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500" />
          {t.apex.adminTitle}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {language === 'ar'
            ? 'إدارة سياسات النادي، صلاحيات المدربين، ومراجعة بلاغات دقة التمارين.'
            : 'Manage gym policies, coach/member roles, and exercise accuracy reports.'}
        </p>
      </div>

      {/* Organization Settings */}
      <form
        onSubmit={handleSaveOrg}
        className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-base font-bold">{t.apex.orgSettingsTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">
              {language === 'ar' ? 'اسم النادي / المؤسسة' : 'Club / Organization Name'}
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">{t.profile.language}</label>
            <select
              value={orgLang}
              onChange={(e) => setOrgLang(e.target.value as Language)}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-sm"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs cursor-pointer">
            <span>
              {language === 'ar'
                ? 'السماح للرياضيين بإنشاء برامجهم الخاصة'
                : 'Allow athletes to self-build programs'}
            </span>
            <input
              type="checkbox"
              checked={allowSelfProgram}
              onChange={(e) => setAllowSelfProgram(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>
          <label className="p-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs cursor-pointer">
            <span>
              {language === 'ar'
                ? 'اشتراط إشراف مدرب لفئة الناشئين'
                : 'Require coach oversight for youth profiles'}
            </span>
            <input
              type="checkbox"
              checked={requireYouthApproval}
              onChange={(e) => setRequireYouthApproval(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={savingOrg}
          className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
        >
          {savingOrg ? t.common.loading : t.common.save}
        </button>
      </form>

      {/* Organization Members */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-500" />
          {t.apex.memberRolesTitle}
        </h2>
        {!activeOrg ? (
          <p className="text-xs text-neutral-500">
            {language === 'ar'
              ? 'احفظ إعدادات المؤسسة أعلاه أولاً لإدارة الأعضاء.'
              : 'Save your organization settings above first to register members.'}
          </p>
        ) : (
          <>
            <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                required
                value={memUid}
                onChange={(e) => setMemUid(e.target.value)}
                placeholder={language === 'ar' ? 'معرّف العضو (UID)' : 'Member UID'}
                className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 font-mono text-xs"
              />
              <input
                type="text"
                required
                value={memName}
                onChange={(e) => setMemName(e.target.value)}
                placeholder={t.profile.displayName}
                className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              />
              <select
                value={memRole}
                onChange={(e) => setMemRole(e.target.value as UserRole)}
                className="min-h-[40px] px-3 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                <option value="coach">{t.apex.roleCoach}</option>
                <option value="athlete">{t.apex.roleAthlete}</option>
                <option value="gym_admin">{t.apex.roleAdmin}</option>
              </select>
              <button
                type="submit"
                disabled={savingMember}
                className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.common.add}
              </button>
            </form>

            {members.length > 0 && (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {members.map((m) => (
                  <div key={m.uid} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <strong className="text-sm">{m.displayName}</strong>
                      <span className="font-mono text-neutral-500 ms-2">{m.uid}</span>
                    </div>
                    <span className="font-semibold text-emerald-500 uppercase">
                      {m.role === 'coach'
                        ? t.apex.roleCoach
                        : m.role === 'gym_admin'
                          ? t.apex.roleAdmin
                          : t.apex.roleAthlete}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Flagged Exercise Accuracy Reports */}
      <section className="bg-white dark:bg-[#121417] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-500" />
          {t.apex.flaggedContentTitle} ({flags.length})
        </h2>
        {flags.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">{t.common.noResults}</p>
        ) : (
          <div className="space-y-2.5">
            {flags.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#090A0B] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">{f.exerciseName}</strong>
                    <span
                      className={`font-semibold ${
                        f.status === 'reviewed' ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      ·{' '}
                      {f.status === 'reviewed'
                        ? language === 'ar'
                          ? 'تمت المراجعة'
                          : 'Reviewed'
                        : language === 'ar'
                          ? 'مفتوح'
                          : 'Open'}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300">{f.reason}</p>
                  <p className="text-neutral-400">{f.userName}</p>
                </div>
                {f.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(f.id)}
                    className="min-h-[36px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'تمت المراجعة' : 'Mark Reviewed'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
