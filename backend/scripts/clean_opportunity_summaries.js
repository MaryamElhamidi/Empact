/**
 * Clean opportunity summaries: remove Format/Source/Posted/Originally published/
 * Origin View original, location-date leads, and other metadata. Keeps substantive content.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/opportunities.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

function cleanSummary(s, region) {
    if (!s || typeof s !== "string") return s;

    let t = s;

    // Remove "Format News and Press Release" / "Format Appeal" / "Format Analysis" (and variants)
    t = t.replace(/\s*Format\s+[A-Za-z\s and]+(?:Source|Sources|published|$)/gi, " ");
    t = t.replace(/\s*Format\s+Analysis\s*/gi, " ");

    // Remove "Source X" / "Sources X Y Z" (until Posted or Originally or end)
    t = t.replace(/\s*Source(?:s)?\s+[A-Za-z0-9\s,]+?(?=Posted|Originally|Origin|published|$)/gi, " ");
    t = t.replace(/\s*Source(?:s)?\s+[A-Za-z0-9\s,]+/gi, " ");

    // Remove Posted DD Mon YYYY, Originally published DD Mon YYYY, Origin View original
    t = t.replace(/\s*Posted\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*/gi, " ");
    t = t.replace(/\s*Originally\s+published\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*/gi, " ");
    t = t.replace(/\s*Origin\s+View\s+original\s*/gi, " ");
    t = t.replace(/\s*published\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*/gi, " ");
    t = t.replace(/\s*Published\s+on\s*\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*/gi, " ");

    // Remove location–date leads: "Port Sudan, February 19, 2026 – " or "PORT SUDAN, Sudan 18 February 2026 – "
    t = t.replace(/\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\s*[–\-]\s*/gi, " ");
    t = t.replace(/\s*[A-Z][A-Za-z\s]+,\s*[A-Za-z\s]+\s+\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*[–\-]?\s*/gi, " ");
    t = t.replace(/\s*[A-Z][A-Za-z\s]+,\s*[A-Za-z\s]+\s*[–\-]\s*/g, " ");

    // Remove "This is a summary of what was said by ..." (up to "to whom" or similar)
    t = t.replace(/\s*This is a summary of what was said by[^.]+\.?\s*/gi, " ");
    t = t.replace(/\s+to whom quot(e)?\s*$/i, "");

    // Remove leading region/country (we have it in .region)
    if (region && typeof region === "string") {
        const r = region.trim();
        if (r) {
            const escaped = r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            t = t.replace(new RegExp("^" + escaped + "\\s*", "i"), "");
        }
    }
    t = t.replace(/^[A-Za-z\s]+\s*\+\s*\d+\s+more\s+/i, "");
    // Remove "oPt " (occupied Palestinian territory) at start
    t = t.replace(/^oPt\s+/i, "");

    // Remove [EN/AR] etc.
    t = t.replace(/\s*\[EN\/AR\]\s*/gi, " ");

    // Remove standalone dates "19 Feb 2026" or "18 February 2026" (middle of text)
    t = t.replace(/\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:uary|ch|il|y|e|ust|ember|ber|ber)?\s+\d{4}\s+/gi, " ");
    // Remove "Published on18" or "Published on 18 ..." (no space in on18)
    t = t.replace(/\s*Published\s+on\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*/gi, " ");

    // Remove "Format News and Press Release al " / "Format Situation Report al " anywhere
    t = t.replace(/\s*Format\s+News\s+and\s+Press\s+Release\s+al\s+/gi, " ");
    t = t.replace(/\s*Format\s+Situation\s+Report\s+al\s+/gi, " ");
    // Remove orphan "al " left from "Release al PORT"
    t = t.replace(/\s+al\s+$/i, " ");

    // Trim trailing truncation " (" or " quot"
    t = t.replace(/\s+\(\s*$/, "");
    t = t.replace(/\s+quot(e)?\s*$/i, "");

    // Fix broken "Sudan'" or "Sudan'" (curly apostrophe) back to "Sudan's"
    t = t.replace(/Sudan['\u2019]\s+/g, "Sudan's ");

    // If summary starts with ": " (e.g. ": IPC...") use title or strip the colon
    if (t.startsWith(": ")) t = t.slice(2).trim();

    t = t.replace(/\s+/g, " ").trim();
    return t || s;
}

data.forEach((o) => {
    o.summary = cleanSummary(o.summary, o.region);
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Cleaned", data.length, "summaries. Wrote", file);
