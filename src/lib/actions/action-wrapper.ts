import { z } from 'zod';
import { getCurrentUser, type AuthUser } from '@/lib/supabase/server';
import { getDb, type AppState } from '@/lib/db/mock-data';
import type { UserRole } from '@/lib/db/types';

export type ActionResponse<T = unknown> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export interface ActionContext {
  user: AuthUser;
  db: AppState;
}

export interface ActionOptions {
  role?: UserRole | UserRole[];
  requireAuth?: boolean;
}

export function createAction<Schema extends z.ZodTypeAny, ReturnData>(
  schema: Schema,
  options: ActionOptions = { requireAuth: true },
  handler: (
    input: z.infer<Schema>,
    ctx: ActionContext
  ) => Promise<ReturnData>
) {
  return async (rawInput: unknown): Promise<ActionResponse<ReturnData>> => {
    try {
      // 1. Authenticate user
      const user = await getCurrentUser();
      if (options.requireAuth !== false && !user) {
        return { ok: false, error: 'You must be signed in to perform this action.' };
      }

      if (user && !user.is_active) {
        return { ok: false, error: 'Your account is deactivated.' };
      }

      // 2. Validate role
      if (options.role && user) {
        const allowedRoles = Array.isArray(options.role) ? options.role : [options.role];
        if (!allowedRoles.includes(user.role)) {
          return { ok: false, error: 'Unauthorized: insufficient permissions.' };
        }
      }

      // 3. Validate Zod input
      const parsed = schema.safeParse(rawInput);
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const firstError = parsed.error.errors[0]?.message || 'Invalid form submission.';
        return {
          ok: false,
          error: firstError,
          fieldErrors,
        };
      }

      // 4. Execute action handler
      const db = getDb();
      const result = await handler(parsed.data, {
        user: user!,
        db,
      });

      return {
        ok: true,
        data: result,
      };
    } catch (err: unknown) {
      console.error('Server Action Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return {
        ok: false,
        error: errorMessage,
      };
    }
  };
}
