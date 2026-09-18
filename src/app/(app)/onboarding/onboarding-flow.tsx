'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { completeOnboarding } from '@/actions/auth';
import { signupForCompetition, cancelCompetitionSignup } from '@/actions/competitions';
import { getCompetitionDisciplines } from '@/lib/constants/competitions';
import { ImpactBadge } from '@/components/domain/impact-badge';
import type { AuthUser } from '@/lib/supabase/server';
import type { CompetitionRow, CompetitionSignupRow } from '@/lib/db/queries';
import {
  Cpu,
  User,
  Wrench,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  Rocket,
  Brain,
  Cog,
  Zap,
  Code2,
  Bot,
  Activity,
  Building2,
  Atom,
  ShieldAlert,
  Trophy,
  Search,
  ExternalLink,
} from 'lucide-react';

const DISCIPLINES = [
  { id: 'Aerospace Engineering', icon: Rocket, desc: 'Aerodynamics, rocketry, propulsion & flight dynamics' },
  { id: 'Computer Engineering', icon: Cpu, desc: 'Embedded systems, microprocessors, FPGA & digital logic' },
  { id: 'AI Engineering', icon: Brain, desc: 'Machine learning, neural networks, computer vision & LLMs' },
  { id: 'Mechanical Engineering', icon: Cog, desc: 'CAD design, kinematics, structural mechanics & thermodynamics' },
  { id: 'Electrical Engineering', icon: Zap, desc: 'Circuit analysis, PCB layout, power systems & RF sensing' },
  { id: 'Software Engineering', icon: Code2, desc: 'Full-stack applications, algorithms, cloud systems & ROS' },
  { id: 'Robotics & Mechatronics', icon: Bot, desc: 'Autonomous robotics, motion control, actuator systems & sensors' },
  { id: 'Biomedical Engineering', icon: Activity, desc: 'Medical devices, biomechanics, prosthetics & biosensors' },
  { id: 'Civil & Environmental Engineering', icon: Building2, desc: 'Structural design, sustainable energy & green infrastructure' },
  { id: 'Materials & Chemical Engineering', icon: Atom, desc: 'Advanced composites, metallurgy, polymers & synthesis' },
];

const VALID_DISCIPLINE_SET = new Set(DISCIPLINES.map((d) => d.id));

const LEGACY_INVALID_SKILLS = new Set([
  'CAD 3D Modeling',
  'CAD & 3D Modeling',
  '3D Printed and Additive',
  '3D Printing & Additive',
  'CAD',
  'Embedded Systems',
]);

const GRAD_YEARS = [
  { year: 2025, label: 'Class of 2025', role: 'Senior' },
  { year: 2026, label: 'Class of 2026', role: 'Junior' },
  { year: 2027, label: 'Class of 2027', role: 'Sophomore' },
  { year: 2028, label: 'Class of 2028', role: 'Freshman' },
  { year: 2029, label: 'Class of 2029', role: 'Incoming Student' },
];

export interface OnboardingFlowProps {
  currentUser: AuthUser;
  isRedo?: boolean;
  competitions?: CompetitionRow[];
  initialSignups?: CompetitionSignupRow[];
}

