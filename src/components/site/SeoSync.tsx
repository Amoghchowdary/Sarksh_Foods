import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

const SITE_URL = "https://www.sarkshfoods.in";

const SEO: Record<string, { title: string; description: string; canonical?: string; noindex?: boolean }> = {
  "/": {
    title: "SARKSH Foods | Premium Red Chilli Powder in India",
    description: "SARKSH Foods premium red chilli powder in a 1 kg carton for home orders and retail, wholesale, HoReCa, distribution and institutional enquiries across India.",
  },
  "/chilli-powder": {
    title: "Premium Red Chilli Powder 1 kg in India | SARKSH Foods",
    description: "Explore SARKSH Foods premium red chilli powder in a 1 kg carton, including product details, pack information and home or business ordering routes across India.",
  },
  "/products": {
    title: "Chilli Powder Products in India | SARKSH Foods",
    description: "Explore SARKSH Foods chilli powder products, beginning with the 1 kg red chilli powder carton for household and commercial requirements across India.",
  },
  "/products/chilli-powder": {
    title: "SARKSH Foods Chilli Powder 1 kg | Product Details",
    description: "View SARKSH Foods red chilli powder 1 kg carton details, product highlights and ordering routes for home and business buyers.",
    canonical: "/chilli-powder/",
  },
  "/enterprise": {
    title: "Bulk Red Chilli Powder Enquiries in India | SARKSH Foods",
    description: "Send SARKSH Foods red chilli powder requirements for retail, wholesale, HoReCa, distribution and institutional supply enquiries across India.",
  },
  "/about": {
    title: "About SARKSH Foods | Legacy of Elegance",
    description: "Learn about SARKSH Foods, the Indian packaged-food brand behind SARKSH Foods Chilli Powder and the Legacy of Elegance identity.",
  },
  "/contact": {
    title: "Contact SARKSH Foods | Chilli Powder Orders & Enquiries",
    description: "Contact SARKSH Foods for chilli powder home orders and retail, wholesale, HoReCa, distribution or institutional requirements.",
  },
  "/privacy": {
    title: "Privacy Policy | SARKSH Foods",
    description: "Read how SARKSH Foods handles information submitted through product orders, customer accounts and business enquiry forms.",
  },
  "/pan-india": {
    title: "Red Chilli Powder Supply Enquiries Across India | SARKSH Foods",
    description: "SARKSH Foods accepts red chilli powder home-order and commercial supply enquiries across India, subject to serviceability and confirmation.",
  },
  "/account": {
    title: "My SARKSH | Customer Account",
    description: "Private SARKSH Foods customer account for products, saved addresses, order history and repeat ordering.",
    noindex: true,
  },
  "/admin": {
    title: "SARKSH Foods Admin",
    description: "Private SARKSH Foods administration portal.",
    noindex: true,
  },
};

function upsertMeta(selector: string, attr: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
}

export function SeoSync() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
    const seo = SEO[normalized] || SEO["/"];
    const canonicalPath = seo.canonical || (normalized === "/" ? "/" : `${normalized}/`);
    const canonical = `${SITE_URL}${canonicalPath}`;

    document.title = seo.title;
    upsertMeta('meta[name="description"]', "content", seo.description);
    upsertMeta('meta[name="robots"]', "content", seo.noindex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMeta('meta[property="og:title"]', "content", seo.title);
    upsertMeta('meta[property="og:description"]', "content", seo.description);
    upsertMeta('meta[property="og:url"]', "content", canonical);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname]);

  return null;
}
