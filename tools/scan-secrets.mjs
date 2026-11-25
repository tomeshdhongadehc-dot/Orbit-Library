// Fails when a tracked or buildable file looks like it contains a secret, a private key or a company/personal identity.
// The repository is public. Patterns are deliberately narrow so real content (the word "token" in a lesson) is not flagged.
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const files = execSync("git ls-files -co --exclude-standard", { encoding: "utf8" }).split("\n").filter(Boolean)
  .filter((f) => !/\.(woff2?|png|jpg|ico|pdf)$/i.test(f) && !f.startsWith("docs/lh/") && f !== "pnpm-lock.yaml" && f !== "tools/scan-secrets.mjs");
const RULES = [
  ["private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ["API key (sk-)", /\bsk-[A-Za-z0-9]{32,}\b/],
  ["JWT", /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ["secret assignment", /\b[A-Za-z0-9_]*(?:secret|password|passwd|token|api_?key)["']?\s*[:=]\s*["']?(?![\s#$<{'"]|process\.env|(?:req|body|this|config|env|args|opts|user|data|params|ctx)\.|[^"'\s]*(?:dev-only|example|changeme|dummy|fake|demo|placeholder)|your[-_])(?=[A-Za-z+\/_.=-]*\d)[A-Za-z0-9+\/_\-.=]{12,}/i],
  ["provider key", /\b(?:sk_live_[0-9A-Za-z]{16,}|sk-(?:proj|ant)-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}|npm_[A-Za-z0-9]{36})\b/],
  ["company or personal identity", /humancloud|tomesh\.dhongade|getacaii|acai-ai-platform/i],
];
const SAFE_DOMAINS = /^(?:example\.(?:com|org|test)|x\.(?:com|io|test)|b\.com|evil\.test|users\.noreply\.github\.com|[a-z0-9-]+\.test)$/i;
const EMAIL = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
let bad = 0;
for (const f of files) {
  if (!existsSync(f)) continue;
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(EMAIL)) {
    if (!SAFE_DOMAINS.test(m[1])) { bad++; console.error(`SECRET SCAN: email address in ${f}: ${m[0].slice(0, 4)}...@${m[1]}`); }
  }
  for (const [name, re] of RULES) {
    const m = re.exec(text);
    if (m) { bad++; console.error(`SECRET SCAN: ${name} in ${f}: ${m[0].slice(0, 6)}...`); }
  }
}
if (bad) { console.error(`${bad} finding(s)`); process.exit(1); }
console.log(`scan-secrets OK (${files.length} files)`);
