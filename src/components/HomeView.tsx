import React, { useState } from 'react';
import { 
  Play, 
  Lock, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  AlertTriangle, 
  FileText, 
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  Unlock
} from 'lucide-react';
import { ExamConfig } from '../types/exam';

interface HomeViewProps {
  config: ExamConfig;
  onStartExamClick: () => void;
  onTeacherLoginClick: () => void;
  onOpenSheetsGuide: () => void;
  onOpenLockModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  config,
  onStartExamClick,
  onTeacherLoginClick,
  onOpenSheetsGuide,
  onOpenLockModal
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'structure' | 'topics'>('rules');

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Banner Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white p-5 sm:p-10 shadow-xl border border-blue-700/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-700/60 border border-blue-400/30 text-[11px] sm:text-xs font-semibold text-blue-200 max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="truncate">Năm học {config.academicYear} • Phân hiệu Nguyễn Trung Trực</span>
          </div>

          <h1 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            KIỂM TRA GIỮA HỌC KỲ I <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-emerald-300">
              MÔN TIN HỌC 11 – KẾT NỐI TRI THỨC
            </span>
          </h1>

          <p className="text-xs sm:text-base text-blue-100 leading-relaxed max-w-2xl">
            Hệ thống khảo thí điện tử chính thức – Sở GD&ĐT Cà Mau • Trường THPT Giá Rai (Phân hiệu Nguyễn Trung Trực). Đề thi gồm 4 mã đề (101, 102, 103, 104) chuẩn ma trận 2026. Chấm điểm bảo mật, chống gian lận và tự động đồng bộ kết quả vào Google Sheets.
          </p>

