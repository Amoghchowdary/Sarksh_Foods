import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const database = JSON.parse(await readFile(resolve(root, "src", "data", "seo-database.json"), "utf8"));
const siteUrl = (process.env.SITE_URL || database.site.url || "http://localhost:4173").replace(/\/$/, "");
const production = siteUrl === database.site.url;
const googleVerification = (process.env.GOOGLE_SITE_VERIFICATION || "").trim();
const indexNowKey = (process.env.INDEXNOW_KEY || "").trim();
const lastmod = (process.env.SEO_LASTMOD || new Date().toISOString()).trim();
const pages = database.pages;
const faqItems = database.faq;
const productData = database.product;
const site = database.site;

const absolute = (path) => path.startsWith("http") ? path : `${siteUrl}${path}`;

const brand = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": `${siteUrl}/#brand`,
  name: site.name,
  alternateName: site.alternateName,
  slogan: site.tagline,
  url: `${siteUrl}/`,
  logo: absolute(site.logo),
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: site.name,
  alternateName: site.alternateName,
  url: `${siteUrl}/`,
  logo: absolute(site.logo),
  image: absolute(site.defaultImage),
  slogan: site.tagline,
  brand: { "@id": `${siteUrl}/#brand` },
  areaServed: { "@type": "Country", name: site.country },
  identifier: { "@type": "PropertyValue", name: "FSSAI Registration Number", value: site.fssaiRegistrationNumber },
  knowsAbout: ["Chilli powder", "Red chilli powder", "Ground spices", "Retail food supply", "Wholesale food supply", "HoReCa food supply"],
  ...(Array.isArray(site.sameAs) && site.sameAs.length ? { sameAs: site.sameAs } : {}),
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: `${siteUrl}/`,
  name: site.name,
  alternateName: site.alternateName,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: site.language,
};

const merchant = productData.merchant || {};
const offer = merchant.price && merchant.availability ? {
  "@type": "Offer",
  url: `${siteUrl}${productData.url}`,
  priceCurrency: merchant.priceCurrency || "INR",
  price: String(merchant.price),
  availability: merchant.availability,
  itemCondition: "https://schema.org/NewCondition",
} : null;

const product = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${siteUrl}${productData.url}#product`,
  name: productData.name,
  alternateName: productData.alternateNames,
  url: `${siteUrl}${productData.url}`,
  description: productData.description,
  image: productData.images.map(absolute),
  category: productData.category,
  size: productData.packSize,
  brand: { "@id": `${siteUrl}/#brand` },
  manufacturer: { "@id": `${siteUrl}/#organization` },
  mainEntityOfPage: { "@id": `${siteUrl}${productData.url}#webpage` },
  ...(merchant.sku ? { sku: merchant.sku } : {}),
  ...(merchant.gtin ? { gtin: merchant.gtin } : {}),
  ...(offer ? { offers: offer } : {}),
  additionalProperty: [
    { "@type": "PropertyValue", name: "Pack size", value: productData.packSize },
    { "@type": "PropertyValue", name: "Supply area", value: site.country },
    ...productData.onPackStatements.map((value) => ({ "@type": "PropertyValue", name: "On-pack statement", value })),
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/faq/#faq`,
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const breadcrumbNames = {
  "/chilli-powder/": "Chilli Powder",
  "/products/": "Products",
  "/products/chilli-powder/": "Chilli Powder",
  "/chilli-powder-brands-india/": "Chilli Powder Brands in India",
  "/red-chilli-powder-buying-guide/": "Red Chilli Powder Buying Guide",
  "/faq/": "FAQ",
  "/enterprise/": "Business Orders",
  "/pan-india/": "Pan-India",
  "/about/": "Our Story",
  "/contact/": "Contact",
  "/privacy/": "Privacy",
};

function breadcrumb(page) {
  if (page.path === "/") return null;
  const canonicalPath = page.canonicalPath || page.path;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: breadcrumbNames[page.path] || site.name, item: `${siteUrl}${canonicalPath}` },
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
    about: page.path === productData.url ? { "@id": `${siteUrl}${productData.url}#product` } : { "@id": `${siteUrl}/#organization` },
    inLanguage: site.language,
  };
}

function articleSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}${page.path}#article`,
    headline: page.title,
    description: page.description,
    image: absolute(page.image),
    mainEntityOfPage: `${siteUrl}${page.path}`,
    author: { "@id": `${siteUrl}/#organization` },
    publisher: { "@id": `${siteUrl}/#organization` },
    dateModified: lastmod,
    inLanguage: site.language,
    keywords: [page.primaryKeyword, ...(page.secondaryKeywords || [])].filter(Boolean).join(", "),
  };
}

