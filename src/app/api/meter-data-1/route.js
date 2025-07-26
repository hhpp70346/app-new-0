import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// تعريف الأدوار باللغة العربية
const roles = {
  'admin': 'المدير العام',
  'system_admin': 'مدير النظام',
  'account_manager': 'إدارة الحسابات',
  'issue_manager': 'إدارة الإصدار',
  'general_manager': 'متابعة المدير العام',
  'revenue_review': 'مراجعة الإيرادات'
};

const dbConfig = {
  host: "sql308.infinityfree.com",
  user: "if0_38114427",
  password: "hhhhhsssss12345",
  database: "if0_38114427_a1"
};

// إنشاء اتصال قاعدة البيانات
async function getDbConnection() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
}

// معالجة طلبات GET
async function handleGetRequest(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const id = searchParams.get('id');

  try {
    const connection = await getDbConnection();

    if (action === 'getDataById' && id) {
      const [rows] = await connection.execute("SELECT * FROM meter_data WHERE id = ?", [id]);
      if (rows.length > 0) {
        const data = rows[0];
        data.intentional = Boolean(data.intentional);
        data.billNotice = Boolean(data.billNotice);
        data.success = Boolean(data.success);
        return NextResponse.json(data);
      } else {
        return NextResponse.json({ status: 'error', message: 'لا يوجد بيانات' }, { status: 404 });
      }
    } else {
      const [rows] = await connection.execute("SELECT * FROM meter_data");
      const data = rows.map(row => ({
        ...row,
        intentional: Boolean(row.intentional),
        billNotice: Boolean(row.billNotice),
        success: Boolean(row.success)
      }));
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'فشل الاتصال: ' + error.message },
      { status: 500 }
    );
  }
}

// معالجة طلبات POST (تعديل البيانات)
async function handlePostRequest(request) {
  try {
    const { action, ...payload } = await request.json();
    const connection = await getDbConnection();

    if (action === 'editData') {
      // بدء الجلسة (في Next.js يمكن استخدام cookies أو جلب معلومات المستخدم من مكان آخر)
      // هنا سنفترض أن معلومات المستخدم تأتي مع الطلب
      const user = payload.user || { username: 'غير معروف', role: 'ضيف' };
      const updated_by = user.username + " (" + (roles[user.role] || user.role) + ")";

      await connection.execute(
        `UPDATE meter_data SET 
          permissionNumber = ?, 
          requestDate = ?, 
          accountReference = ?, 
          meterNumber = ?, 
          balanceTo = ?, 
          balanceDebtor = ?, 
          meterStatus = ?, 
          faultType = ?, 
          faultNotes = ?, 
          intentional = ?, 
          billNotice = ?, 
          averageQuantity = ?, 
          basePeriodFrom = ?, 
          basePeriodTo = ?, 
          faultPeriodFrom = ?, 
          faultPeriodTo = ?, 
          settlementQuantity = ?, 
          totalSettlement = ?, 
          paidDiscount = ?, 
          installments = ?, 
          executionNotes = ?, 
          success = ?,
          updated_by = ? 
          WHERE id = ?`,
        [
          payload.permissionNumber,
          payload.requestDate,
          payload.accountReference,
          payload.meterNumber,
          payload.balanceTo,
          payload.balanceDebtor,
          payload.meterStatus,
          payload.faultType,
          payload.faultNotes,
          payload.intentional ? 1 : 0,
          payload.billNotice ? 1 : 0,
          payload.averageQuantity,
          payload.basePeriodFrom,
          payload.basePeriodTo,
          payload.faultPeriodFrom,
          payload.faultPeriodTo,
          payload.settlementQuantity,
          payload.totalSettlement,
          payload.paidDiscount,
          payload.installments,
          payload.executionNotes,
          payload.success ? 1 : 0,
          updated_by,
          payload.id
        ]
      );

      return NextResponse.json({ status: 'success' });
    } else if (action === 'deleteData') {
      await connection.execute("DELETE FROM meter_data WHERE id = ?", [payload.id]);
      return NextResponse.json({ status: 'success' });
    } else {
      return NextResponse.json(
        { status: 'error', message: 'إجراء غير صالح' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'حدث خطأ: ' + error.message },
      { status: 500 }
    );
  }
}

// الدالة الرئيسية لمعالجة الطلبات
export async function GET(request) {
  return handleGetRequest(request);
}

export async function POST(request) {
  return handlePostRequest(request);
}