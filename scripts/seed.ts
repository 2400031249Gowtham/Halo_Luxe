import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "halo";

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// Inline schemas for standalone script execution
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true, collection: "users" }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true, collection: "categories" }
);

const ProductSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    article: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    brand: { type: String, default: "Swarovski®" },
    type: { type: String, default: "Flat Back No Hotfix" },
    backing: { type: String, default: "Platinum foiling, where applicable" },
    quantity: { type: Number, default: 10 },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    currency: { type: String, default: "INR" },
    application: { type: String, default: "Professional dental application" },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    stockStatus: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "made_to_order", "hidden"],
      default: "in_stock",
    },
    displayOrder: { type: Number, default: 0 },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true, collection: "products" }
);

const ProductImageSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    imageUrl: { type: String, required: true },
    altText: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "productImages" }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const ProductImage = mongoose.models.ProductImage || mongoose.model("ProductImage", ProductImageSchema);

async function seed() {
  console.log(`Connecting to MongoDB (${MONGODB_DB})...`);
  await mongoose.connect(MONGODB_URI!, { dbName: MONGODB_DB });
  console.log("Connected successfully!");

  // 1. Seed Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@halosmiles.co").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "HaloAdminPassword2026!";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await User.create({
      name: "HALO Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } else {
    console.log(`✓ Admin user already exists: ${adminEmail}`);
  }

  // 2. Seed Initial Categories
  const initialCategories = [
    {
      name: "Individual Crystals",
      slug: "individual-crystals",
      description: "Choose your sparkle. Genuine Swarovski® Flat Backs No Hotfix with platinum foiling.",
      imageUrl: "/images/crystal-individual.jpg",
      status: "published",
      featured: true,
      displayOrder: 1,
      seoTitle: "Individual Swarovski® Tooth Crystals | HALO",
      seoDescription: "Authentic Swarovski® flat back tooth crystals for dental professionals across India.",
    },
    {
      name: "HALO Sets",
      slug: "halo-sets",
      description: "Curated combinations. Clinic starter kits and master aesthetic collections.",
      imageUrl: "/images/halo-sets.jpg",
      status: "published",
      featured: true,
      displayOrder: 2,
      seoTitle: "HALO Tooth Crystal Sets & Kits | HALO",
      seoDescription: "HALO curated dental tooth gem kits and clinical sets for dental practices.",
    },
  ];

  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const catData of initialCategories) {
    let cat = await Category.findOne({ slug: catData.slug });
    if (!cat) {
      cat = await Category.create(catData);
      console.log(`✓ Category created: ${cat.name} (${cat.slug})`);
    } else {
      console.log(`✓ Category exists: ${cat.name} (${cat.slug})`);
    }
    categoryMap.set(catData.slug, cat._id as mongoose.Types.ObjectId);
  }

  // 3. Seed Authentic HALO Products
  const authenticProducts = [
    {
      name: "Swarovski® 2088 XIRIUS Rose — Crystal Clear",
      slug: "swarovski-2088-crystal-clear",
      categorySlug: "individual-crystals",
      article: "2088 XIRIUS Rose",
      image: "/images/crystal-clear.jpg",
      price: 1650,
      quantity: 10,
      brand: "Swarovski®",
      type: "Flat Back No Hotfix",
      backing: "Platinum foiling, where applicable",
      application: "Professional dental application",
      shortDescription: "SS5 (1.8mm) · Crystal (Pure Diamond) · Pack of 10 crystals",
      description:
        "Swarovski® Flat Backs No Hotfix are loose crystal components with platinum foiling for added brilliance and protection. The 2088 XIRIUS Rose cut features multifaceted geometry designed to maximize light refraction within the oral cavity.",
      status: "published",
      featured: true,
      stockStatus: "in_stock",
      displayOrder: 1,
    },
    {
      name: "Swarovski® 2088 XIRIUS Rose — Crystal AB",
      slug: "swarovski-2088-crystal-ab",
      categorySlug: "individual-crystals",
      article: "2088 XIRIUS Rose",
      image: "/images/crystal-ab.jpg",
      price: 1850,
      quantity: 10,
      brand: "Swarovski®",
      type: "Flat Back No Hotfix",
      backing: "Platinum foiling, where applicable",
      application: "Professional dental application",
      shortDescription: "SS5 (1.8mm) · Crystal AB (Aurore Boreale) · Pack of 10 crystals",
      description:
        "Aurore Boreale coating creates an iridescent pastel shimmer that delicately catches dental operatory and ambient natural light with whispers of soft gold, rose and azure.",
      status: "published",
      featured: true,
      stockStatus: "in_stock",
      displayOrder: 2,
    },
    {
      name: "Swarovski® 2058 XILION Rose — Golden Shadow",
      slug: "swarovski-2058-golden-shadow",
      categorySlug: "individual-crystals",
      article: "2058 XILION Rose",
      image: "/images/crystal-gold.jpg",
      price: 1750,
      quantity: 10,
      brand: "Swarovski®",
      type: "Flat Back No Hotfix",
      backing: "Platinum foiling, where applicable",
      application: "Professional dental application",
      shortDescription: "SS5 (1.8mm) · Golden Shadow (Warm Champagne) · Pack of 10 crystals",
      description:
        "A warm champagne gold crystal tone crafted for subtle, high-fashion dental aesthetics. Ideal for warm enamel tones and discreet elegance in smile design.",
      status: "published",
      featured: true,
      stockStatus: "in_stock",
      displayOrder: 3,
    },
    {
      name: "Swarovski® 2088 XIRIUS Rose — Micro SS3",
      slug: "swarovski-2088-crystal-clear-ss3",
      categorySlug: "individual-crystals",
      article: "2088 XIRIUS Rose",
      image: "/images/crystal-individual.jpg",
      price: 1550,
      quantity: 10,
      brand: "Swarovski®",
      type: "Flat Back No Hotfix",
      backing: "Platinum foiling, where applicable",
      application: "Professional dental application",
      shortDescription: "SS3 (1.4mm) · Crystal (Pure Diamond) · Pack of 10 crystals",
      description:
        "The delicate 1.4mm micro dimension is the preferred clinical size for subtle tooth placements, canines, and composite smile accents.",
      status: "published",
      featured: false,
      stockStatus: "in_stock",
      displayOrder: 4,
    },
    {
      name: "HALO Curated Dental Starter Kit",
      slug: "halo-curated-starter-kit",
      categorySlug: "halo-sets",
      article: "Curated Practice Selection",
      image: "/images/halo-sets.jpg",
      price: 4950,
      quantity: 30,
      brand: "Swarovski®",
      type: "Flat Back No Hotfix",
      backing: "Platinum foiling on all components",
      application: "Professional dental application",
      shortDescription: "Curated Assortment (SS3, SS5, SS7) · 30 crystals (3 blister packs of 10)",
      description:
        "An essential clinic curation featuring the most-requested crystal sizes and finishes: 10× SS3 Crystal, 10× SS5 Crystal, and 10× SS5 Crystal AB, complete with clinical placement protocol guide.",
      status: "published",
      featured: true,
      stockStatus: "in_stock",
      displayOrder: 5,
    },
    {
      name: "HALO Master Aesthetic Clinic Suite",
      slug: "halo-master-aesthetic-suite",
      categorySlug: "halo-sets",
      article: "Full Practice Curation",
      image: "/images/halo-sets.jpg",
      price: 8400,
      quantity: 50,
      brand: "Swarovski®",
      type: "Flat Back No Hotfix",
      backing: "Platinum foiling on all components",
      application: "Professional dental application",
      shortDescription: "Comprehensive (SS3, SS5, SS7, SS9) · 50 crystals (5 blister packs of 10)",
      description:
        "Designed for dedicated aesthetic dental practices and cosmetic studios. Includes 50 crystals spanning clear diamonds, rainbow AB, and warm champagne golden shadow, along with marketing collateral and patient consultation guidance.",
      status: "published",
      featured: true,
      stockStatus: "in_stock",
      displayOrder: 6,
    },
  ];

  for (const prodData of authenticProducts) {
    const categoryId = categoryMap.get(prodData.categorySlug);
    if (!categoryId) {
      console.warn(`Category not found for slug: ${prodData.categorySlug}`);
      continue;
    }

    let prod = await Product.findOne({ slug: prodData.slug });
    if (!prod) {
      prod = await Product.create({
        categoryId,
        name: prodData.name,
        slug: prodData.slug,
        article: prodData.article,
        shortDescription: prodData.shortDescription,
        description: prodData.description,
        brand: prodData.brand,
        type: prodData.type,
        backing: prodData.backing,
        quantity: prodData.quantity,
        price: prodData.price,
        currency: "INR",
        application: prodData.application,
        featured: prodData.featured,
        status: prodData.status,
        stockStatus: prodData.stockStatus,
        displayOrder: prodData.displayOrder,
      });
      console.log(`✓ Product created: ${prod.name}`);

      // Create primary ProductImage
      await ProductImage.create({
        productId: prod._id,
        imageUrl: prodData.image,
        altText: prod.name,
        displayOrder: 0,
        isPrimary: true,
      });
      console.log(`  └ Product image attached: ${prodData.image}`);
    } else {
      console.log(`✓ Product exists: ${prod.name}`);
    }
  }

  console.log("\nSeeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
