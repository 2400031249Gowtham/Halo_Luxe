"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  altText: string;
  type: "product" | "category";
  associatedItem: {
    id: string;
    name: string;
    slug: string;
    type: string;
  } | null;
  isPrimary: boolean;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setNotification("Media uploaded successfully");
        setTimeout(() => setNotification(null), 3000);
        fetchMedia();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete image: ${item.url}?`)) return;

    try {
      const res = await fetch(`/api/admin/media?id=${item.id}&url=${encodeURIComponent(item.url)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification("Image removed");
        setTimeout(() => setNotification(null), 3000);
        fetchMedia();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#C8A15A]/25">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
            Media Library
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
            Browse, upload, and inspect catalogue assets and their product associations
          </p>
        </div>

        <label className="cursor-pointer px-5 py-2.5 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.18em] font-semibold transition-colors inline-flex items-center gap-2 self-start sm:self-auto shadow-xs">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#D9BD82]" />
              <span>Upload New Media</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-sans rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#C8A15A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by URL, alt text, or associated product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] placeholder-[#1C211E]/40 focus:outline-none focus:border-[#C8A15A]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-3" />
          <p className="text-xs font-sans uppercase tracking-widest text-[#063C2D]">
            Loading Media Assets...
          </p>
        </div>
      ) : media.length === 0 ? (
        <div className="p-12 text-center bg-[#EDE4D5]/30 border border-[#C8A15A]/20">
          <p className="font-serif text-xl text-[#02281E]">No media assets found.</p>
          <p className="text-xs font-sans text-[#1C211E]/60 mt-2">
            Upload images above or attach images when creating products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-[#EDE4D5]/30 border border-[#C8A15A]/25 overflow-hidden flex flex-col justify-between hover:border-[#C8A15A]/60 transition-colors"
            >
              <div className="relative aspect-square w-full bg-[#EDE4D5]">
                <Image
                  src={item.url}
                  alt={item.altText || "Media file"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {item.isPrimary && (
                  <div className="absolute top-2 left-2 bg-[#02281E] text-[#D9BD82] text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 border border-[#C8A15A]/40">
                    Primary
                  </div>
                )}
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-[11px] font-mono text-[#063C2D] truncate" title={item.url}>
                  {item.url}
                </p>

                {item.associatedItem ? (
                  <div className="text-[11px] font-sans">
                    <span className="text-[#1C211E]/50 uppercase tracking-wider text-[9px] block">
                      Associated with {item.associatedItem.type}:
                    </span>
                    <Link
                      href={
                        item.associatedItem.type === "Product"
                          ? `/admin/products/${item.associatedItem.id}`
                          : `/admin/categories/${item.associatedItem.id}`
                      }
                      className="text-[#02281E] font-medium hover:text-[#C8A15A] truncate block"
                    >
                      {item.associatedItem.name} ↗
                    </Link>
                  </div>
                ) : (
                  <span className="text-[10px] font-sans text-[#1C211E]/40 italic">
                    Unlinked Asset
                  </span>
                )}

                <div className="pt-2 border-t border-[#C8A15A]/15 flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="text-[11px] font-sans text-[#063C2D] hover:text-[#C8A15A] flex items-center gap-1"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
