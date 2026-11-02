import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
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
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiClient.adminLogin(password);

      if (data.success) {
        onLoginSuccess();
      } else {
        const errText = typeof data.error === 'string'
          ? data.error
          : (data.error && typeof (data.error as any).message === 'string')
            ? (data.error as any).message
            : 'Mật khẩu giáo viên không chính xác.';
        setError(errText);
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : String(err || 'Lỗi không xác định');
      setError('Lỗi đăng nhập: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Đăng nhập Giáo viên</h3>
              <p className="text-[11px] text-slate-500">Quản lý kỳ thi & Xem điểm</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{String(error)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              MẬT KHẨU GIÁO VIÊN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Nhập mật khẩu quản trị..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
