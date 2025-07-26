import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: "sql308.infinityfree.com",
  user: "if0_38114427",
  password: "hhhhhsssss12345",
  database: "if0_38114427_a1"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    const connection = await mysql.createConnection(dbConfig);

    if (action === 'getUsers') {
      const search = searchParams.get('search') || '';
      const roleFilter = searchParams.get('roleFilter') || '';
      const branchFilter = searchParams.get('branchFilter') || '';

      let sql = "SELECT * FROM users WHERE (fullName LIKE ? OR username LIKE ?)";
      const params = [`%${search}%`, `%${search}%`];

      if (roleFilter) {
        sql += " AND role = ?";
        params.push(roleFilter);
      }

      if (branchFilter) {
        sql += " AND branch = ?";
        params.push(branchFilter);
      }

      const [rows] = await connection.execute(sql, params);
      const users = rows.map(row => ({
        ...row,
        isActive: row.isActive ? 'مفعل' : 'غير مفعل'
      }));
      
      return NextResponse.json(users);
    }

    if (action === 'getUserById') {
      const id = searchParams.get('id');
      const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);
      
      if (rows.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      
      const user = {
        ...rows[0],
        isActive: rows[0].isActive ? 'مفعل' : 'غير مفعل'
      };
      
      return NextResponse.json(user);
    }

    connection.end();
    return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const data = await request.json();
  const action = data.action;

  try {
    const connection = await mysql.createConnection(dbConfig);

    if (action === 'addUser') {
      const { fullName, username, password, nationalID, role, isActive, branch } = data;

      // Check if username exists in the same branch
      const [checkRows] = await connection.execute(
        "SELECT id FROM users WHERE username = ? AND branch = ?",
        [username, branch]
      );

      if (checkRows.length > 0) {
        return NextResponse.json(
          { status: 'error', message: 'اسم المستخدم موجود بالفعل في هذا الفرع' },
          { status: 400 }
        );
      }

      const [result] = await connection.execute(
        "INSERT INTO users (fullName, username, password, nationalID, role, isActive, branch) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [fullName, username, password, nationalID, role, isActive, branch]
      );

      return NextResponse.json(
        { status: 'success', message: 'تم اضافة المستخدم بنجاح' }
      );
    }

    if (action === 'editUser') {
      const { id, fullName, username, password, nationalID, role, isActive, branch } = data;

      // Check if username exists in the same branch excluding current user
      const [checkRows] = await connection.execute(
        "SELECT id FROM users WHERE username = ? AND branch = ? AND id <> ?",
        [username, branch, id]
      );

      if (checkRows.length > 0) {
        return NextResponse.json(
          { status: 'error', message: 'اسم المستخدم موجود بالفعل في هذا الفرع' },
          { status: 400 }
        );
      }

      await connection.execute(
        "UPDATE users SET fullName = ?, username = ?, password = ?, nationalID = ?, role = ?, isActive = ?, branch = ? WHERE id = ?",
        [fullName, username, password, nationalID, role, isActive, branch, id]
      );

      return NextResponse.json(
        { status: 'success', message: 'تم تعديل المستخدم بنجاح' }
      );
    }

    if (action === 'deleteUser') {
      const { id } = data;
      await connection.execute("DELETE FROM users WHERE id = ?", [id]);
      
      return NextResponse.json(
        { status: 'success', message: 'تم حذف المستخدم بنجاح' }
      );
    }

    connection.end();
    return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}