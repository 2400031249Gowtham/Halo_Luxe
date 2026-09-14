import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import ProductImage from "@/models/ProductImage";
import Category from "@/models/Category";
import { storage } from "@/lib/storage";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Find all product images
    const images = await ProductImage.find()
      .populate("productId", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    // Also find category images
    const categoriesWithImages = await Category.find({
      imageUrl: { $exists: true, $ne: "" },
    })
      .select("name slug imageUrl")
      .lean();

    let combined = images.map((img) => ({
      id: img._id.toString(),
      url: img.imageUrl,
      altText: img.altText || "",
      type: "product" as const,
      associatedItem: img.productId
        ? {
            id: (img.productId as any)._id,
            name: (img.productId as any).name,
            slug: (img.productId as any).slug,
            type: "Product",
          }
        : null,
      isPrimary: img.isPrimary,
      createdAt: img.createdAt,
    }));

    for (const cat of categoriesWithImages) {
      if (cat.imageUrl) {
        combined.push({
          id: cat._id.toString(),
          url: cat.imageUrl,
          altText: cat.name,
          type: "category" as any,
          associatedItem: {
            id: cat._id,
            name: cat.name,
            slug: cat.slug,
            type: "Category",
          },
          isPrimary: false,
          createdAt: (cat as any).createdAt || new Date(),
        });
      }
    }

    if (search) {
      const s = search.toLowerCase();
      combined = combined.filter(
        (item) =>
          item.url.toLowerCase().includes(s) ||
          item.altText.toLowerCase().includes(s) ||
          (item.associatedItem && item.associatedItem.name.toLowerCase().includes(s))
      );
    }

    return NextResponse.json({ media: combined });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Media GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const url = searchParams.get("url");

    if (!id && !url) {
      return NextResponse.json(
        { error: "Image ID or URL is required" },
        { status: 400 }
      );
    }

    if (id) {
      const img = await ProductImage.findById(id);
      if (img) {
        await storage.delete(img.imageUrl);
        await ProductImage.findByIdAndDelete(id);
      }
    } else if (url) {
      await storage.delete(url);
      await ProductImage.deleteMany({ imageUrl: url });
    }

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
