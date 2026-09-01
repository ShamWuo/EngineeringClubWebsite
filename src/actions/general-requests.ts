'use server';

import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { generalRequestSchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';

export const submitGeneralRequest = createAction(
  generalRequestSchema,
  { role: ['member', 'officer', 'admin'] },
  async (input, { user, db }) => {
    const now = new Date().toISOString();
    const requestId = crypto.randomUUID();

    try {
      const supabase = await createClient();
      const { error } = await supabase.from('general_requests').insert({
        id: requestId,
        requested_by: user.id,
        title: input.title,
        category: input.category,
        description: input.description,
        urgency: input.urgency,
        status: 'pending',
      });
      if (error) {
        console.warn('Supabase general request insert fallback to mock store:', error.message);
      }
    } catch (err) {
      console.warn('Supabase general request error:', err);
    }

    // In-memory sync
    db.general_requests.push({
      id: requestId,
      requested_by: user.id,
      title: input.title,
      category: input.category,
      description: input.description,
      urgency: input.urgency,
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_at: now,
      updated_at: now,
    });

    db.audit_log.push({
      id: db.audit_log.length + 1,
      actor_id: user.id,
      action: 'create_general_request',
      entity_type: 'general_requests',
      entity_id: requestId,
      diff: input,
      created_at: now,
    });

    safeRevalidatePath('/requests');
    safeRevalidatePath('/review');
    safeRevalidatePath('/dashboard');

    return { requestId };
  }
);
