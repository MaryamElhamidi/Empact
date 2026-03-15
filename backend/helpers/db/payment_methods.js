const db = require("./db_conn");

async function getByUserId(userId) {
  const [rows] = await db.execute(
    "SELECT payment_method_id AS id, user_id, last_four AS lastFour, exp_month AS expMonth, exp_year AS expYear, created_at AS createdAt FROM payment_methods WHERE user_id = ? ORDER BY created_at ASC",
    [userId]
  );
  return rows;
}

async function add(userId, method) {
  const lastFour = (method.last_four || method.lastFour || "").toString().slice(-4);
  const expMonth = method.exp_month != null ? method.exp_month : method.expMonth;
  const expYear = method.exp_year != null ? method.exp_year : method.expYear;
  const [result] = await db.execute(
    "INSERT INTO payment_methods (user_id, last_four, exp_month, exp_year, stripe_payment_method_id) VALUES (?, ?, ?, ?, ?)",
    [userId, lastFour, expMonth, expYear, method.stripe_payment_method_id || method.stripePaymentMethodId || null]
  );
  return result.insertId;
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
