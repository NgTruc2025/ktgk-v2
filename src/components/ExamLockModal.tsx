import React, { useState } from 'react';
import { Lock, Unlock, X, KeyRound, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface ExamLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExamStatus: boolean; // true = MỞ, false = KHÓA
  onStatusChanged: (newStatus: boolean) => void;
}

export const ExamLockModal: React.FC<ExamLockModalProps> = ({
  isOpen,
  onClose,
  currentExamStatus,
  onStatusChanged
}) => {
  const [password, setPassword] = useState('');
  const [targetStatus, setTargetStatus] = useState<boolean>(!currentExamStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync target status if currentExamStatus changes while modal opens
  React.useEffect(() => {
    setTargetStatus(!currentExamStatus);
    setError(null);
    setSuccessMsg(null);
  }, [currentExamStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu giáo viên.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.toggleExamLock(password.trim(), targetStatus);
      if (data && data.success) {
        setSuccessMsg(typeof data.message === 'string' ? data.message : `Đã ${targetStatus ? 'MỞ' : 'KHÓA'} đề thi thành công!`);
        onStatusChanged(targetStatus);
        setTimeout(() => {
          onClose();
          setPassword('');
          setSuccessMsg(null);
        }, 900);
      } else {
        const errorText = typeof data?.error === 'string'
          ? data.error
          : (data?.error && typeof (data.error as any).message === 'string')
            ? (data.error as any).message
            : (typeof (data as any)?.message === 'string')
              ? (data as any).message
              : 'Mật khẩu giáo viên không chính xác. Vui lòng thử lại.';
        setError(errorText);
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : String(err || 'Lỗi kết nối máy chủ');
      setError('Lỗi kết nối: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
              currentExamStatus 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {currentExamStatus ? <Lock className="w-5 h-5 text-amber-700" /> : <Unlock className="w-5 h-5 text-emerald-700" />}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Điều Khiển Kỳ Thi
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                KÍCH HOẠT KHÓA / MỞ ĐỀ THI
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current & Target status */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Trạng thái hiện tại:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              currentExamStatus
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${currentExamStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              {currentExamStatus ? 'ĐANG MỞ THI' : 'ĐÃ KHÓA (ĐÓNG THI)'}
            </span>
          </div>

          {/* Action Choice */}
          <div className="pt-2 border-t border-slate-200/60">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Chọn hành động mong muốn:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetStatus(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  !targetStatus
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa đề thi</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetStatus(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  targetStatus
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở lại đề thi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{String(error)}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{String(successMsg)}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              MẬT KHẨU GIÁO VIÊN BẢO VỆ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Nhập mật khẩu giáo viên..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {targetStatus
                ? 'Khi MỞ ĐỀ: Học sinh có thể vào thi bình thường. Trạng thái MỞ sẽ có hiệu lực liên tục cho đến khi có lệnh khóa tiếp theo.'
                : 'Khi KHÓA ĐỀ: Toàn bộ học sinh sẽ bị chặn không thể vào thi hoặc nộp bài mới cho đến khi giáo viên mở lại.'}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                targetStatus
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-700/20'
              }`}
            >
              {targetStatus ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{loading ? 'Đang xác thực...' : targetStatus ? 'Xác nhận MỞ ĐỀ' : 'Xác nhận KHÓA ĐỀ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
