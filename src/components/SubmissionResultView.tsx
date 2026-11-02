import React from 'react';
import { 
  CheckCircle, 
  Award, 
  Clock, 
  FileCheck2, 
  FileSpreadsheet, 
  User, 
  Home, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface SubmissionResultViewProps {
  resultData: {
    attemptId: string;
    fullName: string;
    studentId: string;
    className: string;
    examCode: string;
    submittedTime: string;
    durationSeconds?: number;
    leaveTabCount: number;
    syncedToGoogleSheets: boolean;
    googleSheetsError?: string;
    showScore?: boolean;
    totalScore?: number;
    mcqScore?: number;
    tfScore?: number;
    mcqCorrectCount?: number;
  };
  onReturnHome: () => void;
}

export const SubmissionResultView: React.FC<SubmissionResultViewProps> = ({
  resultData,
  onReturnHome
}) => {
  const formatSubmittedTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleTimeString('vi-VN');
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN');
    } catch {
      return isoString;
    }
  };

  const getEvaluation = (score?: number) => {
    if (score === undefined) return '';
    if (score >= 9.0) return 'Xuất sắc! Nắm vững toàn diện kiến thức Tin học 11.';
    if (score >= 8.0) return 'Giỏi! Hoàn thành rất tốt các nội dung kiểm tra.';
    if (score >= 6.5) return 'Khá! Cần lưu ý thêm một số bẫy ở câu hỏi Đúng/Sai.';
    if (score >= 5.0) return 'Đạt yêu cầu! Cần ôn luyện thêm về phần cứng và ứng dụng trực tuyến.';
    return 'Chưa đạt! Cần liên hệ giáo viên để được hướng dẫn bổ sung kiến thức.';
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-12 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Success Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-5 sm:p-8 space-y-5 sm:space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] sm:text-xs font-bold tracking-wider uppercase">
            Hệ thống đã nhận bài làm
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900">
            ĐÃ NỘP BÀI THÀNH CÔNG!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Bài thi môn Tin học 11 – Giữa Học kỳ I (Năm học 2026 - 2027)
          </p>
        </div>

        {/* Score display (If configured to show) */}
        {resultData.showScore && resultData.totalScore !== undefined ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 p-4 sm:p-6 rounded-2xl border border-blue-200/80 space-y-3 sm:space-y-4">
            <div className="text-[11px] sm:text-xs font-bold text-blue-800 uppercase tracking-wider">
              Kết quả bài thi chính thức
            </div>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-4xl sm:text-5xl font-black text-blue-700">
                {resultData.totalScore.toFixed(2)}
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-400 self-end mb-1">
                / 10,0
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-sm mx-auto text-xs pt-2 border-t border-blue-200/60">
              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px] sm:text-xs">Phần I (MCQ):</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                  {resultData.mcqScore?.toFixed(2)} đ
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ({resultData.mcqCorrectCount}/24 câu)
                </span>
              </div>

              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px] sm:text-xs">Phần II (Đúng/Sai):</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                  {resultData.tfScore?.toFixed(2)} đ
                </span>
                <span className="text-[10px] text-slate-400 block">
                  (Theo số ý đúng)
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-blue-900 bg-white/80 p-2.5 rounded-xl border border-blue-100 leading-relaxed">
              {getEvaluation(resultData.totalScore)}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-200/70 text-left space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Lock className="w-4 h-4" />
              </span>
              <span>CHẾ ĐỘ BẢO MẬT ĐIỂM SỐ ĐANG KÍCH HOẠT</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Theo quy chế kiểm tra tập trung, hệ thống tạm thời <strong>ẩn điểm số của học sinh</strong> trong suốt ca thi. Bài làm gồm 24 câu trắc nghiệm (Phần I) và 4 câu Đúng/Sai (Phần II) đã được niêm phong an toàn và chuyển đến giáo viên bộ môn.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] sm:text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/90 border border-slate-200/80 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã lưu & khóa bài nộp chính thức</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/90 border border-slate-200/80 text-slate-700">
                <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Giáo viên sẽ công bố điểm sau ca thi</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Examination Receipt */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-3 text-xs">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs">BIÊN BẢN GHI NHẬN NỘP BÀI</span>
            <span className="font-mono text-slate-500 font-semibold text-[10px] sm:text-xs truncate">{resultData.attemptId}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-slate-700">
            <div>
              <span className="text-slate-400 block">Học sinh:</span>
              <strong className="text-slate-900 text-sm">{resultData.fullName}</strong>
            </div>

            <div>
              <span className="text-slate-400 block">Mã số:</span>
              <span className="font-mono font-bold text-slate-800">{resultData.studentId}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Lớp:</span>
              <span className="font-bold text-blue-700">{resultData.className}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Mã đề:</span>
              <span className="font-bold text-purple-700">{resultData.examCode}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Thời gian nộp:</span>
              <span className="font-medium text-slate-800">{formatSubmittedTime(resultData.submittedTime)}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Số lần rời màn hình:</span>
              <span className={resultData.leaveTabCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                {resultData.leaveTabCount} lần
              </span>
            </div>
          </div>

          {/* Google Sheets Status */}
          <div className="pt-2 border-t border-slate-200 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              Lưu dữ liệu Google Sheets:
            </span>

            {resultData.syncedToGoogleSheets ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 w-fit">
                <CheckCircle className="w-3.5 h-3.5" /> Đã lưu thành công
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium text-[11px] w-fit">
                Đã lưu cục bộ máy chủ
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2">
          <button
            onClick={onReturnHome}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation min-h-[46px]"
          >
            <Home className="w-4 h-4" />
            <span>Quay về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
