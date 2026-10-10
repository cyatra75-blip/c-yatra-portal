import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updatePortal, deletePortal, getPortalById } from '@/lib/supabase/service';
import { portalSchema } from '@/lib/validations/portal';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing portal ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = portalSchema.partial().safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const updated = await updatePortal(id, result.data);
    return NextResponse.json({ success: true, portal: updated });
  } catch (error: any) {
    console.error('Error updating portal:', error);
    return NextResponse.json({ error: error.message || 'Failed to update portal' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
  }

  const { id } = params;

  try {
    const existing = await getPortalById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    await deletePortal(id);
    return NextResponse.json({ success: true, message: 'Portal deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting portal:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete portal' }, { status: 500 });
  }
}
