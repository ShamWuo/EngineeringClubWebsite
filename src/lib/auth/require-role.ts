import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, type AuthUser } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/db/types';

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || !user.is_active) {
    redirect('/login');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    // Return 404 to avoid leaking internal officer/admin surface
    notFound();
  }

  return user;
}

export function isOfficerOrAdmin(role: UserRole): boolean {
  return role === 'officer' || role === 'admin';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}
