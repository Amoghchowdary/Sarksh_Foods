import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const PRIMARY_ORIGIN = "https://www.sarkshfoods.in";
const siteUrl = (process.env.SITE_URL || "http://localhost:4173").replace(/\/$/, "");
const production = siteUrl === PRIMARY_ORIGIN;
const googleVerification = (process.env.GOOGLE_SITE_VERIFICATION || "").trim();
const buildDate = new Date().toISOString().slice(0, 10);

const pages = [
  {
    path: "/",
    title: "SARKSH Foods | Red Chilli Powder & Premium Chilli Powder India",
    description: "Discover SARKSH Foods premium red chilli powder (chili powder) in a 1 kg carton for home, retail, wholesale, HoReCa, distribution and institutional requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
    h1: "SARKSH Foods Premium Red Chilli Powder in India",
    summary: "SARKSH Foods is an Indian packaged-food brand. The current range begins with SARKSH Foods Chilli Powder, a 1 kg red chilli powder carton available through home-order and business-enquiry routes across India.",
    links: [["/chilli-powder/", "SARKSH Foods Chilli Powder"], ["/products/", "Products"], ["/enterprise/", "Business orders"], ["/about/", "About SARKSH Foods"]],
  },
  {
    path: "/chilli-powder/",
    title: "SARKSH Foods Red Chilli Powder 1 kg | Premium Chilli Powder India",
    description: "Explore SARKSH Foods red chilli powder, also searched as chili powder, in a 1 kg carton for home, retail, wholesale, HoReCa and distribution requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "product",
    h1: "SARKSH Foods Chilli Powder — Premium Red Chilli Powder 1 kg",
    summary: "SARKSH Foods Chilli Powder is a 1 kg ground-spice carton for household and commercial requirements. The product page covers pack information, ordering routes, pan-India enquiries and commonly asked questions.",
    links: [["/", "SARKSH Foods"], ["/enterprise/", "Bulk and business orders"], ["/pan-india/", "Pan-India supply"], ["/contact/", "Contact"]],
  },
  {
    path: "/products/",
    title: "SARKSH Foods Chilli Powder Products in India",
    description: "Explore SARKSH Foods chilli powder products, starting with the 1 kg red chilli powder carton for household and commercial requirements across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
    h1: "SARKSH Foods Products",
    summary: "Explore the SARKSH Foods product range, beginning with SARKSH Foods Chilli Powder in a 1 kg carton for home and business requirements.",
    links: [["/chilli-powder/", "Red Chilli Powder 1 kg"], ["/enterprise/", "Business orders"], ["/contact/", "Contact SARKSH Foods"]],
  },
  {
    path: "/products/chilli-powder/",
    title: "SARKSH Foods Chilli Powder 1 kg | Product Details",
    description: "View SARKSH Foods red chilli powder 1 kg carton details, product highlights and ordering routes for home and business buyers across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "product",
    canonicalPath: "/chilli-powder/",
    h1: "SARKSH Foods Chilli Powder 1 kg",
    summary: "Product details for the SARKSH Foods 1 kg red chilli powder carton.",
    links: [["/chilli-powder/", "Canonical chilli powder page"]],
  },
  {
    path: "/enterprise/",
    title: "Bulk Red Chilli Powder Supplier in India | SARKSH Foods",
    description: "Send bulk red chilli powder requirements to SARKSH Foods for retail, wholesale, distribution, HoReCa and institutional supply enquiries across India.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
    h1: "SARKSH Foods Bulk Red Chilli Powder Enquiries",
    summary: "SARKSH Foods accepts commercial chilli powder requirements from retailers, wholesalers, distributors, HoReCa buyers and institutions across India, subject to serviceability and order confirmation.",
    links: [["/chilli-powder/", "Chilli Powder 1 kg"], ["/pan-india/", "Pan-India supply"], ["/contact/", "Send an enquiry"]],
  },
  {
    path: "/about/",
    title: "SARKSH Foods Brand | About SARKSH Foods — Legacy of Elegance",
    description: "Learn about SARKSH Foods, the Indian packaged-food brand behind SARKSH Foods Chilli Powder and the Legacy of Elegance identity.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    h1: "About SARKSH Foods",
    summary: "SARKSH Foods is the brand behind the Legacy of Elegance identity and the current SARKSH Foods Chilli Powder product line.",
    links: [["/chilli-powder/", "SARKSH Foods Chilli Powder"], ["/contact/", "Contact SARKSH Foods"]],
  },
  {
    path: "/contact/",
    title: "Contact SARKSH Foods | Chilli Powder Orders & Enquiries",
    description: "Contact SARKSH Foods for red chilli powder home orders, retail, wholesale, HoReCa, distribution and institutional requirements across India.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    h1: "Contact SARKSH Foods",
    summary: "Contact SARKSH Foods for Chilli Powder orders, business requirements and distribution enquiries.",
    links: [["/chilli-powder/", "Chilli Powder"], ["/enterprise/", "Business orders"]],
  },
  {
    path: "/privacy/",
    title: "Privacy Policy | SARKSH Foods",
    description: "Read how SARKSH Foods handles information submitted through product orders, customer accounts and business enquiry forms on sarkshfoods.in.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    h1: "SARKSH Foods Privacy Policy",
    summary: "Privacy information for SARKSH Foods website forms and customer-account data.",
    links: [["/", "SARKSH Foods home"], ["/contact/", "Contact"]],
  },
  {
    path: "/pan-india/",
    title: "Red Chilli Powder Supply Across India | SARKSH Foods",
    description: "SARKSH Foods accepts red chilli powder order and commercial supply enquiries across Indian states, union territories and major cities, subject to serviceability.",
    image: "/assets/sarksh-foods-chilli-powder-og.jpg",
    type: "website",
    h1: "SARKSH Foods Red Chilli Powder Supply Across India",
    summary: "SARKSH Foods accepts red chilli powder and chilli powder supply enquiries across India, subject to final serviceability and delivery confirmation.",
    links: [["/chilli-powder/", "Chilli Powder 1 kg"], ["/enterprise/", "Business orders"], ["/contact/", "Contact"]],
  },
  {
    path: "/account/",
    title: "My SARKSH | Customer Account",
    description: "Private SARKSH Foods customer account for products, saved addresses, order history and repeat ordering.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    noindex: true,
    h1: "My SARKSH Customer Account",
    summary: "Private customer sign-in area.",
    links: [["/", "Return to SARKSH Foods"]],
  },
  {
    path: "/admin/",
    title: "SARKSH Foods Admin",
    description: "Private SARKSH Foods production administration portal.",
    image: "/assets/logos/sarksh-foods-logo.svg",
    type: "website",
    noindex: true,
    h1: "SARKSH Foods Admin",
    summary: "Private administration area.",
    links: [["/", "Return to SARKSH Foods"]],
  },
];

