import React from 'react';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { OnboardingFlow } from './onboarding-flow';

export default async function OnboardingPage() {
  const user = await requireUser();

  // If onboarding is already completed and user is NOT an admin, redirect to dashboard
  if (user.onboarding_completed && user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <OnboardingFlow
      currentUser={user}
      isRedo={Boolean(user.onboarding_completed && user.role === 'admin')}
    />
  );
}
