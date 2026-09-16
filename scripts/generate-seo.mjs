import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const siteUrl = (process.env.SITE_URL || "http://localhost:4173").replace(/\/$/, "");
const production = siteUrl === "https://sarkshfoods.in";
const googleVerification = (process.env.GOOGLE_SITE_VERIFICATION || "").trim();

const pages = [
  {
    path: "/",
    title: "SARKSH Foods | Premium Red Chilli Powder in India",
    description: "Discover SARKSH Foods premium red chilli powder in a 1 kg carton for home, retail, wholesale, HoReCa, distribution and institutional enquiries across India.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
  },
  {
    path: "/chilli-powder/",
    title: "Premium Red Chilli Powder 1 kg in India | SARKSH Foods",
    description: "Explore SARKSH Foods premium red chilli powder in a 1 kg carton. Order for home or send retail, wholesale, HoReCa and distribution requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "product",
  },
  {
    path: "/products/",
    title: "Chilli Powder Products in India | SARKSH Foods",
    description: "Explore SARKSH Foods chilli powder, starting with our 1 kg red chilli powder carton for household and commercial requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
  },
  {
    path: "/products/chilli-powder/",
    title: "SARKSH Foods Chilli Powder 1 kg | Product Details",
    description: "View SARKSH Foods red chilli powder 1 kg carton details, product highlights and ordering routes for home and business buyers across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "product",
    canonicalPath: "/chilli-powder/",
  },
  {
    path: "/enterprise/",
    title: "Bulk Red Chilli Powder Supplier in India | SARKSH Foods",
    description: "Send bulk red chilli powder requirements to SARKSH Foods for retail, wholesale, distribution, HoReCa and institutional supply enquiries across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
  },
  {
    path: "/about/",
    title: "About SARKSH Foods | Indian Food Brand | Legacy of Elegance",
    description: "Learn about SARKSH Foods, the heritage-led Indian food brand behind SARKSH Foods Chilli Powder and the Legacy of Elegance identity.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
  },
  {
    path: "/contact/",
    title: "Contact SARKSH Foods | Chilli Powder Orders & Business Enquiries",
    description: "Contact SARKSH Foods for red chilli powder home orders, retail, wholesale, HoReCa, distribution and institutional requirements across India.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
  },
  {
    path: "/privacy/",
    title: "Privacy Policy | SARKSH Foods",
    description: "Read how SARKSH Foods handles information submitted through product orders and business enquiry forms on sarkshfoods.in.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
  },
  {
    path: "/pan-india/",
    title: "Red Chilli Powder Supply Across India | SARKSH Foods",
    description: "SARKSH Foods accepts red chilli powder order and commercial supply enquiries across Indian states, union territories and major cities, subject to serviceability.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
  },
  {
    path: "/account/",
    title: "My SARKSH | Customer Account",
    description: "Private SARKSH Foods customer account for products, saved addresses, order history and repeat ordering.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    noindex: true,
  },
  {
    path: "/admin/",
    title: "SARKSH Foods Admin",
    description: "Private SARKSH Foods production administration portal.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    noindex: true,
  },
];

const INDIA_AREAS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
].map((name) => ({ "@type": "AdministrativeArea", name }));

const org = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "SARKSH Foods",
  slogan: "Legacy of Elegance",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
  image: `${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg`,
  areaServed: { "@type": "Country", name: "India" },
  identifier: {
    "@type": "PropertyValue",
    name: "FSSAI Registration Number",
    value: "23626023001557",
  },
  knowsAbout: ["Chilli Powder", "Red Chilli Powder", "Ground Spices", "Retail Food Supply", "HoReCa Food Supply"],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: `${siteUrl}/`,
  name: "SARKSH Foods",
  alternateName: "SARKSH Foods — Legacy of Elegance",
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: "en-IN",
};

