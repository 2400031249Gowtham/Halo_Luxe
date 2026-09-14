import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const [
      totalCategories,
      publishedCategories,
      draftCategories,
      totalProducts,
      publishedProducts,
      draftProducts,
      archivedProducts,
      featuredProducts,
      recentProducts,
      recentCategories,
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ status: "published" }),
      Category.countDocuments({ status: "draft" }),
      Product.countDocuments(),
      Product.countDocuments({ status: "published" }),
      Product.countDocuments({ status: "draft" }),
      Product.countDocuments({ status: "archived" }),
      Product.countDocuments({ featured: true }),
      Product.find()
        .populate("categoryId", "name slug")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      Category.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      stats: {
        totalCategories,
        publishedCategories,
        draftCategories,
        totalProducts,
        publishedProducts,
        draftProducts,
        archivedProducts,
        featuredProducts,
      },
      recentProducts,
      recentCategories,
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Stats API Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch database statistics" },
      { status: 500 }
    );
  }
}
