import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50, 'Category name cannot exceed 50 characters'),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  icon: z.string().trim().min(1, 'Icon identifier is required'),
  sort_order: z.coerce.number().int().min(0, 'Sort order must be 0 or greater').default(0),
  is_active: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial().extend({
  id: z.string().min(1, 'Category ID is required'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
