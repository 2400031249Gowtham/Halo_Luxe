"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Plus,
  ExternalLink,
  Package,
  Edit2,
  RefreshCw,
} from "lucide-react";

interface CategoryProduct {
  _id: string;
  name: string;
  slug: string;
  article?: string;
  price: number;
  currency?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  status: "draft" | "published" | "archived";
  primaryImage?: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [productCount, setProductCount] = useState(0);

  // Products in this Category
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCategoryData = async () => {
    if (!categoryId) return;
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`);
      if (!res.ok) {
        throw new Error("Category not found in database");
      }
      const data = await res.json();
      const cat = data.category;
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || "");
      setImageUrl(cat.imageUrl || "");
      setStatus(cat.status || "draft");
      setFeatured(cat.featured || false);
      setDisplayOrder(cat.displayOrder || 0);
      setSeoTitle(cat.seoTitle || "");
      setSeoDescription(cat.seoDescription || "");
      setProductCount(cat.productCount || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load category");
    }
  };

  const fetchProducts = async () => {
    if (!categoryId) return;
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/admin/products?category=${categoryId}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        const prods = data.products || [];
        setProducts(prods);
        setProductCount(data.pagination?.total ?? prods.length);
      }
    } catch (e) {
      console.error("Failed to load category products", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await Promise.all([fetchCategoryData(), fetchProducts()]);
      setLoading(false);
    }
    loadAll();
  }, [categoryId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        slug: slug.trim(),
        description,
        imageUrl,
        status,
        featured,
        displayOrder: Number(displayOrder),
        seoTitle,
        seoDescription,
      };

      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      setSuccess("Category updated successfully in MongoDB!");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-3" />
        <p className="text-xs font-sans uppercase tracking-widest text-[#063C2D]">
          Loading Category from MongoDB...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D]">
        <Link href="/admin/categories" className="hover:text-[#C8A15A] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Categories</span>
        </Link>
        <span>/</span>
        <span className="text-[#C8A15A]">{name || "Category"}</span>
      </div>

      {/* Header & Main Actions */}
      <div className="pb-4 border-b border-[#C8A15A]/25 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
              {name}
            </h1>
            <span
              className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${
                status === "published"
                  ? "bg-emerald-100 text-emerald-800"
                  : status === "draft"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            Category ID: <span className="font-mono text-[#063C2D]">{categoryId}</span> · Contains{" "}
            <strong>{productCount}</strong> product{productCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Primary CTA: Add Product directly to this category */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            href={`/admin/products/new?category=${categoryId}`}
            className="px-5 py-2.5 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.18em] font-semibold transition-colors inline-flex items-center gap-2 shadow-xs"
            title={`Add a new product to ${name}`}
          >
            <Plus className="w-4 h-4 text-[#D9BD82]" />
            <span>ADD PRODUCT</span>
          </Link>

          <Link
            href={`/category/${slug}`}
            target="_blank"
            className="p-2.5 bg-white/80 hover:bg-white border border-[#C8A15A]/30 text-[#063C2D] rounded transition-colors"
            title="Preview category in public store"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
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

      {/* SECTION: PRODUCTS IN THIS CATEGORY */}
      <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/30 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#C8A15A]/25 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Package className="w-5 h-5 text-[#063C2D]" />
              <h2 className="font-serif text-xl sm:text-2xl text-[#02281E] font-normal">
                Products in this Category ({products.length})
              </h2>
            </div>
            <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
              Catalogue items assigned to &apos;{name}&apos;. Adding a product here automatically associates it with this collection.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchProducts}
              className="p-2 text-[#063C2D] hover:bg-[#EDE4D5] rounded transition-colors"
              title="Refresh products list"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProducts ? "animate-spin" : ""}`} />
            </button>
            <Link
              href={`/admin/products/new?category=${categoryId}`}
              className="px-4 py-2 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.16em] font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D9BD82]" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Products List / Table */}
        {loadingProducts ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#063C2D] animate-spin mb-2" />
            <p className="text-xs font-sans text-[#063C2D] uppercase tracking-wider">
              Loading Products in {name}...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 px-6 text-center border-2 border-dashed border-[#C8A15A]/40 bg-white/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EDE4D5] flex items-center justify-center text-[#063C2D]">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#02281E]">
              No products in &quot;{name}&quot; yet
            </h3>
            <p className="text-xs font-sans text-[#1C211E]/60 max-w-md mx-auto">
              Start adding authentic Swarovski® dental crystals or clinic starter sets to this category collection.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/admin/products/new?category=${categoryId}`}
                className="px-5 py-2.5 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] text-xs font-sans uppercase tracking-[0.18em] font-semibold transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D9BD82]" />
                <span>Add First Product</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#C8A15A]/25 bg-white/60">
            <table className="w-full text-left text-xs font-sans divide-y divide-[#C8A15A]/20">
              <thead className="bg-[#02281E] text-[#F4EEE4] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">IMAGE</th>
                  <th className="py-2.5 px-3">PRODUCT</th>
                  <th className="py-2.5 px-3">ARTICLE</th>
                  <th className="py-2.5 px-3">PRICE</th>
                  <th className="py-2.5 px-3">STOCK</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8A15A]/15">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#EDE4D5]/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="w-10 h-10 relative bg-[#EDE4D5] border border-[#C8A15A]/30 overflow-hidden shrink-0">
                        {p.primaryImage ? (
                          <Image
                            src={p.primaryImage}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-[#1C211E]/40">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="font-serif text-sm text-[#02281E] font-medium hover:text-[#C8A15A] transition-colors block"
                      >
                        {p.name}
                      </Link>
                      <span className="font-mono text-[10px] text-[#1C211E]/50">
                        /{p.slug}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-xs text-[#1C211E]/80">
                      {p.article || "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#063C2D]">
                      ₹{p.price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded ${
                          p.stockStatus === "in_stock"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.stockStatus === "low_stock"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.stockStatus?.replace("_", " ") || "in stock"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded ${
                          p.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/products/${p._id}`}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#EDE4D5] hover:bg-[#063C2D] hover:text-[#F4EEE4] text-[#02281E] rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1 text-[#063C2D] hover:text-[#C8A15A]"
                          title="View product in storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CATEGORY METADATA & SETTINGS FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-8"
      >
        {/* Category Identity */}
        <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-[#02281E] font-normal border-b border-[#C8A15A]/20 pb-3">
            Category Identity & Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Slug * (URL Identifier)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-mono text-[#063C2D] focus:outline-none focus:border-[#C8A15A]"
              />
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1">
                Public URL: /category/{slug}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
            />
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Category Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {imageUrl && (
                <div className="w-24 h-24 relative bg-[#EDE4D5] border border-[#C8A15A]/40 overflow-hidden shrink-0">
                  <Image src={imageUrl} alt="Category Preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. /images/crystal-individual.jpg or upload below)"
                  className="w-full px-4 py-2 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                />
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EDE4D5] hover:bg-[#C8A15A]/20 border border-[#C8A15A]/40 text-xs font-sans text-[#02281E] transition-colors">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#063C2D]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#C8A15A]" />
                        <span>Upload New Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Clear image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publishing & Ordering */}
        <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-[#02281E] font-normal border-b border-[#C8A15A]/20 pb-3">
            Publishing & Visibility
          </h2>

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
                <option value="draft">Draft (Hidden from public)</option>
                <option value="published">Published (Visible on site)</option>
                <option value="archived">Archived</option>
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
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-[#02281E] font-normal border-b border-[#C8A15A]/20 pb-3">
            Search Engine Optimization (SEO)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
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
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#C8A15A]/25">
          <Link
            href="/admin/categories"
            className="w-full sm:w-auto px-6 py-3 border border-[#C8A15A]/40 text-xs font-sans uppercase tracking-[0.18em] text-[#02281E] hover:bg-[#EDE4D5] text-center"
          >
            BACK TO CATEGORIES
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-[#063C2D] text-[#F4EEE4] text-xs font-sans uppercase tracking-[0.2em] font-semibold hover:bg-[#0B5942] transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                <span>SAVING CHANGES...</span>
              </>
            ) : (
              <span>SAVE CATEGORY CHANGES</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
