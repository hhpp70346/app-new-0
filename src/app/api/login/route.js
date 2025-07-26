// app/api/auth/route.js
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

// تكوين اتصال قاعدة البيانات
const dbConfig = {
  host: "sql308.infinityfree.com",
  user: "if0_38114427",
  password: "hhhhhsssss12345",
  database: "if0_38114427_a1"
};

export async function POST(request) {
  const { action, ...data } = await request.json();

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    switch (action) {
      case 'login':
        return await handleLogin(connection, data);
      case 'getBranches':
        return await getBranches(connection, data.username);
      case 'getUsersByBranch':
        return await getUsersByBranch(connection, data.branch);
      case 'getUserStatus':
        return await getUserStatus(connection, data.userId);
      case 'changeBranch':
        return await changeUserBranch(connection, data);
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.end();
  }
}

async function handleLogin(connection, { username, password, branch }) {
  // التحقق من الفروع المتاحة لهذا المستخدم
  const [branches] = await connection.execute(
    "SELECT DISTINCT branch FROM users WHERE username = ?",
    [username]
  );

  const branchNames = branches.map(b => b.branch);

  if (branchNames.length > 1 && !branch) {
    return NextResponse.json({
      success: false,
      multiple_branches: true,
      branches: branchNames,
      message: "يرجى اختيار الفرع."
    });
  }

  // التحقق من بيانات الدخول
  const [users] = await connection.execute(
    "SELECT id, username, role, isActive, branch FROM users WHERE username = ? AND password = ? AND branch = ?",
    [username, password, branch || branchNames[0]]
  );

  if (users.length === 0) {
    return NextResponse.json(
      { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة." },
      { status: 401 }
    );
  }

  const user = users[0];

  if (user.isActive === 0) {
    return NextResponse.json({
      success: false,
      message: "حسابك غير مفعل. يرجى الاتصال بالمسؤول."
    });
  }

   // تحديد الصفحة المستهدفة بناءً على الدور
   const redirect = {
    admin: '/admin',
    system_admin: '/system-admin',
    account_manager: '/account-manager',
    issue_manager: '/issue-manager',
    general_manager: '/general_manager',
    revenue_review: '/revenue-review'
  }[user.role] || '/';

  return NextResponse.json({
    success: true,
    redirect,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      branch: user.branch,
      isActive: user.isActive
    }
  });
}

async function getBranches(connection, username = null) {
  let query = "SELECT DISTINCT branch FROM users ORDER BY branch";
  let params = [];
  
  if (username) {
    query = "SELECT DISTINCT branch FROM users WHERE username = ? ORDER BY branch";
    params = [username];
  }
  
  const [branches] = await connection.execute(query, params);
  return NextResponse.json(branches.map(b => b.branch));
}

async function getUsersByBranch(connection, branch) {
  const [users] = await connection.execute(
    "SELECT username FROM users WHERE branch = ? ORDER BY username",
    [branch]
  );
  return NextResponse.json(users.map(u => u.username));
}

async function getUserStatus(connection, userId) {
  const [users] = await connection.execute(
    "SELECT isActive FROM users WHERE id = ?",
    [userId]
  );
  
  if (users.length === 0) {
    return NextResponse.json(
      { success: false, message: "المستخدم غير موجود" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    isActive: users[0].isActive
  });
}

async function changeUserBranch(connection, { username, branch }) {
  // التحقق من وجود المستخدم في الفرع الجديد
  const [users] = await connection.execute(
    "SELECT id, role, isActive FROM users WHERE username = ? AND branch = ?",
    [username, branch]
  );
  
  if (users.length === 0) {
    return NextResponse.json(
      { success: false, message: "المستخدم غير موجود في هذا الفرع" },
      { status: 404 }
    );
  }
  
  const user = users[0];
  
  if (user.isActive === 0) {
    return NextResponse.json(
      { success: false, message: "الحساب غير مفعل في هذا الفرع" },
      { status: 403 }
    );
  }
  
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username,
      role: user.role,
      branch,
      isActive: user.isActive
    }
  });
}