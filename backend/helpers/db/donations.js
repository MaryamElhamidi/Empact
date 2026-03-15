const db = require("./db_conn");

/*
Create Donation
*/
async function createDonation(donation) {

  const sql = `
    INSERT INTO donations
    (user_id, campaign_url, amount, currency, country, people_helped, organization_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    donation.user_id,
    donation.campaign_url ?? null,
    donation.amount,
    donation.currency ?? "USD",
    donation.country ?? null,
    donation.people_helped ?? null,
    donation.organization_name ?? null
  ];

  const [result] = await db.execute(sql, values);

  return result.insertId;
}


/*
Retrieve donation by ID
*/
async function getDonationById(donationId) {

  const sql = `
    SELECT * FROM donations
    WHERE donation_id = ?
  `;

  const [rows] = await db.execute(sql, [donationId]);

  if (rows.length === 0) return null;

  return rows[0];
}


/*
Retrieve all donations for a user
*/
async function getDonationsByUser(userId) {

  const sql = `
    SELECT * FROM donations
    WHERE user_id = ?
    ORDER BY donation_id DESC
  `;

  const [rows] = await db.execute(sql, [userId]);

  return rows;
}


/*
Update donation
*/
async function updateDonation(donationId, updatedDonation) {

  const sql = `
    UPDATE donations
    SET
      campaign_url = ?,
      amount = ?,
      currency = ?,
      country = ?,
      people_helped = ?
    WHERE donation_id = ?
  `;

  const values = [
    updatedDonation.campaign_url ?? null,
    updatedDonation.amount,
    updatedDonation.currency ?? "USD",
    updatedDonation.country ?? null,
    updatedDonation.people_helped ?? null,
    donationId
  ];

  const [result] = await db.execute(sql, values);

  return result.affectedRows;
}


/*
Delete donation
*/
async function deleteDonation(donationId) {

  const sql = `
    DELETE FROM donations
    WHERE donation_id = ?
  `;

  const [result] = await db.execute(sql, [donationId]);

  return result.affectedRows;
}

/*
Impact stats for a user: totalDonated, peopleHelped, countriesSupported
*/
async function getImpactStatsByUser(userId) {

  const [sumRows] = await db.execute(
    `SELECT COALESCE(SUM(amount), 0) AS total_donated,
            COALESCE(SUM(people_helped), 0) AS total_people_helped
     FROM donations WHERE user_id = ?`,
    [userId]
  );

  const [countryRows] = await db.execute(
    `SELECT COUNT(DISTINCT country) AS count
     FROM donations WHERE user_id = ? AND country IS NOT NULL AND country != ''`,
    [userId]
  );

  const totalDonated = Number(sumRows[0]?.total_donated ?? 0);
  let peopleHelped = Number(sumRows[0]?.total_people_helped ?? 0);
  if (peopleHelped === 0 && totalDonated > 0) {
    peopleHelped = Math.max(1, Math.floor(totalDonated / 6.25));
  }
  const countriesSupported = Number(countryRows[0]?.count ?? 0);

  return {
    totalDonated,
    peopleHelped,
    countriesSupported
  };
}

module.exports = {
  createDonation,
  getDonationById,
  getDonationsByUser,
  updateDonation,
  deleteDonation,
  getImpactStatsByUser
};
