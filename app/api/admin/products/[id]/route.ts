import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductImage from "@/models/ProductImage";
import { ProductSchema } from "@/lib/validations/product";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const product = await Product.findById(id)
      .populate("categoryId", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const images = await ProductImage.find({ productId: product._id })
      .sort({ isPrimary: -1, displayOrder: 1 })
      .lean();

    return NextResponse.json({
      product: {
        ...product,
        images,
      },
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const validated = ProductSchema.parse(body);

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(validated.categoryId)) {
      return NextResponse.json({ error: "Invalid category selection" }, { status: 400 });
    }

    const categoryExists = await Category.findById(validated.categoryId);
    if (!categoryExists) {
      return NextResponse.json({ error: "Selected category does not exist" }, { status: 400 });
    }

    // Validate slug uniqueness against other products
    const existing = await Product.findOne({
      slug: validated.slug,
      _id: { $ne: id },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Another product with slug '${validated.slug}' already exists.` },
        { status: 400 }
      );
    }

    const { images, ...productData } = validated;

    const updated: any = await Product.findByIdAndUpdate(
      id,
      {
        ...productData,
        compareAtPrice: productData.compareAtPrice ?? undefined,
        categoryId: new mongoose.Types.ObjectId(validated.categoryId),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Sync Images: Replace existing with incoming list
    if (images !== undefined) {
      await ProductImage.deleteMany({ productId: updated._id });
      if (images.length > 0) {
        const imageDocs = images.map((img, idx) => ({
          productId: updated._id,
          imageUrl: img.imageUrl,
          altText: img.altText || updated.name,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
        }));
        await ProductImage.insertMany(imageDocs);
      }
    }

    // Revalidate public routes
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${categoryExists.slug}`);
    revalidatePath(`/products/${updated.slug}`);

    return NextResponse.json({
      success: true,
      product: updated,
      message: "Product updated successfully",
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
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();

    const allowedUpdates = ["status", "stockStatus", "featured", "displayOrder"];
    const updateData: any = {};

    for (const key of allowedUpdates) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/products/${updated.slug}`);

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to patch product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete associated images
    await ProductImage.deleteMany({ productId: product._id });
    await Product.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
