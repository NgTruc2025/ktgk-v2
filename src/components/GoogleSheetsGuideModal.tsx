import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  Terminal, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    fetch('/public/google-apps-script.js')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        alert('Vui lòng mở file google-apps-script.js để sao chép.');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            Tài liệu & Hướng dẫn kỹ thuật
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            KẾT NỐI GOOGLE SHEETS & GOOGLE APPS SCRIPT
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Quy trình triển khai lưu trữ điểm và chi tiết bài thi tự động chuẩn Trường THPT Giá Rai
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          
          {/* Quick copy banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-950 text-sm">
                Mã nguồn Google Apps Script (Sẵn sàng triển khai)
              </div>
              <div className="text-emerald-700 text-xs">
                Chứa hàm <code>setupSheets()</code> tự động tạo 7 Worksheet và bộ xử lý <code>doPost()</code> bảo mật.
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-yellow-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép toàn bộ mã Script'}</span>
            </button>
          </div>

          {/* 8-Step Deployment Guide */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2">
              Các bước thiết lập chỉ trong 2 phút
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Tạo bảng tính Google Sheets mới</strong>
                  Truy cập <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> và đặt tên bảng tính là <code>KET_QUA_KIEM_TRA_TIN_12_GIA_RAI</code>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Mở trình soạn thảo Apps Script</strong>
                  Trên thanh menu Google Sheets, chọn <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Dán mã nguồn và lưu lại</strong>
                  Xóa toàn bộ mã mặc định trong <code>Code.gs</code>, dán mã đã sao chép ở nút trên vào, rồi nhấn biểu tượng <strong>Lưu (Save)</strong> (hoặc Ctrl+S).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Chạy hàm setupSheets() một lần</strong>
                  Tại thanh công cụ Apps Script, chọn hàm <code>setupSheets</code> từ danh sách thả xuống và bấm <strong>Chạy (Run)</strong>. Cấp quyền truy cập cho Script khi Google hiển thị hộp thoại. Bảng tính sẽ tự động sinh ra đủ 7 Worksheet với tiêu đề màu xanh chuyên nghiệp!
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">5</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Triển khai dưới dạng Ứng dụng web (Web App)</strong>
                  Nhấn nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &rarr; <strong>Tùy chọn triển khai mới (New deployment)</strong> &rarr; Chọn biểu tượng bánh răng chọn <strong>Ứng dụng web (Web app)</strong>.
                  <div className="mt-2 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                    <div>• <strong>Thực thi dưới dạng (Execute as):</strong> Tôi (Me - tài khoản của bạn)</div>
                    <div>• <strong>Ai có quyền truy cập (Who has access):</strong> Bất kỳ ai (Anyone)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">6</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Sao chép URL Web App</strong>
                  Sau khi bấm Triển khai, sao chép URL có dạng <code>https://script.google.com/macros/s/AKfycb.../exec</code>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">7</span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Dán vào Hệ thống thi & Kiểm tra kết nối</strong>
                  Vào <strong>Giáo viên</strong> &rarr; Tab <strong>Tích hợp Google Sheets</strong> &rarr; Dán URL &rarr; Bấm <strong>&quot;Kiểm tra kết nối Google Sheets&quot;</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Structure of 7 Sheets */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2">
              Cấu trúc 7 Worksheet được tạo tự động
            </h3>

            <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-blue-700 block">1. DANH_SACH_HS:</span>
                STT | Mã HS | Họ tên | Lớp | Khối | Trạng thái
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-blue-700 block">2. DANH_SACH_DE:</span>
                Mã đề | Tên đề | Khối | Môn | Thời gian | Số MCQ | Số TF | Trạng thái | Phiên bản đề
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
                <span className="font-bold text-emerald-700 block">3. KET_QUA (Bảng điểm chính):</span>
                STT | Mã lượt thi | Mã HS | Họ tên | Lớp | Khối | Mã đề | Ngày thi | Giờ bắt đầu | Giờ nộp | Thời gian làm bài | Số MCQ đúng | Điểm MCQ | Điểm TF | Tổng điểm | Trạng thái nộp | Số lần rời trang | Ghi chú
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-purple-700 block">4. CHI_TIET_BAI_LAM:</span>
                Mã lượt thi | Mã đề | Phiên bản đề | Mã câu hỏi | Loại câu | Đáp án HS | Điểm câu | Thời điểm ghi nhận
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-700 block">5. CAU_HOI:</span>
                Mã câu | Khối | Chủ đề | Bài học | Loại câu | Mức độ | Nội dung | Phương án/Ý | Đáp án chuẩn | Trạng thái
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-amber-700 block">6. CAU_HINH:</span>
                Tham số | Giá trị | Mô tả
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-rose-700 block">7. NHAT_KY:</span>
                Thời điểm | Mã HS | Mã lượt thi | Loại sự kiện | Nội dung | Trạng thái xử lý
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            Bảo mật: Xác thực khóa bí mật SHARED_SECRET_KEY chống giả mạo
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Đóng hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
