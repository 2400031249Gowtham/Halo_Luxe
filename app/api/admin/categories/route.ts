import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { CategorySchema } from "@/lib/validations/category";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "displayOrder";

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (featured === "true") {
      query.featured = true;
    } else if (featured === "false") {
      query.featured = false;
    }

    let sortOption: any = { displayOrder: 1, createdAt: -1 };
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "name") {
      sortOption = { name: 1 };
    } else if (sort === "order") {
      sortOption = { displayOrder: 1 };
    }

    const categories = await Category.find(query).sort(sortOption).lean();

    // Compute product count for each category
    const categoryIds = categories.map((c) => c._id);
    const productCounts = await Product.aggregate([
      { $match: { categoryId: { $in: categoryIds } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      productCounts.map((p) => [p._id.toString(), p.count])
    );

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Categories GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const validated = CategorySchema.parse(body);

    // Check slug uniqueness
    const existing = await Category.findOne({ slug: validated.slug });
    if (existing) {
      return NextResponse.json(
        { error: `A category with the slug '${validated.slug}' already exists.` },
        { status: 400 }
      );
    }

    const category = await Category.create(validated);

    // Revalidate public routes
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/category/${category.slug}`);

    return NextResponse.json({
      success: true,
      category,
      message: "Category created successfully",
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
    console.error("[Categories POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
