const { pool } = require('../config/db');

const createNotification = async ({ userId, message, type = 'general' }) => {
  const [result] = await pool.query(
    'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
    [userId, message, type]
  );
  const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getNotificationsForUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const markAsRead = async (notificationId, userId) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [
    notificationId,
    userId
  ]);
};

module.exports = { createNotification, getNotificationsForUser, markAsRead };
