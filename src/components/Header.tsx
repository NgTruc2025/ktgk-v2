import React from 'react';
import { ShieldCheck, Award, Lock, Unlock, BookOpen, Clock } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'exam' | 'result' | 'teacher';
  onNavigate: (view: 'home' | 'teacher') => void;
  isOpen?: boolean;
  academicYear?: string;
  durationMinutes?: number;
  onOpenLockModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isOpen = true,
  academicYear = '2026-2027',
  durationMinutes = 45,
  onOpenLockModal
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top institution bar - Optimized for mobile and desktop */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-1 px-3 sm:px-4 text-[11px] sm:text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
            <span className="font-semibold tracking-wide truncate">SỞ GD&ĐT CÀ MAU • THPT GIÁ RAI</span>
            <span className="text-blue-200 hidden md:inline">| Phân hiệu Nguyễn Trung Trực</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-blue-100 shrink-0 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1 font-mono font-semibold">
              <Clock className="w-3 h-3 text-blue-300" /> {durationMinutes}p
            </span>
            <span className="hidden sm:inline">Năm học: {academicYear}</span>
            {onOpenLockModal ? (
              <button
                type="button"
                onClick={onOpenLockModal}
                title="Bấm để kích hoạt Khóa hoặc Mở đề thi với mật khẩu"
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                  isOpen 
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/50' 
                    : 'bg-red-500/30 text-red-300 border border-red-400/40 hover:bg-red-500/50'
                }`}
              >
                {isOpen ? <Unlock className="w-2.5 h-2.5 text-emerald-300" /> : <Lock className="w-2.5 h-2.5 text-red-300" />}
                <span>{isOpen ? 'MỞ THI' : 'ĐÃ KHÓA'}</span>
              </button>
            ) : (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isOpen ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/30 text-red-300 border border-red-400/40'}`}>
                {isOpen ? 'MỞ THI' : 'ĐÓNG'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div 
          onClick={() => currentView !== 'exam' && onNavigate('home')} 
          className={`flex items-center gap-2 sm:gap-3 min-w-0 ${currentView !== 'exam' ? 'cursor-pointer' : ''}`}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border-2 border-blue-500 shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider truncate">
              Hệ Thống Khảo Thí Trực Tuyến
            </div>
            <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 leading-tight truncate">
              KIỂM TRA GIỮA HK I • TIN HỌC 11
            </h1>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentView !== 'exam' && (
            <>
              <button
                onClick={() => onNavigate('home')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'home'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>

              {onOpenLockModal && (
                <button
                  type="button"
                  onClick={onOpenLockModal}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isOpen
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                  }`}
                  title={isOpen ? "Nhấn để Khóa đề thi (yêu cầu mật khẩu)" : "Nhấn để Mở đề thi (yêu cầu mật khẩu)"}
                >
                  {isOpen ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isOpen ? 'Khóa đề' : 'Mở đề'}</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('teacher')}
                className={`px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 border cursor-pointer ${
                  currentView === 'teacher'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'text-slate-700 border-slate-300 hover:border-blue-600 hover:text-blue-700 bg-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span>Giáo viên</span>
              </button>
            </>
          )}

          {currentView === 'exam' && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 py-1 sm:py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span>Phòng thi</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
