const db = require("./db_conn");

/*
Get global issues with opportunity count (from opportunities.values JSON; no opportunity_issues table)
*/
async function getGlobalIssuesWithCounts() {
  const [rows] = await db.execute(
    `SELECT g.issue_id, g.name, g.icon FROM global_issues g ORDER BY g.name ASC`
  );
  return rows.map((r) => ({
    name: r.name,
    icon: r.icon || "📌",
    count: 0,
  }));
}

/*
Get all global issues (no counts)
*/
async function getGlobalIssues() {
  const [rows] = await db.execute(
    `SELECT issue_id, name, icon FROM global_issues ORDER BY name`
  );
  return rows;
}

/*
Create global issue (admin/seed)
*/
async function createGlobalIssue(issue) {
  const [result] = await db.execute(
    `INSERT INTO global_issues (name, icon) VALUES (?, ?)`,
    [issue.name, issue.icon ?? null]
  );
  return result.insertId;
}

module.exports = {
  getGlobalIssuesWithCounts,
  getGlobalIssues,
  createGlobalIssue,
};
