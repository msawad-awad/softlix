import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectTrackingIntoHtml } from "./inject-tracking";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("/{*path}", async (_req, res) => {
    try {
      let html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
      html = await injectTrackingIntoHtml(html);
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
