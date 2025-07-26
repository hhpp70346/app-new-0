'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  FiEdit, FiTrash2, FiCheck, FiX, FiArrowLeft, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight 
} from 'react-icons/fi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faLock, faUsers, faChartBar, faCogs } from '@fortawesome/free-solid-svg-icons';

const branches = [
  'الرحاب', 'القطاميه', 'التجمع الخامس', 'التجمع الاول', 'العباسيه', 'الظاهر',
  'شروق م.نصر', 'مدينه نصر', 'الزهراء', 'العبور', 'السلام', 'النهضه', 'عرابى',
  'النزهه', 'مصر الجديده', 'الحدائق', 'الاميريه', 'المطريه', 'الزيتون', 'عين شمس',
  'الخصوص', 'شبرا الخيمه', 'بيجام', 'منشيه الحريه', 'بهتيم', 'شبرا مصر', 'روض الفرج',
  'الشرابيه', 'الزاويه', 'القناطر', 'منشيه عبدالمنعم رياض', 'مسطرد', 'المرج',
  'قباء', 'عزبة النخل', 'الخانكه', 'ابو زعبل', 'تجريبي'
];

const ROLE_NAMES = {
  admin: 'المدير العام',
  system_admin: 'مدير النظام',
  account_manager: 'إدارة الحسابات',
  issue_manager: 'إدارة الإصدار',
  general_manager: 'متابعة المدير العام',
  revenue_review: 'مراجعة الإيرادات',
};

