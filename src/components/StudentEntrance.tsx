import React, { useState } from 'react';
import { User, Hash, GraduationCap, FileCode, ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface StudentEntranceProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (studentData: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  }) => Promise<void>;
  allowedExamCodes: string[];
}

export const StudentEntrance: React.FC<StudentEntranceProps> = ({
  isOpen,
  onClose,
  onConfirmStart,
  allowedExamCodes = ['101', '102', '103', '104']
}) => {
  const [studentId, setStudentId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [examCode, setExamCode] = useState('101');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId.trim() || !passcode.trim()) {
      setError('Vui lòng nhập Mã học sinh và Mã dự thi.');
      return;
    }

    setLoading(true);
    try {
      // 1. Xác thực thông tin thí sinh (qua máy chủ bảo mật)
      const data = await apiClient.verifyStudent({
        studentId: studentId.trim(),
        passcode: passcode.trim(),
        examCode,
        fullName: '',
        className: '',
        grade: 11
      });

      if (data.success && data.student) {
        const s = data.student;
        // Start exam immediately after verification
        await onConfirmStart({
          studentId: s.studentId,
          fullName: s.fullName,
          className: s.className,
          grade: s.grade,
          examCode: s.assignedCode || examCode
        });
      } else {
        setError(data.error || 'Xác thực thất bại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ phòng thi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-auto text-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Vào Phòng Thi</h3>
              <p className="text-[11px] text-slate-500">Xác thực danh tính học sinh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Mã học sinh
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HS110101"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-bold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Mã dự thi (Passcode)
              </label>
              <div className="relative">
                <FileCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mã bí mật..."
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                * Mã dự thi do giáo viên cung cấp tại phòng máy.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Chọn mã đề thi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allowedExamCodes.map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setExamCode(code)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      examCode === code
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Mã đề {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Đang xác thực...' : 'Vào phòng thi'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            Hệ thống giám sát an toàn: Ép toàn màn hình, chặn sao chép và ghi nhận lịch sử chuyển tab.
          </p>
        </div>
      </div>
    </div>
  );
};
