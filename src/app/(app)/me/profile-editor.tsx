'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { updateProfile, signOut } from '@/actions/auth';
import { Save, LogOut, Plus, X, User } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function ProfileEditor({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [gradYear, setGradYear] = useState(profile.grad_year ? profile.grad_year.toString() : '2027');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!skillInput.trim()) return;

    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await updateProfile({
        full_name: fullName.trim(),
        grad_year: gradYear ? parseInt(gradYear, 10) : null,
        skills,
        avatar_url: avatarUrl.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({});
      router.push('/login');
    });
  };

  return (
    <Card>
      <form onSubmit={handleSave}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Profile updated successfully!
            </div>
          )}

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-14 w-14 rounded-full object-cover border border-slate-300"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white text-lg font-bold">
                {(fullName || profile.email).substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {profile.email}
                </span>
                <StatusBadge status={profile.role} className="text-3xs" />
              </div>
              <span className="text-xs text-slate-500">
                Registered on {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Graduation Year
              </label>
              <Input
                type="number"
                min="2020"
                max="2035"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Avatar Image URL (Optional)
            </label>
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Engineering Skills & Matchmaking Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                placeholder="Add skill (e.g. ROS2, KiCad, SolidWorks, FEA, Welding)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSkill}
                className="h-8 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400">No skills added yet.</span>
              ) : (
                skills.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="gap-1 text-xs py-0.5 pr-1 font-medium bg-white dark:bg-slate-800 border"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-red-500 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isPending}
            className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>

          <Button
            type="submit"
            disabled={isPending || !fullName.trim()}
            size="sm"
            className="font-semibold gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isPending ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
