/**
 * Rewrite opportunity summaries: remove metadata, produce clear 1–2 sentence summaries (~40 words).
 * Only modifies the `summary` field; all other fields unchanged.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/opportunities.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const MONTHS =
  "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December";

function stripMetadata(text) {
  let t = text;
  // Strip "Format ..." (News and Press Release, Appeal, Analysis, Situation Report, etc.)
  t = t.replace(/\s*Format\s+[A-Za-z\s and]+\s*/gi, " ");
  // Strip "Source X" / "Sources X Y Z"
  t = t.replace(/\s*Source(?:s)?\s+[A-Za-z0-9\s,|]+\s*/gi, " ");
  // Strip Posted / Originally published / Origin View original
  t = t.replace(new RegExp(`\\s*Posted\\s+\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}\\s*`, "gi"), " ");
  t = t.replace(/\s*Originally\s+published\s+[^.]*\.?\s*/gi, " ");
  t = t.replace(/\s*Origin\s+View\s+original\s*/gi, " ");
  t = t.replace(/\s*Published\s+on\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*/gi, " ");
  t = t.replace(/\s*\[EN\/AR\]\s*/gi, " ");
  // Strip "+ N more" and standalone dates
  t = t.replace(/\s*[A-Za-z\s]*\+\s*\d+\s+more\s+/gi, " ");
  t = t.replace(new RegExp(`\\s+\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}\\s*`, "gi"), " ");
  // Strip location–date leads: "PORT SUDAN, Sudan 18 February 2026 – " or "Geneva/Kyiv, 16 February 2026 – "
  t = t.replace(
    new RegExp(
      `\\s*[A-Z][A-Za-z/]+(?:,\\s*[A-Za-z\\s]+)?\\s+\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}\\s*[–\\-—]?\\s*`,
      "gi"
    ),
    " "
  );
  t = t.replace(
    new RegExp(
      `\\s*[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*,\\s*(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4}\\s*[–\\-—]\\s*`,
      "gi"
    ),
    " "
  );
  // "This is a summary of what was said by ... to whom quot"
  t = t.replace(/\s*This is a summary of what was said by[^.]+\.?\s*/gi, " ");
  t = t.replace(/\s+to whom quot(e)?\s*$/i, "");
  // Trailing truncation
  t = t.replace(/\s+\(\s*$/, "").trim();
  return t.replace(/\s+/g, " ").trim();
}

function firstSentence(s, maxWords = 45) {
  const trimmed = s.trim();
  if (!trimmed) return "";
  const chunks = trimmed.split(/(?<=[.!?])\s+/);
  let out = chunks[0] || trimmed;
  const words = out.split(/\s+/).filter(Boolean);
  if (words.length > maxWords) {
    out = words.slice(0, maxWords).join(" ");
    if (!/[.!?]$/.test(out)) out += ".";
  }
  // Remove trailing fragment (single letter or incomplete word)
  out = out.replace(/\s+[a-zA-Z]\s*$/, "").trim();
  if (out && !/[.!?]$/.test(out)) out += ".";
  return out.trim();
}

function dropLeadingRegion(text, region) {
  if (!region || !text) return text;
  const r = region.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp("^" + r + "\\s*", "i"), "").trim();
}

function rewriteSummary(raw, title, region) {
  let t = stripMetadata(raw);
  t = dropLeadingRegion(t, region);
  t = t.replace(/^[A-Za-z\s]+\s*\+\s*\d+\s+more\s+/i, "");
  t = t.replace(/^oPt\s+/i, "");

  // If after stripping we have almost nothing meaningful, use title to build a sentence
  const meaningful = t.replace(/^\s*$/, "").length > 20 ? t : "";
  if (!meaningful || meaningful.length < 30) {
    // Build from title: "X – Y" or "X: Y" -> "Y" or use full title as summary base
    const titleClean = title
      .replace(/\s*\|\s*[^|]+$/, "")
      .replace(/\s*\[EN\/AR\]\s*/i, "")
      .trim();
    return firstSentence(titleClean, 40);
  }

  // Prefer content after " – " (often the real lead)
  const dash = meaningful.indexOf(" – ");
  const afterDash = dash >= 0 ? meaningful.slice(dash + 3).trim() : "";
  const source = afterDash.length > 50 ? afterDash : meaningful;

  return firstSentence(source, 40);
}

data.forEach((o) => {
  o.summary = rewriteSummary(o.summary || "", o.title || "", o.region || "");
  // Ensure we never leave empty
  if (!o.summary || o.summary.length < 10) {
    o.summary = firstSentence((o.title || "").replace(/\s*\|\s*[^|]+$/, ""), 40);
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Rewrote", data.length, "summaries in", file);
