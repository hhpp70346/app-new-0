import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: "sql308.infinityfree.com",
  user: "if0_38114427",
  password: "hhhhhsssss12345",
  database: "if0_38114427_a1"
};

export async function POST(request) {
  const { currentPassword, newPassword, userId } = await request.json();

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. Verify current password
    const [users] = await connection.execute(
      "SELECT id FROM users WHERE id = ? AND password = ?",
      [userId, currentPassword]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // 2. Update password
    await connection.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPassword, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}