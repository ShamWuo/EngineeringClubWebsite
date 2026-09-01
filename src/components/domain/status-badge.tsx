import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string | null | undefined;
  type?: 'request' | 'comp' | 'workshop' | 'funding' | 'role' | 'tier';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  switch (normalized) {
    // Approved / Active / Success states
    case 'approved':
    case 'active':
      return <Badge variant="success" className={className}>Active / Approved</Badge>;

    // In-progress / Scheduled / Info states
    case 'scheduled':
      return <Badge variant="info" className={className}>Scheduled</Badge>;
    case 'planned':
      return <Badge variant="info" className={className}>Planned</Badge>;
    case 'partially_approved':
      return <Badge variant="info" className={className}>Partially Approved</Badge>;

    // Pending / Review / Warning states
    case 'pending':
      return <Badge variant="warning" className={className}>Pending Review</Badge>;
    case 'changes_requested':
      return <Badge variant="warning" className={className}>Changes Requested</Badge>;
    case 'proposed':
    case 'idea':
      return <Badge variant="warning" className={className}>Proposed Idea</Badge>;

    // Rejected / Cancelled / Destructive states
    case 'rejected':
      return <Badge variant="destructive" className={className}>Rejected</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className={className}>Cancelled</Badge>;

    // Completed / Reimbursed / Secondary states
    case 'completed':
      return <Badge variant="secondary" className={className}>Completed</Badge>;
    case 'reimbursed':
      return <Badge variant="purple" className={className}>Reimbursed</Badge>;
    case 'withdrawn':
      return <Badge variant="secondary" className={className}>Withdrawn</Badge>;

    // User Roles
    case 'admin':
      return <Badge variant="destructive" className={className}>Admin</Badge>;
    case 'officer':
      return <Badge variant="default" className={className}>Officer</Badge>;
    case 'member':
      return <Badge variant="secondary" className={className}>Member</Badge>;
    case 'lead':
      return <Badge variant="purple" className={className}>Team Lead</Badge>;

    // Link Tiers
    case 'primary':
      return <Badge variant="default" className={className}>Tier 1 Primary</Badge>;
    case 'secondary':
      return <Badge variant="info" className={className}>Tier 2 Secondary</Badge>;
    case 'resource':
      return <Badge variant="outline" className={className}>Tier 3 Resource</Badge>;

    default:
      return <Badge variant="outline" className={className}>{status}</Badge>;
  }
}
