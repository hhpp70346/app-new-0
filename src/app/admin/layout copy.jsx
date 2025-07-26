// app/admin/layout.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faChartBar, faCogs, faHome, faSearch,
  faUserCircle, faChevronDown, faUser, faSitemap, 
  faExchangeAlt, faMoon, faSun, faSignOutAlt, faTimes, 
  faChevronLeft, faCircle, faBars, faBolt, faCodeBranch, 
  faUserTag, faCheckCircle, faTimesCircle, faPalette, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { faLock } from '@fortawesome/free-solid-svg-icons';


const ROLE_NAMES = {
  'admin': 'المدير العام',
  'system_admin': 'مدير النظام',
  'account_manager': 'إدارة الحسابات',
  'issue_manager': 'إدارة الإصدار',
  'general_manager': 'متابعة المدير العام',
  'revenue_review': 'مراجعة الإيرادات'
};

const MENU_ITEMS = {
  admin: [
    { 
      name: 'الرئيسية',
      icon: faHome,
      path: '/',
      screenName: 'الرئيسية',
      subItems: []
    },
    { 
      name: 'تغيير كلمة المرور',
  icon: faLock, // أيقونة القفل
  path: '/admin/change-password',
  screenName: 'تغيير كلمة المرور',
  subItems: []
    },
    { 
      name: 'إدارة المستخدمين', 
      icon: faUsers, 
      subItems: [
        { name: 'إضافة مستخدم', path: '/admin/users', screenName: 'إضافة مستخدم' },
        { name: 'عرض المستخدمين', path: '/admin/change-password', screenName: 'عرض المستخدمين' }
      ]
    },
    { 
      name: 'التقارير', 
      icon: faChartBar, 
      subItems: [
        { name: 'تقرير يومي', path: '/admin/reports/daily', screenName: 'تقرير يومي' },
        { name: 'تقرير شهري', path: '/admin/reports/monthly', screenName: 'تقرير شهري' }
      ]
    },
    { 
      name: 'الإعدادات', 
      icon: faCogs, 
      subItems: [
        { name: 'إعدادات النظام', path: '/admin/settings/system', screenName: 'إعدادات النظام' },
        { name: 'إعدادات الحساب', path: '/admin/settings/account', screenName: 'إعدادات الحساب' }
      ]
    }
  ]
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [branches, setBranches] = useState([]);
  const [screenName, setScreenName] = useState('نظام إدارة الطاقة المتجددة');
  const [colorCustomizerOpen, setColorCustomizerOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#4361ee');
  const [secondaryColor, setSecondaryColor] = useState('#3f37c9');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({}); // New state for tracking expanded submenus

  // تحميل التفضيلات المحفوظة
  useEffect(() => {
    const loadPreferences = () => {
      const savedPrimary = localStorage.getItem('primaryColor');
      const savedSecondary = localStorage.getItem('secondaryColor');
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      
      if (savedPrimary) setPrimaryColor(savedPrimary);
      if (savedSecondary) setSecondaryColor(savedSecondary);
      setDarkMode(savedDarkMode);
    };
    loadPreferences();
  }, []);

  // تطبيق الألوان على المتغيرات CSS
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
  }, [primaryColor, secondaryColor]);

  // التحقق من المستخدم
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
      fetchUserBranches(userData.username);
      checkUserStatus(userData.id);
      setLoading(false);
    };

    authenticate();
  }, []);

  // البحث في القائمة
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const roleMenu = MENU_ITEMS[user?.role] || [];
    
    for (const menu of roleMenu) {
      if (menu.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          type: 'main',
          name: menu.name,
          path: menu.path,
          screenName: menu.screenName
        });
      }

      for (const subItem of menu.subItems) {
        if (subItem.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({
            type: 'sub',
            name: subItem.name,
            path: subItem.path,
            screenName: subItem.screenName,
            parentMenu: menu.name
          });
        }
      }
    }

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, user]);

  // منع التنقل الخلفي
  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      window.history.forward();
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  // تفعيل/تعطيل الوضع الداكن
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // تحديث اسم الشاشة عند تغيير المسار
  useEffect(() => {
    if (!user) return;
    
    const roleMenu = MENU_ITEMS[user.role] || [];
    let currentScreen = 'نظام إدارة الطاقة المتجددة';
    
    for (const menu of roleMenu) {
      if (menu.path === pathname) {
        currentScreen = menu.screenName;
        break;
      }
      
      for (const subItem of menu.subItems) {
        if (subItem.path === pathname) {
          currentScreen = subItem.screenName;
          break;
        }
      }
    }
    
    setScreenName(currentScreen);
  }, [pathname, user]);

  // جلب فروع المستخدم
  const fetchUserBranches = async (username) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getBranches', username })
      });
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error('فشل في جلب الفروع:', error);
      toast.error('فشل في جلب بيانات الفروع');
    }
  };

  // التحقق من حالة المستخدم
  const checkUserStatus = async (userId) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUserStatus', userId })
      });
      const data = await response.json();
      
      if (!data.success || data.isActive === 0) {
        handleLogout();
      }
    } catch (error) {
      console.error('فشل في التحقق من حالة المستخدم:', error);
      toast.error('فشل في التحقق من حالة المستخدم');
    }
  };

  // تغيير الفرع
  const handleBranchChange = async (branch) => {
    try {
      const result = await Swal.fire({
        title: 'تغيير الفرع',
        text: `هل أنت متأكد من تغيير الفرع إلى ${branch}؟`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، تغيير',
        cancelButtonText: 'إلغاء',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'changeBranch',
            username: user.username,
            branch
          })
        });
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          setUserDropdownOpen(false);
          toast.success(`تم تغيير الفرع إلى ${branch} بنجاح`);
        } else {
          toast.error(data.message || 'فشل في تغيير الفرع');
        }
      }
    } catch (error) {
      console.error('فشل في تغيير الفرع:', error);
      toast.error('حدث خطأ أثناء تغيير الفرع');
    }
  };

  // تسجيل الخروج
  const handleLogout = () => {
    Swal.fire({
      title: 'تسجيل الخروج',
      text: 'هل أنت متأكد من تسجيل الخروج؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، تسجيل خروج',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        toast.success('تم تسجيل الخروج بنجاح');
        router.push('/');
      }
    });
  };

  // تبديل الوضع الداكن
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`تم تفعيل الوضع ${!darkMode ? 'الليلي' : 'النهاري'}`);
  };

  // تطبيق الألوان المخصصة
  const applyColors = () => {
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('secondaryColor', secondaryColor);
    toast.success('تم تطبيق الألوان بنجاح');
    setColorCustomizerOpen(false);
  };

  // إعادة تعيين الألوان الافتراضية
  const resetColors = () => {
    setPrimaryColor('#4361ee');
    setSecondaryColor('#3f37c9');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('secondaryColor');
    toast.success('تم إعادة تعيين الألوان إلى الافتراضي');
  };

  // معالجة النقر على القائمة
  const handleMenuClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.name]: !prev[item.name]
      }));
    } else if (item.path) {
      router.push(item.path);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
        </div>
      </div>
    );
  }

  const userMenu = MENU_ITEMS[user.role] || [];

  return (
    <>
      <Head>
        <title>نظام إدارة الطاقة المتجددة - {screenName}</title>
      </Head>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />

      <header className="admin-header">
        <div className="header-title">
          <FontAwesomeIcon icon={faBolt} />
          نظام إدارة الطاقة المتجددة - {screenName}
        </div>
        
        <div className="search-container">
          <div className="search-group">
            <input
              type="text"
              placeholder="ابحث في القائمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(searchResults.length > 0)}
            />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          
          {showSearchResults && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleMenuClick(result)}
                >
                  <div className="result-info">
                    <span className="result-name">{result.name}</span>
                    {result.type === 'sub' && (
                      <span className="result-parent">في {result.parentMenu}</span>
                    )}
                  </div>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="user-dropdown">
          <button 
            className="dropdown-toggle" 
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          >
            <FontAwesomeIcon icon={faUserCircle} />
            {user.username}
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`dropdown-icon ${userDropdownOpen ? 'active' : ''}`} 
            />
          </button>
          <div className={`dropdown-content ${userDropdownOpen ? 'show' : ''}`}>
            <div className="user-info-section">
              <div className="info-item">
                <FontAwesomeIcon icon={faUser} />
                <span>اسم المستخدم: {user.username}</span>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faUserTag} />
                <span>الصلاحية: {ROLE_NAMES[user.role] || user.role}</span>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={user.isActive ? faCheckCircle : faTimesCircle} />
                <span>الحالة: {user.isActive ? 'مفعل' : 'غير مفعل'}</span>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faSitemap} />
                <span>الفرع الحالي: {user.branch}</span>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <div className="branches-section">
              <div className="section-title">
                <FontAwesomeIcon icon={faExchangeAlt} />
                <span>تغيير الفرع:</span>
              </div>
              <div className="branches-list">
                {branches.map((branch) => (
                  <div 
                    key={branch} 
                    className={`branch-option ${user.branch === branch ? 'active' : ''}`}
                    onClick={() => handleBranchChange(branch)}
                  >
                    <FontAwesomeIcon icon={faCodeBranch} />
                    <span>{branch}</span>
                    {user.branch === branch && <div className="active-indicator"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <div className="settings-section">
              <div 
                className="settings-item dark-mode-toggle"
                onClick={toggleDarkMode}
              >
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                <span>الوضع الليلي: {darkMode ? 'مفعل' : 'غير مفعل'}</span>
                <div className={`toggle-switch ${darkMode ? 'active' : ''}`}>
                  <div className="toggle-handle"></div>
                </div>
              </div>
              
              <div 
                className="settings-item"
                onClick={() => setColorCustomizerOpen(!colorCustomizerOpen)}
              >
                <FontAwesomeIcon icon={faPalette} />
                <span>تخصيص الألوان</span>
              </div>
              
              {colorCustomizerOpen && (
                <div className="color-customizer">
                  <div className="color-picker">
                    <label>اللون الأساسي:</label>
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                  </div>
                  <div className="color-picker">
                    <label>اللون الثانوي:</label>
                    <input 
                      type="color" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                  </div>
                  <div className="color-buttons">
                    <button 
                      className="apply-colors"
                      onClick={applyColors}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      تطبيق
                    </button>
                    <button 
                      className="reset-colors"
                      onClick={resetColors}
                    >
                      إعادة تعيين
                    </button>
                  </div>
                </div>
              )}
              
              <div 
                className="settings-item logout-button"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>تسجيل الخروج</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`admin-sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarExpanded(false)}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {userMenu.map((item, index) => (
          <div key={index}>
            <a
              className={`sidebar-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.name}</span>
              {item.subItems && item.subItems.length > 0 && (
                <FontAwesomeIcon 
                  icon={faChevronLeft} 
                  className={`submenu-icon ${expandedMenus[item.name] ? 'expanded' : ''}`} 
                />
              )}
            </a>
            {item.subItems && item.subItems.length > 0 && expandedMenus[item.name] && (
              <div className="submenu">
                {item.subItems.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    className={`sidebar-item ${pathname === subItem.path ? 'active' : ''}`}
                    onClick={() => handleMenuClick(subItem)}
                  >
                    <FontAwesomeIcon icon={faCircle} size="xs" />
                    <span>{subItem.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="sidebar-toggle" onClick={() => setSidebarExpanded(true)}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      <main className="admin-content">
        {children}
      </main>

      <footer className="admin-footer">
        جميع الحقوق محفوظة © <strong>HASSAN</strong> 2025
      </footer>
   
      <style jsx global>{`
        
        :root {
          --primary: #4361ee;
          --secondary: #3f37c9;
          --dark: #1a1a2e;
          --light: #f8f9fa;
          --accent: #4cc9f0;
          --success: #4caf50;
          --warning: #ff9800;
          --danger: #f44336;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1);
          --shadow-xl: 0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05);
          --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
          --sidebar-width: 80px;
          --expanded-sidebar-width: 300px;
          --border-radius: 12px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: var(--light);
          color: var(--text-primary);
          transition: var(--transition);
          overflow-x: hidden;
          line-height: 1.6;
        }

        body.dark-mode {
          background-color: var(--dark);
          color: var(--light);
          --text-primary: #f8f9fa;
          --text-secondary: #adb5bd;
        }

        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--gradient);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .loader {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .loader-circle {
          position: absolute;
          border-radius: 50%;
          border: 8px solid transparent;
          animation: spin 1.5s linear infinite;
        }

        .loader-circle:nth-child(1) {
          width: 100%;
          height: 100%;
          border-top-color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .loader-circle:nth-child(2) {
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          border-left-color: rgba(255, 255, 255, 0.8);
          border-right-color: rgba(255, 255, 255, 0.8);
          animation-direction: reverse;
        }

        .loader-circle:nth-child(3) {
          top: 35%;
          left: 35%;
          width: 30%;
          height: 30%;
          border-top-color: var(--primary);
          border-bottom-color: var(--primary);
          animation-duration: 2s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .admin-header {
          background: var(--gradient);
          color: var(--light);
          padding: 1rem 2rem;
          font-size: 1.5rem;
          font-weight: 700;
          box-shadow: var(--shadow-xl);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1001;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: var(--transition);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-grow: 1;
          justify-content: center;
        }

        .header-title svg {
          color: var(--accent);
          font-size: 1.8rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .search-container {
          position: relative;
          flex-grow: 1;
          max-width: 500px;
          margin: 0 1.5rem;
        }

        .search-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-group input {
          width: 100%;
          padding: 0.75rem 1.5rem 0.75rem 3rem;
          border: none;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.2);
          color: var(--light);
          font-size: 1rem;
          transition: var(--transition);
          backdrop-filter: blur(5px);
        }

        body.dark-mode .search-group input {
          background: rgba(255, 255, 255, 0.1);
        }

        .search-group input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-group input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 0 2px var(--accent);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--light);
          opacity: 0.8;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--light);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-xl);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1002;
          margin-top: 0.5rem;
          animation: slideDown 0.3s ease-out;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        body.dark-mode .search-results {
          background: rgba(26, 26, 46, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: var(--transition);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        body.dark-mode .search-result-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .search-result-item:hover {
          background: rgba(67, 97, 238, 0.1);
        }

        body.dark-mode .search-result-item:hover {
          background: rgba(67, 97, 238, 0.2);
        }

        .result-info {
          display: flex;
          flex-direction: column;
        }

        .result-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        body.dark-mode .result-name {
          color: var(--light);
        }

        .result-parent {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        body.dark-mode .result-parent {
          color: var(--light);
          opacity: 0.7;
        }

        .search-result-item svg {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        body.dark-mode .search-result-item svg {
          color: var(--light);
          opacity: 0.7;
        }

        .user-dropdown {
          position: relative;
          z-index: 1002;
        }

        .dropdown-toggle {
          background: var(--gradient);
          color: var(--light);
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
        }

        .dropdown-toggle:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          right: -150px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          min-width: 320px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 12px;
          box-shadow: var(--shadow-xl);
          z-index: 1;
          animation: fadeIn 0.3s ease-out;
        }

        body.dark-mode .dropdown-content {
          background: rgba(30, 30, 46, 0.95);
        }

        .dropdown-content.show {
          display: block;
        }

        .user-info-section, 
        .branches-section, 
        .settings-section {
          padding: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: var(--text-primary);
        }

        body.dark-mode .info-item {
          color: var(--light);
        }

        .info-item svg {
          color: var(--primary);
          width: 20px;
          text-align: center;
        }

        .info-item .fa-check-circle {
          color: var(--success);
        }

        .info-item .fa-times-circle {
          color: var(--danger);
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 0.5rem 0;
        }

        body.dark-mode .dropdown-divider {
          background: rgba(255, 255, 255, 0.1);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        body.dark-mode .section-title {
          color: var(--light);
        }

        .section-title svg {
          color: var(--primary);
        }

        .branches-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 5px;
        }

        .branches-list::-webkit-scrollbar {
          width: 6px;
        }

        .branches-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }

        .branches-list::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 3px;
        }

        .branch-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          background: rgba(0, 0, 0, 0.05);
        }

        body.dark-mode .branch-option {
          background: rgba(255, 255, 255, 0.05);
        }

        .branch-option:hover {
          background: rgba(67, 97, 238, 0.1);
          transform: translateX(5px);
        }

        body.dark-mode .branch-option:hover {
          background: rgba(67, 97, 238, 0.2);
        }

        .branch-option.active {
          background: rgba(67, 97, 238, 0.2);
          font-weight: 600;
        }

        .branch-option svg {
          color: var(--primary);
        }

        .active-indicator {
          position: absolute;
          left: 10px;
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition);
        }

        .settings-item:hover {
          background: rgba(67, 97, 238, 0.1);
        }

        body.dark-mode .settings-item:hover {
          background: rgba(67, 97, 238, 0.2);
        }

        .settings-item svg {
          color: var(--primary);
          width: 20px;
          text-align: center;
        }

        .dark-mode-toggle {
          position: relative;
          padding-right: 60px;
        }

        .toggle-switch {
          position: absolute;
          right: 1.5rem;
          width: 40px;
          height: 20px;
          background-color: #ccc;
          border-radius: 20px;
          transition: var(--transition);
        }

        .toggle-switch.active {
          background-color: var(--primary);
        }

        .toggle-handle {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          transition: var(--transition);
        }

        .toggle-switch.active .toggle-handle {
          transform: translateX(20px);
        }

        .logout-button {
          color: var(--danger);
        }

        .logout-button:hover {
          background: rgba(244, 67, 54, 0.1) !important;
        }

        .color-customizer {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          margin: 0.5rem 0;
        }

        body.dark-mode .color-customizer {
          background: rgba(255, 255, 255, 0.05);
        }

        .color-picker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .color-picker label {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        body.dark-mode .color-picker label {
          color: var(--light);
        }

        .color-picker input[type="color"] {
          width: 40px;
          height: 40px;
          border: 2px solid var(--primary);
          border-radius: 8px;
          cursor: pointer;
          background: transparent;
        }

        .color-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .apply-colors, .reset-colors {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .apply-colors {
          background: var(--primary);
          color: white;
        }

        .apply-colors:hover {
          background: var(--secondary);
          transform: translateY(-2px);
        }

        .reset-colors {
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-primary);
        }

        body.dark-mode .reset-colors {
          background: rgba(255, 255, 255, 0.1);
          color: var(--light);
        }

        .reset-colors:hover {
          background: rgba(0, 0, 0, 0.2);
          transform: translateY(-2px);
        }

        body.dark-mode .reset-colors:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .admin-sidebar {
          height: 100vh;
          width: var(--sidebar-width);
          position: fixed;
          z-index: 1000;
          top: 0;
          right: 0;
          background: var(--gradient);
          transition: width 0.3s ease;
          box-shadow: var(--shadow-xl);
          overflow-x: hidden;
          overflow-y: auto;
          padding-top: 80px;
          min-height: 100vh;
          backdrop-filter: blur(10px);
        }

        .admin-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .admin-sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .admin-sidebar::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 3px;
        }

        .admin-sidebar::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }

        .admin-sidebar.expanded {
          width: var(--expanded-sidebar-width);
        }

        .sidebar-close {
          display: none;
          position: fixed;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--light);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          z-index: 1001;
        }

        .admin-sidebar.expanded .sidebar-close {
          display: block;
        }

        .sidebar-close:hover {
          transform: scale(1.1);
        }

        .sidebar-item {
          position: relative;
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          text-decoration: none;
          font-size: 1rem;
          color: var(--light);
          transition: var(--transition);
          white-space: nowrap;
          overflow: hidden;
          cursor: pointer;
        }

        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .sidebar-item svg {
          font-size: 1.25rem;
          min-width: 30px;
          transition: var(--transition);
        }

        .sidebar-item span {
          margin-right: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease 0.2s;
          font-weight: 500;
        }

        .admin-sidebar.expanded .sidebar-item span {
          opacity: 1;
        }

        .sidebar-item::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 0;
          background-color: var(--accent);
          border-radius: 2px 0 0 2px;
          transition: height 0.3s ease;
        }

        .sidebar-item:hover::after {
          height: 60%;
        }

        .sidebar-item.active {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-item.active::after {
          height: 60%;
        }

        .submenu {
          display: block;
          background: rgba(0, 0, 0, 0.1);
          animation: slideDown 0.4s ease-out;
        }

        .submenu .sidebar-item {
          padding: 0.75rem 1.5rem 0.75rem 3rem;
          font-size: 0.9rem;
        }

        .sidebar-item .submenu-icon {
          position: absolute;
          left: 1.5rem;
          transition: transform 0.3s ease;
          font-size: 0.8rem;
        }

        .submenu-icon.expanded {
          transform: rotate(-90deg);
        }

        .admin-content {
          margin-right: var(--sidebar-width);
          margin-top: 80px;
          padding: 2rem;
          min-height: calc(100vh - 80px);
          transition: var(--transition);
        }

        .admin-sidebar.expanded ~ .admin-content {
          margin-right: var(--expanded-sidebar-width);
        }

        .admin-footer {
          text-align: center;
          padding: 1.5rem;
          margin-top: auto;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .admin-footer strong {
          color: var(--primary);
          font-weight: 700;
        }

        .sidebar-toggle {
          background: transparent;
          border: none;
          color: var(--light);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1001;
        }

        .sidebar-toggle:hover {
          transform: scale(1.1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 992px) {
          .admin-sidebar {
            width: 0;
            z-index: 1002;
          }

          .admin-sidebar.expanded {
            width: var(--expanded-sidebar-width);
          }

          .admin-content {
            width: 100%;
            margin-right: 0;
          }

          .admin-sidebar.expanded ~ .admin-content {
            margin-right: var(--expanded-sidebar-width);
          }

          .search-container {
            display: none;
          }
        }
        
      `}</style>
    </>
  );
}