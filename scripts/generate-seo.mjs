
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const siteUrl = (process.env.SITE_URL || "http://localhost:4173").replace(/\/$/, "");
const production = siteUrl === "https://www.sarkshfoods.in";
const googleVerification = (process.env.GOOGLE_SITE_VERIFICATION || "").trim();
const indexNowKey = (process.env.INDEXNOW_KEY || "").trim();

const pages = [
  { path: "/", title: "SARKSH Foods | Premium Red Chilli Powder in India", description: "SARKSH Foods premium red chilli powder in a 1 kg carton for home orders and retail, wholesale, HoReCa, distribution and institutional enquiries across India.", image: "/assets/sarksh-foods-chilli-powder-og.jpg", type: "website", priority: "1.0", changefreq: "weekly" },
  { path: "/chilli-powder/", title: "Premium Red Chilli Powder 1 kg in India | SARKSH Foods", description: "Explore SARKSH Foods premium red chilli powder in a 1 kg carton, including product details, pack information and home or business ordering routes across India.", image: "/assets/sarksh-foods-chilli-powder-og.jpg", type: "product", priority: "0.9", changefreq: "weekly" },
  { path: "/products/", title: "Chilli Powder Products in India | SARKSH Foods", description: "Explore SARKSH Foods chilli powder products, beginning with the 1 kg red chilli powder carton for household and commercial requirements across India.", image: "/assets/sarksh-foods-chilli-powder-og.jpg", type: "website", priority: "0.8", changefreq: "weekly" },
  { path: "/products/chilli-powder/", title: "SARKSH Foods Chilli Powder 1 kg | Product Details", description: "View SARKSH Foods red chilli powder 1 kg carton details, product highlights and ordering routes for home and business buyers.", image: "/assets/sarksh-foods-chilli-powder-og.jpg", type: "product", canonicalPath: "/chilli-powder/", noSitemap: true },
  { path: "/enterprise/", title: "Bulk Red Chilli Powder Enquiries in India | SARKSH Foods", description: "Send SARKSH Foods red chilli powder requirements for retail, wholesale, HoReCa, distribution and institutional supply enquiries across India.", image: "/assets/sarksh-foods-chilli-powder-og.jpg", type: "website", priority: "0.8", changefreq: "monthly" },
  { path: "/pan-india/", title: "Red Chilli Powder Supply Enquiries Across India | SARKSH Foods", description: "SARKSH Foods accepts red chilli powder home-order and commercial supply enquiries across India, subject to serviceability and confirmation.", image: "/assets/sarksh-foods-chilli-powder-og.jpg", type: "website", priority: "0.8", changefreq: "monthly" },
  { path: "/about/", title: "About SARKSH Foods | Legacy of Elegance", description: "Learn about SARKSH Foods, the Indian packaged-food brand behind SARKSH Foods Chilli Powder and the Legacy of Elegance identity.", image: "/assets/logos/sarksh-foods-logo.svg", type: "website", priority: "0.7", changefreq: "monthly" },
  { path: "/contact/", title: "Contact SARKSH Foods | Chilli Powder Orders & Enquiries", description: "Contact SARKSH Foods for chilli powder home orders and retail, wholesale, HoReCa, distribution or institutional requirements.", image: "/assets/logos/sarksh-foods-logo.svg", type: "website", priority: "0.7", changefreq: "monthly" },
  { path: "/privacy/", title: "Privacy Policy | SARKSH Foods", description: "Read how SARKSH Foods handles information submitted through product orders, customer accounts and business enquiry forms.", image: "/assets/logos/sarksh-foods-logo.svg", type: "website", priority: "0.3", changefreq: "yearly" },
  { path: "/account/", title: "My SARKSH | Customer Account", description: "Private SARKSH Foods customer account for products, saved addresses, order history and repeat ordering.", image: "/assets/logos/sarksh-foods-logo.svg", type: "website", noindex: true, noSitemap: true },
  { path: "/admin/", title: "SARKSH Foods Admin", description: "Private SARKSH Foods administration portal.", image: "/assets/logos/sarksh-foods-logo.svg", type: "website", noindex: true, noSitemap: true },
];

