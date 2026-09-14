export interface Product {
  id: string;
  slug: string;
  name: string;
  article: string;
  image: string;
  images?: string[];
  size: string;
  availableSizes?: string[];
  colour: string;
  price: number;
  packQuantity: string;
  category: string;
  categorySlug?: string;
  categoryId?: any;
  description: string;
  backing: string;
  application: string;
  features: string[];
}

export const products: Product[] = [
  {
    id: "halo-001",
    slug: "swarovski-2088-crystal-clear",
    name: "Swarovski® 2088 XIRIUS Rose — Crystal Clear",
    article: "2088 XIRIUS Rose",
    image: "/images/crystal-clear.jpg",
    size: "SS5 (1.8mm)",
    availableSizes: ["SS3 (1.4mm)", "SS5 (1.8mm)", "SS7 (2.2mm)", "SS9 (2.6mm)"],
    colour: "Crystal (Pure Diamond)",
    price: 1650,
    packQuantity: "10 crystals",
    category: "individual",
    backing: "Platinum foiling, where applicable",
    application: "Professional dental application",
    description:
      "Swarovski® Flat Backs No Hotfix are loose crystal components with platinum foiling for added brilliance and protection. The 2088 XIRIUS Rose cut features multifaceted geometry designed to maximize light refraction within the oral cavity.",
    features: [
      "Genuine Swarovski® crystal components",
      "Sourced through an authorised Swarovski® distribution partner",
      "Precision round flat back no hotfix",
      "Platinum foiling for brilliant optical refraction and enamel bonding protection",
      "10 crystals per sealed clinical blister pack",
    ],
  },
  {
    id: "halo-002",
    slug: "swarovski-2088-crystal-ab",
    name: "Swarovski® 2088 XIRIUS Rose — Crystal AB",
    article: "2088 XIRIUS Rose",
    image: "/images/crystal-ab.jpg",
    size: "SS5 (1.8mm)",
    availableSizes: ["SS3 (1.4mm)", "SS5 (1.8mm)", "SS7 (2.2mm)"],
    colour: "Crystal AB (Aurore Boreale)",
    price: 1850,
    packQuantity: "10 crystals",
    category: "individual",
    backing: "Platinum foiling, where applicable",
    application: "Professional dental application",
    description:
      "Aurore Boreale coating creates an iridescent pastel shimmer that delicately catches dental operatory and ambient natural light with whispers of soft gold, rose and azure.",
    features: [
      "Genuine Swarovski® crystal components",
      "Sourced through an authorised Swarovski® distribution partner",
      "Signature Swarovski® iridescent AB coating",
      "High-adhesion flat backing for dental composite bonding",
      "10 crystals per clinical blister pack",
    ],
  },
  {
    id: "halo-003",
    slug: "swarovski-2058-golden-shadow",
    name: "Swarovski® 2058 XILION Rose — Golden Shadow",
    article: "2058 XILION Rose",
    image: "/images/crystal-gold.jpg",
    size: "SS5 (1.8mm)",
    availableSizes: ["SS5 (1.8mm)", "SS7 (2.2mm)"],
    colour: "Golden Shadow (Warm Champagne)",
    price: 1750,
    packQuantity: "10 crystals",
    category: "individual",
    backing: "Platinum foiling, where applicable",
    application: "Professional dental application",
    description:
      "A warm champagne gold crystal tone crafted for subtle, high-fashion dental aesthetics. Ideal for warm enamel tones and discreet elegance in smile design.",
    features: [
      "Genuine Swarovski® crystal components",
      "Sourced through an authorised Swarovski® distribution partner",
      "Warm champagne gold hue with multi-angled facets",
      "Platinum foiling backing",
      "10 crystals per clinical blister pack",
    ],
  },
  {
    id: "halo-004",
    slug: "swarovski-2088-crystal-clear-ss3",
    name: "Swarovski® 2088 XIRIUS Rose — Micro SS3",
    article: "2088 XIRIUS Rose",
    image: "/images/crystal-individual.jpg",
    size: "SS3 (1.4mm)",
    availableSizes: ["SS3 (1.4mm)"],
    colour: "Crystal (Pure Diamond)",
    price: 1550,
    packQuantity: "10 crystals",
    category: "individual",
    backing: "Platinum foiling, where applicable",
    application: "Professional dental application",
    description:
      "The delicate 1.4mm micro dimension is the preferred clinical size for subtle tooth placements, canines, and composite smile accents.",
    features: [
      "Genuine Swarovski® crystal components",
      "Ultra-compact 1.4mm profile for minimal occlusion interference",
      "High brilliance 2088 XIRIUS geometric facet cut",
      "Sealed clinical packaging of 10 crystals",
    ],
  },
  {
    id: "halo-005",
    slug: "halo-curated-starter-kit",
    name: "HALO Curated Dental Starter Kit",
    article: "Curated Practice Selection",
    image: "/images/halo-sets.jpg",
    size: "Curated Assortment (SS3, SS5, SS7)",
    colour: "Crystal Clear & Crystal AB",
    price: 4950,
    packQuantity: "30 crystals (3 blister packs of 10)",
    category: "sets",
    backing: "Platinum foiling on all components",
    application: "Professional dental application",
    description:
      "An essential clinic curation featuring the most-requested crystal sizes and finishes: 10× SS3 Crystal, 10× SS5 Crystal, and 10× SS5 Crystal AB, complete with clinical placement protocol guide.",
    features: [
      "30 genuine Swarovski® tooth crystals (3 blister packs)",
      "Comprehensive clinical protocol manual for dentists",
      "Authorised distribution partner provenance",
      "Sterile-packaged blister protection",
      "Complimentary clinic display card",
    ],
  },
  {
    id: "halo-006",
    slug: "halo-master-aesthetic-suite",
    name: "HALO Master Aesthetic Clinic Suite",
    article: "Full Practice Curation",
    image: "/images/halo-sets.jpg",
    size: "Comprehensive (SS3, SS5, SS7, SS9)",
    colour: "Crystal Clear, Crystal AB & Golden Shadow",
    price: 8400,
    packQuantity: "50 crystals (5 blister packs of 10)",
    category: "sets",
    backing: "Platinum foiling on all components",
    application: "Professional dental application",
    description:
      "Designed for dedicated aesthetic dental practices and cosmetic studios. Includes 50 crystals spanning clear diamonds, rainbow AB, and warm champagne golden shadow, along with marketing collateral and patient consultation guidance.",
    features: [
      "50 genuine Swarovski® tooth crystals in 5 clinical packs",
      "Full spectrum of sizes from micro 1.4mm to statement 2.6mm",
      "Patient smile consultation shade match guide",
      "Step-by-step clinical etching & bonding protocols",
      "Insured express dispatch across India",
    ],
  },
];
