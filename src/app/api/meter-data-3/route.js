import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: "sql308.infinityfree.com",
  user: "if0_38114427",
  password: "hhhhhsssss12345",
  database: "if0_38114427_a1"
};
// تعريف الأدوار باللغة العربية
const roles = {
  'admin': 'المدير العام',
  'system_admin': 'مدير النظام',
  'account_manager': 'إدارة الحسابات',
  'issue_manager': 'إدارة الإصدار',
  'general_manager': 'متابعة المدير العام',
  'revenue_review': 'مراجعة الإيرادات'
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM deleted_meter_data');
    connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const input = await request.json();
    const connection = await mysql.createConnection(dbConfig);

    if (input.action === 'restore') {
      // استرجاع السجل من جدول deleted_meter_data
      const [record] = await connection.execute('SELECT * FROM deleted_meter_data WHERE id = ?', [input.id]);
      
      if (record.length === 0) {
        connection.end();
        return NextResponse.json({ error: "السجل غير موجود في سجل المحذوفات" }, { status: 404 });
      }

      // الحصول على اسم المستخدم ودوره الحالي لتسجيله كقائم بالاسترجاع
      const userRole = roles[input.user?.role] || input.user?.role;
      const restorer = `${input.user?.username || 'غير معروف'} (${userRole || 'دور غير معروف'})`;

      // إدراج السجل في جدول meter_data
      await connection.execute(
        `INSERT INTO meter_data 
        (id, permissionNumber, requestDate, accountReference, meterNumber, balanceTo, balanceDebtor, meterStatus, 
         faultType, faultNotes, intentional, billNotice, averageQuantity, basePeriodFrom, basePeriodTo, 
         faultPeriodFrom, faultPeriodTo, settlementQuantity, totalSettlement, paidDiscount, installments, 
         executionNotes, success, added_by, updated_by, restored_by, branch)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record[0].id,
          record[0].permissionNumber,
          record[0].requestDate,
          record[0].accountReference,
          record[0].meterNumber,
          record[0].balanceTo,
          record[0].balanceDebtor,
          record[0].meterStatus,
          record[0].faultType,
          record[0].faultNotes,
          record[0].intentional,
          record[0].billNotice,
          record[0].averageQuantity,
          record[0].basePeriodFrom,
          record[0].basePeriodTo,
          record[0].faultPeriodFrom,
          record[0].faultPeriodTo,
          record[0].settlementQuantity,
          record[0].totalSettlement,
          record[0].paidDiscount,
          record[0].installments,
          record[0].executionNotes,
          record[0].success,
          record[0].added_by,
          record[0].updated_by || null,
          restorer,
          record[0].branch
        ]
      );

      // حذف السجل من جدول deleted_meter_data
      await connection.execute('DELETE FROM deleted_meter_data WHERE id = ?', [input.id]);
      connection.end();

      return NextResponse.json({ 
        status: 'success', 
        message: 'تم استرجاع السجل بنجاح' 
      });
    } else if (input.action === 'deletePermanently') {
      // حذف السجل نهائياً من جدول deleted_meter_data
      await connection.execute('DELETE FROM deleted_meter_data WHERE id = ?', [input.id]);
      connection.end();

      return NextResponse.json({ 
        status: 'success', 
        message: 'تم حذف السجل نهائياً' 
      });
    }

    connection.end();
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}