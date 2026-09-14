const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.message ?? body?.error?.message ?? 'Something went wrong. Try again.';
    throw new ApiError(message, res.status);
  }

  return body?.data ?? body;
}

export const api = {
  register: (input: { fullName: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(input) }),

  verifyEmail: (input: { email: string; code: string }) =>
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify(input) }),

  resendVerification: (input: { email: string }) =>
    request('/auth/resend-verification', { method: 'POST', body: JSON.stringify(input) }),

  login: (input: { email: string; password: string }) =>
    request<{
      status: 'verified' | 'requires_email_verification' | 'requires_2fa';
      email?: string;
      method?: 'email' | 'totp';
    }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),

  verifyLogin2fa: (input: { code: string }) =>
    request('/auth/login/2fa/verify', { method: 'POST', body: JSON.stringify(input) }),

  resendLogin2fa: () => request('/auth/login/2fa/resend', { method: 'POST' }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  logoutAll: () => request('/auth/logout-all', { method: 'POST' }),

  me: () => request('/auth/me'),

  sessions: () =>
    request<
      { id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; expiresAt: string }[]
    >('/auth/sessions'),

  twoFaStatus: () => request<{ enabled: boolean; method: 'email' | 'totp' | null }>('/auth/2fa/status'),

  totpSetup: () => request<{ secret: string; keyUri: string; qrCodeDataUrl: string }>('/auth/2fa/totp/setup', { method: 'POST' }),

  totpEnable: (input: { code: string }) =>
    request('/auth/2fa/totp/enable', { method: 'POST', body: JSON.stringify(input) }),

  emailTwoFaSetup: () => request('/auth/2fa/email/setup', { method: 'POST' }),

  emailTwoFaEnable: (input: { code: string }) =>
    request('/auth/2fa/email/enable', { method: 'POST', body: JSON.stringify(input) }),

  disable2fa: (input: { password?: string }) =>
    request('/auth/2fa/disable', { method: 'POST', body: JSON.stringify(input) }),

  // Not yet implemented on the backend — endpoints assumed pending
  // /auth/forgot-password and /auth/reset-password.
  forgotPassword: (input: { email: string }) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(input) }),

  resetPassword: (input: { token: string; password: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(input) }),
};