const MENU_ITEMS = {
  admin: [
    { name: 'الرئيسية', path: '/', screenName: 'الرئيسية' },
    { name: 'تغيير كلمة المرور', path: '/admin/change-password', screenName: 'تغيير كلمة المرور' },
    { name: 'إضافة مستخدم', path: '/admin/users', screenName: 'إضافة مستخدم' },
    { name: 'عرض المستخدمين', path: '/admin/users-1', screenName: 'عرض المستخدمين' },
    { name: 'صلاحيات المستخدمين', path: '/admin/users-2', screenName: 'صلاحيات المستخدمين' },
    { name: 'تقرير فحص أحادي الوجه', path: '/admin/meter-data-5', screenName: 'تقرير فحص أحادي الوجه' },
    { name: 'تقرير المحذوفات فحص أحادي الوجه', path: '/admin/meter-data-4', screenName: 'تقرير المحذوفات فحص أحادي الوجه' },
    { name: 'شاشة إدخال فحص أحادي الوجه', path: '/admin/meter-data', screenName: 'شاشة إدخال فحص أحادي الوجه' },
    { name: 'شاشة تعديل فحص أحادي الوجه', path: '/admin/meter-data-1', screenName: 'شاشة تعديل فحص أحادي الوجه' },
    { name: 'شاشة حذف فحص أحادي الوجه', path: '/admin/meter-data-2', screenName: 'شاشة حذف فحص أحادي الوجه' },
    { name: 'أرشيف المحذوفات فحص أحادي الوجه', path: '/admin/meter-data-3', screenName: 'أرشيف المحذوفات فحص أحادي الوجه' }
  ],
  system_admin: [
    { name: 'الرئيسية', path: '/', screenName: 'الرئيسية' },
    { name: 'تغيير كلمة المرور', path: '/system-admin/change-password', screenName: 'تغيير كلمة المرور' },
    { name: 'إضافة مستخدم', path: '/system-admin/users', screenName: 'إضافة مستخدم' },
    { name: 'عرض المستخدمين', path: '/system-admin/meter-data', screenName: 'عرض المستخدمين' },
    { name: 'تقرير يومي', path: '/system-admin/meter-data-1', screenName: 'تقرير يومي' },
    { name: 'تقرير شهري', path: '/system-admin/reports/monthly', screenName: 'تقرير شهري' },
    { name: 'إعدادات النظام', path: '/system-admin/settings/system', screenName: 'إعدادات النظام' },
    { name: 'إعدادات الحساب', path: '/system-admin/settings/account', screenName: 'إعدادات الحساب' }
  ],
  account_manager: [
    { name: 'الرئيسية', path: '/account-manager', screenName: 'الرئيسية' },
    { name: 'تغيير كلمة المرور', path: '/account-manager/change-password', screenName: 'تغيير كلمة المرور' },
    { name: 'عرض الحسابات', path: '/account-manager/accounts', screenName: 'عرض الحسابات' },
    { name: 'إضافة حساب جديد', path: '/account-manager/accounts/add', screenName: 'إضافة حساب جديد' },
    { name: 'تعديل الحسابات', path: '/account-manager/accounts/edit', screenName: 'تعديل الحسابات' },
    { name: 'عرض العملاء', path: '/account-manager/customers', screenName: 'عرض العملاء' },
    { name: 'إضافة عميل', path: '/account-manager/customers/add', screenName: 'إضافة عميل' },
    { name: 'تعديل بيانات العملاء', path: '/account-manager/customers/edit', screenName: 'تعديل بيانات العملاء' },
    { name: 'عرض الفواتير', path: '/account-manager/invoices', screenName: 'عرض الفواتير' },
    { name: 'إنشاء فاتورة', path: '/account-manager/invoices/create', screenName: 'إنشاء فاتورة' },
    { name: 'المدفوعات', path: '/account-manager/payments', screenName: 'المدفوعات' },
    { name: 'المتأخرات', path: '/account-manager/overdue', screenName: 'المتأخرات' },
    { name: 'تقرير الإيرادات', path: '/account-manager/reports/revenue', screenName: 'تقرير الإيرادات' },
    { name: 'تقرير المصروفات', path: '/account-manager/reports/expenses', screenName: 'تقرير المصروفات' },
    { name: 'تقرير الأرباح والخسائر', path: '/account-manager/reports/profit-loss', screenName: 'تقرير الأرباح والخسائر' },
    { name: 'تقرير التدفق النقدي', path: '/account-manager/reports/cash-flow', screenName: 'تقرير التدفق النقدي' },
    { name: 'إعدادات الحساب', path: '/account-manager/settings/account', screenName: 'إعدادات الحساب' },
    { name: 'إعدادات الفواتير', path: '/account-manager/settings/invoices', screenName: 'إعدادات الفواتير' },
    { name: 'إعدادات التقارير', path: '/account-manager/settings/reports', screenName: 'إعدادات التقارير' }
  ],
  general_manager: [
    { name: 'الرئيسية', path: '/', screenName: 'الرئيسية' },
    { name: 'تغيير كلمة المرور', path: '/general-manager/change-password', screenName: 'تغيير كلمة المرور' },
    { name: 'متابعة المستخدمين', path: '/general-manager/monitoring/users', screenName: 'متابعة المستخدمين' },
    { name: 'متابعة العمليات', path: '/general-manager/monitoring/operations', screenName: 'متابعة العمليات' },
    { name: 'متابعة الأنشطة', path: '/general-manager/monitoring/activities', screenName: 'متابعة الأنشطة' },
    { name: 'تقرير الأداء اليومي', path: '/general-manager/reports/daily-performance', screenName: 'تقرير الأداء اليومي' },
    { name: 'تقرير الأداء الشهري', path: '/general-manager/reports/monthly-performance', screenName: 'تقرير الأداء الشهري' },
    { name: 'تقرير المتابعة العامة', path: '/general-manager/reports/general-monitoring', screenName: 'تقرير المتابعة العامة' },
    { name: 'عرض المهام', path: '/general-manager/tasks/view', screenName: 'عرض المهام' },
    { name: 'متابعة التقدم', path: '/general-manager/tasks/progress', screenName: 'متابعة التقدم' },
    { name: 'تقييم الأداء', path: '/general-manager/tasks/evaluation', screenName: 'تقييم الأداء' },
    { name: 'إحصائيات الأداء', path: '/general-manager/analytics/performance', screenName: 'إحصائيات الأداء' },
    { name: 'تحليل البيانات', path: '/general-manager/analytics/data-analysis', screenName: 'تحليل البيانات' },
    { name: 'مؤشرات الأداء الرئيسية', path: '/general-manager/analytics/kpi', screenName: 'مؤشرات الأداء الرئيسية' },
    { name: 'جدولة المهام', path: '/general-manager/scheduling/tasks', screenName: 'جدولة المهام' },
    { name: 'التخطيط الاستراتيجي', path: '/general-manager/scheduling/strategic', screenName: 'التخطيط الاستراتيجي' },
    { name: 'متابعة الجداول', path: '/general-manager/scheduling/monitoring', screenName: 'متابعة الجداول' }
  ],
  issue_manager: [
    { name: 'الرئيسية', path: '/', screenName: 'الرئيسية' },
    { name: 'تغيير كلمة المرور', path: '/issue-manager/change-password', screenName: 'تغيير كلمة المرور' },
    { name: 'إصدار جديد', path: '/issue-manager/issues/new', screenName: 'إصدار جديد' },
    { name: 'عرض الإصدارات', path: '/issue-manager/issues/list', screenName: 'عرض الإصدارات' },
    { name: 'الإصدارات المعلقة', path: '/issue-manager/issues/pending', screenName: 'الإصدارات المعلقة' },
    { name: 'الإصدارات المكتملة', path: '/issue-manager/issues/completed', screenName: 'الإصدارات المكتملة' },
    { name: 'مهام جديدة', path: '/issue-manager/tasks/new', screenName: 'مهام جديدة' },
    { name: 'المهام الجارية', path: '/issue-manager/tasks/ongoing', screenName: 'المهام الجارية' },
    { name: 'المهام المكتملة', path: '/issue-manager/tasks/completed', screenName: 'المهام المكتملة' },
    { name: 'جدولة المهام', path: '/issue-manager/tasks/schedule', screenName: 'جدولة المهام' },
    { name: 'مراجعة الإصدارات', path: '/issue-manager/review/issues', screenName: 'مراجعة الإصدارات' },
    { name: 'متابعة التقدم', path: '/issue-manager/review/progress', screenName: 'متابعة التقدم' },
    { name: 'التحقق من الجودة', path: '/issue-manager/review/quality', screenName: 'التحقق من الجودة' },
    { name: 'الموافقات النهائية', path: '/issue-manager/review/approvals', screenName: 'الموافقات النهائية' },
    { name: 'تقرير يومي', path: '/issue-manager/reports/daily', screenName: 'تقرير يومي' },
    { name: 'تقرير أسبوعي', path: '/issue-manager/reports/weekly', screenName: 'تقرير أسبوعي' },
    { name: 'تقرير شهري', path: '/issue-manager/reports/monthly', screenName: 'تقرير شهري' },
    { name: 'إحصائيات الأداء', path: '/issue-manager/reports/performance', screenName: 'إحصائيات الأداء' },
    { name: 'تقارير مخصصة', path: '/issue-manager/reports/custom', screenName: 'تقارير مخصصة' },
    { name: 'أرشيف الإصدارات', path: '/issue-manager/archive/issues', screenName: 'أرشيف الإصدارات' },
    { name: 'سجل الأنشطة', path: '/issue-manager/archive/activities', screenName: 'سجل الأنشطة' },
    { name: 'النسخ الاحتياطية', path: '/issue-manager/archive/backups', screenName: 'النسخ الاحتياطية' },
    { name: 'سجل التغييرات', path: '/issue-manager/archive/changelog', screenName: 'سجل التغييرات' },
    { name: 'إعدادات الإصدار', path: '/issue-manager/settings/issue', screenName: 'إعدادات الإصدار' },
    { name: 'إعدادات المهام', path: '/issue-manager/settings/tasks', screenName: 'إعدادات المهام' },
    { name: 'إعدادات التنبيهات', path: '/issue-manager/settings/notifications', screenName: 'إعدادات التنبيهات' },
    { name: 'إعدادات الحساب', path: '/issue-manager/settings/account', screenName: 'إعدادات الحساب' }
  ],
  revenue_review: [
    { name: 'الرئيسية', path: '/', screenName: 'الرئيسية' },
    { name: 'تغيير كلمة المرور', path: '/revenue-review/change-password', screenName: 'تغيير كلمة المرور' },
    { name: 'مراجعة الفواتير', path: '/revenue-review/invoices', screenName: 'مراجعة الفواتير' },
    { name: 'تدقيق الإيرادات', path: '/revenue-review/audit', screenName: 'تدقيق الإيرادات' },
    { name: 'مراجعة المدفوعات', path: '/revenue-review/payments', screenName: 'مراجعة المدفوعات' },
    { name: 'تقرير الإيرادات اليومي', path: '/revenue-review/reports/daily-revenue', screenName: 'تقرير الإيرادات اليومي' },
    { name: 'تقرير الإيرادات الشهري', path: '/revenue-review/reports/monthly-revenue', screenName: 'تقرير الإيرادات الشهري' },
    { name: 'تقرير المقارنات', path: '/revenue-review/reports/comparisons', screenName: 'تقرير المقارنات' },
    { name: 'مراجعة الحسابات', path: '/revenue-review/accounts/review', screenName: 'مراجعة الحسابات' },
    { name: 'تسوية الحسابات', path: '/revenue-review/accounts/reconciliation', screenName: 'تسوية الحسابات' },
    { name: 'متابعة المستحقات', path: '/revenue-review/accounts/receivables', screenName: 'متابعة المستحقات' },
    { name: 'قائمة المراجعة اليومية', path: '/revenue-review/checklists/daily', screenName: 'قائمة المراجعة اليومية' },
    { name: 'قائمة المراجعة الشهرية', path: '/revenue-review/checklists/monthly', screenName: 'قائمة المراجعة الشهرية' },
    { name: 'قائمة المراجعة السنوية', path: '/revenue-review/checklists/annual', screenName: 'قائمة المراجعة السنوية' },
    { name: 'تتبع الإيرادات', path: '/revenue-review/revenue/tracking', screenName: 'تتبع الإيرادات' },
    { name: 'تحليل الإيرادات', path: '/revenue-review/revenue/analysis', screenName: 'تحليل الإيرادات' },
    { name: 'توقعات الإيرادات', path: '/revenue-review/revenue/forecasting', screenName: 'توقعات الإيرادات' }
  ]
};

