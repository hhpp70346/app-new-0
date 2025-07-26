"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBell, faExclamationTriangle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function AdminHomePage() {
  const systemMessages = [
    { icon: faBell, text: "تمت إضافة مستخدم جديد", type: "info" },
    { icon: faExclamationTriangle, text: "تنبيه: تجاوز في استهلاك الطاقة", type: "warning" },
    { icon: faCheckCircle, text: "النظام يعمل بكفاءة", type: "success" },
  ];

  return (
    <div className="admin-homepage min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <style jsx>{`
        .boxes-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
          width: 100%;
          max-width: 900px;
        }

        .message-box {
          padding: 1rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.7);
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .message-box:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .message-box .icon {
          font-size: 1.5rem;
        }

        .info {
          border-left: 6px solid #3b82f6;
        }

        .warning {
          border-left: 6px solid #f59e0b;
        }

        .success {
          border-left: 6px solid #10b981;
        }

        .dark .message-box {
          background-color: rgba(30, 41, 59, 0.7);
          border-color: #334155;
          color: #e2e8f0;
        }
      `}</style>

      {/* البطاقة الرئيسية */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/50 max-w-2xl w-full transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-xl"></div>
          </div>

          <div className="relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25 transform transition-all duration-700 hover:rotate-12 hover:scale-110">
                <FontAwesomeIcon
                  icon={faHome}
                  className="text-3xl md:text-4xl text-white animate-pulse hover:animate-bounce transition-all duration-300"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
              مرحباً بك في نظام إدارة الطاقة المتجددة
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-md mx-auto">
              اختر صفحة من القائمة الجانبية للبدء
            </p>

            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مربعات رسائل النظام */}
      <div className="boxes-container">
        {systemMessages.map((msg, index) => (
          <div key={index} className={`message-box ${msg.type}`}>
            <FontAwesomeIcon icon={msg.icon} className="icon" />
            <span className="text-sm md:text-base font-medium">{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