function schemasFor(page) {
  if (page.noindex) return [];
  const items = [];
  if (page.path === "/" || page.path === "/about/") items.push(brand, organization);
  if (page.path === "/") items.push(website);
  items.push(webPage(page));
  const crumb = breadcrumb(page);
  if (crumb) items.push(crumb);

  for (const type of page.schema || []) {
    if (type === "Product") items.push(product);
    if (type === "FAQPage") items.push(faqSchema);
    if (type === "Article") items.push(articleSchema(page));
    if (type === "ItemList") {
      items.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${site.name} Products`,
        itemListElement: [{ "@type": "ListItem", position: 1, url: `${siteUrl}${productData.url}`, name: productData.name }],
      });
    }
    if (type === "Service") {
      items.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: page.path === "/enterprise/" ? "SARKSH Foods Business Chilli Powder Enquiries" : "SARKSH Foods Pan-India Chilli Powder Enquiries",
        serviceType: page.path === "/enterprise/" ? "Retail, wholesale, HoReCa, distribution and institutional chilli powder enquiries" : "Chilli powder home-order and commercial supply enquiries",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: { "@type": "Country", name: site.country },
        url: `${siteUrl}${page.path}`,
      });
    }
  }
  return items;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function articleContent(page) {
  if (page.path === "/chilli-powder-brands-india/") {
    const guide = database.guides.chilliPowderBrandsIndia;
    return `<section><h2>How to compare chilli powder brands in India</h2><p>${escapeAttr(guide.intro)}</p>${guide.criteria.map((item) => `<h3>${escapeAttr(item.title)}</h3><p>${escapeAttr(item.text)}</p>`).join("")}</section>`;
  }
  if (page.path === "/red-chilli-powder-buying-guide/") {
    const guide = database.guides.redChilliPowderBuyingGuide;
    return `<section><h2>Red chilli powder buying guide</h2><p>${escapeAttr(guide.intro)}</p>${guide.sections.map((item) => `<h3>${escapeAttr(item.title)}</h3><p>${escapeAttr(item.text)}</p>`).join("")}</section>`;
  }
  if (page.path === "/faq/") {
    return `<section><h2>SARKSH Foods frequently asked questions</h2>${faqItems.map((item) => `<h3>${escapeAttr(item.question)}</h3><p>${escapeAttr(item.answer)}</p>`).join("")}</section>`;
  }
  return "";
}

function semanticBody(page) {
  if (page.noindex) return "";
  const canonicalPath = page.canonicalPath || page.path;
  const productBlock = page.path === "/" || page.path.includes("chilli-powder") || page.path === "/products/"
    ? `<section><h2>${escapeAttr(productData.name)}</h2><p>${escapeAttr(productData.description)}</p><p><a href="${siteUrl}${productData.url}">Product details</a> · <a href="${siteUrl}/enterprise/">Business orders</a></p></section>`
    : "";
  const publicLinks = pages.filter((p) => !p.noindex && !p.noSitemap && !p.canonicalPath).map((p) => `<a href="${siteUrl}${p.path}">${escapeAttr(breadcrumbNames[p.path] || p.title)}</a>`).join(" · ");
  return `<div data-crawl-first="true" style="max-width:1100px;margin:0 auto;padding:28px;font-family:Georgia,serif;color:#3b0908">
    <header><p>${escapeAttr(site.name)} · ${escapeAttr(site.tagline)}</p><h1>${escapeAttr(page.title)}</h1><p>${escapeAttr(page.description)}</p></header>
    ${productBlock}
    ${articleContent(page)}
    <nav aria-label="Key ${escapeAttr(site.name)} pages">${publicLinks}</nav>
    <link itemprop="url" href="${siteUrl}${canonicalPath}">
  </div>`;
}

function render(page) {
  const canonicalPath = page.canonicalPath || page.path;
  const canonical = `${siteUrl}${canonicalPath}`;
  const image = absolute(page.image || site.defaultImage);
  const robots = page.noindex ? "noindex,nofollow,noarchive" : production ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow";
  const schemas = schemasFor(page).map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n    ");
  const verification = production && googleVerification ? `<meta name="google-site-verification" content="${escapeAttr(googleVerification)}" />` : "";
  const head = `
    <title>${escapeAttr(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    <meta name="bingbot" content="${robots}" />
    <meta name="author" content="${escapeAttr(site.name)}" />
    <meta name="application-name" content="${escapeAttr(site.name)}" />
    ${verification}
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="en-IN" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="${escapeAttr(site.name)}" />
    <meta property="og:type" content="${page.type === "article" ? "article" : page.type}" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(page.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:alt" content="${escapeAttr(site.name)} chilli powder and brand identity" />
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
const pageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((p) => `  <url><loc>${siteUrl}${p.path}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap-pages.xml"), pageSitemap, "utf8");

const productSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}${productData.url}</loc><lastmod>${lastmod}</lastmod></url>\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap-products.xml"), productSitemap, "utf8");

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  <url><loc>${siteUrl}${productData.url}</loc><image:image><image:loc>${absolute(productData.images[0])}</image:loc><image:title>${escapeAttr(productData.name)}</image:title><image:caption>${escapeAttr(productData.description)}</image:caption></image:image></url>\n  <url><loc>${siteUrl}/</loc><image:image><image:loc>${absolute(site.defaultImage)}</image:loc><image:title>${escapeAttr(site.name)} premium red chilli powder</image:title></image:image></url>\n</urlset>\n`;
await writeFile(resolve(dist, "sitemap-images.xml"), imageSitemap, "utf8");

const sitemapText = `${publicPages.map((p) => `${siteUrl}${p.path}`).join("\n")}\n`;
await writeFile(resolve(dist, "sitemap.txt"), sitemapText, "utf8");

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${siteUrl}/sitemap-pages.xml</loc><lastmod>${lastmod}</lastmod></sitemap>\n  <sitemap><loc>${siteUrl}/sitemap-products.xml</loc><lastmod>${lastmod}</lastmod></sitemap>\n  <sitemap><loc>${siteUrl}/sitemap-images.xml</loc><lastmod>${lastmod}</lastmod></sitemap>\n</sitemapindex>\n`;
await writeFile(resolve(dist, "sitemap.xml"), sitemapIndex, "utf8");
await writeFile(resolve(dist, "sitemap-index.xml"), sitemapIndex, "utf8");

const robots = production ? `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/sitemap.txt\n` : `User-agent: *\nDisallow: /\n`;
await writeFile(resolve(dist, "robots.txt"), robots, "utf8");

const llms = `# ${site.name}\n\n> ${site.name} is an Indian packaged-food brand. The current product is ${productData.name}.\n\n## Official facts\n- Brand: ${site.name}\n- Tagline: ${site.tagline}\n- Product: ${productData.shortName}\n- Pack size: ${productData.packSize} carton\n- Category: chilli powder / red chilli powder / ground spice\n- FSSAI Registration No.: ${site.fssaiRegistrationNumber}\n- Enquiries: home orders and business requirements across India, subject to serviceability and confirmation\n\n## Key pages\n${publicPages.map((p) => `- ${siteUrl}${p.path} — ${p.title}`).join("\n")}\n`;
await writeFile(resolve(dist, "llms.txt"), llms, "utf8");

const llmsFull = `${llms}\n## Common questions\n${faqItems.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n")}\n`;
await writeFile(resolve(dist, "llms-full.txt"), llmsFull, "utf8");
await writeFile(resolve(dist, "ai.txt"), llms, "utf8");

await writeFile(resolve(dist, "brand.json"), JSON.stringify({
  name: site.name,
  alternateName: site.alternateName,
  tagline: site.tagline,
  canonicalUrl: `${siteUrl}/`,
  logo: absolute(site.logo),
  fssaiRegistrationNumber: site.fssaiRegistrationNumber,
  market: site.country,
  currentProduct: productData.name,
  sameAs: site.sameAs,
}, null, 2) + "\n");

await writeFile(resolve(dist, "product-catalog.json"), JSON.stringify({
  brand: site.name,
  products: [{
    name: productData.shortName,
    alternateNames: productData.alternateNames,
    category: productData.category,
    packSize: productData.packSize,
    url: `${siteUrl}${productData.url}`,
    image: absolute(productData.images[0]),
    ordering: ["Home orders", "Business enquiries"],
    businessSegments: productData.businessSegments,
    merchantListingReady: Boolean(offer),
  }],
}, null, 2) + "\n");

await writeFile(resolve(dist, "entity.json"), JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [brand, organization, website, product],
}, null, 2) + "\n");

await writeFile(resolve(dist, "seo-database.json"), JSON.stringify({
  version: database.version,
  site,
  product: productData,
  pages: publicPages.map(({ path, title, description, intent, primaryKeyword, secondaryKeywords = [], schema = [] }) => ({ path, title, description, intent, primaryKeyword, secondaryKeywords, schema })),
  faq: faqItems,
}, null, 2) + "\n");

await writeFile(resolve(dist, "indexing-manifest.json"), JSON.stringify({
  generatedAt: lastmod,
  canonicalHost: siteUrl,
  indexableUrls: publicPages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    title: page.title,
    primaryKeyword: page.primaryKeyword,
    lastmod,
  })),
  noindexUrls: pages.filter((p) => p.noindex).map((p) => `${siteUrl}${p.path}`),
}, null, 2) + "\n");

await mkdir(resolve(dist, ".well-known"), { recursive: true });
await writeFile(resolve(dist, ".well-known", "site-info.json"), JSON.stringify({
  name: site.name,
  url: `${siteUrl}/`,
  language: site.language,
  country: site.country,
  productCatalog: `${siteUrl}/product-catalog.json`,
  seoDatabase: `${siteUrl}/seo-database.json`,
  llms: `${siteUrl}/llms.txt`,
  sitemap: `${siteUrl}/sitemap.xml`,
}, null, 2) + "\n");

const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
await writeFile(resolve(dist, ".well-known", "security.txt"), `Contact: ${siteUrl}/contact/\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${siteUrl}/.well-known/security.txt\n`, "utf8");

if (production && /^[A-Fa-f0-9]{8,128}$/.test(indexNowKey)) {
  await writeFile(resolve(dist, `${indexNowKey}.txt`), indexNowKey, "utf8");
}

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));
console.log(`V14 SEO database generated ${publicPages.length} indexable pages for ${production ? siteUrl : "local verification (noindex)"}.`);
console.log(`Merchant listing offer data: ${offer ? "enabled" : "not enabled (public price/availability not configured)"}.`);
