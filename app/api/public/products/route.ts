import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductImage from "@/models/ProductImage";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 0;

    const query: any = { status: "published" };

    if (categorySlug && categorySlug !== "all") {
      const cat = await Category.findOne({ slug: categorySlug, status: "published" });
      if (cat) {
        query.categoryId = cat._id;
      } else {
        return NextResponse.json({ products: [] });
      }
    }

    let prodQuery = Product.find(query)
      .populate("categoryId", "name slug")
      .sort({ displayOrder: 1, createdAt: -1 });

    if (limit > 0) {
      prodQuery = prodQuery.limit(limit);
    }

    const products = await prodQuery.lean();

    // Fetch primary images
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

    const formatted = products.map((p) => ({
      ...p,
      id: p._id.toString(),
      image: imageMap.get(p._id.toString()) || "/images/crystal-individual.jpg",
    }));

    return NextResponse.json({ products: formatted });
  } catch (error: any) {
    console.error("[Public Products GET Error]", error);
    return NextResponse.json(
      { error: "Failed to load products", products: [] },
      { status: 500 }
    );
  }
}
