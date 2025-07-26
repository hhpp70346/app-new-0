// app/api/meter-data/route.js
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

// تكوين اتصال قاعدة البيانات
const dbConfig = {
  host: "sql308.infinityfree.com",
  user: "if0_38114427",
  password: "hhhhhsssss12345",
  database: "if0_38114427_a1"
};
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    if (id) {
      const [rows] = await connection.execute('SELECT * FROM meter_data WHERE id = ?', [id]);
      if (rows.length > 0) {
        const row = rows[0];
        // تحويل القيم الرقمية إلى أعداد صحيحة
        row.intentional = parseInt(row.intentional);
        row.billNotice = parseInt(row.billNotice);
        row.success = parseInt(row.success);
        return new Response(JSON.stringify(row), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: "لا توجد بيانات بهذا المعرف" }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      const [rows] = await connection.execute('SELECT * FROM meter_data');
      const data = rows.map(row => {
        row.intentional = parseInt(row.intentional);
        row.billNotice = parseInt(row.billNotice);
        row.success = parseInt(row.success);
        return row;
      });
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "فشل الاتصال: " + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) connection.end();
  }
}

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    connection = await mysql.createConnection(dbConfig);

    // الحصول على بيانات المستخدم من الطلب
    const user = data.user || { username: 'غير معروف', role: 'ضيف' };
    const added_by = user.username + " (" + (roles[user.role] || 'ضيف') + ")";
    const branch = user.branch || '';

    const sql = `INSERT INTO meter_data (permissionNumber, requestDate, accountReference, meterNumber, balanceTo, balanceDebtor, meterStatus, faultType, faultNotes, intentional, billNotice, averageQuantity, basePeriodFrom, basePeriodTo, faultPeriodFrom, faultPeriodTo, settlementQuantity, totalSettlement, paidDiscount, installments, executionNotes, success, added_by, branch) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      data.permissionNumber,
      data.requestDate,
      data.accountReference,
      data.meterNumber,
      data.balanceTo,
      data.balanceDebtor,
      data.meterStatus,
      data.faultType,
      data.faultNotes,
      data.intentional || 0,
      data.billNotice || 0,
      data.averageQuantity,
      data.basePeriodFrom,
      data.basePeriodTo,
      data.faultPeriodFrom,
      data.faultPeriodTo,
      data.settlementQuantity,
      data.totalSettlement,
      data.paidDiscount,
      data.installments,
      data.executionNotes,
      data.success || 0,
      added_by,
      branch
    ];

    const [result] = await connection.execute(sql, values);
    
    return new Response(JSON.stringify({ 
      message: "تم إضافة البيانات بنجاح",
      id: result.insertId 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "حدث خطأ أثناء إضافة البيانات: " + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) connection.end();
  }
}

export async function PUT(request) {
  let connection;
  try {
    const data = await request.json();
    connection = await mysql.createConnection(dbConfig);

    const sql = `UPDATE meter_data SET 
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
                success = ?
                WHERE id = ?`;

    const values = [
      data.permissionNumber,
      data.requestDate,
      data.accountReference,
      data.meterNumber,
      data.balanceTo,
      data.balanceDebtor,
      data.meterStatus,
      data.faultType,
      data.faultNotes,
      data.intentional || 0,
      data.billNotice || 0,
      data.averageQuantity,
      data.basePeriodFrom,
      data.basePeriodTo,
      data.faultPeriodFrom,
      data.faultPeriodTo,
      data.settlementQuantity,
      data.totalSettlement,
      data.paidDiscount,
      data.installments,
      data.executionNotes,
      data.success || 0,
      data.id
    ];

    await connection.execute(sql, values);
    
    return new Response(JSON.stringify({ 
      message: "تم تحديث البيانات بنجاح" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "حدث خطأ أثناء تحديث البيانات: " + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) connection.end();
  }
}

export async function DELETE(request) {
  let connection;
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "المعرف مطلوب" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    connection = await mysql.createConnection(dbConfig);
    await connection.execute('DELETE FROM meter_data WHERE id = ?', [id]);
    
    return new Response(JSON.stringify({ 
      message: "تم حذف البيانات بنجاح" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "حدث خطأ أثناء حذف البيانات: " + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) connection.end();
  }
}