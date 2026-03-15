/**
 * Imports charities from backend/data/charity_registry.json into the SQL database.
 * Ensures causes and regions tables are populated and consistent (including with opportunities).
 * Run from repo root: node backend/scripts/seed_charities_from_registry.js
 *
 * Prerequisites: DB already has opportunities table (can be empty). Run db.sql first.
 */
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const db = require("../helpers/db/db_conn");

const registryPath = path.join(__dirname, "../data/charity_registry.json");

function escapeSql(s) {
  if (s == null) return "NULL";
  return "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

async function run() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const charities = registry.charities || [];

  const causeSlugs = new Set();
  const regionNames = new Set();

  for (const c of charities) {
    (c.focus_values || []).forEach((v) => causeSlugs.add(v));
    (c.regions || []).forEach((r) => regionNames.add(r));
  }

  // Add causes/regions from opportunities table so they stay consistent
  try {
    const [oppRows] = await db.execute(
      "SELECT region, `values` FROM opportunities WHERE region IS NOT NULL OR `values` IS NOT NULL"
    );
    for (const row of oppRows) {
      if (row.region) regionNames.add(row.region);
      if (row.values) {
        const arr = typeof row.values === "string" ? JSON.parse(row.values) : row.values;
        if (Array.isArray(arr)) arr.forEach((v) => causeSlugs.add(v));
      }
    }
  } catch (e) {
    // opportunities table might not exist or might have no rows
  }

  // Insert causes
  for (const slug of causeSlugs) {
    await db.execute("INSERT IGNORE INTO causes (cause_slug) VALUES (?)", [slug]);
  }
  console.log("Causes:", causeSlugs.size);

  // Insert regions
  for (const name of regionNames) {
    await db.execute("INSERT IGNORE INTO regions (name) VALUES (?)", [name]);
  }
  console.log("Regions:", regionNames.size);

  // Sync global_issues: add any cause_slug that is not yet in global_issues (by name)
  for (const slug of causeSlugs) {
    const [rows] = await db.execute("SELECT 1 FROM global_issues WHERE name = ? LIMIT 1", [slug]);
    if (rows.length === 0) {
      await db.execute("INSERT INTO global_issues (name, icon) VALUES (?, NULL)", [slug]);
    }
  }

  // Insert or update charities
  for (const c of charities) {
    await db.execute(
      `INSERT INTO charities (charity_id, name, website, donation_url, description, verified)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         website = VALUES(website),
         donation_url = VALUES(donation_url),
         description = VALUES(description),
         verified = VALUES(verified)`,
      [
        c.charity_id,
        c.name,
        c.website || null,
        c.donation_url || null,
        c.description || null,
        c.verified === true ? 1 : 0
      ]
    );
  }
  console.log("Charities:", charities.length);

  // Clear and repopulate charity_causes and charity_regions
  for (const c of charities) {
    await db.execute("DELETE FROM charity_causes WHERE charity_id = ?", [c.charity_id]);
    await db.execute("DELETE FROM charity_regions WHERE charity_id = ?", [c.charity_id]);

    for (const slug of c.focus_values || []) {
      await db.execute("INSERT IGNORE INTO charity_causes (charity_id, cause_slug) VALUES (?, ?)", [c.charity_id, slug]);
    }

    for (const regionName of c.regions || []) {
      const [rows] = await db.execute("SELECT region_id FROM regions WHERE name = ?", [regionName]);
      if (rows.length > 0) {
        await db.execute("INSERT IGNORE INTO charity_regions (charity_id, region_id) VALUES (?, ?)", [
          c.charity_id,
          rows[0].region_id
        ]);
      }
    }
  }

  console.log("Done. Causes, regions, global_issues, charities, charity_causes, and charity_regions are updated.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