const INDIA_AREAS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
].map((name) => ({ "@type": "AdministrativeArea", name }));

const brand = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": `${siteUrl}/#brand`,
  name: "SARKSH Foods",
  alternateName: "SARKSH",
  slogan: "Legacy of Elegance",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
};

const org = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${siteUrl}/#organization`,
  name: "SARKSH Foods",
  alternateName: ["SARKSH", "SARKSH Foods — Legacy of Elegance"],
  slogan: "Legacy of Elegance",
  url: `${siteUrl}/`,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
    contentUrl: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
    width: 500,
    height: 500,
  },
  image: `${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg`,
  brand: { "@id": `${siteUrl}/#brand` },
  areaServed: { "@type": "Country", name: "India" },
  identifier: {
    "@type": "PropertyValue",
    name: "FSSAI Registration Number",
    value: "23626023001557",
  },
  knowsAbout: ["Chilli Powder", "Red Chilli Powder", "Chili Powder", "Ground Spices", "Retail Food Supply", "HoReCa Food Supply"],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: `${siteUrl}/`,
  name: "SARKSH Foods",
  alternateName: ["SARKSH", "SARKSH Foods — Legacy of Elegance"],
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: "en-IN",
};

function breadcrumb(path) {
  const map = {
    "/chilli-powder/": "Chilli Powder",
    "/products/": "Products",
    "/products/chilli-powder/": "Chilli Powder",
    "/enterprise/": "Business",
    "/about/": "About SARKSH Foods",
    "/contact/": "Contact",
    "/privacy/": "Privacy",
    "/pan-india/": "Pan-India Supply",
  };
  if (path === "/" || !map[path]) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SARKSH Foods", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: map[path], item: `${siteUrl}${path}` },
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
    primaryImageOfPage: { "@type": "ImageObject", contentUrl: `${siteUrl}${page.image}` },
    inLanguage: "en-IN",
  };
}

