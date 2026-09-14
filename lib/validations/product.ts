import { z } from "zod";

export const ProductImageSchema = z.object({
  _id: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  altText: z.string().optional().default(""),
  displayOrder: z.coerce.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z
    .string()
    .min(1, "Product slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe (lowercase letters, numbers, hyphens)"),
  categoryId: z.string().min(1, "Category is required"),
  article: z.string().optional().default(""),
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  brand: z.string().optional().default("Swarovski®"),
  type: z.string().optional().default("Flat Back No Hotfix"),
  backing: z.string().optional().default("Platinum foiling, where applicable"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(10),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  compareAtPrice: z.coerce.number().nullable().optional(),
  currency: z.string().default("INR"),
  application: z.string().optional().default("Professional dental application"),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  stockStatus: z
    .enum(["in_stock", "low_stock", "out_of_stock", "made_to_order", "hidden"])
    .default("in_stock"),
  displayOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  images: z.array(ProductImageSchema).optional().default([]),
});

export type ProductInput = z.infer<typeof ProductSchema>;
