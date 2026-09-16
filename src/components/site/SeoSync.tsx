import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "SARKSH Foods | Premium Red Chilli Powder in India",
    description: "Discover SARKSH Foods premium red chilli powder in a 1 kg carton for home, retail, wholesale, HoReCa, distribution and institutional enquiries across India.",
  },
  "/chilli-powder": {
    title: "Premium Red Chilli Powder 1 kg in India | SARKSH Foods",
    description: "Explore SARKSH Foods premium red chilli powder in a 1 kg carton. Order for home or send retail, wholesale, HoReCa and distribution requirements across India.",
  },
  "/products": {
    title: "Chilli Powder Products in India | SARKSH Foods",
    description: "Explore SARKSH Foods chilli powder, starting with our 1 kg red chilli powder carton for household and commercial requirements across India.",
  },
  "/products/chilli-powder": {
    title: "SARKSH Foods Chilli Powder 1 kg | Product Details",
    description: "View SARKSH Foods Chilli Powder 1 kg carton details, on-pack highlights and ordering routes for home and business buyers.",
  },
  "/enterprise": {
    title: "Bulk Red Chilli Powder Supplier in India | SARKSH Foods",
    description: "Send bulk red chilli powder requirements to SARKSH Foods for retail, wholesale, distribution, HoReCa and institutional supply enquiries across India.",
  },
  "/about": {
    title: "About SARKSH Foods | Indian Food Brand | Legacy of Elegance",
    description: "Learn about SARKSH Foods, the heritage-led food brand behind SARKSH Foods Chilli Powder and the Legacy of Elegance identity.",
  },
  "/contact": {
    title: "Contact SARKSH Foods | Chilli Powder Orders & Enquiries",
    description: "Contact SARKSH Foods for chilli powder home orders, retail, wholesale, HoReCa, distribution and institutional requirements across India.",
  },
  "/privacy": {
    title: "Privacy | SARKSH Foods",
    description: "Read how SARKSH Foods handles information submitted through product orders and business enquiry forms.",
  },
  "/pan-india": {
    title: "Red Chilli Powder Supply Across India | SARKSH Foods",
    description: "SARKSH Foods accepts red chilli powder order and commercial supply enquiries across Indian states, union territories and major cities, subject to serviceability.",
  },
  "/account": {
    title: "My SARKSH | Customer Account",
    description: "Private SARKSH Foods customer account for products, orders, saved addresses and order history.",
  },
  "/admin": {
    title: "SARKSH Foods Admin",
    description: "Private SARKSH Foods production administration portal.",
  },
};

export function SeoSync() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
    const seo = SEO[normalized] || SEO["/"];
    document.title = seo.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = seo.description;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots) robots.content = normalized.startsWith("/admin") || normalized.startsWith("/account") ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
  }, [pathname]);

  return null;
}
