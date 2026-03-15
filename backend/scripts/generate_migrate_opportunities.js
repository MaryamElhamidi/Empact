/**
 * Generates backend/helpers/db/migrate_opportunities.sql:
 * 1. Schema migration: ensure opportunities table has new format (migrate from old or create if missing).
 * 2. INSERT all opportunities from opportunities.json (donation_url resolved from donation.charity_id + charity_registry).
 * Run from repo root: node backend/scripts/generate_migrate_opportunities.js
 */
const fs = require("fs");
const path = require("path");

const jsonPath = path.join(__dirname, "../data/opportunities.json");
const registryPath = path.join(__dirname, "../data/charity_registry.json");
const outPath = path.join(__dirname, "../helpers/db/migrate_opportunities.sql");

function escapeSql(s) {
  if (s == null) return "NULL";
  return "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

const list = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let charityIdToUrl = {};
try {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  (registry.charities || []).forEach((c) => {
    if (c.charity_id) charityIdToUrl[c.charity_id] = c.donation_url || "";
  });
} catch (e) {
  console.warn("Could not load charity_registry.json, donation_url will be empty");
}

const v = "`values`"; // backtick-wrapped column name for reserved word
const schemaPart =
  "-- Migration: opportunities table to new format + seed from opportunities.json\n" +
  "-- 1. Drops opportunity_issues if present.\n" +
  "-- 2. If table has old schema (country column): migrates to new format, preserves existing rows as legacy_*.\n" +
  "-- 3. If table does not exist: creates opportunities in new format.\n" +
  "-- 4. Inserts/updates all opportunities from opportunities.json (donation_url from donation.charity_id + charity_registry).\n" +
  "--\n" +
  "-- Usage: mysql -u <user> -p empact < backend/helpers/db/migrate_opportunities.sql\n\n" +
  "USE empact;\n\n" +
  "DROP TABLE IF EXISTS opportunity_issues;\n\n" +
  "DELIMITER //\n" +
  "CREATE PROCEDURE _migrate_opportunities_schema()\n" +
  "BEGIN\n" +
  "  SET @has_old = (SELECT COUNT(*) FROM information_schema.COLUMNS\n" +
  "    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'opportunities' AND COLUMN_NAME = 'country');\n" +
  "  SET @tbl_exists = (SELECT COUNT(*) FROM information_schema.TABLES\n" +
  "    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'opportunities');\n\n" +
  "  IF @has_old > 0 THEN\n" +
  "    CREATE TABLE opportunities_new (\n" +
  "      opportunity_id VARCHAR(100) PRIMARY KEY,\n" +
  "      title VARCHAR(255) NOT NULL,\n" +
  "      summary TEXT,\n" +
  "      cause VARCHAR(500),\n" +
  "      region VARCHAR(255),\n" +
  "      org_name VARCHAR(255),\n" +
  "      org_website VARCHAR(500),\n" +
  "      org_verified TINYINT(1) DEFAULT 1,\n" +
  "      donation_url VARCHAR(500),\n" +
  "      suggested_amounts JSON,\n" +
  "      " + v + " JSON,\n" +
  "      ai_confidence_score DECIMAL(3,2),\n" +
  "      date_discovered VARCHAR(50),\n" +
  "      source_url VARCHAR(500)\n" +
  "    );\n" +
  "    INSERT INTO opportunities_new (opportunity_id, title, summary, cause, region, org_name, org_website, org_verified, donation_url, suggested_amounts, " + v + ", ai_confidence_score, date_discovered, source_url)\n" +
  "    SELECT CONCAT('legacy_', opportunity_id), title, summary, NULL, country, NULL, NULL, COALESCE(is_verified, 1), NULL, CAST('[10,25,50,100]' AS JSON), CAST('[]' AS JSON), NULL, DATE_FORMAT(created_at, '%Y-%m-%d'), NULL FROM opportunities;\n" +
  "    DROP TABLE opportunities;\n" +
  "    RENAME TABLE opportunities_new TO opportunities;\n" +
  "  ELSEIF @tbl_exists = 0 THEN\n" +
  "    CREATE TABLE opportunities (\n" +
  "      opportunity_id VARCHAR(100) PRIMARY KEY,\n" +
  "      title VARCHAR(255) NOT NULL,\n" +
  "      summary TEXT,\n" +
  "      cause VARCHAR(500),\n" +
  "      region VARCHAR(255),\n" +
  "      org_name VARCHAR(255),\n" +
  "      org_website VARCHAR(500),\n" +
  "      org_verified TINYINT(1) DEFAULT 1,\n" +
  "      donation_url VARCHAR(500),\n" +
  "      suggested_amounts JSON,\n" +
  "      " + v + " JSON,\n" +
  "      ai_confidence_score DECIMAL(3,2),\n" +
  "      date_discovered VARCHAR(50),\n" +
  "      source_url VARCHAR(500)\n" +
  "    );\n" +
  "  END IF;\n" +
  "END//\n" +
  "DELIMITER ;\n\n" +
  "CALL _migrate_opportunities_schema();\n" +
  "DROP PROCEDURE IF EXISTS _migrate_opportunities_schema;\n\n";

const insertLines = [];
for (const o of list) {
  const org = o.organization || {};
  const donation = o.donation || {};
  const charityId = donation.charity_id || "";
  const donationUrl = charityId ? (charityIdToUrl[charityId] || "") : (donation.donation_url || "");
  const suggestedAmounts = donation.suggested_amounts != null ? JSON.stringify(donation.suggested_amounts) : null;
  const valuesJson = o.values != null ? JSON.stringify(o.values) : null;

  const cols = "opportunity_id, title, summary, cause, region, org_name, org_website, org_verified, donation_url, suggested_amounts, `values`, ai_confidence_score, date_discovered, source_url";
  const vals = [
    escapeSql(o.opportunity_id),
    escapeSql(o.title),
    escapeSql(o.summary),
    escapeSql(o.cause),
    escapeSql(o.region),
    escapeSql(org.name),
    escapeSql(org.website),
    org.verified === true ? "1" : "0",
    escapeSql(donationUrl),
    suggestedAmounts != null ? escapeSql(suggestedAmounts) : "NULL",
    valuesJson != null ? escapeSql(valuesJson) : "NULL",
    o.ai_confidence_score != null ? String(o.ai_confidence_score) : "NULL",
    escapeSql(o.date_discovered),
    escapeSql(o.source_url)
  ].join(", ");
  insertLines.push(
    "INSERT INTO opportunities (" + cols + ") VALUES (" + vals + ") ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), cause = VALUES(cause), region = VALUES(region), org_name = VALUES(org_name), org_website = VALUES(org_website), org_verified = VALUES(org_verified), donation_url = VALUES(donation_url), suggested_amounts = VALUES(suggested_amounts), `values` = VALUES(`values`), ai_confidence_score = VALUES(ai_confidence_score), date_discovered = VALUES(date_discovered), source_url = VALUES(source_url);"
  );
}

const fullSql = schemaPart + "-- Seed from opportunities.json\n\n" + insertLines.join("\n") + "\n";

fs.writeFileSync(outPath, fullSql, "utf8");
console.log("Wrote " + outPath + " (schema migration + " + list.length + " INSERTs).");
