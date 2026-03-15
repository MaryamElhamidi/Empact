/**
 * Generates backend/helpers/db/migrate_charities.sql:
 * 1. Creates causes, regions, charities, charity_causes, charity_regions if they don't exist.
 * 2. Inserts/updates all data from charity_registry.json.
 * Run from repo root: node backend/scripts/generate_migrate_charities.js
 */
const fs = require("fs");
const path = require("path");

const jsonPath = path.join(__dirname, "../data/charity_registry.json");
const outPath = path.join(__dirname, "../helpers/db/migrate_charities.sql");

function escapeSql(s) {
  if (s == null) return "NULL";
  return "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

const registry = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const charities = registry.charities || [];

const causeSlugs = new Set();
const regionNames = new Set();
for (const c of charities) {
  (c.focus_values || []).forEach((v) => causeSlugs.add(v));
  (c.regions || []).forEach((r) => regionNames.add(r));
}

const schemaPart =
  "-- Migration: charity tables + seed from charity_registry.json\n" +
  "-- 1. Creates causes, regions, charities, charity_causes, charity_regions if not present.\n" +
  "-- 2. Inserts/updates all causes, regions, charities, charity_causes, charity_regions from charity_registry.json.\n" +
  "--\n" +
  "-- Usage: mysql -u <user> -p empact < backend/helpers/db/migrate_charities.sql\n\n" +
  "USE empact;\n\n" +
  "CREATE TABLE IF NOT EXISTS causes (\n" +
  "  cause_slug VARCHAR(50) PRIMARY KEY\n" +
  ");\n\n" +
  "CREATE TABLE IF NOT EXISTS regions (\n" +
  "  region_id INT AUTO_INCREMENT PRIMARY KEY,\n" +
  "  name VARCHAR(150) UNIQUE NOT NULL\n" +
  ");\n\n" +
  "CREATE TABLE IF NOT EXISTS charities (\n" +
  "  charity_id VARCHAR(50) PRIMARY KEY,\n" +
  "  name VARCHAR(255) NOT NULL,\n" +
  "  website VARCHAR(500),\n" +
  "  donation_url VARCHAR(500),\n" +
  "  description TEXT,\n" +
  "  verified TINYINT(1) DEFAULT 1\n" +
  ");\n\n" +
  "CREATE TABLE IF NOT EXISTS charity_causes (\n" +
  "  charity_id VARCHAR(50),\n" +
  "  cause_slug VARCHAR(50),\n" +
  "  PRIMARY KEY (charity_id, cause_slug),\n" +
  "  FOREIGN KEY (charity_id) REFERENCES charities(charity_id) ON DELETE CASCADE,\n" +
  "  FOREIGN KEY (cause_slug) REFERENCES causes(cause_slug)\n" +
  ");\n\n" +
  "CREATE TABLE IF NOT EXISTS charity_regions (\n" +
  "  charity_id VARCHAR(50),\n" +
  "  region_id INT,\n" +
  "  PRIMARY KEY (charity_id, region_id),\n" +
  "  FOREIGN KEY (charity_id) REFERENCES charities(charity_id) ON DELETE CASCADE,\n" +
  "  FOREIGN KEY (region_id) REFERENCES regions(region_id)\n" +
  ");\n\n";

const dataLines = ["-- Seed from charity_registry.json", ""];

if (causeSlugs.size > 0) {
  const vals = [...causeSlugs].map((s) => "(" + escapeSql(s) + ")").join(", ");
  dataLines.push("INSERT INTO causes (cause_slug) VALUES " + vals + " ON DUPLICATE KEY UPDATE cause_slug = cause_slug;");
  dataLines.push("");
}

if (regionNames.size > 0) {
  const vals = [...regionNames].map((s) => "(" + escapeSql(s) + ")").join(", ");
  dataLines.push("INSERT INTO regions (name) VALUES " + vals + " ON DUPLICATE KEY UPDATE name = name;");
  dataLines.push("");
}

for (const c of charities) {
  dataLines.push(
    "INSERT INTO charities (charity_id, name, website, donation_url, description, verified) VALUES (" +
      [escapeSql(c.charity_id), escapeSql(c.name), escapeSql(c.website), escapeSql(c.donation_url), escapeSql(c.description), c.verified === true ? "1" : "0"].join(", ") +
      ") ON DUPLICATE KEY UPDATE name = VALUES(name), website = VALUES(website), donation_url = VALUES(donation_url), description = VALUES(description), verified = VALUES(verified);"
  );
}
dataLines.push("");

dataLines.push("-- charity_causes");
for (const c of charities) {
  const causes = c.focus_values || [];
  if (causes.length === 0) continue;
  dataLines.push("DELETE FROM charity_causes WHERE charity_id = " + escapeSql(c.charity_id) + ";");
  const vals = causes.map((slug) => "(" + escapeSql(c.charity_id) + ", " + escapeSql(slug) + ")").join(", ");
  dataLines.push("INSERT INTO charity_causes (charity_id, cause_slug) VALUES " + vals + ";");
}
dataLines.push("");

dataLines.push("-- charity_regions");
for (const c of charities) {
  const regions = c.regions || [];
  if (regions.length === 0) continue;
  dataLines.push("DELETE FROM charity_regions WHERE charity_id = " + escapeSql(c.charity_id) + ";");
  const vals = regions
    .map((name) => "(" + escapeSql(c.charity_id) + ", (SELECT region_id FROM regions WHERE name = " + escapeSql(name) + " LIMIT 1))")
    .join(", ");
  dataLines.push("INSERT IGNORE INTO charity_regions (charity_id, region_id) VALUES " + vals + ";");
}

const fullSql = schemaPart + dataLines.join("\n") + "\n";
fs.writeFileSync(outPath, fullSql, "utf8");
console.log("Wrote " + outPath + " (schema + " + causeSlugs.size + " causes, " + regionNames.size + " regions, " + charities.length + " charities).");
