const db = require("./db_conn");

async function getByUserId(userId) {
  const [rows] = await db.execute(
    "SELECT notification_id AS id, type, title, message, target, user_name AS userName, user_avatar AS userAvatar, user_fallback AS userFallback, is_read AS isRead, actions, created_at AS createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows.map(function (r) {
    return Object.assign({}, r, {
      isRead: !!r.isRead,
      actions: r.actions ? (typeof r.actions === "string" ? JSON.parse(r.actions) : r.actions) : null
    });
  });
}

async function markAsRead(notificationId, userId) {
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?",
    [notificationId, userId]
  );
  return result.affectedRows;
}

async function markAllAsRead(userId) {
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId]
  );
  return result.affectedRows;
}

async function create(userId, notification) {
  const actionsJson = notification.actions ? JSON.stringify(notification.actions) : null;
  const [result] = await db.execute(
    "INSERT INTO notifications (user_id, type, title, message, target, user_name, user_avatar, user_fallback, is_read, actions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)",
    [
      userId,
      notification.type,
      notification.title,
      notification.message,
      notification.target || null,
      notification.user && notification.user.name ? notification.user.name : null,
      notification.user && notification.user.avatar ? notification.user.avatar : null,
      notification.user && notification.user.fallback ? notification.user.fallback : null,
      actionsJson
    ]
  );
  return result.insertId;
}

async function remove(notificationId, userId) {
  const [result] = await db.execute(
    "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
    [notificationId, userId]
  );
  return result.affectedRows;
}

module.exports = {
  getByUserId,
  markAsRead,
  markAllAsRead,
  create,
  remove
};
