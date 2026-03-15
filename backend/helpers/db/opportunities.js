const db = require("./db_conn");

/** Map DB row to opportunities.json shape */
function rowToJson(r) {
  const suggestedAmounts = r.suggested_amounts != null
    ? (typeof r.suggested_amounts === "string" ? JSON.parse(r.suggested_amounts) : r.suggested_amounts)
    : [];
  const valuesArr = r.values != null
    ? (typeof r.values === "string" ? JSON.parse(r.values) : r.values)
    : [];
  return {
    opportunity_id: r.opportunity_id,
    title: r.title,
    summary: r.summary ?? null,
    cause: r.cause ?? null,
    region: r.region ?? null,
    organization: {
      name: r.org_name ?? null,
      website: r.org_website ?? null,
      verified: !!r.org_verified
    },
    donation: {
      donation_url: r.donation_url ?? null,
      suggested_amounts: Array.isArray(suggestedAmounts) ? suggestedAmounts : []
    },
    values: Array.isArray(valuesArr) ? valuesArr : [],
    ai_confidence_score: r.ai_confidence_score != null ? Number(r.ai_confidence_score) : null,
    date_discovered: r.date_discovered ?? null,
    source_url: r.source_url ?? null
  };
}

async function getOpportunities(filters) {
  filters = filters || {};
  let sql = [
    "SELECT opportunity_id, title, summary, cause, region, org_name, org_website, org_verified,",
    "donation_url, suggested_amounts, `values`, ai_confidence_score, date_discovered, source_url",
    "FROM opportunities WHERE 1=1"
  ].join(" ");
  const params = [];
  if (filters.region) {
    sql += " AND region = ?";
    params.push(filters.region);
  }
  if (filters.cause) {
    sql += " AND cause LIKE ?";
    params.push("%" + filters.cause + "%");
  }
  if (filters.value) {
    sql += " AND JSON_CONTAINS(`values`, ?)";
    params.push(JSON.stringify(filters.value));
  }
  sql += " ORDER BY ai_confidence_score DESC, date_discovered DESC";
  const [rows] = await db.execute(sql, params);
  return rows.map(rowToJson);
}

async function getFeaturedOpportunity() {
  const [rows] = await db.execute(
    "SELECT opportunity_id, title, summary, cause, region, org_name, org_website, org_verified, donation_url, suggested_amounts, `values`, ai_confidence_score, date_discovered, source_url FROM opportunities ORDER BY ai_confidence_score DESC LIMIT 1"
  );
  return rows.length ? rowToJson(rows[0]) : null;
}

async function getOpportunityById(id) {
  const [rows] = await db.execute(
    "SELECT opportunity_id, title, summary, cause, region, org_name, org_website, org_verified, donation_url, suggested_amounts, `values`, ai_confidence_score, date_discovered, source_url FROM opportunities WHERE opportunity_id = ?",
    [id]
  );
  return rows.length ? rowToJson(rows[0]) : null;
}

async function createOpportunity(opp) {
  const org = opp.organization || {};
  const donation = opp.donation || {};
  const suggestedAmounts = donation.suggested_amounts != null ? JSON.stringify(donation.suggested_amounts) : null;
  const valuesJson = opp.values != null ? JSON.stringify(opp.values) : null;
  await db.execute(
    "INSERT INTO opportunities (opportunity_id, title, summary, cause, region, org_name, org_website, org_verified, donation_url, suggested_amounts, `values`, ai_confidence_score, date_discovered, source_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      opp.opportunity_id,
      opp.title,
      opp.summary ?? null,
      opp.cause ?? null,
      opp.region ?? null,
      org.name ?? null,
      org.website ?? null,
      org.verified === true ? 1 : 0,
      donation.donation_url ?? null,
      suggestedAmounts,
      valuesJson,
      opp.ai_confidence_score ?? null,
      opp.date_discovered ?? null,
      opp.source_url ?? null
    ]
  );
  return opp.opportunity_id;
}

module.exports = {
  getOpportunities,
  getFeaturedOpportunity,
  getOpportunityById,
  createOpportunity
};
