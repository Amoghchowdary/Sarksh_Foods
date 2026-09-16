export type Product = {
  slug: string;
  name: string;
  category: string;
  eyebrow: string;
  tagline: string;
  description: string;
  weight: string;
  image: string;
  status: string;
  highlights: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "chilli-powder",
    name: "Chilli Powder",
    category: "Ground Spice",
    eyebrow: "SARKSH Foods · Chilli Powder",
    tagline: "Bold colour. Full flavour. Distinctly SARKSH.",
    description: "A 1 kg chilli powder carton created for everyday cooking, retail shelves and professional kitchens, with direct order routes for home and business buyers.",
    weight: "1 kg",
    image: "/assets/chilli-pack-front.webp",
    status: "Order enquiries open",
    highlights: ["1 kg carton", "Home order requests", "Business order requests"],
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((product) => product.slug === slug);

export const BRAND = { name: "SARKSH Foods", tagline: "Legacy of Elegance" };
