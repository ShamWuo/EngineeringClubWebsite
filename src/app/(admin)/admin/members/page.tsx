import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { MemberRoleManager } from './member-role-manager';
import { Shield } from 'lucide-react';

export default async function AdminMembersPage() {
  const adminUser = await requireRole(['admin']);
  const db = getDb();
  const profiles = db.profiles;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-red-600" />
          Member Roles & Account Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Promote or demote member roles and manage soft account deactivations for graduated students.
        </p>
      </div>

      <MemberRoleManager profiles={profiles} currentAdminId={adminUser.id} />
    </div>
  );
}
