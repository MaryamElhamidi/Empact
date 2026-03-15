const db = require("./db_conn");

/*
Create Donation
*/
async function createDonation(donation) {

  const sql = `
    INSERT INTO donations
    (user_id, campaign_url, amount, currency)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    donation.user_id,
    donation.campaign_url,
    donation.amount,
    donation.currency
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
      currency = ?
    WHERE donation_id = ?
  `;

  const values = [
    updatedDonation.campaign_url,
    updatedDonation.amount,
    updatedDonation.currency,
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


module.exports = {
  createDonation,
  getDonationById,
  getDonationsByUser,
  updateDonation,
  deleteDonation
};
