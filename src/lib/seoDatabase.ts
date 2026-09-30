import database from "@/data/seo-database.json";

export type SeoPage = (typeof database.pages)[number];
export type FaqItem = (typeof database.faq)[number];

export const SEO_DATABASE = database;
export const SEO_PAGES = database.pages;
export const FAQ_ITEMS = database.faq;

export function normalizeSeoPath(pathname: string) {
  if (pathname === "/") return "/";
  return `${pathname.replace(/\/+$/, "")}/`;
}

export function findSeoPage(pathname: string) {
  const normalized = normalizeSeoPath(pathname);
  return SEO_PAGES.find((page) => page.path === normalized) ?? SEO_PAGES[0];
}
