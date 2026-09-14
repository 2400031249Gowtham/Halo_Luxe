"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { generateSlug } from "@/lib/slugify";

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

interface ImageItem {
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("category");

  // Categories from MongoDB
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // SECTION 1: BASIC INFORMATION
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugModified, setSlugModified] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // SECTION 2: PRODUCT DETAILS
  const [brand, setBrand] = useState("Swarovski®");
  const [article, setArticle] = useState("2088 XIRIUS Rose");
  const [type, setType] = useState("Flat Back No Hotfix");
  const [backing, setBacking] = useState("Platinum foiling, where applicable");
  const [quantity, setQuantity] = useState(10);
  const [application, setApplication] = useState("Professional dental application");

  // SECTION 3: PRICING
  const [price, setPrice] = useState<number | string>(1650);
  const [compareAtPrice, setCompareAtPrice] = useState<number | string>("");
  const [currency, setCurrency] = useState("INR");

  // SECTION 4: INVENTORY
  const [stockStatus, setStockStatus] = useState("in_stock");

  // SECTION 5: MEDIA
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // SECTION 6: PUBLISHING
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  // SECTION 7: SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load categories dynamically from MongoDB (Requirement 14)
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          const loadedCats: CategoryOption[] = data.categories || [];
          setCategories(loadedCats);
          if (loadedCats.length > 0) {
            const matched = preselectedCategory
              ? loadedCats.find(
                  (c) =>
                    c._id === preselectedCategory ||
                    c.slug === preselectedCategory
                )
              : null;
            setCategoryId(matched ? matched._id : loadedCats[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories from MongoDB", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [preselectedCategory]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugModified) {
      setSlug(generateSlug(val));
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const newImg: ImageItem = {
        imageUrl: data.url,
        altText: name || "Product image",
        displayOrder: images.length,
        isPrimary: images.length === 0,
      };

      setImages([...images, newImg]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddManualImage = () => {
    if (!newImageUrl.trim()) return;
    const newImg: ImageItem = {
      imageUrl: newImageUrl.trim(),
      altText: name || "Product image",
      displayOrder: images.length,
      isPrimary: images.length === 0,
    };
    setImages([...images, newImg]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If we removed the primary image, make the first remaining one primary
    if (images[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(updated);
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign display orders
    updated.forEach((img, i) => {
      img.displayOrder = i;
    });

    setImages(updated);
  };

  const handleSave = async (submitStatus: "draft" | "published") => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (!categoryId) {
        throw new Error("Please select a category.");
      }

      const payload = {
        name,
        slug: slug.trim(),
        categoryId,
        shortDescription,
        description,
        brand,
        article,
        type,
        backing,
        quantity: Number(quantity),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        currency,
        application,
        stockStatus,
        status: submitStatus,
        featured,
        displayOrder: Number(displayOrder),
        seoTitle,
        seoDescription,
        images,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setSuccess("Product created and published to MongoDB Atlas!");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Header Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D]">
        <Link href="/admin/products" className="hover:text-[#C8A15A] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Products</span>
        </Link>
        <span>/</span>
        <span className="text-[#C8A15A]">New Product</span>
      </div>

      <div className="pb-4 border-b border-[#C8A15A]/25 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
            Add New Product
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            Organized into 7 product catalogue sections. Saves directly to MongoDB Atlas.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-800 text-xs font-sans rounded flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-sans rounded flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {preselectedCategory && (
        <div className="p-3.5 bg-[#063C2D]/10 border border-[#063C2D]/30 flex items-center justify-between gap-3 text-xs font-sans text-[#02281E] rounded">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#063C2D]" />
            <span>
              Creating product directly for collection:{" "}
              <strong className="text-[#063C2D]">
                {categories.find((c) => c._id === categoryId || c.slug === categoryId)?.name || "Selected Category"}
              </strong>
            </span>
          </div>
          <Link
            href={`/admin/categories/${categoryId}`}
            className="text-[11px] uppercase tracking-wider font-semibold text-[#063C2D] hover:text-[#C8A15A] transition-colors"
          >
            ← View Category
          </Link>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(status === "published" ? "published" : "draft");
        }}
        className="space-y-8"
      >
        {/* SECTION 1: BASIC INFORMATION */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 1: Basic Information
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Core Identity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Swarovski® 2088 XIRIUS Rose — Crystal Clear"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Product Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugModified(true);
                }}
                placeholder="swarovski-2088-crystal-clear"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-mono text-[#063C2D] focus:outline-none focus:border-[#C8A15A]"
              />
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1">
                Public URL: /products/{slug || "slug"}
              </p>
            </div>
          </div>

          {/* Category Dropdown (Requirement 14: Dynamic from MongoDB) */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Category * (Loaded dynamically from MongoDB Atlas)
            </label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-xs font-sans text-[#063C2D]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading categories from MongoDB...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-xs font-sans text-amber-800 bg-amber-50 p-3 border border-amber-300">
                No categories found in MongoDB. Please{" "}
                <Link href="/admin/categories/new" className="underline font-bold text-[#063C2D]">
                  create a category first
                </Link>{" "}
                before creating products.
              </div>
            ) : (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Short Description / Subtitle
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. SS5 (1.8mm) · Crystal (Pure Diamond) · Pack of 10 crystals"
              className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical and aesthetic description of the crystal cut, brilliance, and application notes..."
              className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            />
          </div>
        </section>

        {/* SECTION 2: PRODUCT DETAILS */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 2: Product Details
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Specifications
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Swarovski®"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Article
              </label>
              <input
                type="text"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="e.g. 2088 XIRIUS Rose"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Type
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Flat Back No Hotfix"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Backing
              </label>
              <input
                type="text"
                value={backing}
                onChange={(e) => setBacking(e.target.value)}
                placeholder="Platinum foiling, where applicable"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Quantity in Pack
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 10)}
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1">
                Standard HALO dental blister pack is 10 crystals.
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Application
              </label>
              <input
                type="text"
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                placeholder="Professional dental application"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: PRICING */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 3: Pricing
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Commercial
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Price (INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1650"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1">
                Clinical purchase price in Indian Rupees (₹).
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Compare-at Price (INR)
              </label>
              <input
                type="number"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Original MSRP if discounted"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full px-4 py-2.5 bg-white/50 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] opacity-70"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: INVENTORY */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 4: Inventory
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Stock Status
            </span>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Stock Status
            </label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="in_stock">In Stock (Immediate Dispatch)</option>
              <option value="low_stock">Low Stock (Limited Blisters)</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order / Custom</option>
              <option value="hidden">Hidden from Stock Display</option>
            </select>
          </div>
        </section>

        {/* SECTION 5: MEDIA (Requirement 15) */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 5: Media & Images
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Multi-Image Gallery
            </span>
          </div>

          {/* Upload and manual URL input */}
          <div className="p-4 bg-white/60 border border-[#C8A15A]/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#063C2D] text-[#F4EEE4] hover:bg-[#0B5942] text-xs font-sans uppercase tracking-wider font-semibold transition-colors">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    <span>Uploading file...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-[#D9BD82]" />
                    <span>Upload Image File</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <span className="text-xs font-sans text-[#1C211E]/50 uppercase">or</span>

              <div className="flex items-center gap-2 flex-1 w-full">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter direct image URL (e.g. /images/crystal-clear.jpg)"
                  className="flex-1 px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualImage}
                  className="px-4 py-2.5 bg-[#EDE4D5] border border-[#C8A15A] text-xs font-sans uppercase tracking-wider font-medium hover:bg-[#C8A15A]/20"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Image List / Grid */}
          {images.length === 0 ? (
            <p className="text-xs font-sans text-[#1C211E]/60 text-center py-6 border border-dashed border-[#C8A15A]/30">
              No images attached yet. Upload files or provide URLs above.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-sans text-[#063C2D] font-medium">
                Drag or order images. Star marks the primary image displayed on catalogue grids.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border transition-all ${
                      img.isPrimary
                        ? "bg-[#063C2D]/5 border-[#063C2D] ring-1 ring-[#063C2D]"
                        : "bg-white/80 border-[#C8A15A]/30"
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-[#EDE4D5] overflow-hidden mb-3">
                      <Image
                        src={img.imageUrl}
                        alt={img.altText || "Product"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 bg-[#02281E] text-[#D9BD82] text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 border border-[#C8A15A]/40">
                          Primary
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => {
                          const updated = [...images];
                          updated[idx].altText = e.target.value;
                          setImages(updated);
                        }}
                        placeholder="Alt text for accessibility..."
                        className="w-full px-2 py-1 bg-white border border-[#C8A15A]/25 text-[11px] font-sans"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className={`text-xs font-sans flex items-center gap-1 ${
                            img.isPrimary ? "text-[#C8A15A] font-bold" : "text-[#1C211E]/60 hover:text-[#063C2D]"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" fill={img.isPrimary ? "currentColor" : "none"} />
                          <span>{img.isPrimary ? "Primary" : "Set Primary"}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, "up")}
                            className="p-1 text-[#063C2D] hover:bg-[#EDE4D5] rounded disabled:opacity-30"
                            title="Move left"
                          >
                            <MoveUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => handleMoveImage(idx, "down")}
                            className="p-1 text-[#063C2D] hover:bg-[#EDE4D5] rounded disabled:opacity-30"
                            title="Move right"
                          >
                            <MoveDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 6: PUBLISHING */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 6: Publishing & Visibility
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Storefront Display
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              >
                <option value="draft">Draft (Hidden publicly)</option>
                <option value="published">Published (Visible in Shop)</option>
                <option value="archived">Archived (Delisted)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1">
                Lower numbers display first on shop and category grids.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer select-none pt-4 sm:pt-0">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#063C2D] border-[#C8A15A]/40 rounded focus:ring-[#C8A15A]"
                />
                <span className="text-xs font-sans uppercase tracking-wider text-[#02281E] font-medium">
                  Feature on Homepage
                </span>
              </label>
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1 pl-7">
                Featured products automatically appear in the Homepage collection.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: SEO */}
        <section className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Section 7: Search Engine Optimization
            </h2>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              Metadata
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Product Name | HALO Swarovski® Tooth Crystals"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                SEO Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description for search engine previews..."
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Buttons (Requirement 13) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#C8A15A]/25">
          <Link
            href="/admin/products"
            className="w-full sm:w-auto px-6 py-3 border border-[#C8A15A]/40 text-xs font-sans uppercase tracking-[0.18em] text-[#02281E] hover:bg-[#EDE4D5] text-center"
          >
            CANCEL
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave("draft")}
              className="w-full sm:w-auto px-6 py-3 bg-[#EDE4D5] border border-[#C8A15A] text-xs font-sans uppercase tracking-[0.18em] text-[#02281E] font-semibold hover:bg-[#C8A15A]/20 transition-colors disabled:opacity-50"
            >
              {submitting ? "SAVING..." : "SAVE DRAFT"}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave("published")}
              className="w-full sm:w-auto px-8 py-3 bg-[#063C2D] text-[#F4EEE4] text-xs font-sans uppercase tracking-[0.2em] font-semibold hover:bg-[#0B5942] transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                  <span>PERSISTING TO MONGODB...</span>
                </>
              ) : (
                <span>PUBLISH PRODUCT</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-3" />
          <p className="text-xs font-sans uppercase tracking-widest text-[#063C2D]">
            Loading Add Product Form...
          </p>
        </div>
      }
    >
      <NewProductForm />
    </Suspense>
  );
}
