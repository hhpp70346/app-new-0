"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Head from "next/head"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUsers,
  faChartBar,
  faCogs,
  faHome,
  faSearch,
  faUserCircle,
  faChevronDown,
  faUser,
  faSitemap,
  faExchangeAlt,
  faMoon,
  faSun,
  faSignOutAlt,
  faTimes,
  faChevronLeft,
  faCircle,
  faBars,
  faCodeBranch,
  faUserTag,
  faCheckCircle,
  faTimesCircle,
  faPalette,
  faCheck,
  faWallet,
  faFileInvoice,
  faBolt,
} from "@fortawesome/free-solid-svg-icons"
import { ToastContainer, toast } from "react-toastify"
import Swal from "sweetalert2"
import "react-toastify/dist/ReactToastify.css"
import { faLock } from "@fortawesome/free-solid-svg-icons"

const ROLE_NAMES = {
  admin: "المدير العام",
  system_admin: "مدير النظام",
  account_manager: "إدارة الحسابات",
  issue_manager: "إدارة الإصدار",
  general_manager: "متابعة المدير العام",
  revenue_review: "مراجعة الإيرادات",
}

const MENU_ITEMS = {
  account_manager: [
    {
      name: "الرئيسية",
      icon: faHome,
      path: "/account-manager",
      screenName: "الرئيسية",
      subItems: [],
    },
    {
      name: "تغيير كلمة المرور",
      icon: faLock,
      path: "/account-manager/change-password",
      screenName: "تغيير كلمة المرور",
      subItems: [],
    },
    {
      name: "إدارة الحسابات",
      icon: faWallet,
      subItems: [
        { name: "عرض الحسابات", path: "/account-manager/accounts", screenName: "عرض الحسابات" },
        { name: "إضافة حساب جديد", path: "/account-manager/accounts/add", screenName: "إضافة حساب جديد" },
        { name: "تعديل الحسابات", path: "/account-manager/accounts/edit", screenName: "تعديل الحسابات" },
      ],
    },
    {
      name: "إدارة العملاء",
      icon: faUsers,
      subItems: [
        { name: "عرض العملاء", path: "/account-manager/customers", screenName: "عرض العملاء" },
        { name: "إضافة عميل", path: "/account-manager/customers/add", screenName: "إضافة عميل" },
        { name: "تعديل بيانات العملاء", path: "/account-manager/customers/edit", screenName: "تعديل بيانات العملاء" },
      ],
    },
    {
      name: "الفواتير والمدفوعات",
      icon: faFileInvoice,
      subItems: [
        { name: "عرض الفواتير", path: "/account-manager/invoices", screenName: "عرض الفواتير" },
        { name: "إنشاء فاتورة", path: "/account-manager/invoices/create", screenName: "إنشاء فاتورة" },
        { name: "المدفوعات", path: "/account-manager/payments", screenName: "المدفوعات" },
        { name: "المتأخرات", path: "/account-manager/overdue", screenName: "المتأخرات" },
      ],
    },
    {
      name: "التقارير المالية",
      icon: faChartBar,
      subItems: [
        { name: "تقرير الإيرادات", path: "/account-manager/reports/revenue", screenName: "تقرير الإيرادات" },
        { name: "تقرير المصروفات", path: "/account-manager/reports/expenses", screenName: "تقرير المصروفات" },
        {
          name: "تقرير الأرباح والخسائر",
          path: "/account-manager/reports/profit-loss",
          screenName: "تقرير الأرباح والخسائر",
        },
        { name: "تقرير التدفق النقدي", path: "/account-manager/reports/cash-flow", screenName: "تقرير التدفق النقدي" },
      ],
    },
    {
      name: "الإعدادات",
      icon: faCogs,
      subItems: [
        { name: "إعدادات الحساب", path: "/account-manager/settings/account", screenName: "إعدادات الحساب" },
        { name: "إعدادات الفواتير", path: "/account-manager/settings/invoices", screenName: "إعدادات الفواتير" },
        { name: "إعدادات التقارير", path: "/account-manager/settings/reports", screenName: "إعدادات التقارير" },
      ],
    },
  ],
}

