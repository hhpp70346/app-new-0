'use client';
import { useState } from 'react';
import { FaKey, FaLock, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'كلمات المرور الجديدة غير متطابقة',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#e53e3e'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'تأكيد تغيير كلمة المرور',
      text: "هل أنت متأكد أنك تريد تغيير كلمة المرور؟",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2b6cb0',
      cancelButtonColor: '#718096',
      confirmButtonText: 'نعم، قم بالتغيير',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        // في التطبيق الحقيقي، يجب الحصول على userId من الجلسة أو السياق
        const userId = 1; // استبدل بمعرف المستخدم الفعلي
        
        const response = await fetch('/api/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword, userId })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'تم بنجاح',
            text: data.message,
            confirmButtonText: 'موافق',
            confirmButtonColor: '#2b6cb0'
          });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: data.message,
            confirmButtonText: 'موافق',
            confirmButtonColor: '#e53e3e'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء الاتصال بالخادم',
          confirmButtonText: 'موافق',
          confirmButtonColor: '#e53e3e'
        });
      }
    }
  };

  return (
    <div className="container">
      <h2><FaKey className="fa-icon" /> تغيير كلمة المرور</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-group">
            <input 
              type="password" 
              id="currentPassword" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required 
            />
            <label htmlFor="currentPassword" className="transparent-label">
              <FaLock className="fa-icon" /> كلمة المرور الحالية
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <input 
              type="password" 
              id="newPassword" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
            <label htmlFor="newPassword" className="transparent-label">
              <FaKey className="fa-icon" /> كلمة المرور الجديدة
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            <label htmlFor="confirmPassword" className="transparent-label">
              <FaKey className="fa-icon" /> تأكيد كلمة المرور الجديدة
            </label>
          </div>
        </div>
        <button type="submit" className="submit-btn">
          <FaSave className="fa-icon" /> تغيير كلمة المرور
        </button>
      </form>

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
          max-width: 400px;
          margin: 50px auto;
          padding: 25px;
          border-radius: 15px;
          box-shadow: var(--shadow-md);
          background-color: ;
          animation: fadeInUp 1s ease-in-out;
        }
        
        h2 {
          color: var(--primary);
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.2rem;
          font-weight: 700;
          position: relative;
          animation: fadeInDown 0.8s ease;
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

        .form-group {
          position: relative;
          transition: var(--transition);
          margin-bottom: 25px;
        }

        .form-group:hover {
          transform: translateY(-5px);
        }

        .input-group {
          position: relative;
        }

        .input-group input {
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

        .input-group input:focus {
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

        .input-group input:focus ~ .transparent-label,
        .input-group input:valid ~ .transparent-label {
          top: -10px;
          right: 10px;
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 600;
          opacity: 1;
          background: ;
        }

        .submit-btn {
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          color: #fff;
          border: none;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          width: 100%;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: linear-gradient(135deg, var(--secondary), var(--primary));
        }

        .fa-icon {
          margin-left: 5px;
          color: var(--primary);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .container {
            width: 95%;
            margin: 20px auto;
          }
          
          h2 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}