const brand = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": `${siteUrl}/#brand`,
  name: "SARKSH Foods",
  slogan: "Legacy of Elegance",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "SARKSH Foods",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
  image: `${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg`,
  slogan: "Legacy of Elegance",
  brand: { "@id": `${siteUrl}/#brand` },
  areaServed: { "@type": "Country", name: "India" },
  identifier: { "@type": "PropertyValue", name: "FSSAI Registration Number", value: "23626023001557" },
  knowsAbout: ["Chilli powder", "Red chilli powder", "Ground spices", "Retail food supply", "Wholesale food supply", "HoReCa food supply"],
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

const product = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${siteUrl}/chilli-powder/#product`,
  name: "SARKSH Foods Chilli Powder 1 kg",
  alternateName: ["SARKSH Foods Red Chilli Powder 1 kg", "SARKSH Foods Chili Powder 1 kg"],
  url: `${siteUrl}/chilli-powder/`,
  description: "SARKSH Foods red chilli powder in a 1 kg carton for household and commercial requirements across India.",
  image: [
    `${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp`,
    `${siteUrl}/assets/chilli-pack-front.webp`,
    `${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg`,
  ],
  category: "Food > Spices > Chilli Powder",
  size: "1 kg",
  brand: { "@id": `${siteUrl}/#brand` },
  manufacturer: { "@id": `${siteUrl}/#organization` },
  mainEntityOfPage: { "@id": `${siteUrl}/chilli-powder/#webpage` },
  additionalProperty: [
    { "@type": "PropertyValue", name: "Pack size", value: "1 kg" },
    { "@type": "PropertyValue", name: "Supply area", value: "India" },
    { "@type": "PropertyValue", name: "On-pack statement", value: "100% Pure & Natural" },
    { "@type": "PropertyValue", name: "On-pack statement", value: "Rich Colour. Bold Flavour." },
    { "@type": "PropertyValue", name: "On-pack statement", value: "No Added Preservatives" },
  ],
};

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/chilli-powder/#faq`,
  mainEntity: [
    { "@type": "Question", name: "What pack size is currently available?", acceptedAnswer: { "@type": "Answer", text: "The current SARKSH Foods Chilli Powder pack is a 1 kg carton." } },
    { "@type": "Question", name: "Can I order SARKSH Foods Chilli Powder for home use?", acceptedAnswer: { "@type": "Answer", text: "Yes. The website provides a home-order route for the current 1 kg chilli powder carton, subject to confirmation and serviceability." } },
    { "@type": "Question", name: "Does SARKSH Foods accept business enquiries?", acceptedAnswer: { "@type": "Answer", text: "Yes. Retail, wholesale, HoReCa, distribution and institutional buyers can submit business requirements through the Business Orders route." } },
    { "@type": "Question", name: "Does SARKSH Foods accept enquiries across India?", acceptedAnswer: { "@type": "Answer", text: "Yes. SARKSH Foods accepts enquiries across India, subject to final serviceability and delivery confirmation." } },
    { "@type": "Question", name: "What is the SARKSH Foods FSSAI registration number?", acceptedAnswer: { "@type": "Answer", text: "The website identifies SARKSH Foods with FSSAI Registration No. 23626023001557." } },
  ],
};

function breadcrumb(page) {
  if (page.path === "/") return null;
  const names = {
    "/chilli-powder/": "Chilli Powder", "/products/": "Products", "/products/chilli-powder/": "Chilli Powder",
    "/enterprise/": "Business Orders", "/pan-india/": "Pan-India", "/about/": "Our Story", "/contact/": "Contact", "/privacy/": "Privacy",
  };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: names[page.path] || "SARKSH Foods", item: `${siteUrl}${page.canonicalPath || page.path}` },
    ],
  };
}

function webPage(page) {
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
    about: page.path === "/chilli-powder/" ? { "@id": `${siteUrl}/chilli-powder/#product` } : { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-IN",
  };
}

