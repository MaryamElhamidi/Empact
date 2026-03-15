const db = require("./db_conn");

async function getOpportunities(filters) {
  filters = filters || {};
  let sql = [
    "SELECT opportunity_id AS id, title, country, summary, urgency,",
    "image_url AS imageUrl, is_verified AS isVerified, recommendation,",
    "is_featured AS isFeatured, created_at AS createdAt FROM opportunities WHERE 1=1"
  ].join(" ");
  const params = [];
  if (filters.urgency) {
    sql += " AND urgency = ?";
    params.push(filters.urgency);
  }
  if (filters.country) {
    sql += " AND country = ?";
    params.push(filters.country);
  }
  if (filters.issue_id) {
    sql += " AND opportunity_id IN (SELECT opportunity_id FROM opportunity_issues WHERE issue_id = ?)";
    params.push(filters.issue_id);
  }
  sql += " ORDER BY FIELD(urgency, 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'), created_at DESC";
  const [rows] = await db.execute(sql, params);
  return rows.map(function (r) {
    return Object.assign({}, r, { isVerified: !!r.isVerified, isFeatured: !!r.isFeatured });
  });
}

async function getFeaturedOpportunity() {
  const [rows] = await db.execute(
    "SELECT opportunity_id AS id, title, country AS location, summary, urgency, image_url AS imageUrl FROM opportunities WHERE is_featured = 1 LIMIT 1"
  );
  return rows.length ? rows[0] : null;
}

async function getOpportunityById(id) {
  const [rows] = await db.execute(
    "SELECT opportunity_id AS id, title, country, summary, urgency, image_url AS imageUrl, is_verified AS isVerified, recommendation, created_at AS createdAt FROM opportunities WHERE opportunity_id = ?",
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return Object.assign({}, r, { isVerified: !!r.isVerified });
}

async function createOpportunity(opp) {
  const [result] = await db.execute(
    "INSERT INTO opportunities (title, country, summary, urgency, image_url, is_verified, recommendation, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      opp.title,
      opp.country,
      opp.summary || null,
      opp.urgency || "MODERATE",
      opp.image_url || opp.imageUrl || null,
      opp.is_verified != null ? opp.is_verified : opp.isVerified != null ? opp.isVerified : 1,
      opp.recommendation || null,
      opp.is_featured != null ? opp.is_featured : opp.isFeatured != null ? opp.isFeatured : 0
    ]
  );
  return result.insertId;
}

module.exports = {
  getOpportunities,
  getFeaturedOpportunity,
  getOpportunityById,
  createOpportunity
};
