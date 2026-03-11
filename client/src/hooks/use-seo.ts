import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  siteName?: string;
}

export function useSEO({ title, description, image, type = "website", siteName = "Softlix" }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        if (attr === "name") el.setAttribute("name", selector.replace('meta[name="', "").replace('"]', ""));
        if (attr === "property") el.setAttribute("property", selector.replace('meta[property="', "").replace('"]', ""));
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    if (description) {
      setMeta('meta[name="description"]', "name", description);
      setMeta('meta[property="og:description"]', "property", description);
    }
    if (title) {
      setMeta('meta[property="og:title"]', "property", fullTitle);
    }
    if (image) {
      setMeta('meta[property="og:image"]', "property", image);
    }
    setMeta('meta[property="og:type"]', "property", type);
    setMeta('meta[property="og:site_name"]', "property", siteName);
  }, [title, description, image, type, siteName]);
}
