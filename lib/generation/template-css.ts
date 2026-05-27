import fs from "fs";
import path from "path";

function readTemplateCss(filename: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "templates", "_shared", filename),
    "utf-8"
  );
}

let baseCssCache: string | undefined;
let premiumCssCache: string | undefined;
let agentCssCache: string | undefined;

export function getBaseCss(): string {
  if (!baseCssCache) {
    baseCssCache = readTemplateCss("base.css");
  }
  return baseCssCache;
}

export function getPremiumCss(): string {
  if (!premiumCssCache) {
    premiumCssCache = readTemplateCss("premium.css");
  }
  return premiumCssCache;
}

export function getAgentCss(): string {
  if (!agentCssCache) {
    agentCssCache = readTemplateCss("agent.css");
  }
  return agentCssCache;
}
