import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPortals, createPortal } from '@/lib/supabase/service';
import { portalSchema } from '@/lib/validations/portal';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id') || undefined;
  const search = searchParams.get('search') || undefined;
  const includeInactive = searchParams.get('include_inactive') === 'true';

  const canSeeInactive = session.role === 'admin' && includeInactive;

  try {
    const portals = await getPortals({
      categoryId,
      search,
      includeInactive: canSeeInactive,
    });
    return NextResponse.json({ portals });
  } catch (error: any) {
    console.error('Error fetching portals:', error);
    return NextResponse.json({ error: 'Failed to fetch portals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = portalSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const portal = await createPortal(result.data);
    return NextResponse.json({ success: true, portal }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating portal:', error);
    return NextResponse.json({ error: error.message || 'Failed to create portal' }, { status: 500 });
  }
}
