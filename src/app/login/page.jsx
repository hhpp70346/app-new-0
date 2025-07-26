"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faSun,
  faMoon,
  faDoorOpen,
  faSignInAlt,
  faExclamationCircle,
  faBuilding,
  faUser,
  faLock,
  faSpinner,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons"
import Head from "next/head"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    branch: "",
    username: "",
    password: "",
  })
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")

  // Memoize getRedirectPath to prevent unnecessary re-computations
  const getRedirectPath = useCallback((role) => {
    const redirectPaths = {
      admin: "/admin",
      system_admin: "/system-admin",
      account_manager: "/account-manager",
      issue_manager: "/issue-manager",
      general_manager: "/general_manager",
      revenue_review: "/revenue-review",
    }
    return redirectPaths[role] || "/"
  }, [])

  // Check for existing user and fetch branches
  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData && userData.role) {
          router.replace(getRedirectPath(userData.role))
          return
        }
      } catch (err) {
        console.error("Invalid user data in localStorage:", err)
        localStorage.removeItem("user") // Clear invalid user data
      }
    }

    // Fetch branches
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "getBranches" }),
        })
        if (!res.ok) {
          throw new Error("Failed to fetch branches")
        }
        const data = await res.json()
        setBranches(data)
      } catch (err) {
        console.error("Failed to fetch branches:", err)
        setError("تعذر تحميل الفروع. يرجى المحاولة لاحقاً.")
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [router, getRedirectPath])

  // Fetch users when branch changes
  useEffect(() => {
    if (!formData.branch) {
      setUsers([])
      return
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "getUsersByBranch",
            branch: formData.branch,
          }),
        })
        if (!res.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setError("تعذر تحميل المستخدمين. يرجى المحاولة لاحقاً.")
      }
    }

    fetchUsers()
  }, [formData.branch])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          ...formData,
        }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        router.replace(getRedirectPath(data.user.role))
      } else if (data.multiple_branches) {
        setBranches(data.branches)
        setError(data.message)
        setLoading(false)
      } else {
        setError(data.message)
        setLoading(false)
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم")
      console.error("Login error:", err)
      setLoading(false)
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
    document.body.classList.toggle("dark-mode")
  }

  // Render loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <FontAwesomeIcon icon={faCircleNotch} spin size="3x" className="loader-icon" />
        </div>
        <p>
          <FontAwesomeIcon icon={faSpinner} spin /> جاري التحميل...
        </p>
      </div>
    )
  }

  // Render login form
  return (
    <>
      <Head>
        <title>تسجيل الدخول</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={`main-container ${darkMode ? "dark-mode" : ""}`}>
        <div className="background-animation">
          <div className="floating-shape shape1"></div>
          <div className="floating-shape shape2"></div>
          <div className="floating-shape shape3"></div>
          <div className="floating-shape shape4"></div>
          <div className="floating-shape shape5"></div>
          <div className="floating-shape shape6"></div>
        </div>

        <button id="toggleDarkMode" onClick={toggleDarkMode}>
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
          <span className="toggle-tooltip">{darkMode ? "الوضع النهاري" : "الوضع الليلي"}</span>
        </button>

        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <img src="/favicon.ico" alt="شعار النظام" />
            <div className="logo-text">
              <h1>نظام إدارة المؤسسة</h1>
              <p>الحل الشامل لإدارة الأعمال</p>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="login-form">
            <div className="form-header">
              <div className="icon-wrapper">
                <FontAwesomeIcon icon={faDoorOpen} />
              </div>
              <h2>تسجيل الدخول</h2>
              <p>مرحباً بك، يرجى تسجيل الدخول للمتابعة</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-group">
                  <div className="input-icon">
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                  <select
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    required
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="branch">الفرع</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <select
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!formData.branch}
                  >
                    <option value="">اختر اسم المستخدم</option>
                    {users.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="username">اسم المستخدم</label>
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <div className="input-icon">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder=""
                    required
                  />
                  <label htmlFor="password">كلمة المرور</label>
                  <div className="input-border"></div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                <span className="btn-text">
                  <FontAwesomeIcon icon={faSignInAlt} />
                  تسجيل الدخول
                </span>
                <div className="btn-wave"></div>
              </button>
            </form>

            <div className="footer">
              <div className="footer-content">
                <p>جميع الحقوق محفوظة © HASSAN 2025</p>
                <div className="footer-links">
                  <a href="" className="footer-link"></a>
                  <a href="" className="footer-link"></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap');

        :root {
          /* Modern Color Palette */
          --primary: #667eea;
          --primary-dark: #5a67d8;
          --primary-light: #7c3aed;
          --secondary: #764ba2;
          --accent: #f093fb;
          --accent-secondary: #f5576c;
          
          /* Neutral Colors */
          --white: #ffffff;
          --black: #000000;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          
          /* Status Colors */
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --info: #3b82f6;
          
          /* Gradients */
          --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          --gradient-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          --gradient-dark: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          
          /* Shadows */
          --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
          
          /* Borders */
          --border-radius-sm: 0.375rem;
          --border-radius: 0.5rem;
          --border-radius-md: 0.75rem;
          --border-radius-lg: 1rem;
          --border-radius-xl: 1.5rem;
          --border-radius-2xl: 2rem;
          --border-radius-full: 9999px;
          
          /* Transitions */
          --transition-fast: all 0.15s ease;
          --transition: all 0.3s ease;
          --transition-slow: all 0.5s ease;
          --transition-bounce: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          
          /* Spacing */
          --space-xs: 0.25rem;
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
          --space-2xl: 3rem;
          --space-3xl: 4rem;
          
          /* Typography */
          --font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-size-xs: 0.75rem;
          --font-size-sm: 0.875rem;
          --font-size-base: 1rem;
          --font-size-lg: 1.125rem;
          --font-size-xl: 1.25rem;
          --font-size-2xl: 1.5rem;
          --font-size-3xl: 1.875rem;
          --font-size-4xl: 2.25rem;
          --font-size-5xl: 3rem;
          
          /* Z-Index */
          --z-dropdown: 1000;
          --z-sticky: 1020;
          --z-fixed: 1030;
          --z-modal-backdrop: 1040;
          --z-modal: 1050;
          --z-popover: 1060;
          --z-tooltip: 1070;
        }

        /* Dark Mode Variables */
        body.dark-mode {
          --primary: #818cf8;
          --primary-dark: #6366f1;
          --primary-light: #a78bfa;
          --secondary: #8b5cf6;
          --accent: #ec4899;
          --accent-secondary: #f472b6;
          
          --white: var(--gray-900);
          --gray-50: var(--gray-900);
          --gray-100: var(--gray-800);
          --gray-200: var(--gray-700);
          --gray-300: var(--gray-600);
          --gray-400: var(--gray-500);
          --gray-500: var(--gray-400);
          --gray-600: var(--gray-300);
          --gray-700: var(--gray-200);
          --gray-800: var(--gray-100);
          --gray-900: var(--gray-50);
          
          --gradient-primary: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
          --gradient-secondary: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: var(--font-family);
          background: var(--gray-50);
          color: var(--gray-900);
          line-height: 1.6;
          font-weight: 400;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: var(--transition);
          overflow-x: hidden;
          min-height: 100vh;
        }

        body.dark-mode {
          background: var(--gray-900);
          color: var(--gray-100);
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: var(--gradient-primary);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: var(--z-modal);
          backdrop-filter: blur(10px);
        }

        .loader {
          position: relative;
          width: 120px;
          height: 120px;
          margin-bottom: var(--space-xl);
        }

        .loader-circle {
          position: absolute;
          border-radius: var(--border-radius-full);
          border: 3px solid transparent;
          animation: spin 2s linear infinite;
        }

        .loader-circle:nth-child(1) {
          width: 100%;
          height: 100%;
          border-top-color: var(--white);
          border-bottom-color: var(--white);
          animation-duration: 1.5s;
        }

        .loader-circle:nth-child(2) {
          top: 15%;
          left: 15%;
          width: 70%;
          height: 70%;
          border-left-color: rgba(255, 255, 255, 0.7);
          border-right-color: rgba(255, 255, 255, 0.7);
          animation-direction: reverse;
          animation-duration: 2s;
        }

        .loader-circle:nth-child(3) {
          top: 30%;
          left: 30%;
          width: 40%;
          height: 40%;
          border-top-color: rgba(255, 255, 255, 0.5);
          border-bottom-color: rgba(255, 255, 255, 0.5);
          animation-duration: 1s;
        }

        .loader-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--white);
          font-size: 2rem;
        }

        .loading-screen p {
          color: var(--white);
          font-size: var(--font-size-xl);
          font-weight: 500;
          text-align: center;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Background Animation */
        .background-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .floating-shape {
          position: absolute;
          border-radius: var(--border-radius-full);
          background: var(--gradient-primary);
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .floating-shape:nth-child(even) {
          background: var(--gradient-secondary);
        }

        .shape1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape2 {
          width: 300px;
          height: 300px;
          top: 60%;
          right: 10%;
          animation-delay: 1s;
        }

        .shape3 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 20%;
          animation-delay: 2s;
        }

        .shape4 {
          width: 250px;
          height: 250px;
          top: 30%;
          right: 30%;
          animation-delay: 3s;
        }

        .shape5 {
          width: 100px;
          height: 100px;
          bottom: 10%;
          right: 50%;
          animation-delay: 4s;
        }

        .shape6 {
          width: 180px;
          height: 180px;
          top: 70%;
          left: 60%;
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        /* Main Container */
        .main-container {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        /* Dark Mode Toggle */
        #toggleDarkMode {
          position: fixed;
          top: var(--space-lg);
          left: var(--space-lg);
          width: 60px;
          height: 60px;
          border-radius: var(--border-radius-full);
          border: none;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: var(--primary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition-bounce);
          z-index: var(--z-fixed);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        #toggleDarkMode:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.2);
        }

        body.dark-mode #toggleDarkMode {
          background: rgba(0, 0, 0, 0.1);
          color: var(--primary);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        body.dark-mode #toggleDarkMode:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .toggle-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gray-900);
          color: var(--white);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--border-radius);
          font-size: var(--font-size-xs);
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition);
          margin-top: var(--space-xs);
        }

        #toggleDarkMode:hover .toggle-tooltip {
          opacity: 1;
          visibility: visible;
        }

        /* Logo Section */
        .logo-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          position: relative;
          overflow: hidden;
        }

        .logo-container {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          border-radius: var(--border-radius-full);
          animation: pulse 3s ease-in-out infinite;
        }

        .logo-section img {
          width: 120px;
          height: 120px;
          border-radius: var(--border-radius-xl);
          border: 4px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          transition: var(--transition-bounce);
          margin-bottom: var(--space-lg);
          box-shadow: var(--shadow-2xl);
        }

        .logo-section img:hover {
          transform: scale(1.05) rotate(5deg);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .logo-text h1 {
          color: var(--white);
          font-size: var(--font-size-3xl);
          font-weight: 900;
          margin-bottom: var(--space-sm);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .logo-text p {
          color: rgba(255, 255, 255, 0.9);
          font-size: var(--font-size-lg);
          font-weight: 300;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
        }

        /* Form Section */
        .form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-2xl);
          background: var(--white);
          position: relative;
        }

        body.dark-mode .form-section {
          background: var(--gray-900);
        }

        .login-form {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: var(--border-radius-2xl);
          padding: var(--space-3xl);
          box-shadow: var(--shadow-2xl);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        body.dark-mode .login-form {
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .login-form::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
          border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0;
        }

        /* Form Header */
        .form-header {
          text-align: center;
          margin-bottom: var(--space-3xl);
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-lg);
          background: var(--gradient-primary);
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: 2rem;
          box-shadow: var(--shadow-lg);
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        .form-header h2 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-sm);
        }

        body.dark-mode .form-header h2 {
          color: var(--white);
        }

        .form-header p {
          color: var(--gray-600);
          font-size: var(--font-size-base);
          font-weight: 400;
        }

        body.dark-mode .form-header p {
          color: var(--gray-400);
        }

        /* Form Groups */
        .form-group {
          margin-bottom: var(--space-xl);
          position: relative;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-lg);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          font-size: var(--font-size-lg);
          z-index: 2;
          transition: var(--transition);
        }

        .input-group input,
        .input-group select {
          width: 100%;
          height: 60px;
          padding: 0 var(--space-lg) 0 60px;
          border: 2px solid transparent;
          border-radius: var(--border-radius-xl);
          background: var(--gray-50);
          font-size: var(--font-size-base);
          font-weight: 500;
          color: var(--gray-900);
          transition: var(--transition);
          outline: none;
          position: relative;
          z-index: 1;
        }

        body.dark-mode .input-group input,
        body.dark-mode .input-group select {
          background: var(--gray-800);
          color: var(--white);
        }

        .input-group input:focus,
        .input-group select:focus {
          background: var(--white);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        body.dark-mode .input-group input:focus,
        body.dark-mode .input-group select:focus {
          background: var(--gray-700);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.1);
        }

        .input-group input:focus + label,
        .input-group select:focus + label,
        .input-group input:valid + label,
        .input-group select:valid + label {
          top: -12px;
          font-size: var(--font-size-sm);
          color: var(--primary);
          font-weight: 6000;
          background: var(--white);
          padding: 0 var(--space-sm);
        }

        body.dark-mode .input-group input:focus + label,
        body.dark-mode .input-group select:focus + label,
        body.dark-mode .input-group input:valid + label,
        body.dark-mode .input-group select:valid + label {
          background: var(--gray-900);
        }

        .input-group input:focus ~ .input-icon,
        .input-group select:focus ~ .input-icon {
          color: var(--primary);
          transform: translateY(-50%) scale(1.1);
        }

        .input-group label {
          position: absolute;
          top: 50%;
          right: var(--space-lg);
          transform: translateY(-50%);
          color: var(--gray-500);
          font-size: var(--font-size-base);
          font-weight: 500;
          pointer-events: none;
          transition: var(--transition);
          background: transparent;
          z-index: 2;
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--gradient-primary);
          transform: translateX(-50%);
          transition: var(--transition);
        }

        .input-group input:focus ~ .input-border,
        .input-group select:focus ~ .input-border {
          width: 100%;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          height: 60px;
          border: none;
          border-radius: var(--border-radius-xl);
          background: var(--gradient-primary);
          color: var(--white);
          font-size: var(--font-size-lg);
          font-weight: 600;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: var(--transition);
          box-shadow: var(--shadow-lg);
          margin-bottom: var(--space-xl);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-2xl);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .btn-text {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
        }

        .btn-wave {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: var(--transition-slow);
        }

        .submit-btn:hover .btn-wave {
          left: 100%;
        }

        /* Error Message */
        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-lg);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--border-radius-lg);
          color: var(--error);
          font-size: var(--font-size-sm);
          font-weight: 500;
          margin-bottom: var(--space-xl);
          backdrop-filter: blur(10px);
        }

        /* Footer */
        .footer {
          margin-top: var(--space-2xl);
          padding-top: var(--space-xl);
          border-top: 1px solid var(--gray-200);
          text-align: center;
        }

        body.dark-mode .footer {
          border-top-color: var(--gray-700);
        }

        .footer-content p {
          color: var(--gray-600);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-sm);
        }

        body.dark-mode .footer-content p {
          color: var(--gray-400);
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: var(--space-lg);
        }

        .footer-link {
          color: var(--primary);
          text-decoration: none;
          font-size: var(--font-size-xs);
          font-weight: 500;
          transition: var(--transition);
        }

        .footer-link:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .main-container {
            flex-direction: column;
          }
          
          .logo-section,
          .form-section {
            flex: none;
          }
          
          .logo-section {
            min-height: 40vh;
          }
          
          .form-section {
            min-height: 60vh;
            padding: var(--space-xl);
          }
          
          .login-form {
            padding: var(--space-2xl);
          }
        }

        @media (max-width: 768px) {
          .logo-section {
            min-height: 30vh;
            padding: var(--space-lg);
          }
          
          .logo-section img {
            width: 80px;
            height: 80px;
          }
          
          .logo-text h1 {
            font-size: var(--font-size-2xl);
          }
          
          .logo-text p {
            font-size: var(--font-size-base);
          }
          
          .form-section {
            padding: var(--space-lg);
          }
          
          .login-form {
            padding: var(--space-xl);
          }
          
          .form-header h2 {
            font-size: var(--font-size-2xl);
          }
          
          .icon-wrapper {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
          
          .input-group input,
          .input-group select {
            height: 50px;
            font-size: var(--font-size-sm);
          }
          
          .submit-btn {
            height: 50px;
            font-size: var(--font-size-base);
          }
          
          #toggleDarkMode {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
          
          .floating-shape {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .logo-section {
            min-height: 25vh;
          }
          
          .form-section {
            padding: var(--space-md);
          }
          
          .login-form {
            padding: var(--space-lg);
          }
          
          .footer-links {
            flex-direction: column;
            gap: var(--space-sm);
          }
          
          #toggleDarkMode {
            top: var(--space-md);
            left: var(--space-md);
          }
        }
      `}</style>
    </>
  )
}
