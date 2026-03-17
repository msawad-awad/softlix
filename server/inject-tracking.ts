import { storage } from "./storage";

let _cache: { head: string; body: string } | null = null;
let _cacheExpiry = 0;

function escapeForHtml(s: string): string {
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildScripts(settings: Record<string, any>): { head: string; body: string } {
  const gtmId = (settings.gtmId || "").trim();
  const gaId = (settings.googleAnalyticsId || "").trim();
  const gAdsId = (settings.googleAdsId || "").trim();
  const customHead = (settings.customHeadScript || "").trim();
  const customBody = (settings.customBodyScript || "").trim();

  let head = "";
  let body = "";

  if (gtmId) {
    head += `\n<!-- Google Tag Manager -->\n<script id="gtm-init">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');</script>\n<!-- End Google Tag Manager -->`;

    body += `\n<!-- Google Tag Manager (noscript) -->\n<noscript id="gtm-noscript"><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->`;
  }

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
      const settings = await storage.getMarketingSettings(tenant.id);
      _cache = settings ? buildScripts(settings as any) : { head: "", body: "" };
      _cacheExpiry = now + 5 * 60 * 1000;
    }

    const { head, body } = _cache;
    if (head) html = html.replace("</head>", `${head}\n</head>`);
    if (body) html = html.replace(/<body([^>]*)>/, `<body$1>${body}`);
    return html;
  } catch {
    return html;
  }
}

export function invalidateTrackingCache() {
  _cache = null;
  _cacheExpiry = 0;
}
