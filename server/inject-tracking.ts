import { storage } from "./storage";

interface InjectionCache {
  head: string;
  body: string;
}

let _cache: InjectionCache | null = null;
let _cacheExpiry = 0;

function buildScripts(
  marketing: Record<string, any> | null,
  site: Record<string, any> | null
): InjectionCache {
  let head = "";
  let body = "";

  // ── Favicon ────────────────────────────────────────────────────────────────
  const faviconUrl = (site?.faviconUrl || "").trim();
  if (faviconUrl) {
    const ext = faviconUrl.split("?")[0].split(".").pop()?.toLowerCase() || "png";
    const mimeMap: Record<string, string> = { ico: "image/x-icon", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
    const mime = mimeMap[ext] || "image/png";
    head += `\n<link id="dyn-favicon" rel="icon" type="${mime}" href="${faviconUrl}">`;
  }

  if (!marketing) return { head, body };

  const gtmId = (marketing.gtmId || "").trim();
  const gaId = (marketing.googleAnalyticsId || "").trim();
  const gAdsId = (marketing.googleAdsId || "").trim();
  const customHead = (marketing.customHeadScript || "").trim();
  const customBody = (marketing.customBodyScript || "").trim();

  // ── Google Tag Manager ─────────────────────────────────────────────────────
  if (gtmId) {
    head += `\n<!-- Google Tag Manager -->\n<script id="gtm-init">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');</script>\n<!-- End Google Tag Manager -->`;
    body += `\n<!-- Google Tag Manager (noscript) -->\n<noscript id="gtm-noscript"><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->`;
  }

  // ── Google Analytics 4 + Google Ads (only if no GTM to avoid double-loading) ─
  if (gaId || gAdsId) {
    const primaryId = gaId || gAdsId;
    let configs = "";
    if (gaId) configs += `gtag('config','${gaId}');`;
    if (gAdsId) configs += `gtag('config','${gAdsId}');`;
    head += `\n<script id="gtag-script" async src="https://www.googletagmanager.com/gtag/js?id=${primaryId}"></script>\n<script id="gtag-init">window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${configs}</script>`;
  }

  if (customHead) head += `\n${customHead}`;
  if (customBody) body += `\n${customBody}`;

  return { head, body };
}

export async function injectTrackingIntoHtml(html: string): Promise<string> {
  try {
    const now = Date.now();
    if (!_cache || now > _cacheExpiry) {
      const allTenants = await storage.getAllTenants();
      const tenant = allTenants[0];
      if (!tenant) return html;

      const [marketing, site] = await Promise.all([
        storage.getMarketingSettings(tenant.id),
        storage.getSiteSettings(tenant.id),
      ]);

      _cache = buildScripts(marketing as any || null, site as any || null);
      _cacheExpiry = now + 5 * 60 * 1000;
    }

    const { head, body } = _cache;

    if (head) {
      const headCloseIdx = html.indexOf("</head>");
      if (headCloseIdx !== -1) {
        html = html.slice(0, headCloseIdx) + head + "\n" + html.slice(headCloseIdx);
      }
    }

    if (body) {
      // Find the real <body> tag by looking for it right after </head>
      const headEnd = html.indexOf("</head>");
      if (headEnd !== -1) {
        const bodyStart = html.indexOf("<body", headEnd);
        if (bodyStart !== -1) {
          const bodyTagEnd = html.indexOf(">", bodyStart) + 1;
          html = html.slice(0, bodyTagEnd) + body + html.slice(bodyTagEnd);
        }
      }
    }

    return html;
  } catch {
    return html;
  }
}

export function invalidateTrackingCache() {
  _cache = null;
  _cacheExpiry = 0;
}
