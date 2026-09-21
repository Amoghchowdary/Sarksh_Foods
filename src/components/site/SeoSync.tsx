import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const PRIMARY_ORIGIN = "https://www.sarkshfoods.in";

type SeoEntry = { title: string; description: string; image?: string; canonicalPath?: string; noindex?: boolean };

const SEO: Record<string, SeoEntry> = {
  "/": {
    title: "SARKSH Foods | Red Chilli Powder & Premium Chilli Powder India",
    description: "Discover SARKSH Foods premium red chilli powder (chili powder) in a 1 kg carton for home, retail, wholesale, HoReCa, distribution and institutional requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
  },
  "/chilli-powder": {
    title: "SARKSH Foods Red Chilli Powder 1 kg | Premium Chilli Powder India",
    description: "Explore SARKSH Foods red chilli powder, also searched as chili powder, in a 1 kg carton for home and business requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
  },
  "/products": {
    title: "SARKSH Foods Chilli Powder Products in India",
    description: "Explore SARKSH Foods chilli powder products, starting with the 1 kg red chilli powder carton for household and commercial requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
  },
  "/products/chilli-powder": {
    title: "SARKSH Foods Chilli Powder 1 kg | Product Details",
    description: "View SARKSH Foods red chilli powder 1 kg carton details, product highlights and ordering routes for home and business buyers.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    canonicalPath: "/chilli-powder/",
  },
  "/enterprise": {
    title: "Bulk Red Chilli Powder Supplier in India | SARKSH Foods",
    description: "Send bulk red chilli powder requirements to SARKSH Foods for retail, wholesale, distribution, HoReCa and institutional supply enquiries across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
  },
  "/about": {
    title: "SARKSH Foods Brand | About SARKSH Foods — Legacy of Elegance",
    description: "Learn about SARKSH Foods, the Indian packaged-food brand behind SARKSH Foods Chilli Powder and the Legacy of Elegance identity.",
    image: "/assets/logos/sarksh-foods-logo.svg",
  },
  "/contact": {
    title: "Contact SARKSH Foods | Chilli Powder Orders & Enquiries",
    description: "Contact SARKSH Foods for red chilli powder home orders, retail, wholesale, HoReCa, distribution and institutional requirements across India.",
    image: "/assets/logos/sarksh-foods-logo.svg",
  },
  "/privacy": {
    title: "Privacy Policy | SARKSH Foods",
    description: "Read how SARKSH Foods handles information submitted through product orders, customer accounts and business enquiry forms.",
    image: "/assets/logos/sarksh-foods-logo.svg",
  },
  "/pan-india": {
    title: "Red Chilli Powder Supply Across India | SARKSH Foods",
    description: "SARKSH Foods accepts red chilli powder order and commercial supply enquiries across Indian states, union territories and major cities, subject to serviceability.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
  },
  "/account": {
    title: "My SARKSH | Customer Account",
    description: "Private SARKSH Foods customer account for products, orders, saved addresses and order history.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    noindex: true,
  },
  "/admin": {
    title: "SARKSH Foods Admin",
    description: "Private SARKSH Foods production administration portal.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    noindex: true,
  },
};

function ensureMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    document.head.appendChild(element);
  }
  return element;
}

function ensureLink(rel: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  return element;
}

export function SeoSync() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
    const seo = SEO[normalized] || SEO["/"];
    const canonicalPath = seo.canonicalPath || (normalized === "/" ? "/" : `${normalized}/`);
    const canonical = `${PRIMARY_ORIGIN}${canonicalPath}`;
    const image = `${PRIMARY_ORIGIN}${seo.image || "/assets/sarksh-foods-chilli-powder-og.jpg"}`;
    const isProductionHost = window.location.hostname === "www.sarkshfoods.in" || window.location.hostname === "sarkshfoods.in";
    const robotsValue = seo.noindex
      ? "noindex,nofollow,noarchive"
      : isProductionHost
        ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        : "noindex,nofollow";

    document.title = seo.title;
    ensureMeta('meta[name="description"]', { name: "description" }).content = seo.description;
    ensureMeta('meta[name="robots"]', { name: "robots" }).content = robotsValue;
    ensureMeta('meta[name="googlebot"]', { name: "googlebot" }).content = robotsValue;

    const canonicalLink = ensureLink("canonical");
    canonicalLink.href = canonical;

    ensureMeta('meta[property="og:title"]', { property: "og:title" }).content = seo.title;
    ensureMeta('meta[property="og:description"]', { property: "og:description" }).content = seo.description;
    ensureMeta('meta[property="og:url"]', { property: "og:url" }).content = canonical;
    ensureMeta('meta[property="og:image"]', { property: "og:image" }).content = image;
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }).content = seo.title;
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" }).content = seo.description;
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image" }).content = image;
  }, [pathname]);

  return null;
}