function schemasFor(page) {
  if (page.noindex) return [];
  const items = [brand, organization, website, webPage(page)];
  const crumb = breadcrumb(page);
  if (crumb) items.push(crumb);

  if (page.path === "/chilli-powder/" || page.path === "/products/chilli-powder/") items.push(product);
  if (page.path === "/chilli-powder/") items.push(faq);
  if (page.path === "/products/") {
    items.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "SARKSH Foods Products",
      itemListElement: [{ "@type": "ListItem", position: 1, url: `${siteUrl}/chilli-powder/`, name: "SARKSH Foods Chilli Powder 1 kg" }],
    });
  }
  if (page.path === "/enterprise/") {
    items.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "SARKSH Foods Business Chilli Powder Enquiries",
      serviceType: "Retail, wholesale, HoReCa, distribution and institutional chilli powder enquiries",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      url: `${siteUrl}/enterprise/`,
    });
  }
  if (page.path === "/pan-india/") {
    items.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "SARKSH Foods Pan-India Chilli Powder Enquiries",
      serviceType: "Chilli powder home-order and commercial supply enquiries",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      url: `${siteUrl}/pan-india/`,
    });
  }
  return items;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function semanticBody(page) {
  if (page.noindex) return "";
  const canonicalPath = page.canonicalPath || page.path;
  const productBlock = page.path === "/" || page.path.includes("chilli-powder") || page.path === "/products/"
    ? `<section><h2>SARKSH Foods Chilli Powder 1 kg</h2><p>Premium red chilli powder in a 1 kg carton for home and business requirements across India.</p><p><a href="${siteUrl}/chilli-powder/">Product details</a> · <a href="${siteUrl}/enterprise/">Business orders</a></p></section>`
    : "";
  return `<div data-crawl-first="true" style="max-width:1100px;margin:0 auto;padding:28px;font-family:Georgia,serif;color:#3b0908">
    <header><p>SARKSH Foods · Legacy of Elegance</p><h1>${escapeAttr(page.title)}</h1><p>${escapeAttr(page.description)}</p></header>
    ${productBlock}
    <nav aria-label="Key SARKSH Foods pages"><a href="${siteUrl}/">Home</a> · <a href="${siteUrl}/chilli-powder/">Chilli Powder</a> · <a href="${siteUrl}/products/">Products</a> · <a href="${siteUrl}/enterprise/">Business Orders</a> · <a href="${siteUrl}/pan-india/">Pan-India</a> · <a href="${siteUrl}/about/">Our Story</a> · <a href="${siteUrl}/contact/">Contact</a></nav>
    <link itemprop="url" href="${siteUrl}${canonicalPath}">
  </div>`;
}

function render(page) {
  const canonicalPath = page.canonicalPath || page.path;
  const canonical = `${siteUrl}${canonicalPath}`;
  const image = `${siteUrl}${page.image}`;
  const robots = page.noindex ? "noindex,nofollow,noarchive" : production ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow";
  const schemas = schemasFor(page).map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n    ");
  const verification = production && googleVerification ? `<meta name="google-site-verification" content="${escapeAttr(googleVerification)}" />` : "";
  const head = `
    <title>${escapeAttr(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    <meta name="bingbot" content="${robots}" />
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

  const appMarkup = `<div id="app">${semanticBody(page)}</div>`;
  return template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/i, "")
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="app"></div>', appMarkup);
}

for (const page of pages) {
  const out = page.path === "/" ? resolve(dist, "index.html") : resolve(dist, page.path.slice(1), "index.html");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, render(page), "utf8");
}

const publicPages = pages.filter((p) => !p.noSitemap && !p.noindex && !p.canonicalPath);
const pageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((p) => `  <url><loc>${siteUrl}${p.path}</loc><changefreq>${p.changefreq || "monthly"}</changefreq><priority>${p.priority || "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap-pages.xml"), pageSitemap, "utf8");

const productSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/chilli-powder/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap-products.xml"), productSitemap, "utf8");

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  <url><loc>${siteUrl}/chilli-powder/</loc><image:image><image:loc>${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp</image:loc><image:title>SARKSH Foods Chilli Powder 1 kg</image:title><image:caption>Premium red chilli powder 1 kg carton from SARKSH Foods</image:caption></image:image></url>\n  <url><loc>${siteUrl}/</loc><image:image><image:loc>${siteUrl}/assets/sarksh-foods-chilli-powder-og.jpg</image:loc><image:title>SARKSH Foods premium red chilli powder</image:title></image:image></url>\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap-images.xml"), imageSitemap, "utf8");

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${siteUrl}/sitemap-pages.xml</loc></sitemap>\n  <sitemap><loc>${siteUrl}/sitemap-products.xml</loc></sitemap>\n  <sitemap><loc>${siteUrl}/sitemap-images.xml</loc></sitemap>\n</sitemapindex>\n`;
await writeFile(resolve(dist, "sitemap.xml"), sitemapIndex, "utf8");
await writeFile(resolve(dist, "sitemap-index.xml"), sitemapIndex, "utf8");

const robots = production ? `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/sitemap-index.xml\n` : `User-agent: *\nDisallow: /\n`;
await writeFile(resolve(dist, "robots.txt"), robots, "utf8");

const llms = `# SARKSH Foods\n\n> SARKSH Foods is an Indian packaged-food brand. The current product is SARKSH Foods Chilli Powder in a 1 kg carton.\n\n## Official facts\n- Brand: SARKSH Foods\n- Tagline: Legacy of Elegance\n- Product: SARKSH Foods Chilli Powder\n- Pack size: 1 kg carton\n- Category: chilli powder / red chilli powder / ground spice\n- FSSAI Registration No.: 23626023001557\n- Enquiries: home orders and business requirements across India, subject to serviceability and confirmation\n\n## Key pages\n- ${siteUrl}/chilli-powder/ — product details\n- ${siteUrl}/products/ — products\n- ${siteUrl}/enterprise/ — business orders\n- ${siteUrl}/pan-india/ — pan-India enquiries\n- ${siteUrl}/about/ — brand story\n- ${siteUrl}/contact/ — contact\n\n## Product statements shown on the website/package\n- 100% Pure & Natural\n- Rich Colour. Bold Flavour.\n- No Added Preservatives\n`;
await writeFile(resolve(dist, "llms.txt"), llms, "utf8");

const llmsFull = `${llms}\n## Answer-ready product summary\nSARKSH Foods Chilli Powder is presented as a premium red chilli powder in a 1 kg carton. The website provides a home-order path and a business-enquiry path for retail, wholesale, HoReCa, distribution and institutional requirements. Enquiries are accepted across India subject to serviceability and final confirmation.\n\n## Common questions\nQ: What pack size is available?\nA: The current pack is a 1 kg carton.\n\nQ: Can households order?\nA: Yes, the website includes a home-order route.\n\nQ: Can businesses enquire?\nA: Yes, retail, wholesale, HoReCa, distribution and institutional requirements can be submitted through Business Orders.\n\nQ: What is the FSSAI registration number shown by SARKSH Foods?\nA: 23626023001557.\n`;
await writeFile(resolve(dist, "llms-full.txt"), llmsFull, "utf8");
await writeFile(resolve(dist, "ai.txt"), llms, "utf8");

await writeFile(resolve(dist, "brand.json"), JSON.stringify({
  name: "SARKSH Foods",
  tagline: "Legacy of Elegance",
  canonicalUrl: `${siteUrl}/`,
  logo: `${siteUrl}/assets/logos/sarksh-foods-logo.svg`,
  fssaiRegistrationNumber: "23626023001557",
  market: "India",
  currentProduct: "SARKSH Foods Chilli Powder 1 kg",
}, null, 2) + "\n");

await writeFile(resolve(dist, "product-catalog.json"), JSON.stringify({
  brand: "SARKSH Foods",
  products: [{
    name: "SARKSH Foods Chilli Powder",
    alternateNames: ["SARKSH Foods Red Chilli Powder", "SARKSH Foods Chili Powder"],
    category: "Chilli powder",
    packSize: "1 kg",
    url: `${siteUrl}/chilli-powder/`,
    image: `${siteUrl}/assets/sarksh-foods-chilli-powder-1kg-india.webp`,
    ordering: ["Home orders", "Business enquiries"],
    businessSegments: ["Retail", "Wholesale", "HoReCa", "Distribution", "Institutional"],
  }],
}, null, 2) + "\n");

await writeFile(resolve(dist, "entity.json"), JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [brand, organization, website, product],
}, null, 2) + "\n");

await mkdir(resolve(dist, ".well-known"), { recursive: true });
await writeFile(resolve(dist, ".well-known", "site-info.json"), JSON.stringify({
  name: "SARKSH Foods",
  url: `${siteUrl}/`,
  language: "en-IN",
  country: "India",
  productCatalog: `${siteUrl}/product-catalog.json`,
  llms: `${siteUrl}/llms.txt`,
  sitemap: `${siteUrl}/sitemap.xml`,
}, null, 2) + "\n");

const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
await writeFile(resolve(dist, ".well-known", "security.txt"), `Contact: ${siteUrl}/contact/\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${siteUrl}/.well-known/security.txt\n`, "utf8");

if (production && /^[A-Fa-f0-9]{8,128}$/.test(indexNowKey)) {
  await writeFile(resolve(dist, `${indexNowKey}.txt`), indexNowKey, "utf8");
}

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));
console.log(`SEO/AEO/GEO files generated for ${production ? siteUrl : "local verification (noindex)"}.`);
