import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPollData {
  newVisitors: number;
  newLeads: number;
  newCrmLeads: number;
  recentVisitors: Array<{ country: string | null; city: string | null; pageUrl: string | null; deviceType: string | null }>;
  recentLeads: Array<{ name: string | null; email: string | null; phone: string | null }>;
  timestamp: string;
}

const POLL_INTERVAL = 15000;
const STORAGE_KEY = "softlix_sound_alerts";
const LAST_POLL_KEY = "softlix_last_poll";

function playNotificationSound(type: "visitor" | "lead" | "crm") {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === "lead" || type === "crm") {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.03);
        gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.25);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
  }
}

export function getSoundAlertsEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundAlertsEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
  }
}

export function useNotificationSound() {
  const { toast } = useToast();
  const lastPollRef = useRef<string>(
    localStorage.getItem(LAST_POLL_KEY) || new Date().toISOString()
  );
  const initializedRef = useRef(false);

  const poll = useCallback(async () => {
    if (!getSoundAlertsEnabled()) return;

    try {
      const since = lastPollRef.current;
      const res = await fetch(`/api/dashboard/notifications-poll?since=${encodeURIComponent(since)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data: NotificationPollData = await res.json();

      lastPollRef.current = data.timestamp;
      try { localStorage.setItem(LAST_POLL_KEY, data.timestamp); } catch {}

      if (!initializedRef.current) {
        initializedRef.current = true;
        return;
      }

      if (data.newLeads > 0) {
        playNotificationSound("lead");
        const lead = data.recentLeads[0];
        toast({
          title: "🔔 عميل محتمل جديد!",
          description: lead
            ? `${lead.name || "بدون اسم"} — ${lead.phone || lead.email || ""}`
            : `${data.newLeads} عميل محتمل جديد`,
          duration: 8000,
        });
        return;
      }

      if (data.newCrmLeads > 0) {
        playNotificationSound("crm");
        toast({
          title: "📋 عميل CRM جديد!",
          description: `تم إضافة ${data.newCrmLeads} عميل محتمل في CRM`,
          duration: 6000,
        });
        return;
      }

      if (data.newVisitors > 0) {
        playNotificationSound("visitor");
        const v = data.recentVisitors[0];
        const location = [v?.city, v?.country].filter(Boolean).join(", ");
        toast({
          title: "👁️ زائر جديد",
          description: location
            ? `زائر من ${location} — ${v?.deviceType === "mobile" ? "جوال 📱" : "ديسكتوب 🖥️"}`
            : `${data.newVisitors} زائر جديد على الموقع`,
          duration: 4000,
        });
      }
    } catch {
    }
  }, [toast]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [poll]);
}
