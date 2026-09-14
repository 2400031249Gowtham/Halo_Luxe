"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Archive,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Star,
  ArrowUpDown,
} from "lucide-react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  productCount: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
  displayOrder: number;
  updatedAt: string;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (featuredFilter !== "all") params.set("featured", featuredFilter);
      params.set("sort", sortBy);

      const res = await fetch(`/api/admin/categories?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, statusFilter, featuredFilter, sortBy]);

  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setNotification(`Category status updated to ${newStatus}`);
        setTimeout(() => setNotification(null), 3000);
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeaturedToggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        setNotification(`Category featured state toggled`);
        setTimeout(() => setNotification(null), 3000);
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete category");
        return;
      }

      setNotification("Category deleted successfully.");
      setTimeout(() => setNotification(null), 3000);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message || "An unexpected error occurred");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#C8A15A]/25">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
            Categories
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            Manage dental product collections and taxonomies stored in MongoDB
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="px-5 py-2.5 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.18em] font-semibold transition-colors inline-flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D9BD82]" />
          <span>ADD CATEGORY</span>
        </Link>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-sans rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#C8A15A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search category by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] placeholder-[#1C211E]/40 focus:outline-none focus:border-[#C8A15A]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Featured:</span>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Standard</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="order">Display Order</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-3" />
          <p className="text-xs font-sans uppercase tracking-widest text-[#063C2D]">
            Loading Categories...
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-[#EDE4D5]/30 border border-[#C8A15A]/20">
          <p className="font-serif text-xl text-[#02281E]">No categories found.</p>
          <p className="text-xs font-sans text-[#1C211E]/60 mt-2">
            Try adjusting your search filters, or click &apos;ADD CATEGORY&apos; to create one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#EDE4D5]/30 border border-[#C8A15A]/25">
          <table className="w-full text-left text-xs font-sans divide-y divide-[#C8A15A]/20">
            <thead className="bg-[#02281E] text-[#F4EEE4] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">IMAGE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">SLUG</th>
                <th className="py-3 px-4">PRODUCTS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">FEATURED</th>
                <th className="py-3 px-4">ORDER</th>
                <th className="py-3 px-4">UPDATED</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8A15A]/15 bg-white/40">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-[#EDE4D5]/60 transition-colors">
                  {/* Image */}
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 relative bg-[#EDE4D5] border border-[#C8A15A]/30 overflow-hidden shrink-0">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-[#1C211E]/40 uppercase">
                          None
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Category Name */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/categories/${cat._id}`}
                      className="font-serif text-base text-[#02281E] font-medium leading-snug hover:text-[#C8A15A] transition-colors block"
                    >
                      {cat.name}
                    </Link>
                    {cat.description && (
                      <div className="text-[11px] text-[#1C211E]/60 truncate max-w-xs font-light">
                        {cat.description}
                      </div>
                    )}
                    <div className="mt-1">
                      <Link
                        href={`/admin/categories/${cat._id}`}
                        className="text-[10px] uppercase font-semibold tracking-wider text-[#C8A15A] hover:text-[#063C2D] inline-flex items-center gap-0.5"
                      >
                        <span>Manage & Products</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#063C2D]">
                    /{cat.slug}
                  </td>

                  {/* Products Count & Quick Add */}
                  <td className="py-3 px-4">
                    {cat.productCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products?category=${cat._id}`}
                          className="font-semibold text-[#063C2D] hover:text-[#C8A15A] hover:underline whitespace-nowrap text-xs"
                          title="View products in this category"
                        >
                          <span>{cat.productCount} items</span>
                        </Link>
                        <Link
                          href={`/admin/products/new?category=${cat._id}`}
                          className="px-2 py-0.5 bg-[#063C2D]/10 hover:bg-[#063C2D] hover:text-[#F4EEE4] text-[#063C2D] text-[10px] font-semibold tracking-wide rounded transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                          title={`Add product to ${cat.name}`}
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add</span>
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/admin/products/new?category=${cat._id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#C8A15A] bg-[#063C2D] px-2.5 py-1 rounded hover:bg-[#0B5942] transition-colors whitespace-nowrap text-[#D9BD82]"
                        title="Add first product to this category"
                      >
                        <Plus className="w-3 h-3 text-[#D9BD82]" />
                        <span>Add Product</span>
                      </Link>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${
                        cat.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : cat.status === "draft"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>

                  {/* Featured */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleFeaturedToggle(cat._id, cat.featured)}
                      className={`p-1 transition-colors ${
                        cat.featured
                          ? "text-[#C8A15A] hover:text-[#063C2D]"
                          : "text-gray-300 hover:text-[#C8A15A]"
                      }`}
                      title={cat.featured ? "Unmark featured" : "Mark as featured"}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={cat.featured ? "currentColor" : "none"}
                      />
                    </button>
                  </td>

                  {/* Order */}
                  <td className="py-3 px-4 font-mono text-xs">{cat.displayOrder}</td>

                  {/* Updated */}
                  <td className="py-3 px-4 text-[11px] text-[#1C211E]/60 whitespace-nowrap">
                    {new Date(cat.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/products/new?category=${cat._id}`}
                        className="px-2.5 py-1 text-[10px] font-sans uppercase font-bold tracking-wider bg-[#063C2D] text-[#D9BD82] hover:bg-[#0B5942] transition-colors rounded inline-flex items-center gap-1 shadow-xs"
                        title={`Add product to ${cat.name}`}
                      >
                        <Plus className="w-3 h-3 text-[#D9BD82]" />
                        <span>Add Product</span>
                      </Link>

                      <Link
                        href={`/admin/categories/${cat._id}`}
                        className="p-1.5 text-[#063C2D] hover:text-[#C8A15A] hover:bg-[#EDE4D5] rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      {cat.status !== "published" && (
                        <button
                          onClick={() => handleStatusChange(cat._id, "published")}
                          className="px-2 py-1 text-[10px] uppercase font-bold text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Publish category"
                        >
                          Publish
                        </button>
                      )}

                      {cat.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(cat._id, "draft")}
                          className="px-2 py-1 text-[10px] uppercase font-bold text-amber-700 hover:bg-amber-50 rounded"
                          title="Unpublish category"
                        >
                          Unpublish
                        </button>
                      )}

                      {cat.status !== "archived" && (
                        <button
                          onClick={() => handleStatusChange(cat._id, "archived")}
                          className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                          title="Archive category"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDeleteTarget(cat);
                          setDeleteError(null);
                        }}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal (Requirement 28 - Delete Safety) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#F4EEE4] border border-[#C8A15A]/40 max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif text-2xl text-[#02281E] font-normal">
              Delete Category
            </h3>
            <p className="mt-2 text-xs font-sans text-[#1C211E]/80 leading-relaxed">
              Are you sure you want to permanently delete category{" "}
              <strong className="text-[#02281E]">&apos;{deleteTarget.name}&apos;</strong>?
            </p>

            {deleteTarget.productCount > 0 ? (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-sans rounded">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  Category contains {deleteTarget.productCount} product
                  {deleteTarget.productCount === 1 ? "" : "s"}!
                </p>
                <p className="mt-1">
                  You cannot delete a category that still contains products. Please
                  reassign or remove these products first, or archive this category instead.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs font-sans text-red-600 font-medium">
                This action cannot be undone.
              </p>
            )}

            {deleteError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-sans">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#C8A15A]/20">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-[#C8A15A]/40 text-xs font-sans uppercase tracking-wider text-[#02281E] hover:bg-[#EDE4D5]"
              >
                Cancel
              </button>

              {deleteTarget.productCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(deleteTarget._id, "archived");
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 bg-[#063C2D] text-[#F4EEE4] text-xs font-sans uppercase tracking-wider hover:bg-[#0B5942]"
                >
                  Archive Category Instead
                </button>
              ) : (
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans uppercase tracking-wider disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
