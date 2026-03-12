import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  siteName?: string;
  url?: string;
  keywords?: string;
  lang?: "ar" | "en";
  twitterHandle?: string;
}

export function useSEO({
  title,
  description,
  image,
  type = "website",
  siteName = "Softlix",
  url,
  keywords,
  lang,
  twitterHandle = "@softlix_sa",
}: SEOOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;

    if (lang) {
      document.documentElement.lang = lang === "ar" ? "ar" : "en";
    }

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const attrName = selector
          .replace(/meta\[name="/, "")
          .replace(/meta\[property="/, "")
          .replace(/"\]$/, "");
        el.setAttribute(attr, attrName);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    if (description) {
      setMeta('meta[name="description"]', "name", description);
      setMeta('meta[property="og:description"]', "property", description);
      setMeta('meta[name="twitter:description"]', "name", description);
    }

    if (title || siteName) {
      setMeta('meta[property="og:title"]', "property", fullTitle);
      setMeta('meta[name="twitter:title"]', "name", fullTitle);
    }

    if (image) {
      setMeta('meta[property="og:image"]', "property", image);
      setMeta('meta[name="twitter:image"]', "name", image);
      setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    } else {
      setMeta('meta[name="twitter:card"]', "name", "summary");
    }

    if (keywords) {
      setMeta('meta[name="keywords"]', "name", keywords);
    }

    const currentUrl = url || window.location.href;
    setMeta('meta[property="og:url"]', "property", currentUrl);
    setLink("canonical", currentUrl.split("?")[0]);

    setMeta('meta[property="og:type"]', "property", type);
    setMeta('meta[property="og:site_name"]', "property", siteName);
    setMeta('meta[name="twitter:site"]', "name", twitterHandle);
  }, [title, description, image, type, siteName, url, keywords, lang, twitterHandle]);
}
