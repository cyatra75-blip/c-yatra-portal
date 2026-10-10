import fs from 'fs';
import path from 'path';
import { createAdminClient } from './server';
import { Category, Portal } from '../types';
import { CategoryInput } from '../validations/category';
import { PortalInput } from '../validations/portal';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('placeholder') && anonKey && !anonKey.includes('placeholder'));
}

function assertSupabaseInProduction() {
  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
    throw new Error(
      'Supabase database is not configured in production. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
}

// Development local fallback store (Strictly disabled in production)
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function getDevLocalDB(): { categories: Category[]; portals: Portal[] } {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Local database store is strictly prohibited in production mode.');
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {}
  }

  return { categories: [], portals: [] };
}

function saveDevLocalDB(data: { categories: Category[]; portals: Portal[] }) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ==================== CATEGORIES SERVICE ====================

export async function getCategories(includeInactive = false): Promise<Category[]> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: categories, error } = await query;
    if (error) {
      console.error('Supabase getCategories error:', error.message);
      throw new Error(`Failed to load categories from Supabase: ${error.message}`);
    }

    // Portal count mapping
    const { data: portals, error: portalError } = await supabase.from('portals').select('category_id, is_active');
    if (portalError) {
      console.warn('Could not fetch portal counts:', portalError.message);
    }

    const countMap: Record<string, number> = {};
    portals?.forEach((p) => {
      if (includeInactive || p.is_active) {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      }
    });

    return (categories || []).map((cat) => ({
      ...cat,
      portal_count: countMap[cat.id] || 0,
    }));
  }

  // Development-only fallback
  const db = getDevLocalDB();
  const list = db.categories
    .filter((c) => includeInactive || c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  const portalCounts: Record<string, number> = {};
  db.portals.forEach((p) => {
    if (includeInactive || p.is_active) {
      portalCounts[p.category_id] = (portalCounts[p.category_id] || 0) + 1;
    }
  });

  return list.map((c) => ({
    ...c,
    portal_count: portalCounts[c.id] || 0,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
    if (error) {
      throw new Error(`Supabase error fetching category: ${error.message}`);
    }
    return data;
  }

  const db = getDevLocalDB();
  return db.categories.find((c) => c.id === id) || null;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  assertSupabaseInProduction();
  const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: input.name,
        slug,
        icon: input.icon,
        sort_order: input.sort_order,
        is_active: input.is_active,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error creating category: ${error.message}`);
    }
    return { ...data, portal_count: 0 };
  }

  const db = getDevLocalDB();
  const newCat: Category = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: input.name,
    slug,
    icon: input.icon,
    sort_order: input.sort_order,
    is_active: input.is_active,
    portal_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.categories.push(newCat);
  saveDevLocalDB(db);
  return newCat;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const updatePayload: Record<string, any> = { ...input, updated_at: new Date().toISOString() };
    if (input.name && !input.slug) {
      updatePayload.slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error updating category: ${error.message}`);
    }
    return data;
  }

  const db = getDevLocalDB();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Category not found');

  const updated: Category = {
    ...db.categories[index],
    ...input,
    slug: input.slug || (input.name ? input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : db.categories[index].slug),
    updated_at: new Date().toISOString(),
  };

  db.categories[index] = updated;
  saveDevLocalDB(db);
  return updated;
}

export async function deleteCategory(id: string, reassignToCategoryId?: string): Promise<{ success: boolean; deletedCount: number }> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    if (reassignToCategoryId) {
      const { error: reassError } = await supabase
        .from('portals')
        .update({ category_id: reassignToCategoryId })
        .eq('category_id', id);
      if (reassError) throw new Error(`Failed to reassign portals: ${reassError.message}`);
    }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      throw new Error(`Supabase error deleting category: ${error.message}`);
    }
    return { success: true, deletedCount: 1 };
  }

  const db = getDevLocalDB();
  const categoryIndex = db.categories.findIndex((c) => c.id === id);
  if (categoryIndex === -1) throw new Error('Category not found');

  if (reassignToCategoryId) {
    db.portals.forEach((p) => {
      if (p.category_id === id) {
        p.category_id = reassignToCategoryId;
        p.updated_at = new Date().toISOString();
      }
    });
  } else {
    db.portals = db.portals.filter((p) => p.category_id !== id);
  }

  db.categories.splice(categoryIndex, 1);
  saveDevLocalDB(db);
  return { success: true, deletedCount: 1 };
}

// ==================== PORTALS SERVICE ====================

export async function getPortals(options?: {
  categoryId?: string;
  search?: string;
  includeInactive?: boolean;
}): Promise<Portal[]> {
  assertSupabaseInProduction();
  const { categoryId, search, includeInactive = false } = options || {};

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    let query = supabase
      .from('portals')
      .select('*, category:categories(*)')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Supabase error fetching portals: ${error.message}`);
    }
    return data || [];
  }

  const db = getDevLocalDB();
  const catMap = new Map(db.categories.map((c) => [c.id, c]));

  let list = db.portals.filter((p) => {
    if (!includeInactive && !p.is_active) return false;
    if (categoryId && p.category_id !== categoryId) return false;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  list.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  return list.map((p) => ({
    ...p,
    category: catMap.get(p.category_id),
  }));
}

export async function getPortalById(id: string): Promise<Portal | null> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('portals')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw new Error(`Supabase error fetching portal: ${error.message}`);
    }
    return data;
  }

  const db = getDevLocalDB();
  const portal = db.portals.find((p) => p.id === id);
  if (!portal) return null;
  const category = db.categories.find((c) => c.id === portal.category_id);
  return { ...portal, category };
}

export async function createPortal(input: PortalInput): Promise<Portal> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('portals')
      .insert({
        category_id: input.category_id,
        name: input.name,
        website_url: input.website_url,
        logo_url: input.logo_url || null,
        description: input.description || null,
        internal_notes: input.internal_notes || null,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) {
      throw new Error(`Supabase error creating portal: ${error.message}`);
    }
    return data;
  }

  const db = getDevLocalDB();
  const newPortal: Portal = {
    id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    category_id: input.category_id,
    name: input.name,
    website_url: input.website_url,
    logo_url: input.logo_url || null,
    description: input.description || null,
    internal_notes: input.internal_notes || null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.portals.push(newPortal);
  saveDevLocalDB(db);

  const category = db.categories.find((c) => c.id === newPortal.category_id);
  return { ...newPortal, category };
}

export async function updatePortal(id: string, input: Partial<PortalInput>): Promise<Portal> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('portals')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      throw new Error(`Supabase error updating portal: ${error.message}`);
    }
    return data;
  }

  const db = getDevLocalDB();
  const index = db.portals.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Portal not found');

  const updated: Portal = {
    ...db.portals[index],
    ...input,
    updated_at: new Date().toISOString(),
  };

  db.portals[index] = updated;
  saveDevLocalDB(db);

  const category = db.categories.find((c) => c.id === updated.category_id);
  return { ...updated, category };
}

export async function deletePortal(id: string): Promise<{ success: boolean }> {
  assertSupabaseInProduction();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { error } = await supabase.from('portals').delete().eq('id', id);
    if (error) {
      throw new Error(`Supabase error deleting portal: ${error.message}`);
    }
    return { success: true };
  }

  const db = getDevLocalDB();
  const index = db.portals.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Portal not found');

  db.portals.splice(index, 1);
  saveDevLocalDB(db);
  return { success: true };
}
