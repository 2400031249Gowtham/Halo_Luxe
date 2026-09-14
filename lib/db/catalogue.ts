import "server-only";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import ProductImage from "@/models/ProductImage";
import { products as fallbackProducts, Product as FrontendProduct } from "@/data/products";

export interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  displayOrder: number;
}

/**
 * Fetch published categories ordered by displayOrder.
 */
export async function getPublishedCategories(): Promise<CategoryData[]> {
  try {
    await connectToDatabase();
    const categories = await Category.find({ status: "published" })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        imageUrl: c.imageUrl || "",
        featured: !!c.featured,
        displayOrder: c.displayOrder || 0,
      }));
    }
  } catch (error) {
    console.warn("[Catalogue] Failed to fetch categories from MongoDB, falling back to initial data:", error);
  }

  // Graceful fallback if database is unseeded
  return [
    {
      _id: "cat-individual",
      name: "Individual Crystals",
      slug: "individual-crystals",
      description: "Choose your sparkle.",
      imageUrl: "/images/crystal-individual.jpg",
      featured: true,
      displayOrder: 1,
    },
    {
      _id: "cat-sets",
      name: "HALO Sets",
      slug: "halo-sets",
      description: "Curated combinations.",
      imageUrl: "/images/halo-sets.jpg",
      featured: true,
      displayOrder: 2,
    },
  ];
}

/**
 * Fetch a published category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    await connectToDatabase();
    const cat = await Category.findOne({ slug, status: "published" }).lean();
    if (cat) {
      return {
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        imageUrl: cat.imageUrl || "",
        featured: !!cat.featured,
        displayOrder: cat.displayOrder || 0,
      };
    }
  } catch (e) {
    console.warn("[Catalogue] Category fetch error:", e);
  }
  return null;
}

/**
 * Fetch published products from MongoDB with category and images.
 */
export async function getPublishedProducts(options?: {
  categorySlug?: string;
  categoryId?: string;
  featured?: boolean;
  limit?: number;
}): Promise<FrontendProduct[]> {
  try {
    await connectToDatabase();

    const query: any = { status: "published" };

    if (options?.categorySlug && options.categorySlug !== "all") {
      const cat = await Category.findOne({ slug: options.categorySlug });
      if (cat) {
        query.categoryId = cat._id;
      } else {
        return [];
      }
    }

    if (options?.categoryId) {
      if (mongoose.Types.ObjectId.isValid(options.categoryId)) {
        query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
      } else {
        query.categoryId = options.categoryId;
      }
    }

    if (options?.featured) {
      query.featured = true;
    }

    let prodQuery = Product.find(query)
      .populate("categoryId", "name slug")
      .sort({ displayOrder: 1, createdAt: -1 });

    if (options?.limit && options.limit > 0) {
      prodQuery = prodQuery.limit(options.limit);
    }

    const docs = await prodQuery.lean();

    if (docs && docs.length > 0) {
      const productIds = docs.map((d) => d._id);
      const images = await ProductImage.find({ productId: { $in: productIds } })
        .sort({ isPrimary: -1, displayOrder: 1 })
        .lean();

      const imageMap = new Map<string, string>();
      for (const img of images) {
        const pid = img.productId.toString();
        if (!imageMap.has(pid)) {
          imageMap.set(pid, img.imageUrl);
        }
      }

      return docs.map((p) => {
        const catSlug = (p.categoryId as any)?.slug || "crystals";
        const catName = (p.categoryId as any)?.name || "Crystals";
        const img = imageMap.get(p._id.toString()) || "/images/crystal-individual.jpg";

        return {
          id: p._id.toString(),
          slug: p.slug,
          name: p.name,
          article: p.article || "Flat Back No Hotfix",
          image: img,
          images: [img],
          size: p.shortDescription?.includes("·")
            ? p.shortDescription.split("·")[0].trim()
            : p.shortDescription || "SS5 (1.8mm)",
          colour: p.shortDescription?.includes("·")
            ? p.shortDescription.split("·")[1]?.trim()
            : "Crystal (Clear)",
          price: p.price,
          packQuantity: `${p.quantity || 10} crystals`,
          category: catSlug,
          categorySlug: catSlug,
          categoryId: {
            _id: (p.categoryId as any)?._id?.toString() || p.categoryId?.toString(),
            name: catName,
            slug: catSlug,
          },
          description: p.description || "",
          backing: p.backing || "Platinum foiling, where applicable",
          application: p.application || "Professional dental application",
          features: [
            "Genuine Swarovski® crystal components",
            "Authorised distribution partner provenance",
            "Platinum foiling for brilliant optical refraction",
            `${p.quantity || 10} crystals per sealed blister pack`,
          ],
        };
      });
    }
  } catch (error) {
    console.warn("[Catalogue] MongoDB products fetch error, falling back to initial data:", error);
  }

  // Fallback to static data
  let fallback = fallbackProducts;
  if (options?.categorySlug && options.categorySlug !== "all") {
    fallback = fallback.filter((p) =>
      options.categorySlug!.includes("set") ? p.category === "sets" : p.category === "individual"
    );
  }
  if (options?.limit) {
    fallback = fallback.slice(0, options.limit);
  }
  return fallback;
}

/**
 * Fetch single product by slug from MongoDB.
 */
export async function getProductBySlug(slug: string): Promise<FrontendProduct | null> {
  try {
    await connectToDatabase();
    const p = await Product.findOne({ slug, status: "published" })
      .populate("categoryId", "name slug")
      .lean();

    if (p) {
      const images = await ProductImage.find({ productId: p._id })
        .sort({ isPrimary: -1, displayOrder: 1 })
        .lean();

      const primaryImg = images[0]?.imageUrl || "/images/crystal-individual.jpg";
      const catSlug = (p.categoryId as any)?.slug || "crystals";
      const catName = (p.categoryId as any)?.name || "Crystals";

      return {
        id: p._id.toString(),
        slug: p.slug,
        name: p.name,
        article: p.article || "Flat Back No Hotfix",
        image: primaryImg,
        images: images.length > 0 ? images.map((i) => i.imageUrl) : [primaryImg],
        size: p.shortDescription?.includes("·")
          ? p.shortDescription.split("·")[0].trim()
          : p.shortDescription || "SS5 (1.8mm)",
        colour: p.shortDescription?.includes("·")
          ? p.shortDescription.split("·")[1]?.trim()
          : "Crystal (Clear)",
        price: p.price,
        packQuantity: `${p.quantity || 10} crystals`,
        category: catSlug,
        categorySlug: catSlug,
        categoryId: {
          _id: (p.categoryId as any)?._id?.toString() || p.categoryId?.toString(),
          name: catName,
          slug: catSlug,
        },
        description: p.description || "",
        backing: p.backing || "Platinum foiling, where applicable",
        application: p.application || "Professional dental application",
        features: [
          "Genuine Swarovski® crystal components",
          "Authorised distribution partner provenance",
          "Platinum foiling for brilliant optical refraction and enamel bonding protection",
          `${p.quantity || 10} crystals per sealed blister pack`,
        ],
      };
    }
  } catch (error) {
    console.warn("[Catalogue] Product fetch by slug error:", error);
  }

  const found = fallbackProducts.find((p) => p.slug === slug);
  return found || null;
}
