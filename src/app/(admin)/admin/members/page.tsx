import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getAdminProfiles } from '@/lib/db/queries';
import { MemberRoleManager } from './member-role-manager';
import { Shield } from 'lucide-react';

export default async function AdminMembersPage() {
  const adminUser = await requireRole(['admin']);
  const profiles = await getAdminProfiles();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-red-500" />
          Member Roles & Account Governance
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Promote or demote member roles and manage soft account deactivations for graduated students.
        </p>
      </div>

      <MemberRoleManager profiles={profiles} currentAdminId={adminUser.id} />
    </div>
  );
}
