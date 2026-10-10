import { z } from 'zod';

const safeUrlSchema = z.string().trim().min(1, 'Website URL is required').refine((val) => {
  try {
    const url = new URL(val);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'Must be a valid HTTP or HTTPS website URL (e.g. https://www.makemytrip.com)');

const safeLogoSchema = z.string().trim().refine((val) => {
  if (!val) return true;
  if (val.startsWith('/') || val.startsWith('./')) return true;
  try {
    const url = new URL(val);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'Logo must be a valid image URL (http/https) or valid local path (/portals/...)').nullable().optional();

export const portalSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  name: z.string().trim().min(2, 'Portal name must be at least 2 characters').max(100, 'Portal name cannot exceed 100 characters'),
  website_url: safeUrlSchema,
  logo_url: safeLogoSchema.transform((v) => (v === '' ? null : v)),
  description: z.string().trim().max(250, 'Description cannot exceed 250 characters').nullable().optional().transform((v) => (v === '' ? null : v)),
  internal_notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional().transform((v) => (v === '' ? null : v)),
  sort_order: z.coerce.number().int().min(0, 'Sort order must be 0 or greater').default(0),
  is_active: z.boolean().default(true),
});

export const portalUpdateSchema = portalSchema.partial().extend({
  id: z.string().min(1, 'Portal ID is required'),
});

export type PortalInput = z.infer<typeof portalSchema>;
export type PortalUpdateInput = z.infer<typeof portalUpdateSchema>;
