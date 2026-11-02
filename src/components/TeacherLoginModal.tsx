import React, { useState } from 'react';
import { Lock, X, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { apiClient } from '../services/apiClient';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. Client-side Google Auth via Firebase
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();

      // 2. Backend verification and session creation
      const data = await apiClient.adminGoogleAuth(idToken);

      if (data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || 'Email của bạn không nằm trong danh sách giáo viên được phép.');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let msg = 'Lỗi đăng nhập Google';
      if (err.code === 'auth/popup-blocked') {
        msg = 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng thử lại và cho phép popup.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Yêu cầu đăng nhập bị hủy.';
      } else {
        msg = err.message || 'Lỗi không xác định';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-blue-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">KTTX11 PRO v2.0</h3>
          <p className="text-sm text-slate-500">Cổng xác thực dành riêng cho Giáo viên</p>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            Xác thực Google OAuth 2.0
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{String(error)}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-300 rounded-2xl text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.gstatic.com/firebase/explore/google.svg" alt="Google" className="w-5 h-5" />
            <span>Tiếp tục với Google</span>
          </button>
          
          <p className="text-[11px] text-center text-slate-400 px-4">
            Vui lòng sử dụng email công vụ đã được cấp quyền quản trị hệ thống.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};
