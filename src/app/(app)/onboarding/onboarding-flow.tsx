'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { completeOnboarding } from '@/actions/auth';
import type { AuthUser } from '@/lib/supabase/server';
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
}

export function OnboardingFlow({ currentUser, isRedo = false }: OnboardingFlowProps) {
  const [step, setStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State initialized with current user profile if available
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [gradYear, setGradYear] = useState<number>(currentUser.grad_year || 2027);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser.skills && currentUser.skills.length > 0
      ? currentUser.skills
      : ['Aerospace Engineering', 'Computer Engineering']
  );
  const [customSkill, setCustomSkill] = useState('');

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

  const handleComplete = () => {
    setError(null);
    if (selectedSkills.length === 0) {
      setError('Please select at least one engineering discipline or interest.');
      return;
    }

    startTransition(async () => {
      const res = await completeOnboarding({
        full_name: fullName.trim() || currentUser.full_name || 'Fairview Knight',
        grad_year: gradYear,
        skills: selectedSkills,
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
            ? 'As a club administrator, you can run through orientation at any time to update your technical focus and verify onboarding flows.'
            : 'Set up your engineering identity and select your technical focus areas.'}
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
        <div className="pt-4 flex items-center justify-center gap-2 max-w-xs mx-auto">
          {[
            { n: 1, title: 'Identity' },
            { n: 2, title: 'Disciplines' },
          ].map((item) => (
            <div key={item.n} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => !isSubmitted && setStep(item.n)}
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

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSkills.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-3xs py-1 px-2.5 gap-1 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                      onClick={() => toggleSkill(s)}
                    >
                      <span>{s}</span>
                      <span className="text-zinc-400 hover:text-red-600 font-bold ml-1">×</span>
                    </Badge>
                  ))}
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
                  onClick={() => setStep(step - 1)}
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
                  onClick={() => setStep(2)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 h-10 px-5 shadow-sm shadow-red-950/30 rounded-xl cursor-pointer"
                >
                  <span>Continue</span>
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