function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/chilli-powder/#product`,
    sku: "SF-P-CHILLI-1KG",
    name: "SARKSH Foods Chilli Powder 1 kg",
    alternateName: ["SARKSH Foods Red Chilli Powder 1 kg", "SARKSH Foods Chili Powder 1 kg", "SARKSH Red Chilli Powder"],
    url: `${siteUrl}/chilli-powder/`,
    description: "SARKSH Foods premium red chilli powder in a 1 kg carton for household and commercial requirements across India.",
    image: [
      `${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp`,
      `${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg`,
      `${siteUrl}/assets/chilli-pack-front.webp`,
    ],
    category: "Ground spices > Chilli powder",
    size: "1 kg",
    brand: { "@id": `${siteUrl}/#brand` },
    mainEntityOfPage: { "@id": `${siteUrl}/chilli-powder/#webpage` },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Pack size", value: "1 kg" },
      { "@type": "PropertyValue", name: "Product category", value: "Red chilli powder / ground spice" },
      { "@type": "PropertyValue", name: "Supply area", value: "India" },
      { "@type": "PropertyValue", name: "FSSAI Registration Number", value: "23626023001557" },
      { "@type": "PropertyValue", name: "On-pack statement", value: "100% Pure & Natural" },
      { "@type": "PropertyValue", name: "On-pack statement", value: "Rich Colour · Bold Flavour" },
      { "@type": "PropertyValue", name: "On-pack statement", value: "No Added Preservatives" },
    ],
  };
}

