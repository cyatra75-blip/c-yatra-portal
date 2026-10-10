import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth';

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  portalType: z.enum(['owner', 'admin']).default('owner'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email and password.' },
        { status: 400 }
      );
    }

    const { email, password, portalType } = result.data;
    const authResult = await authenticate(email, password, portalType);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user?.id,
        email: authResult.user?.email,
        role: authResult.user?.role,
        full_name: authResult.user?.full_name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
