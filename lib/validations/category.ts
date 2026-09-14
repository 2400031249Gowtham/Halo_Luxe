import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z
    .string()
    .min(1, "Category slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase letters, numbers, hyphens)"),
  description: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
