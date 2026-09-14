import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { CategorySchema } from "@/lib/validations/category";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const productCount = await Product.countDocuments({ categoryId: category._id });

    return NextResponse.json({ category: { ...category, productCount } });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch category" },
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
    const validated = CategorySchema.parse(body);

    // Verify slug uniqueness against other categories
    const existing = await Category.findOne({
      slug: validated.slug,
      _id: { $ne: id },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Another category with slug '${validated.slug}' already exists.` },
        { status: 400 }
      );
    }

    const updated = await Category.findByIdAndUpdate(id, validated, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Revalidate public routes
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${updated.slug}`);

    return NextResponse.json({
      success: true,
      category: updated,
      message: "Category updated successfully",
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
      { error: error.message || "Failed to update category" },
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

    const allowedUpdates = ["status", "featured", "displayOrder"];
    const updateData: any = {};

    for (const key of allowedUpdates) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${updated.slug}`);

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to patch category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete Safety: Check if category contains products
    const productCount = await Product.countDocuments({ categoryId: category._id });
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `This category contains ${productCount} product${
            productCount === 1 ? "" : "s"
          }. Please reassign or delete the products before deleting this category, or archive it instead.`,
          productCount,
        },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${category.slug}`);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
