import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";
import { CustomerDrawer } from "@/components/CustomerDrawer";
import { siteConfig } from "@/data/site";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#02281E",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://halosmiles.co"),
  title: "HALO | Swarovski® Tooth Crystals for Dentists in India",
  description:
    "Shop Swarovski® tooth crystals and professional tooth gem supplies for dental professionals. HALO supplies curated tooth crystals to dentists across India.",
  keywords: [
    "tooth crystals for dentists",
    "tooth gem supplies",
    "tooth crystal supplier India",
    "tooth gem wholesale India",
    "Swarovski® tooth crystals",
    "professional tooth gems",
    "dental tooth gem supplies",
    "tooth crystals wholesale",
    "tooth gem supplies India",
    "tooth gems for dentists India",
    "tooth gem application Chennai",
    "tooth gems Chennai",
  ],
  authors: [{ name: "HALO Smiles & Dr. Suprasna Sharan" }],
  creator: "HALO",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://halosmiles.co",
    siteName: "HALO",
    title: "HALO | Swarovski® Tooth Crystals for Dentists in India",
    description:
      "Shop Swarovski® tooth crystals and professional tooth gem supplies for dental professionals. HALO supplies curated tooth crystals to dentists across India.",
    images: [
      {
        url: "/images/editorial-smile.jpg",
        width: 1200,
        height: 630,
        alt: "HALO Swarovski® Tooth Crystals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HALO | Swarovski® Tooth Crystals for Dentists in India",
    description:
      "Shop Swarovski® tooth crystals and professional tooth gem supplies for dental professionals. Curated by a dentist, made for dentists.",
    images: ["/images/editorial-smile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[#F4EEE4] text-[#1C211E] antialiased selection:bg-[#063C2D] selection:text-[#F4EEE4]">
        <CustomerAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
              <CartDrawer />
              <AuthModal />
              <CustomerDrawer />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
