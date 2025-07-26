// pages/api/api-1.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ROOT',
  password: '',
  database: 'A1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, username, branch } = req.body;

    if (action === 'get_user_branches') {
      const [rows] = await pool.query(
        "SELECT DISTINCT branch FROM users WHERE username = ?",
        [username]
      );
      return res.status(200).json({ branches: rows.map(row => row.branch) });
    }

    if (action === 'switch_branch') {
      // هنا يمكنك إضافة تحديث الفرع في الجلسة أو قاعدة البيانات
      return res.status(200).json({ success: true, branch });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}