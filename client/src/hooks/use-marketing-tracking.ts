import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MarketingSettings } from "@shared/schema";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
    ttq: any;
    snaptr: any;
    _linkedin_partner_id: string;
    lintrk: any;
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

function getSessionId(): string {
  let sid = sessionStorage.getItem("_vsid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_vsid", sid);
  }
  return sid;
}

export function useMarketingTracking() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const loggedPages = useRef<Set<string>>(new Set());
  const trackingInitialized = useRef(false);

  useEffect(() => {
    const onNav = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onNav);
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = (...args) => { origPush(...args); onNav(); };
    history.replaceState = (...args) => { origReplace(...args); onNav(); };
    return () => {
      window.removeEventListener("popstate", onNav);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  const { data: settings } = useQuery<Partial<MarketingSettings> & { tenantId?: string }>({
    queryKey: ["/api/public/marketing-settings"],
    queryFn: async () => {
      const res = await fetch("/api/public/marketing-settings");
      return res.ok ? res.json() : {};
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!settings || trackingInitialized.current) return;
    trackingInitialized.current = true;

    // ── Google Tag Manager ─────────────────────────────────────────────────
    if (settings.gtmId?.trim()) {
      const gtmId = settings.gtmId.trim();
      window.dataLayer = window.dataLayer || [];
      injectInlineScript("gtm-init", `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
      `);
      if (!document.getElementById("gtm-noscript")) {
        const noscript = document.createElement("noscript");
        noscript.id = "gtm-noscript";
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    // ── Google Analytics 4 + Google Ads ────────────────────────────────────
    const gaId = (settings as any).googleAnalyticsId?.trim() || "";
    const gAdsId = (settings as any).googleAdsId?.trim() || "";
    if (gaId || gAdsId) {
      const primaryId = gaId || gAdsId;
      injectScript("gtag-script", `https://www.googletagmanager.com/gtag/js?id=${primaryId}`);
      let gtagInit = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());`;
      if (gaId) gtagInit += `gtag('config','${gaId}');`;
      if (gAdsId) gtagInit += `gtag('config','${gAdsId}');`;
      injectInlineScript("gtag-init", gtagInit);
    }

    // ── Meta (Facebook) Pixel ──────────────────────────────────────────────
    // Skip if GTM has already initialized this pixel (prevents duplicate pixel warning)
    if (settings.metaPixelId?.trim()) {
      const pixelId = settings.metaPixelId.trim();
      injectInlineScript("fb-pixel", `
        (function(pixelId){
          // If fbq already exists and this pixel was already inited (e.g. via GTM), skip
          if(window.fbq && typeof window.fbq.getState === 'function') {
            var state = window.fbq.getState();
            if(state && state.pixels && state.pixels.some(function(p){ return p.id === pixelId; })) return;
          }
          if(window.__fbPixelIds && window.__fbPixelIds[pixelId]) return;
          if(!window.__fbPixelIds) window.__fbPixelIds = {};
          window.__fbPixelIds[pixelId] = true;
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', pixelId);
          fbq('track', 'PageView');
        })('${pixelId}');
      `);
    }

    // ── TikTok Pixel ───────────────────────────────────────────────────────
    if (settings.tiktokPixelId?.trim()) {
      const ttqId = settings.tiktokPixelId.trim();
      injectInlineScript("tiktok-pixel", `
        !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
        ttq._o=ttq._o||{};ttq._o[e]=n||{};
        var s=document.createElement("script");s.type="text/javascript";s.async=!0;
        s.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
        ttq.load('${ttqId}');ttq.page();}(window,document,'ttq');
      `);
    }

    // ── Snapchat Pixel ─────────────────────────────────────────────────────
    if (settings.snapchatPixelId?.trim()) {
      const snapId = settings.snapchatPixelId.trim();
      injectInlineScript("snapchat-pixel", `
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script',r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
        snaptr('init','${snapId}');snaptr('track','PAGE_VIEW');
      `);
    }

    // ── LinkedIn Insight Tag ───────────────────────────────────────────────
    if (settings.linkedinInsightId?.trim()) {
      const liId = settings.linkedinInsightId.trim();
      injectInlineScript("linkedin-partner-id", `_linkedin_partner_id="${liId}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);`);
      injectInlineScript("linkedin-insight", `
        (function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}
        var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");
        b.type="text/javascript";b.async=true;
        b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b,s);})(window.lintrk);
      `);
    }

    // ── Custom Scripts ─────────────────────────────────────────────────────
    if (settings.customHeadScript?.trim()) {
      if (!document.getElementById("custom-head-script")) {
        const div = document.createElement("div");
        div.id = "custom-head-script";
        div.innerHTML = settings.customHeadScript;
        Array.from(div.children).forEach(el => document.head.appendChild(el));
      }
    }
    if (settings.customBodyScript?.trim()) {
      if (!document.getElementById("custom-body-script")) {
        const div = document.createElement("div");
        div.id = "custom-body-script";
        div.innerHTML = settings.customBodyScript;
        document.body.appendChild(div);
      }
    }
  }, [settings]);

  // ── Auto Visitor Logging — fires on each unique page view ──────────────
  useEffect(() => {
    const tenantId = settings?.tenantId;
    if (!tenantId) return;
    if (loggedPages.current.has(pathname)) return;
    loggedPages.current.add(pathname);

    const timer = setTimeout(() => {
      try {
        fetch("/api/public/log-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            pageUrl: pathname,
            referrer: document.referrer || "",
            sessionId: getSessionId(),
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, settings?.tenantId]);

  // ── Fire page_view events on navigation ───────────────────────────────
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
    if (window.ttq) {
      window.ttq.page();
    }
    if (window.snaptr) {
      window.snaptr("track", "PAGE_VIEW");
    }
  }, [pathname]);
}