export default function AccountManagerLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [branches, setBranches] = useState([])
  const [screenName, setScreenName] = useState("نظام إدارة الحسابات")
  const [colorCustomizerOpen, setColorCustomizerOpen] = useState(false)
  const [primaryColor, setPrimaryColor] = useState("#667eea")
  const [secondaryColor, setSecondaryColor] = useState("#764ba2")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})

  useEffect(() => {
    const loadPreferences = () => {
      const savedPrimary = localStorage.getItem("primaryColor")
      const savedSecondary = localStorage.getItem("secondaryColor")
      const savedDarkMode = localStorage.getItem("darkMode") === "true"

      if (savedPrimary) setPrimaryColor(savedPrimary)
      if (savedSecondary) setSecondaryColor(savedSecondary)
      setDarkMode(savedDarkMode)
    }
    loadPreferences()
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor)
    document.documentElement.style.setProperty("--secondary", secondaryColor)
  }, [primaryColor, secondaryColor])

  const fetchUserPermissions = async (userId) => {
    try {
      const res = await fetch(`/api/users-2?action=getUserPermissions&id=${userId}`)
      const data = await res.json()
      return data.permissions || []
    } catch (error) {
      console.error("فشل في جلب صلاحيات المستخدم:", error)
      toast.error("فشل في جلب صلاحيات المستخدم")
      return []
    }
  }

  useEffect(() => {
    const authenticate = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/")
        return
      }

      const userData = JSON.parse(storedUser)
      if (userData.role !== "account_manager") {
        router.push("/")
        return
      }

      const permissions = await fetchUserPermissions(userData.id)
      const updatedUser = { ...userData, permissions }
      setUser(updatedUser)
      fetchUserBranches(userData.username)
      checkUserStatus(userData.id)
      setLoading(false)
    }

    authenticate()
  }, [])

  useEffect(() => {
    if (!user || !user.permissions) return

    if (searchQuery.trim() === "") {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const results = []
    const roleMenu = MENU_ITEMS[user.role] || []

    for (const menu of roleMenu) {
      if (
        menu.path &&
        user.permissions.includes(menu.path) &&
        menu.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        results.push({
          type: "main",
          name: menu.name,
          path: menu.path,
          screenName: menu.screenName,
        })
      }

      for (const subItem of menu.subItems) {
        if (
          user.permissions.includes(subItem.path) &&
          subItem.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({
            type: "sub",
            name: subItem.name,
            path: subItem.path,
            screenName: subItem.screenName,
            parentMenu: menu.name,
          })
        }
      }
    }

    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }, [searchQuery, user])

  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault()
      window.history.forward()
    }

    window.history.pushState(null, null, window.location.pathname)
    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark")
      localStorage.setItem("darkMode", "true")
    } else {
      document.body.classList.remove("dark")
      localStorage.setItem("darkMode", "false")
    }
  }, [darkMode])

  useEffect(() => {
    if (!user) return

    const roleMenu = MENU_ITEMS[user.role] || []
    let currentScreen = "نظام إدارة الحسابات"

    for (const menu of roleMenu) {
      if (menu.path === pathname) {
        currentScreen = menu.screenName
        break
      }

      for (const subItem of menu.subItems) {
        if (subItem.path === pathname) {
          currentScreen = subItem.screenName
          break
        }
      }
    }

    setScreenName(currentScreen)
  }, [pathname, user])

  const fetchUserBranches = async (username) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getBranches", username }),
      })
      const data = await response.json()
      setBranches(data)
    } catch (error) {
      console.error("فشل في جلب الفروع:", error)
      toast.error("فشل في جلب بيانات الفروع")
    }
  }

  const checkUserStatus = async (userId) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getUserStatus", userId }),
      })
      const data = await response.json()

      if (!data.success || data.isActive === 0) {
        handleLogout()
      }
    } catch (error) {
      console.error("فشل في التحقق من حالة المستخدم:", error)
      toast.error("فشل في التحقق من حالة المستخدم")
    }
  }

  const handleBranchChange = async (branch) => {
    try {
      const result = await Swal.fire({
        title: "تغيير الفرع",
        text: `هل أنت متأكد من تغيير الفرع إلى ${branch}؟`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "نعم، تغيير",
        cancelButtonText: "إلغاء",
        reverseButtons: true,
      })

      if (result.isConfirmed) {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "changeBranch",
            username: user.username,
            branch,
          }),
        })
        const data = await response.json()

        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user))
          setUser(data.user)
          setUserDropdownOpen(false)
          toast.success(`تم تغيير الفرع إلى ${branch} بنجاح`)
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          toast.error(data.message || "فشل في تغيير الفرع")
        }
      }
    } catch (error) {
      console.error("فشل في تغيير الفرع:", error)
      toast.error("حدث خطأ أثناء تغيير الفرع")
    }
  }

  const handleLogout = () => {
    Swal.fire({
      title: "تسجيل الخروج",
      text: "هل أنت متأكد من تسجيل الخروج؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، تسجيل خروج",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user")
        toast.success("تم تسجيل الخروج بنجاح")
        router.push("/")
      }
    })
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    toast.info(`تم تفعيل الوضع ${!darkMode ? "الليلي" : "النهاري"}`)
  }

  const applyColors = () => {
    localStorage.setItem("primaryColor", primaryColor)
    localStorage.setItem("secondaryColor", secondaryColor)
    toast.success("تم تطبيق الألوان بنجاح")
    setColorCustomizerOpen(false)
  }

  const resetColors = () => {
    setPrimaryColor("#667eea")
    setSecondaryColor("#764ba2")
    localStorage.removeItem("primaryColor")
    localStorage.removeItem("secondaryColor")
    toast.success("تم إعادة تعيين الألوان إلى الافتراضي")
  }

  const handleMenuClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.name]: !prev[item.name],
      }))
    } else if (item.path && user.permissions.includes(item.path)) {
      router.push(item.path)
      setShowSearchResults(false)
      setSearchQuery("")
    } else {
      toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة")
    }
  }

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
    )
  }

  const userMenu = MENU_ITEMS[user.role] || []
  const permittedMenuItems = userMenu.filter((item) => {
    if (item.path) {
      return user.permissions.includes(item.path)
    } else if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some((subItem) => user.permissions.includes(subItem.path))
    }
    return false
  })

  return (
    <div className="modern-admin-dashboard">
      <Head>
        <title>نظام إدارة الطاقة المتجددة - {screenName}</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
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

      <header className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarExpanded(true)}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="brand-section">
              <div className="brand-icon">
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <div className="brand-text">
                <h1>نظام الطاقة المتجددة</h1>
                <span className="screen-indicator">{screenName}</span>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="search-wrapper">
              <div className="search-input-group">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="ابحث في النظام..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(searchResults.length > 0)}
                />
                <div className="search-highlight"></div>
              </div>

              {showSearchResults && (
                <div className="search-dropdown">
                  <div className="search-results-header">
                    <span>نتائج البحث ({searchResults.length})</span>
                  </div>
                  {searchResults.map((result, index) => (
                    <div key={index} className="search-result-item" onClick={() => handleMenuClick(result)}>
                      <div className="result-content">
                        <span className="result-title">{result.name}</span>
                        {result.type === "sub" && <span className="result-subtitle">في {result.parentMenu}</span>}
                      </div>
                      <FontAwesomeIcon icon={faChevronLeft} className="result-arrow" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <div className="user-profile-dropdown">
              <button className="profile-trigger" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                <div className="profile-avatar">
                  <FontAwesomeIcon icon={faUserCircle} />
                  <div className="status-indicator"></div>
                </div>
                <div className="profile-info">
                  <span className="username">{user.username}</span>
                  <span className="user-role">{ROLE_NAMES[user.role]}</span>
                </div>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`dropdown-chevron ${userDropdownOpen ? "rotated" : ""}`}
                />
              </button>

              <div className={`profile-dropdown ${userDropdownOpen ? "active" : ""}`}>
                <div className="dropdown-header">
                  <div className="user-details">
                    <div className="detail-row">
                      <FontAwesomeIcon icon={faUser} />
                      <span>المستخدم: {user.username}</span>
                    </div>
                    <div className="detail-row">
                      <FontAwesomeIcon icon={faUserTag} />
                      <span>الصلاحية: {ROLE_NAMES[user.role]}</span>
                    </div>
                    <div className="detail-row">
                      <FontAwesomeIcon icon={user.isActive ? faCheckCircle : faTimesCircle} />
                      <span>الحالة: {user.isActive ? "مفعل" : "غير مفعل"}</span>
                    </div>
                    <div className="detail-row">
                      <FontAwesomeIcon icon={faSitemap} />
                      <span>الفرع: {user.branch}</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-section">
                  <div className="section-header">
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    <span>تغيير الفرع</span>
                  </div>
                  <div className="branches-grid">
                    {branches.map((branch) => (
                      <button
                        key={branch}
                        className={`branch-item ${user.branch === branch ? "current" : ""}`}
                        onClick={() => handleBranchChange(branch)}
                      >
                        <FontAwesomeIcon icon={faCodeBranch} />
                        <span>{branch}</span>
                        {user.branch === branch && <div className="current-badge">الحالي</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dropdown-section">
                  <div className="section-header">
                    <FontAwesomeIcon icon={faCogs} />
                    <span>الإعدادات</span>
                  </div>

                  <button className="dropdown-action dark-mode-toggle" onClick={toggleDarkMode}>
                    <div className="action-content">
                      <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                      <span>الوضع {darkMode ? "النهاري" : "الليلي"}</span>
                    </div>
                    <div className={`modern-toggle ${darkMode ? "active" : ""}`}>
                      <div className="toggle-slider"></div>
                    </div>
                  </button>

                  <button className="dropdown-action" onClick={() => setColorCustomizerOpen(!colorCustomizerOpen)}>
                    <FontAwesomeIcon icon={faPalette} />
                    <span>تخصيص الألوان</span>
                    <FontAwesomeIcon icon={faChevronLeft} className="action-arrow" />
                  </button>

                  {colorCustomizerOpen && (
                    <div className="color-customizer-panel">
                      <div className="color-option">
                        <label>اللون الأساسي</label>
                        <div className="color-input-wrapper">
                          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                          <span className="color-value">{primaryColor}</span>
                        </div>
                      </div>
                      <div className="color-option">
                        <label>اللون الثانوي</label>
                        <div className="color-input-wrapper">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                          />
                          <span className="color-value">{secondaryColor}</span>
                        </div>
                      </div>
                      <div className="color-actions">
                        <button className="apply-btn" onClick={applyColors}>
                          <FontAwesomeIcon icon={faCheck} />
                          تطبيق
                        </button>
                        <button className="reset-btn" onClick={resetColors}>
                          إعادة تعيين
                        </button>
                      </div>
                    </div>
                  )}

                  <button className="dropdown-action logout-action" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`modern-sidebar ${sidebarExpanded ? "expanded" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <span className="brand-name">القائمة الرئيسية</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarExpanded(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {permittedMenuItems.map((item, index) => (
            <div className="nav-item-group" key={index}>
              <button
                className={`nav-item ${pathname === item.path ? "active" : ""}`}
                onClick={() => handleMenuClick(item)}
              >
                <div className="nav-item-content">
                  <div className="nav-icon-wrapper">
                    <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                  </div>
                  <span className="nav-label">{item.name}</span>
                </div>
                {item.subItems && item.subItems.length > 0 && (
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className={`submenu-indicator ${expandedMenus[item.name] ? "expanded" : ""}`}
                  />
                )}
                <div className="nav-item-highlight"></div>
              </button>

              {item.subItems && item.subItems.length > 0 && expandedMenus[item.name] && (
                <div className="submenu-container">
                  {item.subItems
                    .filter((subItem) => user.permissions.includes(subItem.path))
                    .map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        className={`submenu-item ${pathname === subItem.path ? "active" : ""}`}
                        onClick={() => handleMenuClick(subItem)}
                      >
                        <div className="submenu-indicator-line"></div>
                        <FontAwesomeIcon icon={faCircle} className="submenu-dot" />
                        <span className="submenu-label">{subItem.name}</span>
                        <div className="submenu-highlight"></div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {sidebarExpanded && <div className="sidebar-backdrop" onClick={() => setSidebarExpanded(false)} />}

      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>

      <footer className="modern-footer">
        <div className="footer-content">
          <span>جميع الحقوق محفوظة © </span>
          <strong>HASSAN</strong>
          <span> 2025</span>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&display=swap');

        :root {
          --primary: #667eea;
          --primary-light: #818cf8;
          --primary-dark: #4f46e5;
          --secondary: #764ba2;
          --secondary-light: #a78bfa;
          --accent: #f093fb;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --info: #3b82f6;
          
          /* Light Theme Colors */
          --bg-primary: #fafbfc;
          --bg-secondary: #f1f5f9;
          --bg-tertiary: #ffffff;
          --bg-elevated: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-tertiary: #64748b;
          --text-quaternary: #94a3b8;
          --border-primary: #e2e8f0;
          --border-secondary: #cbd5e1;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          
          /* Spacing */
          --space-1: 0.25rem;
          --space-2: 0.5rem;
          --space-3: 0.75rem;
          --space-4: 1rem;
          --space-5: 1.25rem;
          --space-6: 1.5rem;
          --space-8: 2rem;
          --space-10: 2.5rem;
          --space-12: 3rem;
          --space-16: 4rem;
          --space-20: 5rem;
          
          /* Border Radius */
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-2xl: 1.5rem;
          --radius-full: 9999px;
          
          /* Typography */
          --font-size-xs: 0.75rem;
          --font-size-sm: 0.875rem;
          --font-size-base: 1rem;
          --font-size-lg: 1.125rem;
          --font-size-xl: 1.25rem;
          --font-size-2xl: 1.5rem;
          --font-size-3xl: 1.875rem;
          --font-size-4xl: 2.25rem;
          
          /* Layout */
          --sidebar-width: 280px;
          --sidebar-collapsed: 80px;
          --header-height: 80px;
          --footer-height: 60px;
          
          /* Transitions */
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
          
          /* Z-Index */
          --z-dropdown: 1000;
          --z-sticky: 1020;
          --z-fixed: 1030;
          --z-modal-backdrop: 1040;
          --z-modal: 1050;
          --z-popover: 1060;
          --z-tooltip: 1070;
        }

        .dark {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --bg-tertiary: #334155;
          --bg-elevated: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #e2e8f0;
          --text-tertiary: #cbd5e1;
          --text-quaternary: #94a3b8;
          --border-primary: #334155;
          --border-secondary: #475569;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          font-size: 16px;
        }

        body {
          font-family: 'Tajawal', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          overflow-x: hidden;
          transition: background-color var(--transition-normal), color var(--transition-normal);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .modern-admin-dashboard {
          min-height: 100vh;
          display: grid;
          grid-template-areas:
            "header header"
            "sidebar main"
            "footer footer";
          grid-template-rows: var(--header-height) 1fr var(--footer-height);
          grid-template-columns: var(--sidebar-width) 1fr;
          transition: all var(--transition-normal);
        }

        /* Header Styles */
        .modern-header {
          grid-area: header;
          background: var(--bg-elevated);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--border-primary);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          box-shadow: var(--shadow-sm);
        }

        .header-content {
          height: var(--header-height);
          padding: 0 var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-shrink: 0;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mobile-menu-btn:hover {
          background: var(--bg-secondary);
          color: var(--primary);
          transform: scale(1.05);
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--font-size-xl);
          box-shadow: var(--shadow-md);
          position: relative;
          overflow: hidden;
        }

        .brand-icon::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(45deg);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .brand-text h1 {
          font-size: var(--font-size-xl);
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .screen-indicator {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .header-center {
          flex: 1;
          max-width: 600px;
          margin: 0 var(--space-6);
        }

        .search-wrapper {
          position: relative;
          width: 100%;
        }

        .search-input-group {
          position: relative;
          width: 100%;
        }

        .search-input-group input {
          width: 100%;
          height: 48px;
          padding: 0 var(--space-4) 0 var(--space-12);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          background: var(--bg-secondary);
          font-size: var(--font-size-base);
          color: var(--text-primary);
          transition: all var(--transition-normal);
          outline: none;
          font-family: inherit;
        }

        .search-input-group input:focus {
          border-color: var(--primary);
          background: var(--bg-elevated);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .search-input-group input::placeholder {
          color: var(--text-quaternary);
        }

        .search-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          transition: all var(--transition-fast);
          font-size: var(--font-size-lg);
        }

        .search-input-group input:focus + .search-icon {
          color: var(--primary);
        }

        .search-highlight {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: var(--radius-full);
          transition: all var(--transition-normal);
          transform: translateX(-50%);
        }

        .search-input-group input:focus ~ .search-highlight {
          width: 100%;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          left: 0;
          right: 0;
          background: var(--bg-elevated);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          z-index: var(--z-dropdown);
          overflow: hidden;
          max-height: 400px;
          overflow-y: auto;
          backdrop-filter: blur(20px);
        }

        .search-results-header {
          padding: var(--space-3) var(--space-4);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-secondary);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          cursor: pointer;
          transition: all var(--transition-fast);
          border-bottom: 1px solid var(--border-primary);
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background: var(--bg-secondary);
          transform: translateX(-4px);
        }

        .result-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .result-title {
          font-weight: 600;
          color: var(--text-primary);
        }

        .result-subtitle {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
        }

        .result-arrow {
          color: var(--text-quaternary);
          transition: all var(--transition-fast);
        }

        .search-result-item:hover .result-arrow {
          color: var(--primary);
          transform: translateX(-4px);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-shrink: 0;
        }

        /* User Profile Dropdown */
        .user-profile-dropdown {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: none;
          border: none;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-xl);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .profile-trigger:hover {
          background: var(--bg-secondary);
          transform: translateY(-2px);
        }

        .profile-avatar {
          position: relative;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--font-size-xl);
          box-shadow: var(--shadow-md);
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: var(--success);
          border: 2px solid var(--bg-elevated);
          border-radius: var(--radius-full);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-1);
        }

        .username {
          font-weight: 600;
          color: var(--text-primary);
          font-size: var(--font-size-sm);
        }

        .user-role {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }

        .dropdown-chevron {
          color: var(--text-tertiary);
          transition: all var(--transition-fast);
          font-size: var(--font-size-sm);
        }

        .dropdown-chevron.rotated {
          transform: rotate(180deg);
          color: var(--primary);
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: -150px;
          min-width: 320px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          z-index: var(--z-dropdown);
          overflow: hidden;
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
          transition: all var(--transition-normal);
          pointer-events: none;
          backdrop-filter: blur(20px);
        }

        .profile-dropdown.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .dropdown-header {
          padding: var(--space-6);
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-sm);
        }

        .detail-row svg {
          width: 16px;
          opacity: 0.8;
        }

        .dropdown-section {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-primary);
        }

        .dropdown-section:last-child {
          border-bottom: none;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          font-weight: 600;
          color: var(--text-primary);
          font-size: var(--font-size-sm);
        }

        .branches-grid {
          display: grid;
          gap: var(--space-2);
          max-height: 200px; /* Set maximum height for scrollable area */
          overflow-y: auto; /* Enable vertical scrolling */
          padding-right: var(--space-2); /* Space for scrollbar */
        }

        .branches-grid::-webkit-scrollbar {
          width: 6px;
        }

        .branches-grid::-webkit-scrollbar-track {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .branches-grid::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--primary), var(--secondary));
          border-radius: var(--radius-md);
        }

        .branches-grid::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, var(--primary-dark), var(--primary));
        }

        .branch-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          background: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        }

        .branch-item:hover {
          background: var(--bg-secondary);
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .branch-item.current {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border-color: var(--primary);
          color: var(--primary);
          font-weight: 600;
        }

        .current-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--primary);
          color: white;
          font-size: var(--font-size-xs);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        .dropdown-action {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: none;
          background: none;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-2);
        }

        .dropdown-action:last-child {
          margin-bottom: 0;
        }

        .dropdown-action:hover {
          background: var(--bg-secondary);
          color: var(--primary);
          transform: translateX(-4px);
        }

        .dark-mode-toggle {
          justify-content: space-between;
        }

        .action-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .modern-toggle {
          width: 48px;
          height: 24px;
          background: var(--border-secondary);
          border-radius: var(--radius-full);
          position: relative;
          transition: all var(--transition-fast);
        }

        .modern-toggle.active {
          background: var(--primary);
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .modern-toggle.active .toggle-slider {
          transform: translateX(24px);
        }

        .action-arrow {
          margin-left: auto;
          color: var(--text-quaternary);
          transition: all var(--transition-fast);
        }

        .dropdown-action:hover .action-arrow {
          color: var(--primary);
          transform: translateX(-4px);
        }

        .color-customizer-panel {
          margin-top: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-primary);
        }

        .color-option {
          margin-bottom: var(--space-4);
        }

        .color-option:last-child {
          margin-bottom: 0;
        }

        .color-option label {
          display: block;
          margin-bottom: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-secondary);
        }

        .color-input-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .color-input-wrapper input[type="color"] {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          background: none;
        }

        .color-value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          background: var(--bg-elevated);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-primary);
        }

        .color-actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }

        .color-actions button {
          flex: 1;
          padding: var(--space-3);
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 600;
          transition: all var(--transition-fast);
          font-size: var(--font-size-sm);
        }

        .apply-btn {
          background: var(--primary);
          color: white;
        }

        .apply-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .reset-btn {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }

        .reset-btn:hover {
          background: var(--bg-secondary);
          transform: translateY(-2px);
        }

        .logout-action {
          color: var(--error);
        }

        .logout-action:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        /* Sidebar Styles */
        .modern-sidebar {
          grid-area: sidebar;
          background: var(--bg-elevated);
          border-right: 1px solid var(--border-primary);
          height: calc(100vh - var(--header-height));
          overflow-y: auto;
          position: sticky;
          top: var(--header-height);
          transition: all var(--transition-normal);
          box-shadow: var(--shadow-md);
        }

        .sidebar-header {
          padding: var(--space-6);
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--font-size-lg);
          box-shadow: var(--shadow-md);
        }

        .brand-name {
          font-weight: 700;
          color: var(--text-primary);
          font-size: var(--font-size-lg);
        }

        .sidebar-close-btn {
          display: none;
          background: none;
          border: none;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sidebar-close-btn:hover {
          background: var(--bg-secondary);
          color: var(--error);
        }

        .sidebar-navigation {
          padding: var(--space-6) 0;
        }

        .nav-item-group {
          margin-bottom: var(--space-2);
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-4) var(--space-6);
          border: none;
          background: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          color: var(--text-secondary);
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--primary);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          transform: scaleY(0);
          transition: all var(--transition-fast);
        }

        .nav-item:hover {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), transparent);
          color: var(--primary);
          transform: translateX(8px);
        }

        .nav-item:hover::before {
          transform: scaleY(1);
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(102, 126, 234, 0.05));
          color: var(--primary);
          font-weight: 600;
        }

        .nav-item.active::before {
          transform: scaleY(1);
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .nav-icon-wrapper {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-icon {
          font-size: var(--font-size-lg);
          transition: all var(--transition-fast);
        }

        .nav-label {
          font-size: var(--font-size-base);
          font-weight: 500;
        }

        .submenu-indicator {
          color: var(--text-quaternary);
          transition: all var(--transition-fast);
          font-size: var(--font-size-sm);
        }

        .submenu-indicator.expanded {
          transform: rotate(-90deg);
          color: var(--primary);
        }

        .nav-item-highlight {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, var(--primary), var(--secondary));
          border-radius: var(--radius-md) 0 0 var(--radius-md);
          transform: scaleY(0);
          transition: all var(--transition-fast);
        }

        .nav-item.active .nav-item-highlight {
          transform: scaleY(1);
        }

        .submenu-container {
          background: var(--bg-secondary);
          overflow: hidden;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 500px;
            opacity: 1;
          }
        }

        .submenu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-6) var(--space-3) var(--space-16);
          border: none;
          background: none;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          font-size: var(--font-size-sm);
        }

        .submenu-item:hover {
          background: var(--bg-elevated);
          color: var(--primary);
          transform: translateX(8px);
        }

        .submenu-item.active {
          color: var(--primary);
          background: var(--bg-elevated);
          font-weight: 600;
        }

        .submenu-indicator-line {
          position: absolute;
          left: var(--space-10);
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-primary);
        }

        .submenu-dot {
          font-size: 8px;
          color: var(--text-quaternary);
        }

        .submenu-label {
          font-weight: 500;
        }

        .submenu-highlight {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--primary);
          border-radius: var(--radius-md) 0 0 var(--radius-md);
          transform: scaleY(0);
          transition: all var(--transition-fast);
        }

        .submenu-item.active .submenu-highlight {
          transform: scaleY(1);
        }

        .sidebar-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: var(--z-modal-backdrop);
          backdrop-filter: blur(8px);
        }

        /* Main Content */
        .main-content {
          grid-area: main;
          background: var(--bg-primary);
          overflow-y: auto;
          max-height: calc(100vh - var(--header-height));
        }

        .content-wrapper {
          padding: var(--space-8);
          min-height: calc(100vh - var(--header-height) - var(--footer-height));
        }

        /* Footer */
        .modern-footer {
          grid-area: footer;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .footer-content {
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
          text-align: center;
        }

        .footer-content strong {
          color: var(--primary);
          font-weight: 700;
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
          backdrop-filter: blur(20px);
        }

        .loader-container {
          text-align: center;
        }

        .modern-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }

        .loader-ring {
          width: 60px;
          height: 60px;
          border: 4px solid var(--border-primary);
          border-top: 4px solid var(--primary);
          border-radius: var(--radius-full);
          animation: spin 1s linear infinite;
          position: relative;
        }

        .loader-ring:nth-child(2) {
          width: 80px;
          height: 80px;
          position: absolute;
          animation-duration: 1.5s;
          animation-direction: reverse;
        }

        .loader-ring:nth-child(3) {
          width: 100px;
          height: 100px;
          position: absolute;
          animation-duration: 2s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-text {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-top: var(--space-8);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .modern-admin-dashboard {
            grid-template-areas:
              "header"
              "main"
              "footer";
            grid-template-columns: 1fr;
          }

          .modern-sidebar {
            position: fixed;
            top: 0;
            right: -100%;
            height: 100vh;
            z-index: var(--z-modal);
            width: var(--sidebar-width);
            transition: all var(--transition-normal);
          }

          .modern-sidebar.expanded {
            right: 0;
            animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .mobile-menu-btn {
            display: block;
          }

          .sidebar-close-btn {
            display: block;
          }

          .sidebar-backdrop {
            display: block;
          }

          .header-center {
            margin: 0 var(--space-4);
          }

          .brand-text h1 {
            font-size: var(--font-size-lg);
          }
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 var(--space-4);
          }

          .content-wrapper {
            padding: var(--space-6);
          }

          .header-center {
            display: none;
          }

          .profile-info {
            display: none;
          }

          .brand-text {
            display: none;
          }

          .profile-dropdown {
            right: -50px;
            min-width: 280px;
          }
        }

        @media (max-width: 480px) {
          :root {
            --header-height: 70px;
            --sidebar-width: 260px;
          }

          .brand-icon {
            width: 40px;
            height: 40px;
            font-size: var(--font-size-lg);
          }

          .content-wrapper {
            padding: var(--space-4);
          }

          .profile-dropdown {
            right: -80px;
            min-width: 260px;
          }

          .dropdown-header {
            padding: var(--space-4);
          }

          .dropdown-section {
            padding: var(--space-3);
          }
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--primary), var(--secondary));
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, var(--primary-dark), var(--primary));
        }

        ::-webkit-scrollbar-corner {
          background: var(--bg-secondary);
        }

        /* Selection */
        ::selection {
          background: rgba(102, 126, 234, 0.2);
          color: var(--text-primary);
        }

        ::-moz-selection {
          background: rgba(102, 126, 234, 0.2);
          color: var(--text-primary);
        }

        /* Focus Styles */
        *:focus {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        button:focus,
        input:focus {
          outline: none;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }

        /* Utility Classes */
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .bounce {
          animation: bounce 1s ease-out;
        }

        /* Print Styles */
        @media print {
          .modern-header,
          .modern-sidebar,
          .modern-footer,
          .sidebar-backdrop {
            display: none !important;
          }

          .modern-admin-dashboard {
            grid-template-areas: "main";
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
          }

          .main-content {
            max-height: none;
            overflow: visible;
          }

          .content-wrapper {
            padding: 0;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          :root {
            --border-primary: #000000;
            --border-secondary: #000000;
            --text-primary: #000000;
            --text-secondary: #000000;
            --bg-primary: #ffffff;
            --bg-secondary: #ffffff;
            --bg-elevated: #ffffff;
          }

          .dark {
            --border-primary: #ffffff;
            --border-secondary: #ffffff;
            --text-primary: #ffffff;
            --text-secondary: #ffffff;
            --bg-primary: #000000;
            --bg-secondary: #000000;
            --bg-elevated: #000000;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}