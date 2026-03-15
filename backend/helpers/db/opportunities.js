const path = require("path");
const fs = require("fs");
const db = require("./db_conn");

/** Normalize for matching */
function norm(s) {
  return (s || "").toString().trim().toLowerCase();
}

let regionToCountries = null;
function loadRegionCountries() {
  if (regionToCountries != null) return regionToCountries;
  try {
    const p = path.join(__dirname, "../../data/region_countries.json");
    regionToCountries = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (_) {
    regionToCountries = {};
  }
  return regionToCountries;
}

/** Expand user signup regions (e.g. Africa, Eastern Europe) to set of country names for matching. */
function expandRegionsToCountries(userRegionNames) {
  const mapping = loadRegionCountries();
  const countries = new Set();
  let hasGlobal = false;
  for (const r of userRegionNames || []) {
    const name = (r || "").toString().trim();
    if (!name) continue;
    const n = norm(name);
    if (n === "global") {
      hasGlobal = true;
      continue;
    }
    const key = Object.keys(mapping).find((k) => k.toLowerCase() === n);
    if (key && mapping[key]) {
      for (const c of mapping[key]) {
        if (c) countries.add(norm(c));
      }
    } else {
      countries.add(n);
    }
  }
  return { countries, hasGlobal };
}

/** Relevancy sort: region + cause match first, then most recent date. User regions (e.g. Africa) matched to opportunity country via region_countries.json. */
function sortByRelevancy(opportunities, userCauses, userRegions) {
  const causesSet = new Set((userCauses || []).map(norm).filter(Boolean));
  const { countries: expandedCountries, hasGlobal } = expandRegionsToCountries(userRegions);

  function regionMatches(oppRegion) {
    if (hasGlobal) return true;
    if (!oppRegion || expandedCountries.size === 0) return false;
    const o = norm(oppRegion);
    if (expandedCountries.has(o)) return true;
    for (const c of expandedCountries) {
      if (o.includes(c) || c.includes(o)) return true;
    }
    return false;
  }
  function causeMatches(oppCause) {
    if (!oppCause || causesSet.size === 0) return false;
    return causesSet.has(norm(oppCause));
  }
  function valueScore(opp) {
    const ov = new Set((opp.values || []).map(norm).filter(Boolean));
    let n = 0;
    for (const c of causesSet) {
      if (ov.has(c)) n++;
    }
    return n;
  }
  function dateTs(opp) {
    const d = opp.date_discovered;
    if (!d) return 0;
    try {
      return new Date(d.replace("Z", "+00:00")).getTime();
    } catch (_) {
      return 0;
    }
  }

  return [...opportunities].sort((a, b) => {
    const regionA = regionMatches(a.region);
    const regionB = regionMatches(b.region);
    const causeA = causeMatches(a.cause) || valueScore(a) > 0;
    const causeB = causeMatches(b.cause) || valueScore(b) > 0;
    const relA = regionA && causeA ? 3 : regionA ? 2 : causeA ? 1 : 0;
    const relB = regionB && causeB ? 3 : regionB ? 2 : causeB ? 1 : 0;
    if (relA !== relB) return relB - relA;
    const valA = valueScore(a);
    const valB = valueScore(b);
    if (valA !== valB) return valB - valA;
    return dateTs(b) - dateTs(a);
  });
}

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
  const userCauses = filters.causes ? (typeof filters.causes === "string" ? filters.causes.split(",").map((s) => s.trim()).filter(Boolean) : filters.causes) : [];
  const userRegions = filters.regions ? (typeof filters.regions === "string" ? filters.regions.split(",").map((s) => s.trim()).filter(Boolean) : filters.regions) : [];
  const useRelevancy = userCauses.length > 0 || userRegions.length > 0;

  let sql = [
    "SELECT opportunity_id, title, summary, cause, region, org_name, org_website, org_verified,",
    "donation_url, suggested_amounts, `values`, ai_confidence_score, date_discovered, source_url",
    "FROM opportunities WHERE 1=1"
  ].join(" ");
  const params = [];
  if (!useRelevancy && filters.region) {
    sql += " AND region = ?";
    params.push(filters.region);
  }
  if (!useRelevancy && filters.cause) {
    sql += " AND cause LIKE ?";
    params.push("%" + filters.cause + "%");
  }
  if (filters.value) {
    sql += " AND JSON_CONTAINS(`values`, ?)";
    params.push(JSON.stringify(filters.value));
  }
  sql += " ORDER BY ai_confidence_score DESC, date_discovered DESC";
  const [rows] = await db.execute(sql, params);
  const list = rows.map(rowToJson);
  if (useRelevancy) {
    return sortByRelevancy(list, userCauses, userRegions);
  }
  return list;
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
  createOpportunity,
  sortByRelevancy
};