          {!config.isOpen && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-100 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="font-bold text-white">ĐÃ KHÓA ĐỀ THI (KẾT THÚC BUỔI THI)</div>
                  <div className="text-amber-200/90 text-xs">Buổi kiểm tra đã kết thúc. Hệ thống đã đóng nhận bài làm của thí sinh và tự động đồng bộ kết quả lên Google Sheets.</div>
                </div>
              </div>
              {onOpenLockModal && (
                <button
                  type="button"
                  onClick={onOpenLockModal}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Mở lại đề thi</span>
                </button>
              )}
            </div>
          )}

          {/* Action buttons - Mobile full-width touch friendly */}
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={onStartExamClick}
              disabled={!config.isOpen}
              className={`w-full sm:w-auto px-6 py-3.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation min-h-[48px] ${
                config.isOpen
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-emerald-900/30 active:scale-[0.99]'
                  : 'bg-slate-700/80 text-slate-300 border border-slate-600/60 cursor-not-allowed'
              }`}
            >
              {config.isOpen ? <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />}
              <span>{config.isOpen ? 'VÀO LÀM BÀI KIỂM TRA' : 'ĐÃ KHÓA ĐỀ THI CUỐI BUỔI'}</span>
            </button>

            {onOpenLockModal && (
              <button
                type="button"
                onClick={onOpenLockModal}
                className={`w-full sm:w-auto px-4 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-sm min-h-[44px] ${
                  config.isOpen
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/40'
                    : 'bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border-emerald-400/40'
                }`}
                title="Kích hoạt Khóa hoặc Mở đề thi với mật khẩu giáo viên"
              >
                {config.isOpen ? <Lock className="w-4 h-4 text-amber-300" /> : <Unlock className="w-4 h-4 text-emerald-300" />}
                <span>{config.isOpen ? 'Khóa đề thi' : 'Mở khóa đề'}</span>
              </button>
            )}

            <button
              onClick={onTeacherLoginClick}
              className="w-full sm:w-auto px-4 py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Đăng nhập giáo viên</span>
            </button>

            <button
              onClick={onOpenSheetsGuide}
              className="w-full sm:w-auto px-3.5 py-2.5 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-blue-200 hover:text-white hover:bg-blue-800/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Mẫu Google Sheets</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights - 2x2 grid on mobile, 4 columns on desktop */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center sm:text-left">
          <div className="bg-blue-800/30 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-blue-600/30">
            <div className="text-[11px] sm:text-xs text-blue-200">Thời gian làm bài</div>
            <div className="text-lg sm:text-xl font-black text-white">{config.durationMinutes} phút</div>
          </div>
          <div className="bg-blue-800/30 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-blue-600/30">
            <div className="text-[11px] sm:text-xs text-blue-200">Số lượng câu hỏi</div>
            <div className="text-lg sm:text-xl font-black text-white">28 câu</div>
          </div>
          <div className="bg-blue-800/30 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-blue-600/30">
            <div className="text-[11px] sm:text-xs text-blue-200">Thang điểm chuẩn</div>
            <div className="text-lg sm:text-xl font-black text-white">10,0 điểm</div>
          </div>
          <div className="bg-blue-800/30 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-blue-600/30">
            <div className="text-[11px] sm:text-xs text-blue-200">Lưu kết quả</div>
            <div className="text-base sm:text-xl font-black text-emerald-300 flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Google Sheets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation for Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 p-1 sm:p-1.5 gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <span>Nội quy phòng thi</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation whitespace-nowrap ${
              activeTab === 'structure'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
            <span>Cấu trúc đề & Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation whitespace-nowrap ${
              activeTab === 'topics'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            <span>Chủ đề kiến thức</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Quy định phòng thi và giám sát kiểm tra
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-sm space-y-2">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Giám sát hành vi chuyển trang (Tab-switching)
                  </div>
                  <p className="text-amber-800 text-xs leading-relaxed">
                    Hệ thống tự động phát hiện và ghi nhận số lần chuyển sang tab khác hoặc mất tiêu điểm trình duyệt. Mọi vi phạm được lưu trong nhật ký (NHAT_KY) đối soát cho giáo viên.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-sm space-y-2">
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Đồng bộ thời gian từ máy chủ
                  </div>
                  <p className="text-blue-800 text-xs leading-relaxed">
                    Đồng hồ đếm ngược được khóa theo thời gian thực của máy chủ. Việc chỉnh giờ thiết bị hay tải lại trang web không làm gia hạn thời gian làm bài. Khi hết 45 phút, hệ thống tự động nộp bài.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-sm space-y-2">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Tự động lưu tạm thời bài làm
                  </div>
                  <p className="text-emerald-800 text-xs leading-relaxed">
                    Mỗi khi bạn chọn một đáp án, câu trả lời sẽ được lưu tạm ngay lập tức. Nếu máy tính bị mất điện hoặc tải lại trình duyệt, bạn có thể vào lại để tiếp tục làm bài mà không mất dữ liệu.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/70 text-sm space-y-2">
                  <div className="font-semibold text-purple-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Xác thực một bài nộp chính thức
                  </div>
                  <p className="text-purple-800 text-xs leading-relaxed">
                    Mỗi học sinh chỉ có duy nhất một bài nộp chính thức. Hệ thống ngăn chặn việc nộp nhiều lần hoặc sửa đổi điểm số từ phía học sinh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Cấu trúc đề kiểm tra Giữa học kỳ I - Tin học 11
                </h3>
                <p className="text-xs text-slate-500">
                  Áp dụng theo định dạng đề kiểm tra đổi mới của Bộ Giáo dục và Đào tạo
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Phần 1 */}
                <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold">
                      PHẦN I
                    </span>
                    <span className="text-sm font-extrabold text-blue-700">6,0 ĐIỂM</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Trắc nghiệm nhiều lựa chọn (MCQ)
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    <li>Gồm <strong>24 câu hỏi</strong> (từ Câu 1 đến Câu 24).</li>
                    <li>Mỗi câu có 4 phương án A, B, C, D, chỉ có 1 phương án đúng.</li>
                    <li>Mỗi câu trả lời đúng được <strong>0,25 điểm</strong>.</li>
                    <li>Sai hoặc không trả lời: 0 điểm.</li>
                  </ul>
                </div>

                {/* Phần 2 */}
                <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold">
                      PHẦN II
                    </span>
                    <span className="text-sm font-extrabold text-indigo-700">4,0 ĐIỂM</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Trắc nghiệm Đúng / Sai (TF)
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    <li>Gồm <strong>4 câu hỏi</strong> tình huống (từ Câu 1 đến Câu 4).</li>
                    <li>Mỗi câu có 4 ý a, b, c, d; học sinh chọn Đúng hoặc Sai cho từng ý.</li>
                    <li>
                      <strong>Thang điểm chuẩn theo số ý đúng:</strong>
                      <div className="grid grid-cols-2 gap-1.5 mt-2 bg-white p-2 rounded border border-indigo-100">
                        <div>• Đúng 1 ý: <strong>0,10 điểm</strong></div>
                        <div>• Đúng 2 ý: <strong>0,25 điểm</strong></div>
                        <div>• Đúng 3 ý: <strong>0,50 điểm</strong></div>
                        <div>• Đúng cả 4 ý: <strong>1,00 điểm</strong></div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Tổng điểm toàn bài: <strong>10,0 điểm</strong> (Thang điểm 10)</span>
                <span className="font-medium text-slate-700">Thời gian làm bài: 45 phút</span>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Chủ đề kiến thức trọng tâm (Tin học 11 – Kết nối tri thức với cuộc sống)
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-xs font-bold text-blue-700 uppercase">Chủ đề 1</div>
                  <div className="text-sm font-semibold text-slate-800">Phần cứng & Hệ điều hành</div>
                  <p className="text-xs text-slate-500">
                    Bo mạch chủ, CPU/ALU, RAM, ổ lưu trữ SSD/HDD, cổng kết nối (HDMI, VGA, Bluetooth), thông số màn hình (Hz, độ phân giải) và máy in (ppm, dpi), giao diện đồ họa GUI.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-xs font-bold text-blue-700 uppercase">Chủ đề 2</div>
                  <div className="text-sm font-semibold text-slate-800">Phần mềm nguồn mở & Bản quyền</div>
                  <p className="text-xs text-slate-500">
                    Khái niệm FOSS, hệ điều hành Linux, bộ ứng dụng văn phòng LibreOffice, giấy phép GNU GPL và bản quyền tác giả, mô hình phần mềm dịch vụ SaaS.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-xs font-bold text-blue-700 uppercase">Chủ đề 3</div>
                  <div className="text-sm font-semibold text-slate-800">Ứng dụng trực tuyến & An toàn mạng</div>
                  <p className="text-xs text-slate-500">
                    Cộng tác Google Docs/Drive/Sheets, phân quyền chia sẻ (Viewer/Commenter/Editor), cú pháp tìm kiếm (filetype:pdf, site:, ngoặc kép), an toàn email (To/Cc/Bcc).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 space-y-1 py-4">
        <div>Hệ thống khảo thí Tin học 11 – Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực</div>
        <div>Cơ sở dữ liệu: Google Sheets API & Google Apps Script Backend • Phiên bản 2026.1</div>
      </div>
    </div>
  );
};