export function OnboardingFlow({
  currentUser,
  isRedo = false,
  competitions = [],
  initialSignups = [],
}: OnboardingFlowProps) {
  const [step, setStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State initialized with current user profile if available, filtering out non-existent legacy skills
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [gradYear, setGradYear] = useState<number>(currentUser.grad_year || 2027);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    if (!currentUser.skills || currentUser.skills.length === 0) {
      return [];
    }
    return currentUser.skills.filter(
      (s) => !LEGACY_INVALID_SKILLS.has(s) && (VALID_DISCIPLINE_SET.has(s) || s.trim().length > 0)
    );
  });
  const [customSkill, setCustomSkill] = useState('');

  // Step 3 Competitions State
  const [interestedCompIds, setInterestedCompIds] = useState<string[]>(() =>
    (initialSignups || []).map((s) => s.competition_id)
  );
  const [compSearch, setCompSearch] = useState('');
  const [activeDisciplineFilter, setActiveDisciplineFilter] = useState<string>('recommended');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const toggleInterest = (compId: string) => {
    const isInterested = interestedCompIds.includes(compId);
    if (isInterested) {
      setInterestedCompIds((prev) => prev.filter((id) => id !== compId));
      startTransition(async () => {
        try {
          await cancelCompetitionSignup({ competition_id: compId });
        } catch (err) {
          console.error('Cancel signup error:', err);
        }
      });
    } else {
      setInterestedCompIds((prev) => [...prev, compId]);
      startTransition(async () => {
        try {
          await signupForCompetition({
            competition_id: compId,
            note: 'Expressed interest during onboarding',
          });
        } catch (err) {
          console.error('Signup error:', err);
        }
      });
    }
  };

  const handleComplete = () => {
    setError(null);
    if (selectedSkills.length === 0) {
      setError('Please select at least one engineering discipline or interest.');
      setStep(2);
      return;
    }

    startTransition(async () => {
      const res = await completeOnboarding({
        full_name: fullName.trim() || currentUser.full_name || 'Fairview Knight',
        grad_year: gradYear,
        skills: selectedSkills,
        interested_competition_ids: interestedCompIds,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setIsSubmitted(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      }
    });
  };

  // Step 3: Compute recommendations and filtered competitions
  const filteredCompetitions = competitions.filter((comp) => {
    const compDisciplines = getCompetitionDisciplines(comp);

    // 1. Discipline facet filter
    if (activeDisciplineFilter === 'recommended') {
      if (selectedSkills.length > 0) {
        const hasMatch = compDisciplines.some((d) => selectedSkills.includes(d));
        if (!hasMatch) return false;
      }
    } else if (activeDisciplineFilter !== 'all') {
      if (!compDisciplines.includes(activeDisciplineFilter as any)) {
        return false;
      }
    }

    // 2. Search query filter
    if (compSearch.trim()) {
      const q = compSearch.trim().toLowerCase();
      const nameMatch = comp.name.toLowerCase().includes(q);
      const orgMatch = (comp.organizer || '').toLowerCase().includes(q);
      const descMatch = (comp.description || '').toLowerCase().includes(q);
      const discMatch = compDisciplines.some((d) => d.toLowerCase().includes(q));
      if (!nameMatch && !orgMatch && !descMatch && !discMatch) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-[85vh] py-8 px-4 max-w-3xl mx-auto space-y-8">
      {/* Top Banner & Stepper Indicator */}
      <div className="text-center space-y-3">
        {isRedo ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-bold">
            <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span>ADMINISTRATOR RE-ORIENTATION</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-bold">
            <Sparkles className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span>FIRST-TIME MEMBER ORIENTATION</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {isRedo ? 'Admin Review & Re-Orientation 🚀' : 'Welcome to Fairview Engineering! 🚀'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          {isRedo
            ? 'As a club administrator, you can run through orientation at any time to update your technical focus, explore competitions, and verify onboarding flows.'
            : 'Set up your engineering identity, select your technical disciplines, and explore upcoming competitions.'}
        </p>

        {isRedo && (
          <div className="pt-1">
            <Link
              href="/dashboard"
              className="text-2xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400 underline font-medium"
            >
              ← Cancel & return to Dashboard
            </Link>
          </div>
        )}

        {/* Stepper Dots & Progress */}
        <div className="pt-4 flex items-center justify-center gap-2 max-w-md mx-auto">
          {[
            { n: 1, title: 'Identity' },
            { n: 2, title: 'Disciplines' },
            { n: 3, title: 'Competitions' },
          ].map((item) => (
            <div key={item.n} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitted) {
                    if (item.n === 3 && selectedSkills.length === 0) {
                      setError('Please select at least one engineering discipline before viewing competitions.');
                      setStep(2);
                      return;
                    }
                    setError(null);
                    setStep(item.n);
                  }
                }}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  step === item.n
                    ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-950/30'
                    : step > item.n
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {step > item.n ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <span>0{item.n}</span>
                )}
                <span>{item.title}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-xl shadow-zinc-950/5 dark:shadow-red-950/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        {error && (
          <div className="m-6 mb-0 p-3.5 text-xs rounded-xl bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
              {isRedo ? 'Orientation Updated! 🎉' : 'Orientation Complete! 🎉'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your Fairview Engineering profile and technical focus have been updated. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: Personal Profile */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600 dark:text-red-500" />
                    Verify Your Student Profile
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tell us how you would like your name listed on project rosters and grant submissions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <Input
                      placeholder="e.g. Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 text-sm bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Graduation Year
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {GRAD_YEARS.map((g) => (
                        <button
                          key={g.year}
                          type="button"
                          onClick={() => setGradYear(g.year)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            gradYear === g.year
                              ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-zinc-900 dark:text-white shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{g.year}</span>
                            {gradYear === g.year && (
                              <CheckCircle2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <p className="text-3xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {g.role}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Technical Disciplines */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-red-600 dark:text-red-500" />
                    Select Your Engineering Disciplines
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pick what you know or what you are excited to learn. We pair junior members with senior squad leads.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DISCIPLINES.map((item) => {
                    const isSelected = selectedSkills.includes(item.id);
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSkill(item.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-red-600 bg-red-50/80 dark:bg-red-950/40 text-zinc-900 dark:text-white shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-500'
                              : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-200">
                              {item.id}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-3xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill adder */}
                <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add other engineering discipline (e.g. Nuclear, Systems, Bioengineering)..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="h-9 text-xs bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 rounded-xl"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 gap-1 text-xs border-zinc-200 dark:border-zinc-800 shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </form>

                {selectedSkills.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-3xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Selected Disciplines ({selectedSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-3xs py-1 px-2.5 gap-1 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-red-500"
                          onClick={() => toggleSkill(s)}
                        >
                          <span>{s}</span>
                          <span className="text-zinc-400 hover:text-red-600 font-bold ml-1">×</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Competitions & Express Interest */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-red-600 dark:text-red-500" />
                      Explore & Express Interest in Competitions
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Based on your chosen disciplines, we have recommended upcoming competitions. Express interest to let team captains and advisors know what you would like to work on!
                    </p>
                  </div>
                  {interestedCompIds.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{interestedCompIds.length} Selected</span>
                    </div>
                  )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search competitions, organizers, or keywords (e.g. NASA, rover, robotics, rocketry)..."
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                    className="pl-9 h-10 text-xs bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 rounded-xl"
                  />
                  {compSearch && (
                    <button
                      type="button"
                      onClick={() => setCompSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills based on User's Selected Disciplines */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveDisciplineFilter('recommended')}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                      activeDisciplineFilter === 'recommended'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>🌟 Recommended for You</span>
                  </button>

                  {selectedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setActiveDisciplineFilter(skill)}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer text-xs ${
                        activeDisciplineFilter === skill
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setActiveDisciplineFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer text-xs ${
                      activeDisciplineFilter === 'all'
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    All Competitions
                  </button>
                </div>

                {/* Competitions Cards List */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCompetitions.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                      <Trophy className="h-8 w-8 text-zinc-400 mx-auto" />
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        No competitions found
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        No competitions match your current search or filter. Try switching to "All Competitions" or clearing your search term.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCompSearch('');
                          setActiveDisciplineFilter('all');
                        }}
                        className="text-xs mt-2"
                      >
                        View All Competitions
                      </Button>
                    </div>
                  ) : (
                    filteredCompetitions.map((comp) => {
                      const isInterested = interestedCompIds.includes(comp.id);
                      const disciplines = getCompetitionDisciplines(comp);

                      return (
                        <div
                          key={comp.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isInterested
                              ? 'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <ImpactBadge level={comp.impact_level} className="text-3xs" />
                              {comp.season && (
                                <Badge variant="outline" className="text-3xs font-mono">
                                  {comp.season}
                                </Badge>
                              )}
                              {comp.external_url && (
                                <a
                                  href={comp.external_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-3xs text-zinc-400 hover:text-red-600 inline-flex items-center gap-0.5"
                                >
                                  <span>Site</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">
                                {comp.name}
                              </h4>
                              {comp.organizer && (
                                <p className="text-3xs font-medium text-zinc-500 dark:text-zinc-400">
                                  {comp.organizer}
                                </p>
                              )}
                            </div>

                            {comp.description && (
                              <p className="text-3xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {comp.description}
                              </p>
                            )}

                            {/* Discipline tags */}
                            {disciplines.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {disciplines.map((d) => {
                                  const isUserDiscipline = selectedSkills.includes(d);
                                  return (
                                    <span
                                      key={d}
                                      className={`text-3xs px-2 py-0.5 rounded-full font-medium ${
                                        isUserDiscipline
                                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold border border-red-200 dark:border-red-900/50'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-700/70'
                                      }`}
                                    >
                                      {isUserDiscipline && '✓ '}
                                      {d}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Express Interest Action Button */}
                          <div className="shrink-0 sm:self-center">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => toggleInterest(comp.id)}
                              className={`h-9 px-4 text-xs font-bold gap-1.5 transition-all cursor-pointer rounded-xl ${
                                isInterested
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400'
                              }`}
                            >
                              {isInterested ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Interested ✓</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  <span>Express Interest</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setStep(step - 1);
                  }}
                  className="text-xs gap-1 border-zinc-200 dark:border-zinc-800 h-10 px-4 rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setStep(2);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 h-10 px-5 shadow-sm shadow-red-950/30 rounded-xl cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : step === 2 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (selectedSkills.length === 0) {
                      setError('Please select at least one engineering discipline to continue.');
                      return;
                    }
                    setError(null);
                    setStep(3);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 h-10 px-5 shadow-sm shadow-red-950/30 rounded-xl cursor-pointer"
                >
                  <span>Continue to Competitions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || selectedSkills.length === 0}
                  onClick={handleComplete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 h-10 px-6 shadow-md shadow-red-950/30 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {isPending
                      ? 'Finalizing Profile...'
                      : isRedo
                      ? 'Save & Finalize Orientation 🚀'
                      : 'Complete Setup & Launch Portal 🚀'}
                  </span>
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
