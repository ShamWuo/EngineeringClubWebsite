import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/auth/callback/route';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'test@bvsd.org',
            user_metadata: { full_name: 'Test Engineer' },
          },
        },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '11111111-1111-1111-1111-111111111111',
          role: 'member',
          onboarding_completed: true,
        },
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

describe('Auth Callback Redirection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /dashboard when next param is "/" (prevent landing page loop)', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=mock_code&next=/');
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toBe('http://localhost:3000/dashboard');
  });

  it('redirects to /dashboard when next param is omitted', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=mock_code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toBe('http://localhost:3000/dashboard');
  });

  it('redirects to /dashboard when next param is an open redirect attack', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=mock_code&next=https://attacker.com');
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toBe('http://localhost:3000/dashboard');
  });

  it('redirects to /dashboard when next param is protocol-relative //', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=mock_code&next=//attacker.com');
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toBe('http://localhost:3000/dashboard');
  });

  it('preserves legitimate internal deep links (e.g. /projects)', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=mock_code&next=/projects');
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toBe('http://localhost:3000/projects');
  });

  it('redirects to login with error message if OAuth provider returns an error', async () => {
    const request = new Request('http://localhost:3000/auth/callback?error=access_denied&error_description=User%20cancelled');
    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login?error=');
  });
});
