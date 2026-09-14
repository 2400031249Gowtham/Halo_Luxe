import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductImage from "@/models/ProductImage";
import { ProductSchema } from "@/lib/validations/product";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const stockStatus = searchParams.get("stockStatus") || "";
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { article: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = new mongoose.Types.ObjectId(category);
      }
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (stockStatus && stockStatus !== "all") {
      query.stockStatus = stockStatus;
    }

    if (featured === "true") {
      query.featured = true;
    } else if (featured === "false") {
      query.featured = false;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "name") {
      sortOption = { name: 1 };
    } else if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "order") {
      sortOption = { displayOrder: 1, createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch primary or first image for each product
    const productIds = products.map((p) => p._id);
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

    const productsWithImages = products.map((prod) => ({
      ...prod,
      primaryImage: imageMap.get(prod._id.toString()) || "/images/crystal-individual.jpg",
    }));

    return NextResponse.json({
      products: productsWithImages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Products GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const validated = ProductSchema.parse(body);

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(validated.categoryId)) {
      return NextResponse.json(
        { error: "Invalid category selection" },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(validated.categoryId);
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    // Validate slug uniqueness
    const existing = await Product.findOne({ slug: validated.slug });
    if (existing) {
      return NextResponse.json(
        { error: `A product with the slug '${validated.slug}' already exists.` },
        { status: 400 }
      );
    }

    const { images, ...productData } = validated;

    const product: any = await Product.create({
      ...productData,
      compareAtPrice: productData.compareAtPrice ?? undefined,
      categoryId: new mongoose.Types.ObjectId(validated.categoryId),
    });

    // Create associated images
    if (images && images.length > 0) {
      const imageDocs = images.map((img, idx) => ({
        productId: product._id,
        imageUrl: img.imageUrl,
        altText: img.altText || product.name,
        displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
        isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
      }));
      await ProductImage.insertMany(imageDocs);
    }

    // Revalidate public routes
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${categoryExists.slug}`);
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("[Products POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
