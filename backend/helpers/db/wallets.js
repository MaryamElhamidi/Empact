const db = require("./db_conn");

async function getWallet(userId) {
  const [rows] = await db.execute(
    "SELECT wallet_id, user_id, balance_cents, currency, updated_at FROM wallets WHERE user_id = ?",
    [userId]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    wallet_id: r.wallet_id,
    user_id: r.user_id,
    balance_cents: r.balance_cents,
    balance: (r.balance_cents / 100).toFixed(2),
    currency: r.currency,
    updated_at: r.updated_at
  };
}

async function getOrCreateWallet(userId, currency) {
  currency = currency || "USD";
  let w = await getWallet(userId);
  if (w) return w;
  await db.execute(
    "INSERT INTO wallets (user_id, balance_cents, currency) VALUES (?, 0, ?)",
    [userId, currency]
  );
  return getWallet(userId);
}

async function updateBalance(userId, balanceCents) {
  const [result] = await db.execute(
    "UPDATE wallets SET balance_cents = ? WHERE user_id = ?",
    [balanceCents, userId]
  );
  return result.affectedRows;
}

async function addBalance(userId, deltaCents) {
  await getOrCreateWallet(userId);
  const [rows] = await db.execute(
    "SELECT balance_cents FROM wallets WHERE user_id = ?",
    [userId]
  );
  const current = rows[0].balance_cents;
  const next = Math.max(0, current + deltaCents);
  await updateBalance(userId, next);
  return next;
}

module.exports = {
  getWallet,
  getOrCreateWallet,
  updateBalance,
  addBalance
};
