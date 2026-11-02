import React, { useState } from 'react';
import { User, Hash, GraduationCap, FileCode, ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';
import { INITIAL_STUDENTS } from '../data/initial-students';
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
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [className, setClassName] = useState('11A1');
  const [grade, setGrade] = useState(11);
  const [examCode, setExamCode] = useState('101');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (sId: string) => {
    const s = INITIAL_STUDENTS.find(item => item.studentId === sId);
    if (s) {
      setStudentId(s.studentId);
      setFullName(s.fullName);
      setClassName(s.className);
      setGrade(s.grade);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !studentId.trim() || !className.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, Mã học sinh và Lớp.');
      return;
    }

    setLoading(true);
    try {
      // 1. Xác thực thông tin thí sinh (qua máy chủ hoặc adapter an toàn)
      const data = await apiClient.verifyStudent({
        studentId: studentId.trim(),
        fullName: fullName.trim(),
        className: className.trim(),
        grade,
        examCode
      });

      if (!data.success) {
        const errText = typeof data.error === 'string'
          ? data.error
          : (data.error && typeof (data.error as any).message === 'string')
            ? (data.error as any).message
            : 'Xác thực thông tin thất bại. Vui lòng kiểm tra lại.';
        setError(errText);
        setLoading(false);
        return;
      }

      // 2. Kích hoạt toàn màn hình nếu được trình duyệt cho phép
      try {
        if (document.documentElement.requestFullscreen) {
          const fsPromise = document.documentElement.requestFullscreen();
          if (fsPromise && typeof fsPromise.catch === 'function') {
            fsPromise.catch(() => {});
          }
        }
      } catch {
        // Tránh lỗi khi chạy trong iFrame không có quyền requestFullscreen
      }

      // 3. Bắt đầu làm bài
      await onConfirmStart({
        studentId: studentId.trim().toUpperCase(),
        fullName: fullName.trim(),
        className: className.trim(),
        grade,
        examCode
      });
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : String(err || 'Lỗi không xác định');
      setError('Lỗi xác thực: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col my-auto">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-200 mb-0.5">
            Xác nhận thí sinh
          </div>
          <h2 className="text-lg sm:text-xl font-bold">NHẬP THÔNG TIN DỰ THI</h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Sở GD&ĐT Cà Mau • THPT Giá Rai (Phân hiệu Nguyễn Trung Trực)
          </p>
        </div>

        {/* Quick picker helper - Responsive wrap */}
        <div className="bg-blue-50/70 p-2.5 sm:p-3 px-4 sm:px-6 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-blue-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Chọn nhanh mẫu lớp:</span>
          </div>
          <select
            onChange={(e) => handleSelectSample(e.target.value)}
            defaultValue=""
            className="bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-slate-700 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="" disabled>-- Chọn học sinh mẫu --</option>
            {INITIAL_STUDENTS.slice(0, 10).map(s => (
              <option key={s.studentId} value={s.studentId}>
                {s.fullName} ({s.className} - {s.studentId})
              </option>
            ))}
          </select>
        </div>

        {/* Form content - Scrollable on small screens */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{String(error)}</div>
            </div>
          )}

          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              HỌ VÀ TÊN HỌC SINH <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn An"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Mã học sinh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              MÃ HỌC SINH / SỐ ĐỊNH DANH <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Ví dụ: HS110101"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium uppercase"
              />
            </div>
          </div>

          {/* Lớp & Khối */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                LỚP HỌC <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 11A1"
                  value={className}
                  onChange={e => setClassName(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                KHỐI LỚP
              </label>
              <select
                value={grade}
                onChange={e => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white"
              >
                <option value={11}>Khối 11 (Chính khóa)</option>
                <option value={12}>Khối 12</option>
                <option value={10}>Khối 10</option>
              </select>
            </div>
          </div>

          {/* Mã đề thi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              MÃ ĐỀ KIỂM TRA (DO GIÁO VIÊN CUNG CẤP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={examCode}
                onChange={e => setExamCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 bg-white"
              >
                {allowedExamCodes.map(code => (
                  <option key={code} value={code}>
                    Mã đề {code} (Tin học 11 - Giữa HK1)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-normal space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>Quy chế thi:</span>
            </div>
            <div>• Bài thi sẽ tự động mở ở chế độ <strong>Toàn màn hình (Full Screen)</strong> và <strong>Khóa chuột phải</strong>.</div>
            <div>• Nghiêm cấm rời khỏi màn hình hoặc mở ứng dụng khác (mọi vi phạm đều được ghi nhận vào nhật ký).</div>
          </div>

          {/* Submit action */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center min-h-[42px]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px] touch-manipulation"
            >
              {loading ? (
                <span>Đang kết nối...</span>
              ) : (
                <>
                  <span>Bắt đầu làm bài</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
