'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/domain/status-badge';
import { upsertWorkshop, markAttendance } from '@/actions/workshops';
import { Plus, Edit, UserCheck, X, Save, CheckCircle2 } from 'lucide-react';
import type { Database, WorkshopStatus } from '@/lib/db/types';

type WorkshopRow = Database['public']['Tables']['workshops']['Row'];
type RsvpRow = Database['public']['Tables']['workshop_rsvps']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function WorkshopManager({
  workshops,
  rsvps,
  profiles,
}: {
  workshops: WorkshopRow[];
  rsvps: RsvpRow[];
  profiles: ProfileRow[];
}) {
  const [editingWorkshop, setEditingWorkshop] = useState<Partial<WorkshopRow> | null>(null);
  const [attendanceWorkshop, setAttendanceWorkshop] = useState<WorkshopRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStartCreate = () => {
    setEditingWorkshop({
      id: undefined,
      slug: '',
      title: '',
      description: '',
      instructor_name: '',
      status: 'scheduled',
      location: 'Makerspace Lab 204',
      capacity: 25,
      skill_level: 'All Levels',
      materials_url: '',
      recording_url: '',
    });
    setAttendanceWorkshop(null);
    setError(null);
  };

  const handleStartEdit = (w: WorkshopRow) => {
    setEditingWorkshop({ ...w });
    setAttendanceWorkshop(null);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop || !editingWorkshop.title || !editingWorkshop.slug) return;

    setError(null);
    startTransition(async () => {
      const res = await upsertWorkshop({
        id: editingWorkshop.id,
        slug: editingWorkshop.slug!,
        title: editingWorkshop.title!,
        description: editingWorkshop.description || null,
        instructor_name: editingWorkshop.instructor_name || null,
        status: (editingWorkshop.status as WorkshopStatus) || 'scheduled',
        starts_at: editingWorkshop.starts_at || null,
        ends_at: editingWorkshop.ends_at || null,
        location: editingWorkshop.location || null,
        capacity: editingWorkshop.capacity || null,
        skill_level: editingWorkshop.skill_level || null,
        materials_url: editingWorkshop.materials_url || null,
        recording_url: editingWorkshop.recording_url || null,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setEditingWorkshop(null);
      }
    });
  };

  const handleToggleAttendance = (userId: string, currentAttended: boolean) => {
    if (!attendanceWorkshop) return;
    startTransition(async () => {
      await markAttendance({
        workshop_id: attendanceWorkshop.id,
        user_id: userId,
        attended: !currentAttended,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleStartCreate} size="sm" className="font-semibold gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          Schedule New Workshop
        </Button>
      </div>

      {editingWorkshop && (
        <Card className="border-brand-300 dark:border-brand-800 shadow-md">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingWorkshop.id ? 'Edit Workshop' : 'Schedule Workshop'}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingWorkshop(null)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <Input
                    required
                    value={editingWorkshop.title || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug (URL Key) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. solidworks-advanced-surfacing"
                    value={editingWorkshop.slug || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <Select
                    value={editingWorkshop.status || 'scheduled'}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, status: e.target.value as WorkshopStatus })}
                  >
                    <option value="proposed">Proposed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor Name
                  </label>
                  <Input
                    value={editingWorkshop.instructor_name || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, instructor_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <Input
                    value={editingWorkshop.location || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Materials Download URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/..."
                    value={editingWorkshop.materials_url || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, materials_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recording URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={editingWorkshop.recording_url || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, recording_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingWorkshop(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending} className="gap-1 font-semibold">
                  <Save className="h-4 w-4" />
                  {isPending ? 'Saving...' : 'Save Workshop'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Attendance Marking Modal */}
      {attendanceWorkshop && (
        <Card className="border-purple-300 dark:border-purple-800 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                Attendance Verification: {attendanceWorkshop.title}
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAttendanceWorkshop(null)}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rsvps
                .filter((r) => r.workshop_id === attendanceWorkshop.id)
                .map((r) => {
                  const p = profiles.find((prof) => prof.id === r.user_id);
                  return (
                    <div
                      key={r.user_id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {p?.full_name || p?.email}
                        </div>
                        <div className="text-3xs text-slate-400">{p?.email}</div>
                      </div>

                      <Button
                        size="sm"
                        variant={r.attended ? 'default' : 'outline'}
                        onClick={() => handleToggleAttendance(r.user_id, r.attended)}
                        disabled={isPending}
                        className={`h-7 text-2xs gap-1 font-bold ${
                          r.attended ? 'bg-emerald-600 text-white' : ''
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{r.attended ? 'Attended' : 'Mark Present'}</span>
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workshops List Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b text-2xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Workshop</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Instructor</th>
              <th className="py-3 px-4">RSVPs</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {workshops.map((w) => {
              const rsvpList = rsvps.filter((r) => r.workshop_id === w.id);

              return (
                <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {w.title}
                    <div className="text-3xs font-mono text-slate-400">/{w.slug}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={w.status} className="text-3xs" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">{w.instructor_name || 'N/A'}</td>
                  <td className="py-3 px-4 font-semibold">{rsvpList.length}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAttendanceWorkshop(w)}
                      className="h-7 text-xs gap-1"
                    >
                      <UserCheck className="h-3 w-3" /> Attendance
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(w)}
                      className="h-7 text-xs gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
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
