'use client';

import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';
import { FaPaintBrush, FaSave, FaSyncAlt, FaSearch, FaEraser, FaEdit, FaTimes, FaIdCard, FaTachometerAlt, FaCalendarAlt, FaUser, FaCheckSquare, FaBell, FaCheckCircle, FaUserPlus, FaUserEdit, FaCoins, FaExclamationTriangle, FaStickyNote, FaChartLine, FaBalanceScale, FaMoneyBillWave, FaPercent } from 'react-icons/fa';

const MeterData1 = () => {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showColorSettings, setShowColorSettings] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [filters, setFilters] = useState({
    permissionNumber: '',
    meterNumber: '',
    requestDateFrom: '',
    requestDateTo: '',
    accountReference: '',
    intentional: '',
    billNotice: '',
    success: '',
    addedBy: '',
    updatedBy: ''
  });

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
      const response = await fetch('/api/meter-data-1');
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
    
    const filteredData = [...filteredData].filter(item => 
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
  const calculateTotals = (data) => {
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
    
    data.forEach(item => {
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

  // تطبيق الفلاتر
  const applyFilters = () => {
    const filtered = data.filter(item => {
      return (
        (user ? item.branch === user.branch : true) &&
        item.permissionNumber.toLowerCase().includes(filters.permissionNumber.toLowerCase()) &&
        item.meterNumber.toLowerCase().includes(filters.meterNumber.toLowerCase()) &&
        (!filters.requestDateFrom || item.requestDate >= filters.requestDateFrom) &&
        (!filters.requestDateTo || item.requestDate <= filters.requestDateTo) &&
        item.accountReference.toLowerCase().includes(filters.accountReference.toLowerCase()) &&
        (filters.intentional === '' || item.intentional == filters.intentional) &&
        (filters.billNotice === '' || item.billNotice == filters.billNotice) &&
        (filters.success === '' || item.success == filters.success) &&
        (filters.addedBy === '' || item.added_by.toLowerCase().includes(filters.addedBy.toLowerCase())) &&
        (filters.updatedBy === '' || (item.updated_by && item.updated_by.toLowerCase().includes(filters.updatedBy.toLowerCase())))
      );
    });
    return filtered;
  };

  // مسح الفلاتر
  const clearFilters = () => {
    setFilters({
      permissionNumber: '',
      meterNumber: '',
      requestDateFrom: '',
      requestDateTo: '',
      accountReference: '',
      intentional: '',
      billNotice: '',
      success: '',
      addedBy: '',
      updatedBy: ''
    });
  };

  // فتح نموذج التعديل
  const openEditModal = async (id) => {
    try {
      const response = await fetch(`/api/meter-data-1?action=getDataById&id=${id}`);
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      const data = await response.json();
      setCurrentEditData(data);
      setEditModalOpen(true);
    } catch (error) {
      showMessage("حدث خطأ أثناء جلب البيانات للتعديل", false);
      console.error('Error:', error);
    }
  };

  // حفظ التعديلات
  const saveChanges = async () => {
    showConfirmation("هل أنت متأكد من حفظ التغييرات؟", async () => {
      try {
        const response = await fetch('/api/meter-data-1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'editData',
            ...currentEditData,
            user: user || { username: 'غير معروف', role: 'ضيف' }
          })
        });

        if (!response.ok) {
          throw new Error('فشل في حفظ التغييرات');
        }

        const result = await response.json();
        if (result.status === 'success') {
          showMessage("تم حفظ التغييرات بنجاح", true);
          setEditModalOpen(false);
          loadData();
        } else {
          throw new Error(result.message || 'فشل في حفظ التغييرات');
        }
      } catch (error) {
        showMessage(error.message, false);
        console.error('Error:', error);
      }
    });
  };

  // حذف البيانات
  const deleteData = (id) => {
    showConfirmation("هل أنت متأكد من حذف هذه البيانات؟", async () => {
      try {
        const response = await fetch('/api/meter-data-1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deleteData',
            id: id
          })
        });

        if (!response.ok) {
          throw new Error('فشل في حذف البيانات');
        }

        const result = await response.json();
        if (result.status === 'success') {
          showMessage("تم حذف البيانات بنجاح", true);
          loadData();
        } else {
          throw new Error(result.message || 'فشل في حذف البيانات');
        }
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

  // تصفية البيانات حسب فرع المستخدم والفلاتر
  const filteredData = applyFilters();

  const totals = calculateTotals(filteredData);

  // الحصول على قائمة المستخدمين الفريدة للفلاتر
  const uniqueAddedBy = [...new Set(data.map(item => item.added_by))];
  const uniqueUpdatedBy = [...new Set(data.map(item => item.updated_by).filter(Boolean))];

  return (
    <div className="container">
      <div 
        className="toggle-color-settings" 
        onClick={() => setShowColorSettings(!showColorSettings)}
      >
        <FaPaintBrush className="fa-icon" /> تخصيص الواجهة
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

      <h2>استعلام تعديل عن فحص أحادي الوجه</h2>
      <div className="filter-container">
        <div className="form-row">
          <div className="form-group">
            <div className="input-group">
              <input 
                type="text" 
                id="filterPermissionNumber" 
                value={filters.permissionNumber}
                onChange={(e) => setFilters({...filters, permissionNumber: e.target.value})}
              />
              <label className="transparent-label"><FaIdCard className="fa-icon" /> رقم الاذن:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <input 
                type="text" 
                id="filterMeterNumber" 
                value={filters.meterNumber}
                onChange={(e) => setFilters({...filters, meterNumber: e.target.value})}
              />
              <label className="transparent-label"><FaTachometerAlt className="fa-icon" /> رقم العداد:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <input 
                type="date" 
                id="filterRequestDateFrom" 
                value={filters.requestDateFrom}
                onChange={(e) => setFilters({...filters, requestDateFrom: e.target.value})}
              />
              <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> تاريخ الطلب من:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <input 
                type="date" 
                id="filterRequestDateTo" 
                value={filters.requestDateTo}
                onChange={(e) => setFilters({...filters, requestDateTo: e.target.value})}
              />
              <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> تاريخ الطلب إلى:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <input 
                type="text" 
                id="filterAccountReference" 
                value={filters.accountReference}
                onChange={(e) => setFilters({...filters, accountReference: e.target.value})}
              />
              <label className="transparent-label"><FaUser className="fa-icon" /> مرجع الحساب:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <select 
                id="filterIntentional" 
                value={filters.intentional}
                onChange={(e) => setFilters({...filters, intentional: e.target.value})}
              >
                <option value="">كل</option>
                <option value="1">نعم</option>
                <option value="0">لا</option>
              </select>
              <label className="transparent-label"><FaCheckSquare className="fa-icon" /> التعمد:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <select 
                id="filterBillNotice" 
                value={filters.billNotice}
                onChange={(e) => setFilters({...filters, billNotice: e.target.value})}
              >
                <option value="">كل</option>
                <option value="1">نعم</option>
                <option value="0">لا</option>
              </select>
              <label className="transparent-label"><FaBell className="fa-icon" /> اشعار فاتورة:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <select 
                id="filterSuccess" 
                value={filters.success}
                onChange={(e) => setFilters({...filters, success: e.target.value})}
              >
                <option value="">كل</option>
                <option value="1">نعم</option>
                <option value="0">لا</option>
              </select>
              <label className="transparent-label"><FaCheckCircle className="fa-icon" /> تمت بنجاح:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <select 
                id="filterAddedBy" 
                value={filters.addedBy}
                onChange={(e) => setFilters({...filters, addedBy: e.target.value})}
              >
                <option value="">كل</option>
                {uniqueAddedBy.map((user, index) => (
                  <option key={index} value={user}>{user}</option>
                ))}
              </select>
              <label className="transparent-label"><FaUserPlus className="fa-icon" /> القائم بالإضافة:</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <select 
                id="filterUpdatedBy" 
                value={filters.updatedBy}
                onChange={(e) => setFilters({...filters, updatedBy: e.target.value})}
              >
                <option value="">كل</option>
                {uniqueUpdatedBy.map((user, index) => (
                  <option key={index} value={user}>{user}</option>
                ))}
              </select>
              <label className="transparent-label"><FaUserEdit className="fa-icon" /> القائم بالتعديل:</label>
            </div>
          </div>
        </div>
        <div className="form-row">
          <button id="applyFilters" type="button" onClick={applyFilters}>
            <FaSearch className="fa-icon" /> بحث
          </button>
          <button id="clearFilters" type="button" onClick={clearFilters}>
            <FaEraser className="fa-icon" /> مسح الحقول
          </button>
        </div>
      </div>

      <h2><FaEdit className="fa-icon" /> تعديل عن فحص أحادي الوجه</h2>
      
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
                    'القائم بالإضافة', 'القائم بالتعديل', 'الفرع التابع له', 'الإجراءات'
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
                      <td>{parseFloat(item.balanceTo).toFixed(2)}</td>
                      <td>{parseFloat(item.balanceDebtor).toFixed(2)}</td>
                      <td>{item.meterStatus}</td>
                      <td>{item.faultType}</td>
                      <td>{item.faultNotes}</td>
                      <td>{item.intentional ? "نعم" : "لا"}</td>
                      <td>{item.billNotice ? "نعم" : "لا"}</td>
                      <td>{parseFloat(item.averageQuantity).toFixed(2)}</td>
                      <td>{item.basePeriodFrom}</td>
                      <td>{item.basePeriodTo}</td>
                      <td>{averageDays}</td>
                      <td>{item.faultPeriodFrom}</td>
                      <td>{item.faultPeriodTo}</td>
                      <td>{faultDays}</td>
                      <td>{parseFloat(item.settlementQuantity).toFixed(2)}</td>
                      <td>{parseFloat(item.totalSettlement).toFixed(2)}</td>
                      <td>{parseFloat(item.paidDiscount).toFixed(2)}</td>
                      <td>{netSettlement.toFixed(2)}</td>
                      <td>{item.installments}</td>
                      <td>{item.executionNotes}</td>
                      <td>{item.success ? 'نعم' : 'لا'}</td>
                      <td>{item.added_by}</td>
                      <td>{item.updated_by || '-'}</td>
                      <td>{item.branch}</td>
                      <td>
                        <button onClick={() => openEditModal(item.id)}>
                          <FaEdit className="fa-icon" /> تعديل
                        </button>
                      
                      </td>
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
                  <td colSpan="6"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* نموذج التعديل */}
      {editModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setEditModalOpen(false)}>×</span>
            <h2><FaEdit className="fa-icon" /> تعديل البيانات</h2>
            {currentEditData && (
              <form id="editForm">
                <div className="form-row">
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="text" 
                        id="permissionNumber" 
                        value={currentEditData.permissionNumber}
                        onChange={(e) => setCurrentEditData({...currentEditData, permissionNumber: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaIdCard className="fa-icon" /> رقم الاذن:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="date" 
                        id="requestDate" 
                        value={currentEditData.requestDate}
                        onChange={(e) => setCurrentEditData({...currentEditData, requestDate: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> تاريخ الطلب:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="text" 
                        id="accountReference" 
                        value={currentEditData.accountReference}
                        onChange={(e) => setCurrentEditData({...currentEditData, accountReference: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaUser className="fa-icon" /> مراجع الحساب:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="text" 
                        id="meterNumber" 
                        value={currentEditData.meterNumber}
                        onChange={(e) => setCurrentEditData({...currentEditData, meterNumber: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaTachometerAlt className="fa-icon" /> رقم العداد:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="balanceTo" 
                        step="0.01" 
                        value={currentEditData.balanceTo}
                        onChange={(e) => setCurrentEditData({...currentEditData, balanceTo: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCoins className="fa-icon" /> رصيد له:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="balanceDebtor" 
                        step="0.01" 
                        value={currentEditData.balanceDebtor}
                        onChange={(e) => setCurrentEditData({...currentEditData, balanceDebtor: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCoins className="fa-icon" /> رصيد مدين:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <select 
                        id="meterStatus" 
                        value={currentEditData.meterStatus}
                        onChange={(e) => setCurrentEditData({...currentEditData, meterStatus: e.target.value})}
                        required
                      >
                        <option value="">اختر حالة العداد</option>
                        <option value="سليم">سليم</option>
                        <option value="تالف">تالف</option>
                      </select>
                      <label className="transparent-label"><FaCheckCircle className="fa-icon" /> حالة العداد:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <select 
                        id="faultType" 
                        value={currentEditData.faultType}
                        onChange={(e) => setCurrentEditData({...currentEditData, faultType: e.target.value})}
                        required
                      >
                        <option value="">اختر نوع الخلل</option>
                        <option value="سليم">سليم</option>
                        <option value="تالف">تالف</option>
                        <option value="عيب اجزاء داخلية">عيب اجزاء داخلية</option>
                        <option value="عمدي">عمدي</option>
                        <option value="غير عمدي">غير عمدي</option>
                      </select>
                      <label className="transparent-label"><FaExclamationTriangle className="fa-icon" /> نوع الخلل:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="text" 
                        id="faultNotes" 
                        value={currentEditData.faultNotes}
                        onChange={(e) => setCurrentEditData({...currentEditData, faultNotes: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaStickyNote className="fa-icon" /> ملاحظات العطل:</label>
                    </div>
                  </div>
                  <div className="form-group checkbox">
                    <input 
                      id="intentional" 
                      type="checkbox" 
                      checked={currentEditData.intentional}
                      onChange={(e) => setCurrentEditData({...currentEditData, intentional: e.target.checked})}
                    />
                    <label><FaCheckSquare className="fa-icon" /> التعمد:</label>
                  </div>
                  <div className="form-group checkbox">
                    <input 
                      id="billNotice" 
                      type="checkbox" 
                      checked={currentEditData.billNotice}
                      onChange={(e) => setCurrentEditData({...currentEditData, billNotice: e.target.checked})}
                    />
                    <label><FaBell className="fa-icon" /> اشعار فاتورة:</label>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="averageQuantity" 
                        step="0.01" 
                        value={currentEditData.averageQuantity}
                        onChange={(e) => setCurrentEditData({...currentEditData, averageQuantity: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaChartLine className="fa-icon" /> كمية المتوسط:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="date" 
                        id="basePeriodFrom" 
                        value={currentEditData.basePeriodFrom}
                        onChange={(e) => setCurrentEditData({...currentEditData, basePeriodFrom: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> فترة الاساس من:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="date" 
                        id="basePeriodTo" 
                        value={currentEditData.basePeriodTo}
                        onChange={(e) => setCurrentEditData({...currentEditData, basePeriodTo: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> فترة الاساس الى:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="date" 
                        id="faultPeriodFrom" 
                        value={currentEditData.faultPeriodFrom}
                        onChange={(e) => setCurrentEditData({...currentEditData, faultPeriodFrom: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> فترة العطل من:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="date" 
                        id="faultPeriodTo" 
                        value={currentEditData.faultPeriodTo}
                        onChange={(e) => setCurrentEditData({...currentEditData, faultPeriodTo: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> فترة العطل الى:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="settlementQuantity" 
                        step="0.01" 
                        value={currentEditData.settlementQuantity}
                        onChange={(e) => setCurrentEditData({...currentEditData, settlementQuantity: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaBalanceScale className="fa-icon" /> كمية التسوية:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="totalSettlement" 
                        step="0.01" 
                        value={currentEditData.totalSettlement}
                        onChange={(e) => setCurrentEditData({...currentEditData, totalSettlement: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaMoneyBillWave className="fa-icon" /> اجمالي التسوية:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="paidDiscount" 
                        step="0.01" 
                        value={currentEditData.paidDiscount}
                        onChange={(e) => setCurrentEditData({...currentEditData, paidDiscount: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaPercent className="fa-icon" /> خصم المسدد:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="number" 
                        id="installments" 
                        value={currentEditData.installments}
                        onChange={(e) => setCurrentEditData({...currentEditData, installments: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaCalendarAlt className="fa-icon" /> تقسط على:</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input 
                        type="text" 
                        id="executionNotes" 
                        value={currentEditData.executionNotes}
                        onChange={(e) => setCurrentEditData({...currentEditData, executionNotes: e.target.value})}
                        required 
                      />
                      <label className="transparent-label"><FaStickyNote className="fa-icon" /> ملاحظات التنفيذ:</label>
                    </div>
                  </div>
                  <div className="form-group checkbox">
                    <input 
                      id="success" 
                      type="checkbox" 
                      checked={currentEditData.success}
                      onChange={(e) => setCurrentEditData({...currentEditData, success: e.target.checked})}
                    />
                    <label><FaCheckCircle className="fa-icon" /> تمت بنجاح:</label>
                  </div>
                </div>
                <button type="button" className="save-btn" onClick={saveChanges}>
                  <FaSave className="fa-icon" /> حفظ
                </button>
                <button type="button" id="cancelBtn" onClick={() => setEditModalOpen(false)}>
                  <FaTimes className="fa-icon" /> إلغاء
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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

        input-group input,
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
        }

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

          .transparent-label {
            color: #ebf4ff;
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

        /* تصميم نموذج التعديل */
        .modal {
          display: flex;
          position: fixed;
          z-index: 999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.6);
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: #fff;
          padding: 25px;
          border: none;
          width: 90%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .close {
          color: var(--text-secondary);
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .close:hover, .close:focus {
          color: #2d3748;
        }

        .save-btn {
          background: var(--gradient);
        }

        .save-btn:hover {
          background: linear-gradient(135deg, var(--secondary), var(--primary));
        }

        #cancelBtn {
          background: linear-gradient(135deg, #718096, #5a667a);
          margin-right: 10px;
        }

        #cancelBtn:hover {
          background: linear-gradient(135deg, #5a667a, #718096);
        }

        /* تخصيص الألوان */
        .toggle-color-settings {
          background: var(--gradient);
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-block;
          margin-bottom: 20px;
          transition: var(--transition);
        }

        .toggle-color-settings:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .color-settings {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 1rem;
          margin: 0.5rem 0;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .color-settings label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .color-settings input[type="color"] {
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 8px;
          margin-bottom: 1rem;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .color-settings input[type="color"]:hover {
          transform: scale(1.02);
          box-shadow: var(--shadow-md);
        }

        .color-settings button {
          background: var(--gradient);
          color: #fff;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          font-weight: 500;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }

        .color-settings button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .fa-icon {
          margin-left: 5px;
          color: #fff;
        }

        .style1 {
          background: var(--gradient);
          color: #fff;
        }

        .checkbox input {
          width: 20px;
          height: 20px;
          accent-color: var(--primary);
          margin-left: 10px;
        }

        .checkbox label {
          color: var(--primary);
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default MeterData1;