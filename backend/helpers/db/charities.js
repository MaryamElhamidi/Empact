const db = require("./db_conn");

/**
 * Get charities that match any of the given cause slugs, ordered by number of matching causes.
 * Returns at most `limit` charities (default 3). Uses SQL DB only.
 */
async function getCharitiesByCauseSlugs(causeSlugs, limit = 3) {
  if (!causeSlugs || causeSlugs.length === 0) {
    return [];
  }
  const placeholders = causeSlugs.map(() => "?").join(",");
  const [rows] = await db.execute(
    `SELECT c.charity_id, c.name, c.website, c.donation_url, c.description, c.verified,
            COUNT(cc.cause_slug) AS match_count
     FROM charities c
     INNER JOIN charity_causes cc ON c.charity_id = cc.charity_id
     WHERE cc.cause_slug IN (${placeholders})
     GROUP BY c.charity_id, c.name, c.website, c.donation_url, c.description, c.verified
     ORDER BY match_count DESC, c.name ASC
     LIMIT ?`,
    [...causeSlugs, limit]
  );
  return rows.map((r) => ({
    charity_id: r.charity_id,
    name: r.name,
    website: r.website,
    donation_url: r.donation_url,
    description: r.description,
    verified: !!r.verified
  }));
}

/**
 * Get up to `limit` charities that share at least one cause with the given opportunity (by id).
 * Uses opportunity.values (JSON array of cause slugs) from the SQL database.
 */
async function getRelatedCharitiesForOpportunity(opportunityId, limit = 3) {
  const [oppRows] = await db.execute(
    "SELECT `values` FROM opportunities WHERE opportunity_id = ?",
    [opportunityId]
  );
  if (!oppRows.length) return [];
  const values = oppRows[0].values;
  const slugs = values != null
    ? (typeof values === "string" ? JSON.parse(values) : values)
    : [];
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  return getCharitiesByCauseSlugs(slugs, limit);
}

module.exports = {
  getCharitiesByCauseSlugs,
  getRelatedCharitiesForOpportunity
};