const roles = [
  { value: 'admin', label: 'المدير العام' },
  { value: 'system_admin', label: 'مدير النظام' },
  { value: 'account_manager', label: 'إدارة الحسابات' },
  { value: 'issue_manager', label: 'إدارة الإصدار' },
  { value: 'general_manager', label: 'متابعة المدير العام' },
  { value: 'revenue_review', label: 'مراجعة الإيرادات' }
];

export default function UserPermissions() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState({
    fullName: '',
    username: '',
    role: '',
    branch: ''
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [screenName, setScreenName] = useState('صلاحيات المستخدمين');
  
  // إضافة حالة للجدول الحديث
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  useEffect(() => {
    const authenticate = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/');
        return;
      }

      const userData = JSON.parse(storedUser);
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(userData);
      setLoading(false);
    };

    authenticate();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users-2?action=getUsers');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('حدث خطأ أثناء جلب بيانات المستخدمين', true);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const res = await fetch(`/api/users-2?action=getUserPermissions&id=${userId}`);
      const data = await res.json();
      return data.permissions || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      showAlert('حدث خطأ أثناء جلب صلاحيات المستخدم', true);
      return [];
    }
  };

  const updateUserPermissions = async (userId, newPermissions) => {
    try {
      const res = await fetch('/api/users-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePermissions',
          userId,
          permissions: newPermissions
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showAlert('تم تحديث الصلاحيات بنجاح');
        fetchUsers();
        if (showRoleDetails) {
          showRoleUsers(selectedRole);
        }
      } else {
        showAlert(data.message, true);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      showAlert('حدث خطأ أثناء تحديث الصلاحيات', true);
    }
  };

  const showAlert = (message, isError = false) => {
    Swal.fire({
      title: isError ? 'خطأ' : 'نجاح',
      text: message,
      icon: isError ? 'error' : 'success',
      confirmButtonText: 'حسناً'
    });
  };

  const confirmAction = (message, action, userId, newPermissions) => {
    Swal.fire({
      title: 'تأكيد',
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'لا',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (action === 'updatePermissions') {
          updateUserPermissions(userId, newPermissions);
        }
      }
    });
  };

  const handleEditUser = async (user) => {
    const userPermissions = await fetchUserPermissions(user.id);
    setSelectedUser({
      ...user,
      permissions: userPermissions
    });
    setShowEditModal(true);
  };

  const togglePermission = (permission) => {
    setSelectedUser(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const toggleAllPermissions = (role) => {
    const rolePermissions = MENU_ITEMS[role]?.map(item => item.path) || [];
    setSelectedUser(prev => {
      const hasAllPermissions = rolePermissions.every(p => prev.permissions.includes(p));
      return {
        ...prev,
        permissions: hasAllPermissions
          ? prev.permissions.filter(p => !rolePermissions.includes(p))
          : [...new Set([...prev.permissions, ...rolePermissions])]
      };
    });
  };

  const showRoleUsers = (role) => {
    setSelectedRole(role);
    setShowRoleDetails(true);
    setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير الصلاحية
  };

  const filterUsers = () => {
    let filtered = users;
    if (showRoleDetails) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (filter.fullName) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(filter.fullName.toLowerCase())
      );
    }

    if (filter.username) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(filter.username.toLowerCase())
      );
    }

    if (filter.role && !showRoleDetails) {
      filtered = filtered.filter(user => user.role === filter.role);
    }

    if (filter.branch) {
      filtered = filtered.filter(user => user.branch === filter.branch);
    }

    return filtered;
  };

  // حساب بيانات الصفحات
  const filteredUsers = filterUsers();
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  
  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // تغيير عدد السجلات لكل صفحة
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const roleStats = roles.reduce((acc, role) => {
    const count = users.filter(user => user.role === role.value).length;
    if (count > 0) {
      acc[role.value] = count;
    }
    return acc;
  }, {});

  if (loading || !user) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="modern-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-text">جاري التحميل...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>إدارة صلاحيات المستخدمين</h2>

      {/* Role Boxes */}
      {!showRoleDetails && (
        <div className="role-boxes-container">
          <h2>تجميع المستخدمين حسب الصلاحية</h2>
          {Object.entries(roleStats).map(([role, count]) => (
            <div
              key={role}
              onClick={() => showRoleUsers(role)}
              className="role-box"
            >
              <h3>{ROLE_NAMES[role]}</h3>
              <p>عدد المستخدمين: {count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Role Details */}
      {showRoleDetails && (
        <div className="role-details-container show">
          <button id="backBtn" onClick={() => setShowRoleDetails(false)}>
            <FiArrowLeft /> رجوع
          </button>
          <h2>المستخدمين في الصلاحية: {ROLE_NAMES[selectedRole]}</h2>

          {/* Filter Form */}
          <div className="form-row">
            <div className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  value={filter.fullName}
                  onChange={(e) => setFilter({ ...filter, fullName: e.target.value })}
                  placeholder="بحث بالاسم"
                />
                <FiSearch className="search-icon" />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  value={filter.username}
                  onChange={(e) => setFilter({ ...filter, username: e.target.value })}
                  placeholder="بحث باسم المستخدم"
                />
                <FiSearch className="search-icon" />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <select
                  value={filter.branch}
                  onChange={(e) => setFilter({ ...filter, branch: e.target.value })}
                >
                  <option value="">جميع الفروع</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <table>
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>اسم المستخدم</th>
                <th>الفرع</th>
                <th>الصلاحية</th>
                <th>الحالة</th>
                <th>تعديل الصلاحيات</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map(user => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.username}</td>
                  <td>{user.branch}</td>
                  <td>{roles.find(r => r.value === user.role)?.label || user.role}</td>
                  <td>{user.isActive === '1' ? 'مفعل' : 'غير مفعل'}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditUser(user)}
                    >
                      <FiEdit /> تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* عناصر التحكم في الصفحات */}
          <div className="pagination-controls">
            <div className="records-per-page">
              <label>عرض</label>
              <select 
                value={recordsPerPage} 
                onChange={handleRecordsPerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <label>سجلات</label>
            </div>
            
            <div className="pagination-buttons">
              <button 
                onClick={() => paginate(1)} 
                disabled={currentPage === 1}
                className={currentPage === 1 ? 'disabled' : ''}
              >
                <FiChevronsRight />
              </button>
              
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className={currentPage === 1 ? 'disabled' : ''}
              >
                <FiChevronRight />
              </button>
              
              <span>
                الصفحة {currentPage} من {totalPages}
              </span>
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages || totalPages === 0}
                className={currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}
              >
                <FiChevronLeft />
              </button>
              
              <button 
                onClick={() => paginate(totalPages)} 
                disabled={currentPage === totalPages || totalPages === 0}
                className={currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}
              >
                <FiChevronsLeft />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedUser && (
        <div className="modal show">
          <div className="modal-content">
            <span className="close" onClick={() => setShowEditModal(false)}>
              <FiX />
            </span>
            <h2>تعديل صلاحيات المستخدم: {selectedUser.fullName}</h2>

            <div className="permissions-section">
              <h3>الصلاحيات العامة</h3>
              <button
                className="toggle-all-btn"
                onClick={() => toggleAllPermissions(selectedUser.role)}
              >
                {selectedUser.permissions.some(p => MENU_ITEMS[selectedUser.role]?.some(m => m.path === p))
                  ? 'إلغاء تحديد الكل'
                  : 'تحديد الكل'}
              </button>

              <div className="permissions-grid">
                {MENU_ITEMS[selectedUser.role]?.map(item => (
                  <label key={item.path} className="permission-item">
                    <input
                      type="checkbox"
                      checked={selectedUser.permissions.includes(item.path)}
                      onChange={() => togglePermission(item.path)}
                    />
                    {item.screenName}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                <FiArrowLeft /> رجوع
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={() => confirmAction(
                  'هل أنت متأكد من تحديث صلاحيات هذا المستخدم؟',
                  'updatePermissions',
                  selectedUser.id,
                  selectedUser.permissions
                )}
              >
                <FiCheck /> حفظ التعديلات
              </button>
            </div>
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
        }

        body {
          direction: rtl;
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        .container {
          width: 95%;
          margin: 30px auto;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          background-color: ;
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

        h3 {
          font-size: 1.8rem;
          margin-bottom: 15px;
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

        .input-group {
          position: relative;
          margin-bottom: 25px;
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

        .input-group input:focus,
        .input-group select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(43, 108, 176, 0.3);
          outline: none;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 15px;
          transform: translateY(-50%);
          color: var(--primary);
          opacity: 0.7;
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
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        #backBtn {
          background: linear-gradient(135deg, #718096, #5a667a);
        }

        #backBtn:hover {
          background: linear-gradient(135deg, #5a667a, #718096);
        }

        .edit-btn {
          background: var(--gradient);
        }

        .edit-btn:hover {
          background: linear-gradient(135deg, var(--secondary), var(--primary));
        }

        .save-btn {
          background: var(--success);
        }

        .save-btn:hover {
          background: var(--success-dark);
        }

        .cancel-btn {
          background: var(--warning);
        }

        .cancel-btn:hover {
          background: var(--warning-dark);
        }

        .toggle-all-btn {
          background: var(--primary);
          margin-bottom: 15px;
        }

        .toggle-all-btn:hover {
          background: var(--secondary);
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 25px;
          font-size: 0.95rem;
          background: transparent;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: none;
        }

        table th,
        table td {
          padding: 14px;
          text-align: center;
          transition: background-color 0.3s ease;
          color: var(--primary);
        }

        table th {
          background: var(--gradient);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
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

        .role-boxes-container {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          margin: 30px 0;
          justify-content: center;
          padding: 50px 0;
        }

        .role-box {
          flex: 1 1 200px;
          background-color: #fff;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .role-box:hover {
          transform: scale(1.05);
          background-color: hsl(210, 65.50%, 53.30%);
        }

        .role-box h3 {
          margin: 0 0 10px 0;
          color: var(--primary);
          font-size: 1.2rem;
        }

        .role-box p {
          margin: 5px 0;
          color: #4a5568;
          font-size: 1rem;
        }

        .role-details-container {
          display: none;
          margin-top: 20px;
          padding: 20px;
          border: 2px solid var(--primary);
          border-radius: 10px;
          background-color: #fff;
        }

        .role-details-container.show {
          display: block;
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.6);
        }

        .modal.show {
          display: block;
        }

        .modal-content {
          background: #fff;
          margin: 5% auto;
          padding: 25px;
          border: none;
          width: 60%;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(237, 28, 28, 0.15);
          position: relative;
        }

        .close {
          color: #718096;
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close:hover,
        .close:focus {
          color: #2d3748;
        }

        .permissions-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background-color: #f8fafc;
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: 6px;
          background: white;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .permission-item:hover {
          background: #edf2f7;
        }

        .permission-item input {
          cursor: pointer;
        }

        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loader-container {
          text-align: center;
        }

        .modern-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loader-ring {
          width: 60px;
          height: 60px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-text {
          font-size: 1.2rem;
          color: var(--primary);
        }
        
        .pagination-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 15px;
          background: ;
          border-radius: 10px;
          box-shadow: var(--shadow-sm);
        }

        .records-per-page {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .records-per-page select {
          padding: 8px 15px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          background: transparent;
          color: var(--primary);
          font-weight: 500;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pagination-buttons button {
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--gradient);
          color: white;
          font-size: 1.2rem;
        }

        .pagination-buttons button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-buttons span {
          font-weight: 600;
          color: var(--primary);
          margin: 0 15px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          table {
            display: block;
            overflow-x: auto;
          }

          .modal-content {
            width: 90%;
          }

          .permissions-grid {
            grid-template-columns: 1fr;
          }

          .role-boxes-container {
            grid-template-columns: 1fr;
          }
          
          .pagination-controls {
            flex-direction: column;
            gap: 15px;
          }
          
          .records-per-page {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
}