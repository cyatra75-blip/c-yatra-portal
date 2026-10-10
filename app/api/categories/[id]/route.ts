import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateCategory, deleteCategory, getCategoryById } from '@/lib/supabase/service';
import { categorySchema } from '@/lib/validations/category';

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
    return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = categorySchema.partial().safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const updated = await updateCategory(id, result.data);
    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
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
  const { searchParams } = new URL(req.url);
  const reassignTo = searchParams.get('reassign_to') || undefined;

  try {
    const existing = await getCategoryById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await deleteCategory(id, reassignTo);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
