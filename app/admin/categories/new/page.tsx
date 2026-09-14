"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, Loader2, Check, AlertCircle } from "lucide-react";
import { generateSlug } from "@/lib/slugify";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugModified, setSlugModified] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugModified) {
      setSlug(generateSlug(val));
    }
  };

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

  const handleSave = async (submitStatus: "draft" | "published") => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        slug: slug.trim(),
        description,
        imageUrl,
        status: submitStatus,
        featured,
        displayOrder: Number(displayOrder),
        seoTitle,
        seoDescription,
      };

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      setSuccess("Category created successfully in MongoDB!");
      setTimeout(() => {
        router.push("/admin/categories");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D]">
        <Link href="/admin/categories" className="hover:text-[#C8A15A] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Categories</span>
        </Link>
        <span>/</span>
        <span className="text-[#C8A15A]">New Category</span>
      </div>

      <div className="pb-4 border-b border-[#C8A15A]/25 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
            Add New Category
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            Create a dynamic catalogue category. It will persist directly in MongoDB Atlas.
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(status === "published" ? "published" : "draft");
        }}
        className="space-y-8"
      >
        {/* Basic Details Card */}
        <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-[#02281E] font-normal border-b border-[#C8A15A]/20 pb-3">
            Category Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Individual Crystals, HALO Sets, Dental Gold"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
                Slug * (URL Identifier)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugModified(true);
                }}
                placeholder="individual-crystals"
                className="w-full px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-mono text-[#063C2D] focus:outline-none focus:border-[#C8A15A]"
              />
              <p className="text-[10px] font-sans text-[#1C211E]/60 mt-1">
                Public URL: /category/{slug || "slug"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide an editorial subtitle or description for this collection..."
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
                        <span>Upload Image File</span>
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
            Publishing & Display
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Status */}
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

            {/* Display Order */}
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
                Lower numbers appear first on navigation & storefront.
              </p>
            </div>

            {/* Featured Checkbox */}
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
                Featured categories populate the homepage Showcase section.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
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
                placeholder="e.g. Individual Tooth Crystals | Swarovski® Flat Back No Hotfix"
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
        </div>

        {/* Action Buttons (Requirement 8) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#C8A15A]/25">
          <Link
            href="/admin/categories"
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
                  <span>PERSISTING...</span>
                </>
              ) : (
                <span>PUBLISH CATEGORY</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
