import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { findSeoPage } from "@/lib/seoDatabase";

const SITE_URL = "https://www.sarkshfoods.in";

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
    const seo = findSeoPage(pathname);
    const canonicalPath = "canonicalPath" in seo && seo.canonicalPath ? seo.canonicalPath : seo.path;
    const canonical = `${SITE_URL}${canonicalPath}`;
    const noindex = "noindex" in seo && Boolean(seo.noindex);

    document.title = seo.title;
    upsertMeta('meta[name="description"]', "content", seo.description);
    upsertMeta('meta[name="robots"]', "content", noindex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMeta('meta[name="googlebot"]', "content", noindex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
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
