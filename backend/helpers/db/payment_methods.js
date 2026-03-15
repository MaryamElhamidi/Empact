const db = require("./db_conn");

async function getByUserId(userId) {
  try {
    const [rows] = await db.execute(
      "SELECT payment_method_id AS id, user_id, last_four AS lastFour, exp_month AS expMonth, exp_year AS expYear, cardholder_name AS cardholderName, billing_zip AS billingZip, created_at AS createdAt FROM payment_methods WHERE user_id = ? ORDER BY created_at ASC",
      [userId]
    );
    return rows;
  } catch (e) {
    if (e.code === "ER_BAD_FIELD_ERROR") {
      const [rows] = await db.execute(
        "SELECT payment_method_id AS id, user_id, last_four AS lastFour, exp_month AS expMonth, exp_year AS expYear, created_at AS createdAt FROM payment_methods WHERE user_id = ? ORDER BY created_at ASC",
        [userId]
      );
      return rows;
    }
    throw e;
  }
}

async function add(userId, method) {
  const lastFour = (method.last_four || method.lastFour || "").toString().slice(-4);
  const expMonth = parseInt(method.exp_month != null ? method.exp_month : method.expMonth, 10);
  const expYear = parseInt(method.exp_year != null ? method.exp_year : method.expYear, 10);
  const cardholderName = method.cardholder_name || method.cardholderName || null;
  const billingZip = method.billing_zip || method.billingZip || null;
  const stripeId = method.stripe_payment_method_id || method.stripePaymentMethodId || null;
  if (!lastFour || lastFour.length !== 4 || isNaN(expMonth) || expMonth < 1 || expMonth > 12 || isNaN(expYear)) {
    throw new Error("Invalid payment method: need last 4 digits, month 1–12, and year");
  }
  try {
    const [result] = await db.execute(
      "INSERT INTO payment_methods (user_id, last_four, exp_month, exp_year, cardholder_name, billing_zip, stripe_payment_method_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, lastFour, expMonth, expYear, cardholderName, billingZip, stripeId]
    );
    return result.insertId;
  } catch (e) {
    if (e.code === "ER_BAD_FIELD_ERROR") {
      const [result] = await db.execute(
        "INSERT INTO payment_methods (user_id, last_four, exp_month, exp_year, stripe_payment_method_id) VALUES (?, ?, ?, ?, ?)",
        [userId, lastFour, expMonth, expYear, stripeId]
      );
      return result.insertId;
    }
    throw e;
  }
}

async function remove(paymentMethodId, userId) {
  const [result] = await db.execute(
    "DELETE FROM payment_methods WHERE payment_method_id = ? AND user_id = ?",
    [paymentMethodId, userId]
  );
  return result.affectedRows;
}

module.exports = {
  getByUserId,
  add,
  remove
};
