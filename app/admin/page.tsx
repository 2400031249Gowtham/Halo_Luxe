"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Package,
  Sparkles,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Eye,
  Archive,
  FileEdit,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsData {
  stats: {
    totalCategories: number;
    publishedCategories: number;
    draftCategories: number;
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    archivedProducts: number;
    featuredProducts: number;
  };
  recentProducts: any[];
  recentCategories: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          throw new Error("Failed to load statistics from MongoDB Atlas");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-4" />
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#063C2D]">
          Loading Database Statistics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-500/30 text-red-800 rounded">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="font-sans text-sm font-semibold">{error || "Unable to connect to database."}</p>
        </div>
        <p className="mt-2 text-xs font-sans text-red-700">
          Ensure your MongoDB Atlas cluster is online and MONGODB_URI in .env.local is valid.
        </p>
      </div>
    );
  }

  const { stats, recentProducts, recentCategories } = data;

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#C8A15A]/25">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
            Catalogue Overview
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            Real-time database statistics directly from MongoDB Atlas (<span className="text-[#063C2D] font-medium">halo</span> database)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories/new"
            className="px-4 py-2.5 bg-[#EDE4D5] border border-[#C8A15A]/40 hover:border-[#C8A15A] text-[#02281E] font-sans text-xs uppercase tracking-[0.16em] font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-[#C8A15A]" />
            <span>Category</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D9BD82]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Database Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="p-5 bg-[#EDE4D5]/50 border border-[#C8A15A]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#063C2D]">
            <span className="text-xs font-sans uppercase tracking-[0.18em] font-semibold">
              Total Products
            </span>
            <Package className="w-4 h-4 text-[#C8A15A]" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl text-[#02281E] font-normal">
              {stats.totalProducts}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#C8A15A]/20 flex items-center justify-between text-[11px] font-sans text-[#1C211E]/75">
            <span className="text-emerald-700 font-medium">
              {stats.publishedProducts} published
            </span>
            <span>{stats.draftProducts} draft</span>
          </div>
        </div>

        {/* Total Categories */}
        <div className="p-5 bg-[#EDE4D5]/50 border border-[#C8A15A]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#063C2D]">
            <span className="text-xs font-sans uppercase tracking-[0.18em] font-semibold">
              Total Categories
            </span>
            <Layers className="w-4 h-4 text-[#C8A15A]" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl text-[#02281E] font-normal">
              {stats.totalCategories}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#C8A15A]/20 flex items-center justify-between text-[11px] font-sans text-[#1C211E]/75">
            <span className="text-emerald-700 font-medium">
              {stats.publishedCategories} published
            </span>
            <span>{stats.draftCategories} draft</span>
          </div>
        </div>

        {/* Featured Products */}
        <div className="p-5 bg-[#EDE4D5]/50 border border-[#C8A15A]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#063C2D]">
            <span className="text-xs font-sans uppercase tracking-[0.18em] font-semibold">
              Featured Items
            </span>
            <Sparkles className="w-4 h-4 text-[#C8A15A]" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl text-[#02281E] font-normal">
              {stats.featuredProducts}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#C8A15A]/20 text-[11px] font-sans text-[#1C211E]/70">
            Active on homepage showcase
          </div>
        </div>

        {/* Archived Products */}
        <div className="p-5 bg-[#EDE4D5]/50 border border-[#C8A15A]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#063C2D]">
            <span className="text-xs font-sans uppercase tracking-[0.18em] font-semibold">
              Archived Products
            </span>
            <Archive className="w-4 h-4 text-[#C8A15A]" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl text-[#02281E] font-normal">
              {stats.archivedProducts}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#C8A15A]/20 text-[11px] font-sans text-[#1C211E]/70">
            Hidden from public store
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-7 bg-[#EDE4D5]/30 border border-[#C8A15A]/25 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Recent Products
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D] hover:text-[#C8A15A] font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <p className="text-xs font-sans text-[#1C211E]/60 py-6 text-center">
              No products found in MongoDB. Click &apos;Add Product&apos; to create one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#C8A15A]/20 text-[#063C2D] uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Price</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8A15A]/15">
                  {recentProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-[#EDE4D5]/50">
                      <td className="py-3 font-medium text-[#02281E] max-w-[180px] truncate">
                        {prod.name}
                      </td>
                      <td className="py-3 text-[#1C211E]/70">
                        {prod.categoryId?.name || "Uncategorized"}
                      </td>
                      <td className="py-3 font-medium text-[#02281E]">
                        {formatPrice(prod.price)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${
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
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/products/${prod._id}`}
                          className="text-[#063C2D] hover:text-[#C8A15A] font-semibold"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Categories */}
        <div className="lg:col-span-5 bg-[#EDE4D5]/30 border border-[#C8A15A]/25 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#02281E] font-normal">
              Categories
            </h2>
            <Link
              href="/admin/categories"
              className="text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D] hover:text-[#C8A15A] font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentCategories.length === 0 ? (
            <p className="text-xs font-sans text-[#1C211E]/60 py-6 text-center">
              No categories created yet. Click &apos;Add Category&apos; to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {recentCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="p-3 bg-[#EDE4D5]/60 border border-[#C8A15A]/20 flex items-center justify-between hover:border-[#C8A15A]/50 transition-colors"
                >
                  <div>
                    <h3 className="font-serif text-base text-[#02281E] font-medium">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-sans text-[#1C211E]/60">
                      /{cat.slug} · {cat.status}
                    </p>
                  </div>
                  <Link
                    href={`/admin/categories/${cat._id}`}
                    className="p-1.5 text-[#063C2D] hover:text-[#C8A15A]"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <FileEdit className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
