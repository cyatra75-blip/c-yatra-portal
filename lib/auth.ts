import { cookies } from 'next/headers';
import crypto from 'crypto';
import { UserRole } from './types';
import { createClient as createSupabaseServerClient, createAdminClient } from './supabase/server';

const SESSION_COOKIE_NAME = 'cyatra_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'c-yatra-secure-session-secret-key-32chars';

export interface SessionData {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: number;
}

function signSession(data: SessionData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString('base64');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(base64).digest('hex');
  return `${base64}.${hmac}`;
}

function verifySession(token: string): SessionData | null {
  try {
    const [base64, hmac] = token.split('.');
    if (!base64 || !hmac) return null;
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(base64).digest('hex');
    if (hmac !== expectedHmac) return null;
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const data = JSON.parse(json) as SessionData;
    // 7 days expiration
    if (Date.now() - data.created_at > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(user: { id: string; email: string; role: UserRole; full_name?: string }) {
  const cookieStore = cookies();
  const sessionData: SessionData = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name || (user.role === 'owner' ? 'C-Yatra Owner' : 'Administrator'),
    created_at: Date.now(),
  };

  const token = signSession(sessionData);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('placeholder') && anonKey && !anonKey.includes('placeholder'));
}

export async function authenticate(
  email: string,
  password: string,
  portalType: 'owner' | 'admin'
): Promise<{ success: boolean; user?: SessionData; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Supabase Auth: Primary & Production Authentication
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError || !authData.user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      // Check role in profiles table
      const adminClient = createAdminClient();
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found. Please contact administrator.' };
      }

      const userRole = profile.role as UserRole;

      if (portalType === 'admin' && userRole !== 'admin') {
        return { success: false, error: 'Access denied. You do not have administrator privileges.' };
      }

      if (portalType === 'owner' && userRole !== 'owner' && userRole !== 'admin') {
        return { success: false, error: 'Access denied. You do not have owner portal access.' };
      }

      const session: SessionData = {
        id: authData.user.id,
        email: cleanEmail,
        role: userRole,
        full_name: profile.full_name || (userRole === 'owner' ? 'C-Yatra Owner' : 'Administrator'),
        created_at: Date.now(),
      };

      await setSessionCookie(session);
      return { success: true, user: session };
    } catch (e: any) {
      if (process.env.NODE_ENV === 'production') {
        return { success: false, error: 'Authentication service unavailable. Please check database connection.' };
      }
      console.warn('Supabase auth error in development mode:', e.message);
    }
  }

  // In production, reject if Supabase is not configured. Never allow fallback in production!
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Supabase authentication is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    };
  }

  // 2. Local development fallback ONLY (configured strictly via environment variables, never hardcoded passwords)
  const devOwnerEmail = process.env.INITIAL_OWNER_EMAIL?.trim().toLowerCase();
  const devOwnerPassword = process.env.INITIAL_OWNER_PASSWORD;
  const devAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const devAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (devOwnerEmail && devOwnerPassword && cleanEmail === devOwnerEmail && password === devOwnerPassword) {
    if (portalType === 'admin') {
      return { success: false, error: 'Access denied. This portal is for administrator accounts only.' };
    }
    const session: SessionData = {
      id: 'u-dev-owner',
      email: cleanEmail,
      role: 'owner',
      full_name: 'C-Yatra Owner',
      created_at: Date.now(),
    };
    await setSessionCookie(session);
    return { success: true, user: session };
  }

  if (devAdminEmail && devAdminPassword && cleanEmail === devAdminEmail && password === devAdminPassword) {
    const session: SessionData = {
      id: 'u-dev-admin',
      email: cleanEmail,
      role: 'admin',
      full_name: 'System Administrator',
      created_at: Date.now(),
    };
    await setSessionCookie(session);
    return { success: true, user: session };
  }

  return { success: false, error: 'Invalid email or password.' };
}
