'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { completeOnboarding } from '@/actions/auth';
import {
  Cpu,
  User,
  Wrench,
  Compass,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  Flame,
  Layers,
  Zap,
  Bot,
  Hammer,
  Code2,
  Wind,
} from 'lucide-react';

const DISCIPLINES = [
  { id: 'CAD & 3D Modeling', icon: Layers, desc: 'SolidWorks, Onshape, parametric drafting' },
  { id: '3D Printing & Additive', icon: Zap, desc: 'Bambu Lab X1C, resin SLA, Cura/OrcaSlicer' },
  { id: 'Electronics & PCB Design', icon: Cpu, desc: 'KiCAD, circuit routing, precision soldering' },
  { id: 'Microcontrollers & Embedded', icon: Flame, desc: 'ESP32, Arduino, STM32, embedded C/C++' },
  { id: 'Robotics & Automation', icon: Bot, desc: 'FRC/FTC chassis, motor PID loops, sensors' },
  { id: 'CNC Machining & Metalwork', icon: Hammer, desc: 'Tormach mill, lathe, waterjet, fabrication' },
  { id: 'Software, AI & Web', icon: Code2, desc: 'Python, Next.js, computer vision, ROS2' },
  { id: 'Aerodynamics & FEA Sim', icon: Wind, desc: 'Airfoils, CFD simulation, structural FEA' },
];

const SQUADS = [
  {
    id: 'FIRST Robotics Competition (FRC)',
    name: 'FIRST Robotics (FRC 2027)',
    tagline: '125-lb industrial swerve drive robot & vision targeting',
    season: '2026-27 Active',
    badgeClass: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-900/60',
  },
  {
    id: 'NASA Human Exploration Rover',
    name: 'NASA Lunar Rover Challenge',
    tagline: 'Collapsible lunar terrain chassis & scientific sampling',
    season: 'NASA Marshall MSFC',
    badgeClass: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-900/60',
  },
  {
    id: 'American Rocketry Challenge (TARC)',
    name: 'American Rocketry Challenge',
    tagline: 'Dual-stage aerodynamic model rockets & egg payload recovery',
    season: '2026-27 Season',
    badgeClass: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-900/60',
  },
  {
    id: 'National Solar Car Challenge',
    name: 'National Solar Car Challenge',
    tagline: 'Roadworthy solar-electric endurance vehicle & MPPT array',
    season: 'Texas Motor Speedway',
    badgeClass: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-900/60',
  },
];

const GRAD_YEARS = [
  { year: 2025, label: 'Class of 2025', role: 'Senior' },
  { year: 2026, label: 'Class of 2026', role: 'Junior' },
  { year: 2027, label: 'Class of 2027', role: 'Sophomore' },
  { year: 2028, label: 'Class of 2028', role: 'Freshman' },
  { year: 2029, label: 'Class of 2029', role: 'Incoming Student' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [gradYear, setGradYear] = useState<number>(2027);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['CAD & 3D Modeling', '3D Printing & Additive']);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedSquad, setSelectedSquad] = useState<string>('FIRST Robotics Competition (FRC)');
  const [safetyPledge, setSafetyPledge] = useState<boolean>(false);

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
    if (!safetyPledge) {
      setError('You must read and agree to the Room 604 makerspace safety guidelines.');
      return;
    }

    startTransition(async () => {
      const res = await completeOnboarding({
        full_name: fullName.trim() || 'Fairview Knight',
        grad_year: gradYear,
        skills: selectedSkills,
        subteam_interest: selectedSquad,
        safety_pledge: safetyPledge,
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-mono font-bold">
          <Sparkles className="h-3.5 w-3.5 text-red-600 dark:text-red-400 animate-pulse" />
          <span>FIRST-TIME MEMBER ORIENTATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Welcome to Fairview Engineering! 🚀
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Set up your engineering identity, select technical focus areas, and activate your Room 604 makerspace clearance.
        </p>

        {/* Stepper Dots & Progress */}
        <div className="pt-4 flex items-center justify-center gap-2 max-w-md mx-auto">
          {[
            { n: 1, title: 'Identity' },
            { n: 2, title: 'Disciplines' },
            { n: 3, title: 'Squads' },
            { n: 4, title: 'Safety' },
          ].map((item) => (
            <div key={item.n} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => !isSubmitted && setStep(item.n)}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 border ${
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
                <span className="hidden sm:inline">{item.title}</span>
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
              Orientation Complete! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your Fairview Engineering profile is active. Redirecting you to the member portal...
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
                      placeholder="e.g. Alex Vance"
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
                    placeholder="Add specialized skill (e.g. Anodizing, Python, STM32)..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="h-9 text-xs bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 rounded-xl"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 gap-1 text-xs border-zinc-200 dark:border-zinc-800 shrink-0"
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

            {/* STEP 3: Subteam & Squad Alignment */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Compass className="h-5 w-5 text-red-600 dark:text-red-500" />
                    Explore Active Engineering Squads
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Choose an initial squad interest. You can always cross-collaborate or switch teams after workshop trials.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SQUADS.map((squad) => {
                    const isSelected = selectedSquad === squad.id;

                    return (
                      <button
                        key={squad.id}
                        type="button"
                        onClick={() => setSelectedSquad(squad.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-red-600 bg-red-50/80 dark:bg-red-950/40 text-zinc-900 dark:text-white shadow-xs ring-1 ring-red-500/20'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-3xs font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${squad.badgeClass}`}>
                              {squad.season}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                            {squad.name}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {squad.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Makerspace Safety & Protocol */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-500" />
                    Room 604 Makerspace Safety Protocols
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Fairview High School operates professional fabrication tools. Every member must pledge to follow our safety norms.
                  </p>
                </div>

                <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950/80 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-start gap-3">
                    <span className="text-base">🥽</span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white block font-semibold">Eye Protection Mandatory</strong>
                      Approved ANSI Z87.1 safety glasses must be worn whenever anyone is operating power tools or machines in Room 604.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-base">👥</span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white block font-semibold">No Solo Machinery Operation</strong>
                      Never operate the Tormach CNC mill, metal lathe, or bandsaw without an adult advisor or certified officer present.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-base">🧹</span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white block font-semibold">10-Minute Bench Clean-up</strong>
                      Every workstation, 3D printer bed, and soldering iron must be tidied, cleaned, and shut off before leaving.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-base">📅</span>
                    <div>
                      <strong className="text-zinc-900 dark:text-white block font-semibold">Weekly Meeting Schedule</strong>
                      Official shop sessions take place every Tuesday & Thursday from 3:45 PM – 5:30 PM in Room 604.
                    </div>
                  </div>
                </div>

                {/* Safety Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={safetyPledge}
                    onChange={(e) => setSafetyPledge(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      I accept the Room 604 Safety Agreement
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      I agree to prioritize shop safety, wear eye protection, report machine anomalies, and adhere to Fairview High School lab rules.
                    </span>
                  </div>
                </label>
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

              {step < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 h-10 px-5 shadow-sm shadow-red-950/30 rounded-xl cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || !safetyPledge}
                  onClick={handleComplete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 h-10 px-6 shadow-md shadow-red-950/30 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  <span>{isPending ? 'Finalizing Profile...' : 'Complete Setup & Launch Portal 🚀'}</span>
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
