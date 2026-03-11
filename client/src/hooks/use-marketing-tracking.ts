import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MarketingSettings } from "@shared/schema";

const TENANT_ID = (import.meta.env.VITE_TENANT_ID as string) || "";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
    ttq: any;
    snaptr: any;
  }
}

function injectScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function injectInlineScript(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.textContent = code;
  document.head.appendChild(s);
}

export function useMarketingTracking() {
  const { data: settings } = useQuery<Partial<MarketingSettings>>({
    queryKey: ["/api/public/marketing-settings", TENANT_ID],
    queryFn: async () => {
      const url = TENANT_ID
        ? `/api/public/marketing-settings?tenantId=${TENANT_ID}`
        : "/api/public/marketing-settings";
      const res = await fetch(url);
      return res.ok ? res.json() : {};
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!settings) return;

    // Google Tag Manager
    if (settings.gtmId && settings.gtmId.trim()) {
      const gtmId = settings.gtmId.trim();
      window.dataLayer = window.dataLayer || [];
      injectInlineScript("gtm-init", `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
      `);

      // GTM noscript iframe in body
      if (!document.getElementById("gtm-noscript")) {
        const noscript = document.createElement("noscript");
        noscript.id = "gtm-noscript";
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    // Google Analytics 4
    if (settings.googleAnalyticsId && settings.googleAnalyticsId.trim()) {
      const gaId = settings.googleAnalyticsId.trim();
      injectScript("ga4-script", `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
      injectInlineScript("ga4-init", `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `);
    }

    // Meta (Facebook) Pixel
    if (settings.metaPixelId && settings.metaPixelId.trim()) {
      const pixelId = settings.metaPixelId.trim();
      injectInlineScript("fb-pixel", `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `);
    }

    // Custom head scripts
    if (settings.customHeadScript && settings.customHeadScript.trim()) {
      if (!document.getElementById("custom-head-script")) {
        const div = document.createElement("div");
        div.id = "custom-head-script";
        div.innerHTML = settings.customHeadScript;
        Array.from(div.children).forEach(el => document.head.appendChild(el));
      }
    }

    // Custom body scripts
    if (settings.customBodyScript && settings.customBodyScript.trim()) {
      if (!document.getElementById("custom-body-script")) {
        const div = document.createElement("div");
        div.id = "custom-body-script";
        div.innerHTML = settings.customBodyScript;
        document.body.appendChild(div);
      }
    }
  }, [settings]);
}