function breadcrumb(path) {
  const map = {
    "/chilli-powder/": "Chilli Powder",
    "/products/": "Products",
    "/products/chilli-powder/": "Chilli Powder",
    "/enterprise/": "Business",
    "/about/": "Our Story",
    "/contact/": "Contact",
    "/privacy/": "Privacy",
    "/pan-india/": "Pan-India Supply",
  };
  if (path === "/") return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: map[path] || "SARKSH Foods", item: `${siteUrl}${path}` },
    ],
  };
}

function webPageSchema(page) {
  const canonicalPath = page.canonicalPath || page.path;
  const type = page.path === "/about/" ? "AboutPage" : page.path === "/contact/" ? "ContactPage" : "WebPage";
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${siteUrl}${canonicalPath}#webpage`,
    url: `${siteUrl}${canonicalPath}`,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-IN",
  };
}

function pageSchema(page) {
  if (page.noindex) return [];
  if (page.path === "/") {
    return [org, { ...website, description: page.description }, webPageSchema(page)];
  }

  const items = [org, website, webPageSchema(page)];
  const crumb = breadcrumb(page.path);
  if (crumb) items.push(crumb);

  if (page.path === "/chilli-powder/" || page.path === "/products/chilli-powder/") {
    items.push({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${siteUrl}/chilli-powder/#product`,
      name: "SARKSH Foods Chilli Powder 1 kg",
      alternateName: ["SARKSH Foods Red Chilli Powder 1 kg", "SARKSH Foods Chili Powder 1 kg"],
      url: `${siteUrl}/chilli-powder/`,
      description: "SARKSH Foods red chilli powder in a 1 kg carton for household and commercial requirements across India.",
      image: [`${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp`, `${siteUrl}/assets/chilli-pack-front.webp`],
      category: "Ground spices > Chilli powder",
      size: "1 kg",
      brand: { "@type": "Brand", name: "SARKSH Foods" },
      mainEntityOfPage: { "@id": `${siteUrl}/chilli-powder/#webpage` },
      additionalProperty: [
        { "@type": "PropertyValue", name: "Pack size", value: "1 kg" },
        { "@type": "PropertyValue", name: "Supply area", value: "India" },
        { "@type": "PropertyValue", name: "On-pack statement", value: "100% Pure & Natural" },
        { "@type": "PropertyValue", name: "On-pack statement", value: "Rich Colour · Bold Flavour" },
        { "@type": "PropertyValue", name: "On-pack statement", value: "No Added Preservatives" },
      ],
    });

    if (page.path === "/chilli-powder/") {
      items.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${siteUrl}/chilli-powder/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What pack size is available?",
            acceptedAnswer: { "@type": "Answer", text: "The current SARKSH Foods Chilli Powder pack is a 1 kg carton." },
          },
          {
            "@type": "Question",
            name: "Can businesses order SARKSH Foods Chilli Powder?",
            acceptedAnswer: { "@type": "Answer", text: "Yes. Retailers, wholesalers, distributors, HoReCa buyers and institutions can submit commercial quantity requirements." },
          },
          {
            "@type": "Question",
            name: "Where does SARKSH Foods supply chilli powder?",
            acceptedAnswer: { "@type": "Answer", text: "SARKSH Foods accepts pan-India enquiries, with final delivery subject to serviceability and order confirmation." },
          },
        ],
      });
    }
  }

  if (page.path === "/enterprise/") {
    items.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "SARKSH Foods Business Red Chilli Powder Supply",
      serviceType: "Retail, wholesale, HoReCa, distribution and institutional red chilli powder supply enquiries",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      url: `${siteUrl}/enterprise/`,
    });
  }

  if (page.path === "/pan-india/") {
    items.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "SARKSH Foods Pan-India Red Chilli Powder Supply",
      serviceType: "Red chilli powder order and commercial supply enquiries",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: [{ "@type": "Country", name: "India" }, ...INDIA_AREAS],
      url: `${siteUrl}/pan-india/`,
    });
  }

  return items;
}

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render(page) {
  const canonicalPath = page.canonicalPath || page.path;
  const canonical = `${siteUrl}${canonicalPath}`;
  const image = `${siteUrl}${page.image}`;
  const robots = page.noindex ? "noindex,nofollow,noarchive" : production ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow";
  const schemas = pageSchema(page).map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n    ");
  const verification = production && googleVerification
    ? `<meta name="google-site-verification" content="${escapeAttr(googleVerification)}" />`
    : "";
  const head = `
    <title>${escapeAttr(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    <meta name="author" content="SARKSH Foods" />
    <meta name="application-name" content="SARKSH Foods" />
    ${verification}
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="en-IN" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="SARKSH Foods" />
    <meta property="og:type" content="${page.type}" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(page.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:alt" content="SARKSH Foods Chilli Powder and brand identity" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(page.title)}" />
    <meta name="twitter:description" content="${escapeAttr(page.description)}" />
    <meta name="twitter:image" content="${image}" />
    ${schemas}`;

  const fallback = `<noscript><main style="max-width:900px;margin:48px auto;padding:24px;font-family:Georgia,serif;color:#3b0908"><h1>${escapeAttr(page.title)}</h1><p>${escapeAttr(page.description)}</p><p><a href="${siteUrl}/chilli-powder/">Chilli Powder</a> · <a href="${siteUrl}/enterprise/">Business Orders</a> · <a href="${siteUrl}/pan-india/">Pan-India Supply</a> · <a href="${siteUrl}/contact/">Contact</a></p></main></noscript>`;

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/i, "")
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app"></div>${fallback}`);
}

