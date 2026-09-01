'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/domain/status-badge';
import { updateMemberRole } from '@/actions/admin';
import { Shield, User, CheckCircle2 } from 'lucide-react';
import type { Database, UserRole } from '@/lib/db/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function MemberRoleManager({
  profiles,
  currentAdminId,
}: {
  profiles: ProfileRow[];
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole, isActive: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateMemberRole({
        user_id: userId,
        role: newRole,
        is_active: isActive,
      });

      if (!res.ok) {
        alert(res.error);
      } else {
        setMessage(`Updated role for ${res.data.profile.email} to ${newRole}.`);
      }
    });
  };

  const handleToggleActive = (userId: string, currentRole: UserRole, currentActive: boolean) => {
    if (userId === currentAdminId) {
      alert('You cannot deactivate your own admin account.');
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await updateMemberRole({
        user_id: userId,
        role: currentRole,
        is_active: !currentActive,
      });

      if (!res.ok) {
        alert(res.error);
      } else {
        setMessage(`Account status updated for ${res.data.profile.email}.`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b text-2xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Grad Year</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Account State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {profiles.map((p) => {
              const isSelf = p.id === currentAdminId;

              return (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {p.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt="Avatar"
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-3xs">
                          {(p.full_name || p.email).substring(0, 1)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {p.full_name || p.email}
                          {isSelf && (
                            <span className="text-3xs text-brand-600 font-normal ml-1.5">(You)</span>
                          )}
                        </div>
                        <div className="text-3xs text-slate-400">{p.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {p.grad_year || 'N/A'}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={p.role}
                      onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole, p.is_active)}
                      disabled={isPending || (isSelf && p.role === 'admin')}
                      className="text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 focus:outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={p.role} className="text-3xs" />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant={p.is_active ? 'outline' : 'default'}
                      onClick={() => handleToggleActive(p.id, p.role, p.is_active)}
                      disabled={isPending || isSelf}
                      className={`h-7 text-2xs ${
                        p.is_active
                          ? 'text-slate-700 hover:text-red-600 hover:bg-red-50'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {p.is_active ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
