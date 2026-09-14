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
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  article?: string;
  price: number;
  currency: string;
  stockStatus: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  displayOrder: number;
  primaryImage: string;
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  updatedAt: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [selectedFeatured, setSelectedFeatured] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & feedback
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load categories for dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error("Failed to load categories dropdown", e);
      }
    }
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (selectedStock !== "all") params.set("stockStatus", selectedStock);
      if (selectedFeatured !== "all") params.set("featured", selectedFeatured);
      params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedStatus, selectedStock, selectedFeatured, sortBy, page]);

  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setNotification(`Product status updated to ${newStatus}`);
        setTimeout(() => setNotification(null), 3000);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeaturedToggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (res.ok) {
        setNotification(`Product featured state toggled`);
        setTimeout(() => setNotification(null), 3000);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification("Product deleted successfully");
        setTimeout(() => setNotification(null), 3000);
        setDeleteTarget(null);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#C8A15A]/25">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
            Products
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            {totalCount} total crystals and clinical sets persisted in MongoDB
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.18em] font-semibold transition-colors inline-flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D9BD82]" />
          <span>ADD PRODUCT</span>
        </Link>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-sans rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#C8A15A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, article, or slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] placeholder-[#1C211E]/40 focus:outline-none focus:border-[#C8A15A]"
            />
          </div>

          {/* Dynamic Category Selector (Requirement 14: fetched from MongoDB) */}
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#C8A15A]/15">
          <div className="flex items-center gap-1.5 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans focus:outline-none"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Stock:</span>
            <select
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans focus:outline-none"
            >
              <option value="all">All</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-sans">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Featured:</span>
            <select
              value={selectedFeatured}
              onChange={(e) => {
                setSelectedFeatured(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans focus:outline-none"
            >
              <option value="all">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Standard</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-sans ml-auto">
            <span className="text-[#1C211E]/60 uppercase tracking-wider text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="order">Display Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-3" />
          <p className="text-xs font-sans uppercase tracking-widest text-[#063C2D]">
            Loading Products from MongoDB...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-[#EDE4D5]/30 border border-[#C8A15A]/20">
          <Package className="w-10 h-10 text-[#C8A15A] mx-auto mb-3 opacity-60" />
          <p className="font-serif text-xl text-[#02281E]">No products found.</p>
          <p className="text-xs font-sans text-[#1C211E]/60 mt-2">
            Try adjusting your search criteria or click &apos;ADD PRODUCT&apos; to create one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#EDE4D5]/30 border border-[#C8A15A]/25">
          <table className="w-full text-left text-xs font-sans divide-y divide-[#C8A15A]/20">
            <thead className="bg-[#02281E] text-[#F4EEE4] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">IMAGE</th>
                <th className="py-3 px-4">PRODUCT</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">ARTICLE</th>
                <th className="py-3 px-4">PRICE</th>
                <th className="py-3 px-4">STOCK</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">FEATURED</th>
                <th className="py-3 px-4">UPDATED</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8A15A]/15 bg-white/40">
              {products.map((prod) => (
                <tr key={prod._id} className="hover:bg-[#EDE4D5]/60 transition-colors">
                  {/* Image */}
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 relative bg-[#EDE4D5] border border-[#C8A15A]/30 overflow-hidden shrink-0">
                      <Image
                        src={prod.primaryImage || "/images/crystal-individual.jpg"}
                        alt={prod.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>

                  {/* Product Name & Slug */}
                  <td className="py-3 px-4 max-w-[220px]">
                    <div className="font-serif text-base text-[#02281E] font-medium leading-snug truncate">
                      {prod.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#063C2D]/80 truncate">
                      /{prod.slug}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 font-medium text-[#02281E]">
                    {prod.categoryId?.name || "Unassigned"}
                  </td>

                  {/* Article */}
                  <td className="py-3 px-4 text-[11px] text-[#1C211E]/75">
                    {prod.article || "—"}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-serif text-sm font-semibold text-[#02281E]">
                    {formatPrice(prod.price)}
                  </td>

                  {/* Stock Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded ${
                        prod.stockStatus === "in_stock"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                          : prod.stockStatus === "low_stock"
                          ? "bg-amber-50 text-amber-800 border border-amber-300"
                          : "bg-rose-50 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {prod.stockStatus?.replace("_", " ")}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${
                        prod.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : prod.status === "draft"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>

                  {/* Featured */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleFeaturedToggle(prod._id, prod.featured)}
                      className={`p-1 transition-colors ${
                        prod.featured
                          ? "text-[#C8A15A] hover:text-[#063C2D]"
                          : "text-gray-300 hover:text-[#C8A15A]"
                      }`}
                      title={prod.featured ? "Unmark featured" : "Mark featured"}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={prod.featured ? "currentColor" : "none"}
                      />
                    </button>
                  </td>

                  {/* Updated */}
                  <td className="py-3 px-4 text-[11px] text-[#1C211E]/60 whitespace-nowrap">
                    {new Date(prod.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/products/${prod._id}`}
                        className="p-1.5 text-[#063C2D] hover:text-[#C8A15A] hover:bg-[#EDE4D5] rounded transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      {prod.status !== "published" && (
                        <button
                          onClick={() => handleStatusChange(prod._id, "published")}
                          className="px-2 py-1 text-[10px] uppercase font-bold text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Publish product"
                        >
                          Publish
                        </button>
                      )}

                      {prod.status === "published" && (
                        <button
                          onClick={() => handleStatusChange(prod._id, "draft")}
                          className="px-2 py-1 text-[10px] uppercase font-bold text-amber-700 hover:bg-amber-50 rounded"
                          title="Unpublish product"
                        >
                          Unpublish
                        </button>
                      )}

                      {prod.status !== "archived" && (
                        <button
                          onClick={() => handleStatusChange(prod._id, "archived")}
                          className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                          title="Archive product"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTarget(prod)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete product"
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-sans text-[#1C211E]/70">
            Showing page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-[#C8A15A]/30 text-xs font-sans hover:bg-[#EDE4D5] disabled:opacity-40"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-[#EDE4D5]/60 border border-[#C8A15A]/30 text-xs font-mono">
              {page}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-[#C8A15A]/30 text-xs font-sans hover:bg-[#EDE4D5] disabled:opacity-40"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#F4EEE4] border border-[#C8A15A]/40 max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif text-2xl text-[#02281E] font-normal">
              Delete Product
            </h3>
            <p className="mt-2 text-xs font-sans text-[#1C211E]/80 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[#02281E]">&apos;{deleteTarget.name}&apos;</strong> and all of its
              associated media from MongoDB Atlas?
            </p>
            <p className="mt-3 text-xs font-sans text-red-600 font-medium">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#C8A15A]/20">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-[#C8A15A]/40 text-xs font-sans uppercase tracking-wider text-[#02281E] hover:bg-[#EDE4D5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans uppercase tracking-wider disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
