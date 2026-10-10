export type UserRole = 'owner' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  portal_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Portal {
  id: string;
  category_id: string;
  name: string;
  website_url: string;
  logo_url: string | null;
  description: string | null;
  internal_notes: string | null;
  sort_order: number;
  is_active: boolean;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: UserRole;
    full_name?: string;
  } | null;
}
