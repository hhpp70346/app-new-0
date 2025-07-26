// app/single-phase-meter-inspection/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

const SinglePhaseMeterInspection = () => {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showColorSettings, setShowColorSettings] = useState(false);

  // تحميل بيانات المستخدم من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // تحميل البيانات من API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/meter-data');
      if (!response.ok) {
        throw new Error('فشل في تحميل البيانات');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      showMessage("حدث خطأ أثناء تحميل البيانات", false);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // حساب الفرق بين التاريخين بالأيام
  const calculateDaysDifference = (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    return Math.round(Math.abs((endDate - startDate) / oneDay));
  };

  // عرض رسالة للمستخدم
  const showMessage = (message, isSuccess) => {
    Swal.fire({
      title: isSuccess ? 'نجاح' : 'خطأ',
      text: message,
      icon: isSuccess ? 'success' : 'error',
      confirmButtonText: 'موافق',
      confirmButtonColor: isSuccess ? '#2b6cb0' : '#e53e3e'
    });
  };

  // عرض رسالة تأكيد
  const showConfirmation = (message, onConfirm) => {
    Swal.fire({
      title: 'تأكيد',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2b6cb0',
      cancelButtonColor: '#718096',
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) onConfirm();
    });
  };

  // ترتيب البيانات
  const sortTable = (columnIndex) => {
    const newDirection = sortColumn === columnIndex ? sortDirection * -1 : 1;
    setSortColumn(columnIndex);
    setSortDirection(newDirection);
    
    const filteredData = [...data].filter(item => 
      user ? item.branch === user.branch : true
    );
    
    filteredData.sort((a, b) => {
      const aValue = getValueByColumn(a, columnIndex);
      const bValue = getValueByColumn(b, columnIndex);
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * newDirection;
      }
      return (aValue - bValue) * newDirection;
    });
    
    setData(filteredData);
  };

  // الحصول على قيمة العمود
  const getValueByColumn = (item, columnIndex) => {
    const columnsMap = {
      0: item.id,
      1: item.permissionNumber,
      2: item.requestDate,
      3: item.accountReference,
      4: item.meterNumber,
      5: parseFloat(item.balanceTo),
      6: parseFloat(item.balanceDebtor),
      7: item.meterStatus,
      8: item.faultType,
      9: item.faultNotes,
      10: item.intentional ? 1 : 0,
      11: item.billNotice ? 1 : 0,
      12: parseFloat(item.averageQuantity),
      13: item.basePeriodFrom,
      14: item.basePeriodTo,
      15: calculateDaysDifference(item.basePeriodFrom, item.basePeriodTo),
      16: item.faultPeriodFrom,
      17: item.faultPeriodTo,
      18: calculateDaysDifference(item.faultPeriodFrom, item.faultPeriodTo),
      19: parseFloat(item.settlementQuantity),
      20: parseFloat(item.totalSettlement),
      21: parseFloat(item.paidDiscount),
      22: parseFloat(item.totalSettlement - item.paidDiscount),
      23: item.installments,
      24: item.executionNotes,
      25: item.success ? 1 : 0,
      26: item.added_by,
      27: item.branch
    };
    return columnsMap[columnIndex];
  };

  // حساب الإجماليات
  const calculateTotals = (filteredData) => {
    const totals = {
      balanceTo: 0, 
      balanceDebtor: 0, 
      averageQuantity: 0, 
      averageDays: 0,
      faultDays: 0, 
      settlementQuantity: 0, 
      totalSettlement: 0, 
      paidDiscount: 0,
      netSettlement: 0, 
      installments: 0
    };
    
    filteredData.forEach(item => {
      totals.balanceTo += parseFloat(item.balanceTo) || 0;
      totals.balanceDebtor += parseFloat(item.balanceDebtor) || 0;
      totals.averageQuantity += parseFloat(item.averageQuantity) || 0;
      totals.averageDays += calculateDaysDifference(item.basePeriodFrom, item.basePeriodTo);
      totals.faultDays += calculateDaysDifference(item.faultPeriodFrom, item.faultPeriodTo);
      totals.settlementQuantity += parseFloat(item.settlementQuantity) || 0;
      totals.totalSettlement += parseFloat(item.totalSettlement) || 0;
      totals.paidDiscount += parseFloat(item.paidDiscount) || 0;
      totals.netSettlement += (parseFloat(item.totalSettlement) - parseFloat(item.paidDiscount)) || 0;
      totals.installments += parseFloat(item.installments) || 0;
    });
    
    return totals;
  };

  // إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showMessage("يجب تسجيل الدخول أولاً", false);
      return;
    }
    
    showConfirmation("هل أنت متأكد من حفظ البيانات؟", async () => {
      try {
        const formData = {
          permissionNumber: e.target.permissionNumber.value,
          requestDate: e.target.requestDate.value,
          accountReference: e.target.accountReference.value,
          meterNumber: e.target.meterNumber.value,
          balanceTo: parseFloat(e.target.balanceTo.value),
          balanceDebtor: parseFloat(e.target.balanceDebtor.value),
          meterStatus: e.target.Select1.value,
          faultType: e.target.faultType.value,
          faultNotes: e.target.faultNotes.value,
          intentional: e.target.Checkbox1.checked ? 1 : 0,
          billNotice: e.target.Checkbox2.checked ? 1 : 0,
          averageQuantity: parseFloat(e.target.averageQuantity.value),
          basePeriodFrom: e.target.basePeriodFrom.value,
          basePeriodTo: e.target.basePeriodTo.value,
          faultPeriodFrom: e.target.faultPeriodFrom.value,
          faultPeriodTo: e.target.faultPeriodTo.value,
          settlementQuantity: parseFloat(e.target.settlementQuantity.value),
          totalSettlement: parseFloat(e.target.totalSettlement.value),
          paidDiscount: parseFloat(e.target.paidDiscount.value),
          installments: e.target.installments.value,
          executionNotes: e.target.executionNotes.value,
          success: e.target.successCheckbox.checked ? 1 : 0,
          user: {
            username: user.username,
            role: user.role,
            branch: user.branch
          }
        };
        
        const response = await fetch('/api/meter-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "حدث خطأ أثناء حفظ البيانات");
        }
        
        const result = await response.json();
        showMessage(result.message, true);
        loadData();
        e.target.reset();
      } catch (error) {
        showMessage(error.message, false);
        console.error('Error:', error);
      }
    });
  };

  // تطبيق الألوان المخصصة
  const applyColors = () => {
    const start = document.getElementById('colorStart').value;
    const end = document.getElementById('colorEnd').value;
    
    document.documentElement.style.setProperty('--primary', start);
    document.documentElement.style.setProperty('--secondary', end);
    document.documentElement.style.setProperty('--gradient', `linear-gradient(135deg, ${start}, ${end})`);
    
    localStorage.setItem('themeColors', JSON.stringify({ start, end }));
    showMessage('تم تطبيق الألوان بنجاح', true);
  };

  // تحميل الألوان المحفوظة
  useEffect(() => {
    const savedColors = localStorage.getItem('themeColors');
    if (savedColors) {
      const { start, end } = JSON.parse(savedColors);
      document.documentElement.style.setProperty('--primary', start);
      document.documentElement.style.setProperty('--secondary', end);
      document.documentElement.style.setProperty('--gradient', `linear-gradient(135deg, ${start}, ${end})`);
    }
  }, []);

  // تصفية البيانات حسب فرع المستخدم
  const filteredData = data.filter(item => 
    user ? item.branch === user.branch : true
  );
  
  const totals = calculateTotals(filteredData);

  return (
    <>
      <div className="container">
        <div 
          className="toggle-color-settings" 
          onClick={() => setShowColorSettings(!showColorSettings)}
        >
          <i className="fas fa-paint-brush fa-icon"></i> تخصيص الواجهة
        </div>
        
        {showColorSettings && (
          <div className="color-settings">
            <label>اللون الأساسي:</label>
            <input type="color" id="colorStart" defaultValue="#2b6cb0" />
            
            <label>اللون الثانوي:</label>
            <input type="color" id="colorEnd" defaultValue="#2c5282" />
            
            <button onClick={applyColors}>تطبيق</button>
          </div>
        )}

        <h2>إدخال فحص أحادي الوجة</h2>
        <form id="dataForm" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <div className="input-group">
                <input type="text" id="permissionNumber" name="permissionNumber" required />
                <label className="transparent-label">رقم الاذن</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="date" id="requestDate" name="requestDate" required />
                <label className="transparent-label">تاريخ الطلب</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="text" id="accountReference" name="accountReference" required />
                <label className="transparent-label">مراجع الحساب</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="text" id="meterNumber" name="meterNumber" required />
                <label className="transparent-label">رقم العداد</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="number" id="balanceTo" name="balanceTo" required />
                <label className="transparent-label">رصيد له</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="number" id="balanceDebtor" name="balanceDebtor" required />
                <label className="transparent-label">رصيد مدين</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <select id="Select1" name="Select1" required>
                  <option value="">اختر حالة العداد</option>
                  <option value="سليم">سليم</option>
                  <option value="تالف">تالف</option>
                </select>
                <label className="transparent-label">حالة العداد</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <select id="faultType" name="faultType" required>
                  <option value="">اختر نوع الخلل</option>
                  <option value="سليم">سليم</option>
                  <option value="تالف">تالف</option>
                  <option value="عيب اجزاء داخلية">عيب اجزاء داخلية</option>
                  <option value="عمدي">عمدي</option>
                  <option value="غير عمدي">غير عمدي</option>
                </select>
                <label className="transparent-label">نوع الخلل</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="text" id="faultNotes" name="faultNotes" required />
                <label className="transparent-label">ملاحظات العطل</label>
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input id="Checkbox1" name="Checkbox1" type="checkbox" />
              <label htmlFor="Checkbox1">التعمد</label>
            </div>
            
            <div className="form-group checkbox">
              <input id="Checkbox2" name="Checkbox2" type="checkbox" />
              <label htmlFor="Checkbox2">اشعار فاتورة</label>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="number" id="averageQuantity" name="averageQuantity" required />
                <label className="transparent-label">كمية المتوسط</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="date" id="basePeriodFrom" name="basePeriodFrom" required />
                <label className="transparent-label">فترة الاساس من</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="date" id="basePeriodTo" name="basePeriodTo" required />
                <label className="transparent-label">فترة الاساس الى</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="date" id="faultPeriodFrom" name="faultPeriodFrom" required />
                <label className="transparent-label">فترة العطل من</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="date" id="faultPeriodTo" name="faultPeriodTo" required />
                <label className="transparent-label">فترة العطل الى</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="number" id="settlementQuantity" name="settlementQuantity" required />
                <label className="transparent-label">كمية التسوية</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="number" id="totalSettlement" name="totalSettlement" required />
                <label className="transparent-label">اجمالي التسوية</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="number" id="paidDiscount" name="paidDiscount" required />
                <label className="transparent-label">خصم المسدد</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="text" id="installments" name="installments" required />
                <label className="transparent-label">تقسط على</label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-group">
                <input type="text" id="executionNotes" name="executionNotes" required />
                <label className="transparent-label">ملاحظات التنفيذ</label>
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input id="successCheckbox" name="successCheckbox" type="checkbox" />
              <label htmlFor="successCheckbox">تمت بنجاح</label>
            </div>
            
            <div className="form-group">
              <button type="submit" className="add-user-btn">
                <i className="fas fa-save fa-icon"></i> حفظ البيانات
              </button>
            </div>
            
            <div className="form-group">
              <button type="button" id="refreshData" onClick={loadData}>
                <i className="fas fa-sync-alt fa-icon"></i> تحديث البيانات
              </button>
            </div>
          </div>
        </form>

        <h2>عرض البيانات المدخلة فحص أحادي الوجة</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table id="dataTable">
                <thead>
                  <tr>
                    {[
                      '#', 'رقم الاذن', 'تاريخ الطلب', 'مراجع الحساب', 'رقم العداد', 
                      'رصيد له', 'رصيد مدين', 'حالة العداد', 'نوع الخلل', 'ملاحظات العطل', 
                      'التعمد', 'اشعار فاتورة', 'كمية المتوسط', 'فترة الاساس من', 
                      'فترة الاساس الى', 'عدد ايام المتوسط', 'فترة العطل من', 'فترة العطل الى', 
                      'عدد ايام العطل', 'كمية التسوية', 'اجمالي التسوية', 'خصم المسدد', 
                      'صافي التسوية', 'تقسط على', 'ملاحظات التنفيذ', 'تمت بنجاح', 
                      'القائم بالإضافة', 'الفرع التابع له'
                    ].map((header, index) => (
                      <th key={index} onClick={() => sortTable(index)}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody id="tableBody">
                  {filteredData.map(item => {
                    const averageDays = calculateDaysDifference(item.basePeriodFrom, item.basePeriodTo);
                    const faultDays = calculateDaysDifference(item.faultPeriodFrom, item.faultPeriodTo);
                    const netSettlement = item.totalSettlement - item.paidDiscount;
                    
                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.permissionNumber}</td>
                        <td>{item.requestDate}</td>
                        <td>{item.accountReference}</td>
                        <td>{item.meterNumber}</td>
                        <td>{item.balanceTo}</td>
                        <td>{item.balanceDebtor}</td>
                        <td>{item.meterStatus}</td>
                        <td>{item.faultType}</td>
                        <td>{item.faultNotes}</td>
                        <td>{item.intentional ? "نعم" : "لا"}</td>
                        <td>{item.billNotice ? "نعم" : "لا"}</td>
                        <td>{item.averageQuantity}</td>
                        <td>{item.basePeriodFrom}</td>
                        <td>{item.basePeriodTo}</td>
                        <td>{averageDays}</td>
                        <td>{item.faultPeriodFrom}</td>
                        <td>{item.faultPeriodTo}</td>
                        <td>{faultDays}</td>
                        <td>{item.settlementQuantity}</td>
                        <td>{item.totalSettlement}</td>
                        <td>{item.paidDiscount}</td>
                        <td>{netSettlement}</td>
                        <td>{item.installments}</td>
                        <td>{item.executionNotes}</td>
                        <td>{item.success ? 'نعم' : 'لا'}</td>
                        <td>{item.added_by}</td>
                        <td>{item.branch}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="totals">
                    <td colSpan="5"><strong>الإجماليات</strong></td>
                    <td>{totals.balanceTo.toFixed(2)}</td>
                    <td>{totals.balanceDebtor.toFixed(2)}</td>
                    <td colSpan="5"></td>
                    <td>{totals.averageQuantity.toFixed(2)}</td>
                    <td colSpan="2"></td>
                    <td>{totals.averageDays}</td>
                    <td colSpan="2"></td>
                    <td>{totals.faultDays}</td>
                    <td>{totals.settlementQuantity.toFixed(2)}</td>
                    <td>{totals.totalSettlement.toFixed(2)}</td>
                    <td>{totals.paidDiscount.toFixed(2)}</td>
                    <td>{totals.netSettlement.toFixed(2)}</td>
                    <td>{totals.installments.toFixed(2)}</td>
                    <td colSpan="5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #2b6cb0;
          --secondary: #2c5282;
          --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
          --text-primary: #2b6cb0;
          --text-secondary: #718096;
          --shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
          --danger: #e53e3e;
          --danger-dark: #c53030;
          --success: #38a169;
          --success-dark: #2f855a;
          --warning: #dd6b20;
          --warning-dark: #c05621;
          --scrollbar-thumb: #c1c1c1;
          --scrollbar-track: #f1f1f1;
          --scrollbar-width: 8px;
          --scrollbar-height: 8px;
        }

        body {
          direction: rtl;
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .container {
          width: 95%;
          margin: 30px auto;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        h2, h3 {
          color: var(--primary);
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.2rem;
          font-weight: 700;
          position: relative;
        }

        h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: 50%;
          transform: translateX(50%);
          width: 100px;
          height: 4px;
          background: var(--gradient);
          border-radius: 2px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .form-group {
          position: relative;
          transition: var(--transition);
        }

        .form-group:hover {
          transform: translateY(-5px);
        }

        .input-group {
          position: relative;
          margin-bottom: 25px;
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: transparent;
          font-size: 1rem;
          color: var(--primary);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          appearance: none;
          cursor: pointer;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(43, 108, 176, 0.3);
          outline: none;
        }

        .transparent-label {
          position: absolute;
          top: 50%;
          right: 15px;
          transform: translateY(-50%);
          color: var(--primary);
          font-size: 0.95rem;
          pointer-events: none;
          transition: var(--transition);
          padding: 0 5px;
          background: transparent;
          opacity: 0.7;
        }

        .input-group input:not(:placeholder-shown) ~ .transparent-label,
        .input-group select:not([value=""]) ~ .transparent-label,
        .input-group textarea:not(:placeholder-shown) ~ .transparent-label,
        .input-group input:focus ~ .transparent-label,
        .input-group select:focus ~ .transparent-label,
        .input-group textarea:focus ~ .transparent-label {
          top: -10px;
          right: 10px;
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 600;
          opacity: 1;
        }

        button {
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          color: #fff;
          border: none;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          background: var(--gradient);
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: linear-gradient(135deg, var(--secondary), var(--primary));
        }

        /* تصميم الجدول مع شريط التمرير الأفقي */
        .table-container {
          width: 100%;
          margin-top: 25px;
          overflow: hidden;
          border-radius: 10px;
          box-shadow: var(--shadow-sm);
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          position: relative;
          border-radius: 10px;
        }

        /* تصميم شريط التمرير الأفقي العصري */
        .table-wrapper::-webkit-scrollbar {
          height: var(--scrollbar-height);
          width: var(--scrollbar-width);
        }

        .table-wrapper::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border-radius: 10px;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.95rem;
          background: transparent;
          min-width: 1200px; /* الحد الأدنى لعرض الجدول */
        }

        table th,
        table td {
          padding: 14px;
          text-align: center;
          transition: background-color 0.3s ease;
          color: var(--primary);
          white-space: nowrap; /* منع التفاف النص */
        }

        table th {
          background: var(--gradient);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        table tr:nth-child(even) {
          background: transparent;
          box-shadow: inset 0 0 5px rgba(160, 174, 192, 0.2);
        }

        table tr:nth-child(odd) {
          background: transparent;
          box-shadow: inset 0 0 5px rgba(160, 174, 192, 0.1);
        }

        table tr:hover {
          background: rgba(237, 242, 247, 0.3);
        }

        table tfoot tr {
          background: rgba(43, 108, 176, 0.1) !important;
          font-weight: bold;
        }

        /* تصميم متجاوب للشاشات الصغيرة */
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 15px;
            width: 98%;
          }

          h2 {
            font-size: 1.8rem;
          }

          .table-container {
            border-radius: 8px;
          }

          table th, 
          table td {
            padding: 10px 8px;
            font-size: 0.85rem;
          }
        }

        /* تحسينات للوضع المظلم */
        @media (prefers-color-scheme: dark) {
          :root {
            --text-primary: #ebf4ff;
            --text-secondary: #cbd5e0;
            --scrollbar-thumb: #4a5568;
            --scrollbar-track: #2d3748;
          }

          .container {
           

         .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: transparent;
          font-size: 1rem;
          color: var(--primary);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          appearance: none;
          cursor: pointer;
        }

        .input-group input:focus,
        .input-group select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(43, 108, 176, 0.3);
          outline: none;
        }

        .transparent-label {
          position: absolute;
          top: 50%;
          right: 15px;
          transform: translateY(-50%);
          color: var(--primary);
          font-size: 0.95rem;
          pointer-events: none;
          transition: var(--transition);
          padding: 0 5px;
          background: transparent;
          opacity: 0.7;
        }

        .input-group input:not(:placeholder-shown) ~ .transparent-label,
        .input-group select:not([value=""]) ~ .transparent-label,
        .input-group input:focus ~ .transparent-label,
        .input-group select:focus ~ .transparent-label {
          top: -10px;
          right: 10px;
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 600;
          opacity: 1;
          background: ;
        }

          table tr:nth-child(even) {
            background-color: rgba(74, 85, 104, 0.1);
          }

          table tr:nth-child(odd) {
            background-color: rgba(45, 55, 72, 0.1);
          }

          table tr:hover {
            background-color: rgba(74, 85, 104, 0.3);
          }
        }
      `}</style>
    </>
  );
};

export default SinglePhaseMeterInspection;