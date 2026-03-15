const db = require("./db_conn");

/*
Get global issues with opportunity count per issue
*/
async function getGlobalIssuesWithCounts() {
  const [rows] = await db.execute(
    `SELECT g.issue_id, g.name, g.icon, g.sort_order,
            COUNT(oi.opportunity_id) AS count
     FROM global_issues g
     LEFT JOIN opportunity_issues oi ON g.issue_id = oi.issue_id
     GROUP BY g.issue_id, g.name, g.icon, g.sort_order
     ORDER BY g.sort_order ASC, g.name ASC`
  );
  return rows.map((r) => ({
    name: r.name,
    icon: r.icon || "📌",
    count: Number(r.count),
  }));
}

/*
Get all global issues (no counts)
*/
async function getGlobalIssues() {
  const [rows] = await db.execute(
    `SELECT issue_id, name, icon, sort_order FROM global_issues ORDER BY sort_order, name`
  );
  return rows;
}

/*
Create global issue (admin/seed)
*/
async function createGlobalIssue(issue) {
  const [result] = await db.execute(
    `INSERT INTO global_issues (name, icon, sort_order) VALUES (?, ?, ?)`,
    [issue.name, issue.icon ?? null, issue.sort_order ?? 0]
  );
  return result.insertId;
}

/*
Link opportunity to issue
*/
async function linkOpportunityToIssue(opportunityId, issueId) {
  await db.execute(
    `INSERT IGNORE INTO opportunity_issues (opportunity_id, issue_id) VALUES (?, ?)`,
    [opportunityId, issueId]
  );
}

module.exports = {
  getGlobalIssuesWithCounts,
  getGlobalIssues,
  createGlobalIssue,
  linkOpportunityToIssue,
};