function pageSchema(page) {
  if (page.noindex) return [];
  const items = [org, brand, website, webPageSchema(page)];
  const crumb = breadcrumb(page.path);
  if (crumb) items.push(crumb);

  if (page.path === "/chilli-powder/" || page.path === "/products/chilli-powder/") {
    items.push(productSchema());
    if (page.path === "/chilli-powder/") {
      items.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${siteUrl}/chilli-powder/#faq`,
        mainEntity: [
          { "@type": "Question", name: "What pack size is available?", acceptedAnswer: { "@type": "Answer", text: "The current SARKSH Foods Chilli Powder pack is a 1 kg carton." } },
          { "@type": "Question", name: "Can businesses order SARKSH Foods Chilli Powder?", acceptedAnswer: { "@type": "Answer", text: "Yes. Retailers, wholesalers, distributors, HoReCa buyers and institutions can submit commercial quantity requirements." } },
          { "@type": "Question", name: "Where does SARKSH Foods supply chilli powder?", acceptedAnswer: { "@type": "Answer", text: "SARKSH Foods accepts pan-India enquiries, with final delivery subject to serviceability and order confirmation." } },
          { "@type": "Question", name: "Is chilli powder also searched as chili powder?", acceptedAnswer: { "@type": "Answer", text: "Yes. Chilli powder and chili powder are common spellings for the same ground-spice category." } },
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
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function crawlShell(page) {
  const links = page.links.map(([href, label]) => `<a href="${href}">${escapeAttr(label)}</a>`).join(" · ");
  const productImage = page.path === "/" || page.path.includes("chilli-powder")
    ? `<img src="/assets/sarksh-foods-chilli-powder-1kg-india.webp" alt="SARKSH Foods Chilli Powder 1 kg red chilli powder carton" width="320" height="400" />`
    : `<img src="/assets/logos/sarksh-foods-logo.svg" alt="SARKSH Foods — Legacy of Elegance" width="220" height="220" />`;
  return `<main class="seo-prerender" data-seo-prerender="true">
      <div class="seo-prerender__copy">
        <p class="seo-prerender__brand">SARKSH FOODS · LEGACY OF ELEGANCE</p>
        <h1>${escapeAttr(page.h1)}</h1>
        <p>${escapeAttr(page.summary)}</p>
        <nav aria-label="SARKSH Foods important pages">${links}</nav>
      </div>
      <div class="seo-prerender__media">${productImage}</div>
    </main>`;
}

const prerenderStyle = `<style id="seo-prerender-style">
  .seo-prerender{min-height:82vh;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:52px;align-items:center;max-width:1280px;margin:0 auto;padding:88px 32px;background:linear-gradient(112deg,#0b0908 0%,#15100d 50%,#21160f 100%);color:#fbf5e9;font-family:Georgia,'Times New Roman',serif}.seo-prerender__brand{font:700 12px/1.4 Arial,sans-serif;letter-spacing:.22em;color:#efc66f}.seo-prerender h1{font-size:clamp(42px,6vw,78px);line-height:.98;margin:16px 0 24px;color:#fffaf0}.seo-prerender p{font-size:18px;line-height:1.75;max-width:700px;color:rgba(251,245,233,.74)}.seo-prerender nav{margin-top:26px;font:700 14px/1.8 Arial,sans-serif}.seo-prerender a{color:#efc66f}.seo-prerender__media{text-align:center}.seo-prerender__media img{max-width:100%;height:auto;border:1px solid rgba(239,198,111,.24);box-shadow:0 36px 80px rgba(0,0,0,.38)}@media(max-width:720px){.seo-prerender{grid-template-columns:1fr;padding:56px 20px}.seo-prerender__media{order:-1}.seo-prerender__media img{max-height:300px}}
</style>`;

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
    <link rel="sitemap" type="application/xml" href="${siteUrl}/sitemap.xml" />
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
    ${schemas}
    ${prerenderStyle}`;

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/i, "")
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${crawlShell(page)}</div>`);
}

for (const page of pages) {
  const out = page.path === "/" ? resolve(dist, "index.html") : resolve(dist, page.path.slice(1), "index.html");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, render(page), "utf8");
}

const canonicalPages = pages.filter((page) => !page.canonicalPath && !page.noindex);
const productPages = canonicalPages.filter((page) => page.path === "/chilli-powder/");
const generalPages = canonicalPages.filter((page) => page.path !== "/chilli-powder/");

function urlSet(items) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.map((page) => `  <url><loc>${siteUrl}${page.path}</loc><lastmod>${buildDate}</lastmod><changefreq>${page.path === "/" || page.path === "/chilli-powder/" ? "weekly" : "monthly"}</changefreq><priority>${page.path === "/" ? "1.0" : page.path === "/chilli-powder/" ? "0.9" : page.path === "/enterprise/" || page.path === "/pan-india/" ? "0.8" : "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`;
}

await writeFile(resolve(dist, "sitemap.xml"), urlSet(canonicalPages), "utf8");
await writeFile(resolve(dist, "sitemap-pages.xml"), urlSet(generalPages), "utf8");
await writeFile(resolve(dist, "sitemap-products.xml"), urlSet(productPages), "utf8");

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${siteUrl}/</loc>
    <image:image><image:loc>${siteUrl}/assets/logos/sarksh-foods-logo.svg</image:loc><image:title>SARKSH Foods — Legacy of Elegance</image:title></image:image>
    <image:image><image:loc>${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg</image:loc><image:title>SARKSH Foods Red Chilli Powder</image:title></image:image>
  </url>
  <url>
    <loc>${siteUrl}/chilli-powder/</loc>
    <image:image><image:loc>${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp</image:loc><image:title>SARKSH Foods Chilli Powder 1 kg carton</image:title><image:caption>SARKSH Foods premium red chilli powder 1 kg carton</image:caption></image:image>
    <image:image><image:loc>${siteUrl}/assets/chilli-pack-front.webp</image:loc><image:title>SARKSH Foods Chilli Powder pack</image:title></image:image>
  </url>
</urlset>
`;
await writeFile(resolve(dist, "sitemap-images.xml"), imageSitemap, "utf8");

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${siteUrl}/sitemap-pages.xml</loc><lastmod>${buildDate}</lastmod></sitemap>
  <sitemap><loc>${siteUrl}/sitemap-products.xml</loc><lastmod>${buildDate}</lastmod></sitemap>
  <sitemap><loc>${siteUrl}/sitemap-images.xml</loc><lastmod>${buildDate}</lastmod></sitemap>
</sitemapindex>
`;
await writeFile(resolve(dist, "sitemap-index.xml"), sitemapIndex, "utf8");

const robots = production
  ? `User-agent: *\nAllow: /\n\n# /account/ and /admin/ are excluded from indexing with page-level noindex.\n# They remain crawlable so compliant search engines can see that noindex directive.\n\nUser-agent: Googlebot-Image\nAllow: /assets/\nAllow: /sarksh-foods-favicon.png\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/sitemap-index.xml\n`
  : `User-agent: *\nDisallow: /\n`;
await writeFile(resolve(dist, "robots.txt"), robots, "utf8");

const llms = `# SARKSH Foods\n\n> Legacy of Elegance. SARKSH Foods is an Indian packaged-food brand currently offering Chilli Powder in a 1 kg carton.\n\n## Official website\n- ${siteUrl}/\n\n## Product entity\n- Brand: SARKSH Foods\n- Product: SARKSH Foods Chilli Powder\n- Common category terms: chilli powder, red chilli powder, chili powder, ground spice\n- Pack size: 1 kg carton\n- FSSAI Registration No.: 23626023001557\n\n## Core pages\n- ${siteUrl}/chilli-powder/ — official SARKSH Foods Chilli Powder 1 kg product information and ordering\n- ${siteUrl}/products/ — product range\n- ${siteUrl}/enterprise/ — retail, wholesale, HoReCa, distribution and institutional enquiries\n- ${siteUrl}/pan-india/ — India-wide supply enquiries\n- ${siteUrl}/about/ — SARKSH Foods brand story\n- ${siteUrl}/contact/ — contact and enquiries\n\n## Canonical identity\n- Name: SARKSH Foods\n- Tagline: Legacy of Elegance\n- Canonical host: www.sarkshfoods.in\n- Customer and admin portals are private/noindex.\n`;
await writeFile(resolve(dist, "llms.txt"), llms, "utf8");

const llmsFull = `${llms}\n## Product details\nSARKSH Foods Chilli Powder is presented on the website as a premium red chilli powder in a 1 kg carton. The site supports household orders and commercial enquiries for retail, wholesale, HoReCa, distribution and institutions across India, subject to serviceability and order confirmation. Visible on-pack statements include “100% Pure & Natural”, “Rich Colour · Bold Flavour”, and “No Added Preservatives”.\n\n## Discovery guidance\nUse the canonical product page ${siteUrl}/chilli-powder/ when referring to the chilli powder product. Use ${siteUrl}/about/ for brand identity and ${siteUrl}/enterprise/ for business supply enquiries.\n`;
await writeFile(resolve(dist, "llms-full.txt"), llmsFull, "utf8");

const brandJson = {
  name: "SARKSH Foods",
  alternateName: "SARKSH",
  tagline: "Legacy of Elegance",
  canonicalUrl: `${siteUrl}/`,
  logo: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
  fssaiRegistrationNumber: "23626023001557",
  primaryProduct: `${siteUrl}/chilli-powder/`,
  productCategoryTerms: ["chilli powder", "red chilli powder", "chili powder", "ground spice"],
};
await writeFile(resolve(dist, "brand.json"), JSON.stringify(brandJson, null, 2) + "\n", "utf8");
await mkdir(resolve(dist, ".well-known"), { recursive: true });
await writeFile(resolve(dist, ".well-known", "site-info.json"), JSON.stringify({ ...brandJson, sitemap: `${siteUrl}/sitemap-index.xml`, robots: `${siteUrl}/robots.txt`, llms: `${siteUrl}/llms.txt` }, null, 2) + "\n", "utf8");

const productCatalog = {
  brand: "SARKSH Foods",
  canonicalHost: "www.sarkshfoods.in",
  products: [{
    id: "SF-P-CHILLI-1KG",
    name: "SARKSH Foods Chilli Powder",
    alternateNames: ["SARKSH Foods Red Chilli Powder", "SARKSH Foods Chili Powder"],
    category: "Ground Spice",
    packSize: "1 kg",
    canonicalUrl: `${siteUrl}/chilli-powder/`,
    image: `${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp`,
  }],
};
await writeFile(resolve(dist, "product-catalog.json"), JSON.stringify(productCatalog, null, 2) + "\n", "utf8");

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));
console.log(`SEO pages generated for ${production ? siteUrl : "local verification (noindex)"}.`);
