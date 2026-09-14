import { Hero } from "@/components/Hero";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { ProductGrid } from "@/components/ProductGrid";
import { StorySection } from "@/components/StorySection";
import { BrandValues } from "@/components/BrandValues";
import { ApplicationSection } from "@/components/ApplicationSection";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { getPublishedProducts, getPublishedCategories } from "@/lib/db/catalogue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Fetch all published products from MongoDB Atlas
  const allProducts = await getPublishedProducts();
  const dbCategories = await getPublishedCategories();
  const categoriesList = [
    { id: "all", label: "ALL CRYSTALS" },
    ...dbCategories.map((c) => ({
      id: c.slug.includes("set") ? "sets" : c.slug,
      label: c.name.toUpperCase(),
    })),
  ];

  return (
    <>
      {/* 1. Hero Section - LOCKED */}
      <Hero />

      {/* 2. Shop Categories - Database Driven */}
      <CategoryShowcase />

      {/* 3. Product Collection (Choose Your Sparkle) - Database Driven */}
      <ProductGrid
        limit={6}
        initialProducts={allProducts}
        categoriesList={categoriesList}
      />

      {/* 4. Editorial Story ("It Started With A Little Sparkle") - LOCKED */}
      <StorySection />

      {/* 5. Brand Values (Curated, Professional, Premium, Nationwide) - LOCKED */}
      <BrandValues />

      {/* 6. Chennai Application (Dr. Suprasna Sharan, T. Nagar) - LOCKED */}
      <ApplicationSection />

      {/* 7. Accessible FAQ Accordion - LOCKED */}
      <FAQ />

      {/* 8. Cinematic Final CTA - LOCKED */}
      <FinalCTA />
    </>
  );
}
