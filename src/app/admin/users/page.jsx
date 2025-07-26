'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  FiEdit, FiTrash2, FiUserPlus, FiCheck, FiX, FiArrowLeft,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight 
} from 'react-icons/fi';

const branches = [
  'الرحاب', 'القطاميه', 'التجمع الخامس', 'التجمع الاول', 'العباسيه', 'الظاهر',
  'شروق م.نصر', 'مدينه نصر', 'الزهراء', 'العبور', 'السلام', 'النهضه', 'عرابى',
  'النزهه', 'مصر الجديده', 'الحدائق', 'الاميريه', 'المطريه', 'الزيتون', 'عين شمس',
  'الخصوص', 'شبرا الخيمه', 'بيجام', 'منشيه الحريه', 'بهتيم', 'شبرا مصر', 'روض الفرج',
  'الشرابيه', 'الزاويه', 'القناطر', 'منشيه عبدالمنعم رياض', 'مسطرد', 'المرج',
  'قباء', 'عزبة النخل', 'الخانكه', 'ابو زعبل', 'تجريبي'
];

const roles = [
  { value: 'admin', label: 'المدير العام' },
  { value: 'system_admin', label: 'مدير النظام' },
  { value: 'account_manager', label: 'إدارة الحسابات' },
  { value: 'issue_manager', label: 'إدارة الإصدار' },
  { value: 'general_manager', label: 'متابعة المدير العام' },
  { value: 'revenue_review', label: 'مراجعة الإيرادات' }
];

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchUsers, setBranchUsers] = useState([]);
  const [showBranchDetails, setShowBranchDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filter, setFilter] = useState({
    fullName: '',
    username: '',
    role: ''
  });

  // إضافة حالة للجدول الحديث
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '1234',
    nationalID: '',
    role: '',
    isActive: '1',
    branches: []
  });

  const [editData, setEditData] = useState({
    id: '',
    fullName: '',
    username: '',
    password: '',
    nationalID: '',
    role: '',
    isActive: '1',
    branches: []
  });

  // حساب بيانات الصفحات
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = branchUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(branchUsers.length / recordsPerPage);
  
  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // تغيير عدد السجلات لكل صفحة
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?action=getUsers');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('حدث خطأ أثناء جلب بيانات المستخدمين', true);
    }
  };

  const fetchUserById = async (id) => {
    try {
      const res = await fetch(`/api/users?action=getUserById&id=${id}`);
      const data = await res.json();
      setEditData({
        id: data.id,
        fullName: data.fullName,
        username: data.username,
        password: data.password,
        nationalID: data.nationalID,
        role: data.role,
        isActive: data.isActive === 'مفعل' ? '1' : '0',
        branches: data.branch ? [data.branch] : []
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching user:', error);
      showAlert('حدث خطأ أثناء جلب بيانات المستخدم', true);
    }
  };

  const addUser = async () => {
    if (formData.branches.length === 0) {
      showAlert('يرجى اختيار فرع واحد على الأقل', true);
      return;
    }
    
    try {
      // Create a user for each selected branch
      const addPromises = formData.branches.map(branch => 
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...formData, 
            action: 'addUser',
            branch: branch
          })
        })
      );

      const results = await Promise.all(addPromises);
      const data = await Promise.all(results.map(res => res.json()));
      
      const errors = data.filter(item => item.status === 'error');
      if (errors.length > 0) {
        showAlert(errors[0].message || 'حدث خطأ أثناء إضافة بعض المستخدمين', true);
      } else {
        showAlert('تم إضافة المستخدمين بنجاح');
        setFormData({
          fullName: '',
          username: '',
          password: '1234',
          nationalID: '',
          role: '',
          isActive: '1',
          branches: []
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      showAlert('حدث خطأ أثناء إضافة المستخدم', true);
    }
  };

  const editUser = async () => {
    try {
      // First delete all existing users with this ID (handles branch changes)
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', id: editData.id })
      });

      // Then add new users for each selected branch
      const addPromises = editData.branches.map(branch => 
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...editData, 
            action: 'addUser',
            branch: branch
          })
        })
      );

      const results = await Promise.all(addPromises);
      const data = await Promise.all(results.map(res => res.json()));
      
      const errors = data.filter(item => item.status === 'error');
      if (errors.length > 0) {
        showAlert(errors[0].message || 'حدث خطأ أثناء تعديل بعض المستخدمين', true);
      } else {
        showAlert('تم تعديل المستخدم بنجاح');
        setShowEditModal(false);
        fetchUsers();
        if (showBranchDetails) {
          showBranchUsers(selectedBranch);
        }
      }
    } catch (error) {
      console.error('Error editing user:', error);
      showAlert('حدث خطأ أثناء تعديل المستخدم', true);
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showAlert('تم حذف المستخدم بنجاح');
        fetchUsers();
        if (showBranchDetails) {
          showBranchUsers(selectedBranch);
        }
      } else {
        showAlert(data.message, true);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('حدث خطأ أثناء حذف المستخدم', true);
    }
  };

  const deleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      showAlert('يرجى تحديد مستخدم واحد على الأقل لحذفه', true);
      return;
    }
    try {
      const deletePromises = selectedUsers.map(id =>
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteUser', id })
        })
      );
      const results = await Promise.all(deletePromises);
      const data = await Promise.all(results.map(res => res.json()));
      const errors = data.filter(item => item.status === 'error');
      if (errors.length > 0) {
        showAlert('حدث خطأ في حذف بعض المستخدمين', true);
      } else {
        showAlert('تم حذف المستخدمين المحددين بنجاح');
        setSelectedUsers([]);
        setSelectAll(false);
        fetchUsers();
        if (showBranchDetails) {
          showBranchUsers(selectedBranch);
        }
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      showAlert('حدث خطأ أثناء حذف المستخدمين', true);
    }
  };

  const showBranchUsers = (branch) => {
    const filteredUsers = users.filter(user => user.branch === branch);
    setBranchUsers(filteredUsers);
    setSelectedBranch(branch);
    setShowBranchDetails(true);
    setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير الفرع
  };

  const filterBranchUsers = () => {
    let filtered = users.filter(user => user.branch === selectedBranch);
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
    if (filter.role) {
      filtered = filtered.filter(user => user.role === filter.role);
    }
    setBranchUsers(filtered);
    setCurrentPage(1); // إعادة تعيين الصفحة عند التصفية
  };

  const showAlert = (message, isError = false) => {
    Swal.fire({
      title: isError ? 'خطأ' : 'نجاح',
      text: message,
      icon: isError ? 'error' : 'success',
      confirmButtonText: 'حسناً'
    });
  };

  const confirmAction = (message, action, id = null) => {
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
        if (action === 'delete') {
          deleteUser(id);
        } else if (action === 'deleteSelected') {
          deleteSelectedUsers();
        } else if (action === 'add') {
          addUser();
        } else if (action === 'edit') {
          editUser();
        }
      }
    });
  };

  const toggleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(branchUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleBranchSelection = (branch) => {
    setFormData(prev => {
      if (prev.branches.includes(branch)) {
        return {
          ...prev,
          branches: prev.branches.filter(b => b !== branch)
        };
      } else {
        return {
          ...prev,
          branches: [...prev.branches, branch]
        };
      }
    });
  };

  const toggleEditBranchSelection = (branch) => {
    setEditData(prev => {
      if (prev.branches.includes(branch)) {
        return {
          ...prev,
          branches: prev.branches.filter(b => b !== branch)
        };
      } else {
        return {
          ...prev,
          branches: [...prev.branches, branch]
        };
      }
    });
  };

  const toggleSelectAllBranches = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      branches: checked ? [...branches] : []
    }));
  };

  const toggleEditSelectAllBranches = (e) => {
    const checked = e.target.checked;
    setEditData(prev => ({
      ...prev,
      branches: checked ? [...branches] : []
    }));
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: prev.fullName
    }));
  }, [formData.fullName]);

  useEffect(() => {
    setEditData(prev => ({
      ...prev,
      username: prev.fullName
    }));
  }, [editData.fullName]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showBranchDetails) {
      filterBranchUsers();
    }
  }, [filter]);

  useEffect(() => {
    if (branchUsers.length > 0 && selectedUsers.length === branchUsers.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, branchUsers]);

  const branchStats = branches.reduce((acc, branch) => {
    const count = users.filter(user => user.branch === branch).length;
    if (count > 0) {
      acc[branch] = count;
    }
    return acc;
  }, {});

  return (
    <>
      <div className="container">
        <h2>إدارة المستخدمين</h2>

        {/* Form for Adding User */}
        <form onSubmit={(e) => {
          e.preventDefault();
          confirmAction('هل أنت متأكد من إضافة هذا المستخدم؟', 'add');
        }} className="mb-8">
          <div className="form-row">
            <div className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <label className="transparent-label">الاسم الكامل</label>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  value={formData.username}
                  readOnly
                />
                <label className="transparent-label">اسم المستخدم</label>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <label className="transparent-label">كلمة المرور</label>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  value={formData.nationalID}
                  onChange={(e) => setFormData({ ...formData, nationalID: e.target.value })}
                  required
                />
                <label className="transparent-label">الرقم القومي</label>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">اختر الصلاحية</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <label className="transparent-label">الصلاحية</label>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                  required
                >
                  <option value="1">مفعل</option>
                  <option value="0">غير مفعل</option>
                </select>
                <label className="transparent-label">حالة المستخدم</label>
              </div>
            </div>
          </div>

          {/* Branch Selection */}
          <div className="branch-selection-container">
            <h3>اختيار الفروع</h3>
            <div className="branch-checkboxes">
              <label className="select-all-label">
                <input 
                  type="checkbox" 
                  checked={formData.branches.length === branches.length}
                  onChange={toggleSelectAllBranches}
                /> 
                تحديد الكل
              </label>
              {branches.map(branch => (
                <label key={branch}>
                  <input
                    type="checkbox"
                    checked={formData.branches.includes(branch)}
                    onChange={() => toggleBranchSelection(branch)}
                  />
                  {branch}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="add-user-btn">
            <FiUserPlus /> إضافة مستخدم
          </button>
        </form>

        {/* Branch Stats */}
        {!showBranchDetails && (
          <div className="branch-boxes-container">
            <h2>تجميع المستخدمين حسب الفرع</h2>
            {Object.entries(branchStats).map(([branch, count]) => (
              <div
                key={branch}
                onClick={() => showBranchUsers(branch)}
                className="branch-box"
              >
                <h3>{branch}</h3>
                <p>عدد المستخدمين: {count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Branch Details */}
        {showBranchDetails && (
          <div className="branch-details-container show">
            <button id="backBtn" onClick={() => setShowBranchDetails(false)}>
              <FiArrowLeft /> رجوع
            </button>
            <h2>المستخدمين في الفرع: {selectedBranch}</h2>

            {/* Filter Form */}
            <div className="form-row">
              <div className="form-group">
                <div className="input-group">
                  <input
                    type="text"
                    value={filter.fullName}
                    onChange={(e) => setFilter({ ...filter, fullName: e.target.value })}
                  />
                  <label className="transparent-label">بحث الاسم الكامل</label>
                </div>
              </div>
              <div className="form-group">
                <div className="input-group">
                  <input
                    type="text"
                    value={filter.username}
                    onChange={(e) => setFilter({ ...filter, username: e.target.value })}
                  />
                  <label className="transparent-label">بحث اسم المستخدم</label>
                </div>
              </div>
              <div className="form-group">
                <div className="input-group">
                  <select
                    value={filter.role}
                    onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                  >
                    <option value="">الكل</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <label className="transparent-label">بحث الصلاحية</label>
                </div>
              </div>
            </div>

            <button
              id="deleteSelectedBtn"
              onClick={() => confirmAction('هل أنت متأكد من حذف المستخدمين المحددين؟', 'deleteSelected')}
            >
              <FiTrash2 /> حذف المحدد
            </button>

            {/* Users Table */}
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>الاسم الكامل</th>
                  <th>اسم المستخدم</th>
                  <th>كلمة المرور</th>
                  <th>الرقم القومي</th>
                  <th>الصلاحية</th>
                  <th>الحالة</th>
                  <th>تعديل</th>
                  <th>حذف</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </td>
                    <td>{user.fullName}</td>
                    <td>{user.username}</td>
                    <td>{user.password}</td>
                    <td>{user.nationalID}</td>
                    <td>{roles.find(r => r.value === user.role)?.label || user.role}</td>
                    <td>{user.isActive}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => fetchUserById(user.id)}
                      >
                        <FiEdit /> تعديل
                      </button>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => confirmAction('هل أنت متأكد من حذف هذا المستخدم؟', 'delete', user.id)}
                      >
                        <FiTrash2 /> حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* إضافة عناصر التحكم في الصفحات */}
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

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal show">
            <div className="modal-content">
              <span className="close" onClick={() => setShowEditModal(false)}>
                <FiX />
              </span>
              <h2>تعديل المستخدم</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                confirmAction('هل أنت متأكد من تعديل هذا المستخدم؟', 'edit');
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        required
                      />
                      <label className="transparent-label">الاسم الكامل</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="text"
                        value={editData.username}
                        readOnly
                      />
                      <label className="transparent-label">اسم المستخدم</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="password"
                        value={editData.password}
                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                        required
                      />
                      <label className="transparent-label">كلمة المرور</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input
                        type="text"
                        value={editData.nationalID}
                        onChange={(e) => setEditData({ ...editData, nationalID: e.target.value })}
                        required
                      />
                      <label className="transparent-label">الرقم القومي</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        required
                      >
                        <option value="">اختر الصلاحية</option>
                        {roles.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <label className="transparent-label">الصلاحية</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <select
                        value={editData.isActive}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.value })}
                        required
                      >
                        <option value="1">مفعل</option>
                        <option value="0">غير مفعل</option>
                      </select>
                      <label className="transparent-label">حالة المستخدم</label>
                    </div>
                  </div>
                </div>

                {/* Branch Selection in Edit Modal */}
                <div className="branch-selection-container">
                  <h3>اختيار الفروع</h3>
                  <div className="branch-checkboxes">
                    <label className="select-all-label">
                      <input 
                        type="checkbox" 
                        checked={editData.branches.length === branches.length}
                        onChange={toggleEditSelectAllBranches}
                      /> 
                      تحديد الكل
                    </label>
                    {branches.map(branch => (
                      <label key={branch}>
                        <input
                          type="checkbox"
                          checked={editData.branches.includes(branch)}
                          onChange={() => toggleEditBranchSelection(branch)}
                        />
                        {branch}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <button type="button" id="backBtn" onClick={() => setShowEditModal(false)}>
                    <FiArrowLeft /> رجوع
                  </button>
                  <button type="submit" className="save-btn">
                    <FiCheck /> حفظ التعديلات
                  </button>
                </div>
              </form>
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

        .form-group:hover {
          transform: translateY(-5px);
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
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        button[type="submit"],
        #applyFilterBtn {
          background: var(--gradient);
        }

        button[type="submit"]:hover,
        #applyFilterBtn:hover {
          background: linear-gradient(135deg, var(--secondary), var(--primary));
        }

        #clearFilters,
        #backBtn {
          background: linear-gradient(135deg, #718096, #5a667a);
        }

        #clearFilters:hover,
        #backBtn:hover {
          background: linear-gradient(135deg, #5a667a, #718096);
        }

        table td button {
          padding: 8px 16px;
          background: linear-gradient(135deg, #e53e3e, #c53030);
        }

        table td button:hover {
          background: linear-gradient(135deg, #c53030, #e53e3e);
        }

        #deleteSelectedBtn {
          background: linear-gradient(135deg, #e53e3e, #c53030);
        }

        #deleteSelectedBtn:hover {
          background: linear-gradient(135deg, #c53030, #e53e3e);
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

        .branch-boxes-container {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          margin: 30px 0;
          justify-content: center;
          padding: 50px 0;
        }

        .branch-box {
          flex: 1 1 200px;
          background-color: #fff;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }

        .branch-box:hover {
          transform: scale(1.05);
          background-color: hsl(210, 65.50%, 53.30%);
        }

        .branch-box h3 {
          margin: 0 0 10px 0;
          color: var(--primary);
          font-size: 1.2rem;
        }

        .branch-box p {
          margin: 5px 0;
          color: #4a5568;
          font-size: 1rem;
        }

        .branch-details-container {
          display: none;
          margin-top: 20px;
          padding: 20px;
          border: 2px solid var(--primary);
          border-radius: 10px;
          background-color: #fff;
        }

        .branch-details-container.show {
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

        .branch-selection-container {
          margin: 20px 0;
          padding: 15px;
          border: 1px solidrgb(240, 15, 15);
          border-radius: 8px;
          background-color: ;
        }

        .branch-checkboxes {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }

        .branch-checkboxes label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .branch-checkboxes label:hover {
          background-color:hsl(210, 65.50%, 53.30%);
        }

        .select-all-label {
          font-weight: bold;
          grid-column: 1 / -1;
          padding: 10px;
          background-color: ;
          border-radius: 6px;
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

          .branch-checkboxes {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
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

      `}</style>
    </>
  );
}