import nodemailer from "nodemailer";
import { db } from "./db";
import { integrationSettings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function getSmtpConfig(tenantId: string) {
  const [setting] = await db.select().from(integrationSettings)
    .where(and(eq(integrationSettings.tenantId, tenantId), eq(integrationSettings.provider, "smtp")));
  if (!setting || !setting.isEnabled) return null;
  return setting.config as any;
}

export async function sendEmail(tenantId: string, opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string }>;
}) {
  const config = await getSmtpConfig(tenantId);
  if (!config?.host) throw new Error("SMTP not configured");

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port || "587"),
    secure: config.secure === true || config.port === "465",
    auth: { user: config.user, pass: config.pass },
    tls: { rejectUnauthorized: false },
  });

  const info = await transporter.sendMail({
    from: config.from || `"${config.fromName || "Softlix"}" <${config.user}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments,
  });
  return info;
}

export async function sendSms(tenantId: string, opts: { to: string; message: string }) {
  const [setting] = await db.select().from(integrationSettings)
    .where(and(eq(integrationSettings.tenantId, tenantId), eq(integrationSettings.provider, "sms")));
  if (!setting || !setting.isEnabled) throw new Error("SMS not configured");
  const config = setting.config as any;

  if (config.provider === "twilio") {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: opts.to, From: config.fromNumber, Body: opts.message }),
    });
    if (!res.ok) throw new Error(`Twilio error: ${await res.text()}`);
    return await res.json();
  }

  if (config.provider === "unifonic") {
    const res = await fetch("https://el.cloud.unifonic.com/rest/SMS/messages", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        AppSid: config.appSid,
        SenderID: config.senderId || "Softlix",
        Recipient: opts.to,
        Body: opts.message,
      }),
    });
    if (!res.ok) throw new Error(`Unifonic error: ${await res.text()}`);
    return await res.json();
  }

  if (config.provider === "msegat") {
    const res = await fetch("https://www.msegat.com/gw/sendsms.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: config.userName,
        apiKey: config.apiKey,
        numbers: opts.to,
        userSender: config.senderId || "Softlix",
        msg: opts.message,
      }),
    });
    if (!res.ok) throw new Error(`Msegat error: ${await res.text()}`);
    return await res.json();
  }

  throw new Error(`Unknown SMS provider: ${config.provider}`);
}
