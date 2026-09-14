import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug, getPublishedProducts } from "@/lib/db/catalogue";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | HALO",
    };
  }

  return {
    title: `${product.name} | HALO Swarovski® Tooth Crystals`,
    description: `Buy genuine Swarovski® ${product.article} tooth crystals for professional dental application. Pack of 10 with platinum foiling. Express delivery across India.`,
    openGraph: {
      title: `${product.name} | HALO`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allPublished = await getPublishedProducts();
  const relatedProducts = allPublished
    .filter((p) => p.id !== product.id && p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="pt-28 pb-24 bg-[#F4EEE4] text-[#1C211E]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D]/80">
          <Link href="/shop" className="hover:text-[#C8A15A] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shop</span>
          </Link>
          <span>/</span>
          <span className="text-[#C8A15A] truncate">{product.name}</span>
        </div>

        {/* Product Interactive Client View */}
        <ProductDetailClient product={product} />

        {/* Related Crystals */}
        {relatedProducts.length > 0 && (
          <div className="mt-28 pt-16 border-t border-[#C8A15A]/25">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#02281E]">
                Complete Your Clinical Collection
              </h2>
              <Link
                href="/shop"
                className="text-xs font-sans uppercase tracking-[0.18em] text-[#063C2D] hover:text-[#C8A15A] font-semibold"
              >
                View All Crystals →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  href={`/products/${rel.slug}`}
                  className="group p-4 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 hover:border-[#C8A15A]/60 transition-colors"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#EDE4D5] mb-4">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <h3 className="font-serif text-lg text-[#02281E] group-hover:text-[#063C2D] truncate">
                    {rel.name}
                  </h3>
                  <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
                    {rel.size} · {rel.colour}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