for (const page of pages) {
  const out = page.path === "/" ? resolve(dist, "index.html") : resolve(dist, page.path.slice(1), "index.html");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, render(page), "utf8");
}

const sitemapPages = pages.filter((page) => !page.canonicalPath && !page.noindex);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPages
  .map((page) => `  <url><loc>${siteUrl}${page.path}</loc><changefreq>${page.path === "/" || page.path === "/chilli-powder/" ? "weekly" : "monthly"}</changefreq><priority>${page.path === "/" ? "1.0" : page.path === "/chilli-powder/" ? "0.9" : page.path === "/enterprise/" || page.path === "/pan-india/" ? "0.8" : "0.7"}</priority></url>`)
  .join("\n")}\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap.xml"), sitemap, "utf8");

const robots = production
  ? `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  : `User-agent: *\nDisallow: /\n`;
await writeFile(resolve(dist, "robots.txt"), robots, "utf8");

const llms = `# SARKSH Foods\n\n> Legacy of Elegance. SARKSH Foods is an Indian packaged-food brand currently offering Chilli Powder in a 1 kg carton.\n\n## Official website\n- ${siteUrl}/\n\n## Core pages\n- ${siteUrl}/chilli-powder/ — SARKSH Foods Chilli Powder 1 kg product information and ordering\n- ${siteUrl}/enterprise/ — retail, wholesale, HoReCa, distribution and institutional enquiries\n- ${siteUrl}/pan-india/ — India-wide supply coverage\n- ${siteUrl}/about/ — brand story\n- ${siteUrl}/contact/ — contact and enquiries\n- ${siteUrl}/privacy/ — privacy information\n\n## Verified business information used on the site\n- FSSAI Registration No.: 23626023001557\n- Current product: SARKSH Foods Chilli Powder, 1 kg carton\n- Product category: chilli powder / red chilli powder / ground spice\n- Supply positioning: pan-India enquiries, subject to final serviceability and delivery confirmation\n\n## Brand\n- Name: SARKSH Foods\n- Tagline: Legacy of Elegance\n- Canonical domain: ${siteUrl}\n`;
await writeFile(resolve(dist, "llms.txt"), llms, "utf8");

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));
console.log(`SEO pages generated for ${production ? siteUrl : "local verification (noindex)"}.`);
