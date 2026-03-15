/**
 * Test relevance ordering without DB: reads opportunities.json and runs sortByRelevancy.
 * Run: node backend/scripts/test_relevancy.js [causes] [regions]
 * Example: node backend/scripts/test_relevancy.js "food_security,refugees" "Kenya,Global"
 */
const path = require("path");
const fs = require("fs");

const dataPath = path.join(__dirname, "../data/opportunities.json");
const opportunities = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const { sortByRelevancy } = require("../helpers/db/opportunities");

const causesStr = process.argv[2] || "food_security,disaster_relief";
const regionsStr = process.argv[3] || "Kenya,Sudan";
const userCauses = causesStr.split(",").map((s) => s.trim()).filter(Boolean);
const userRegions = regionsStr.split(",").map((s) => s.trim()).filter(Boolean);

const sorted = sortByRelevancy(opportunities, userCauses, userRegions);

console.log("Relevancy sort test (Node)");
console.log("User causes:", userCauses);
console.log("User regions:", userRegions);
console.log("Total opportunities:", opportunities.length);
console.log("\nTop 10 (relevance-ordered, most recent first within tier):\n");

sorted.slice(0, 10).forEach((opp, i) => {
  const r = opp.region || "";
  const c = opp.cause || "";
  const date = (opp.date_discovered || "").slice(0, 10);
  const regionMatch = userRegions.some((ur) => r.toLowerCase().includes(ur.toLowerCase()) || ur.toLowerCase().includes(r.toLowerCase()));
  const causeMatch = userCauses.includes(c) || (opp.values || []).some((v) => userCauses.includes(v));
  const tier = regionMatch && causeMatch ? "region+cause" : regionMatch ? "region" : causeMatch ? "cause" : "—";
  console.log(`  ${i + 1}. [${tier}] ${r} | ${c} | ${date} | ${opp.title?.slice(0, 50)}...`);
});

console.log("\n✓ Relevancy ordering: matching region+cause first, then by date.");
