import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  Bookmark, 
  Send, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  Check, 
  HelpCircle,
  Wifi,
  WifiOff,
  User,
  Hash,
  GraduationCap,
  ShieldAlert,
  Maximize,
  Minimize,
  Lock,
  LayoutGrid,
  ChevronUp,
  X
} from 'lucide-react';
import { ExamVersion, MCQQuestion, TFQuestion } from '../types/exam';
import { apiClient } from '../services/apiClient';

interface ExamRoomProps {
  attemptId: string;
  studentInfo: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  };
  exam: {
    code: string;
    title: string;
    grade: number;
    subject: string;
    durationMinutes: number;
    totalPoints: number;
    mcqQuestions: MCQQuestion[];
    tfQuestions: TFQuestion[];
  };
  startTime: string;
  expiresAt: string;
  resumedState?: {
    mcqAnswers: any;
    tfAnswers: any;
    flaggedQuestionIds: string[];
    leaveTabCount: number;
  } | null;
  onSubmitExam: (submissionData: {
    attemptId: string;
    examCode: string;
    mcqAnswers: { [qId: string]: 'A' | 'B' | 'C' | 'D' };
    tfAnswers: { [qId: string]: { [item: string]: boolean } };
    leaveTabCount: number;
  }) => Promise<void>;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({
  attemptId,
  studentInfo,
  exam,
  startTime,
  expiresAt,
  resumedState,
  onSubmitExam
}) => {
  // Current active question index (0 to 23 are MCQ, 24 to 27 are TF)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state - initialize from resumed state if available
  const [mcqAnswers, setMcqAnswers] = useState<{ [qId: string]: 'A' | 'B' | 'C' | 'D' }>(resumedState?.mcqAnswers || {});
  const [tfAnswers, setTfAnswers] = useState<{ [qId: string]: { [item: string]: boolean } }>(resumedState?.tfAnswers || {});
  const [flaggedIds, setFlaggedIds] = useState<string[]>(resumedState?.flaggedQuestionIds || []);

  // Monitoring & anti-cheat
  const [leaveTabCount, setLeaveTabCount] = useState(resumedState?.leaveTabCount || 0);
  const [showBlurWarning, setShowBlurWarning] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Vừa mới');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Fullscreen state & right-click toast
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [showExitFullscreenWarning, setShowExitFullscreenWarning] = useState(false);
  const [showRightClickToast, setShowRightClickToast] = useState(false);

  // Function to enter fullscreen
  const enterFullscreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setShowExitFullscreenWarning(false);
        })
        .catch(() => {});
    }
  }, []);

  // Request fullscreen on mount
  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull && !isSubmitting) {
        setShowExitFullscreenWarning(true);
        handleTabLeave('Thí sinh đã thoát chế độ Toàn màn hình');
      } else {
        setShowExitFullscreenWarning(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isSubmitting]);

  // Lock right click (context menu) & key shortcuts (F12, Ctrl+C, Ctrl+U, Ctrl+Shift+I)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowRightClickToast(true);
      setTimeout(() => setShowRightClickToast(false), 2200);
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && ['c', 'C', 'u', 'U', 's', 'S', 'a', 'A', 'p', 'P'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))
      ) {
        e.preventDefault();
        setShowRightClickToast(true);
        setTimeout(() => setShowRightClickToast(false), 2200);
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Cleanup fullscreen on submit or unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Time remaining in seconds
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const endMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    return Math.max(0, Math.floor((endMs - nowMs) / 1000));
  });

  const allQuestionsCount = 28; // 24 MCQ + 4 TF

  // Timer countdown hook
  useEffect(() => {
    const interval = setInterval(() => {
      const endMs = new Date(expiresAt).getTime();
      const nowMs = Date.now();
      const remain = Math.max(0, Math.floor((endMs - nowMs) / 1000));
      setTimeLeft(remain);

      if (remain <= 0) {
        clearInterval(interval);
        handleForceSubmitTimeOut();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Offline / Online listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Anti-cheat window blur & visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabLeave('Chuyển sang tab khác hoặc thu nhỏ cửa sổ');
      }
    };

    const handleWindowBlur = () => {
      // Khi mất tiêu điểm
      handleTabLeave('Mất tiêu điểm cửa sổ thi');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [attemptId]);

  const handleTabLeave = (reason: string) => {
    setLeaveTabCount(prev => {
      const nextCount = prev + 1;
      setShowBlurWarning(true);
      
      // Gửi nhật ký tới máy chủ hoặc adapter an toàn
      apiClient.logEvent({
        attemptId,
        eventType: 'LEAVE_TAB',
        details: `${reason} (Lần thứ ${nextCount})`
      }).catch(() => {});

      return nextCount;
    });
  };

  // Auto-save progress every 25 seconds
  useEffect(() => {
    const saveTimer = setInterval(() => {
      saveProgressToServer();
    }, 25000);
    return () => clearInterval(saveTimer);
  }, [mcqAnswers, tfAnswers, flaggedIds, leaveTabCount]);

  const saveProgressToServer = useCallback(async () => {
    try {
      await apiClient.saveProgress({
        attemptId,
        mcqAnswers,
        tfAnswers,
        flaggedQuestionIds: flaggedIds,
        leaveTabCount
      });
      const d = new Date();
      setLastSavedTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`);
    } catch (e) {
      // Silently retry later
    }
  }, [attemptId, mcqAnswers, tfAnswers, flaggedIds, leaveTabCount]);

  // Handle MCQ selection
  const handleSelectMCQ = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // Handle TF toggle
  const handleToggleTF = (questionId: string, itemId: 'a' | 'b' | 'c' | 'd', value: boolean) => {
    setTfAnswers(prev => {
      const currentQ = prev[questionId] || {};
      return {
        ...prev,
        [questionId]: {
          ...currentQ,
          [itemId]: value
        }
      };
    });
  };

  // Toggle flag for review
  const toggleFlagCurrent = (qId: string) => {
    setFlaggedIds(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Submit trigger
  const handleFinalSubmit = async () => {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    try {
      await onSubmitExam({
        attemptId,
        examCode: exam.code,
        mcqAnswers,
        tfAnswers,
        leaveTabCount
      });
    } catch (err: any) {
      alert('Lỗi nộp bài: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleForceSubmitTimeOut = async () => {
    setIsSubmitting(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    try {
      await onSubmitExam({
        attemptId,
        examCode: exam.code,
        mcqAnswers,
        tfAnswers,
        leaveTabCount
      });
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  // Calculation for answered status
  const isQuestionAnswered = (idx: number): boolean => {
    if (idx < 24) {
      const q = exam.mcqQuestions[idx];
      return q && mcqAnswers[q.id] !== undefined;
    } else {
      const tfIdx = idx - 24;
      const q = exam.tfQuestions[tfIdx];
      if (!q) return false;
      const ans = tfAnswers[q.id];
      // TF is considered answered if all 4 items have been set
      return Boolean(ans && ['a', 'b', 'c', 'd'].every(k => ans[k] !== undefined));
    }
  };

  const countAnswered = () => {
    let count = 0;
    for (let i = 0; i < allQuestionsCount; i++) {
      if (isQuestionAnswered(i)) count++;
    }
    return count;
  };

  const answeredCount = countAnswered();

  // Formatting timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // <= 5 minutes

  // Current question resolver
  const isCurrentMCQ = currentIndex < 24;
  const currentMCQ = isCurrentMCQ ? exam.mcqQuestions[currentIndex] : null;
  const currentTF = !isCurrentMCQ ? exam.tfQuestions[currentIndex - 24] : null;
  const currentQId = currentMCQ ? currentMCQ.id : (currentTF ? currentTF.id : '');
  const isCurrentFlagged = flaggedIds.includes(currentQId);

  return (
    <div 
      onContextMenu={(e) => {
        e.preventDefault();
        setShowRightClickToast(true);
        setTimeout(() => setShowRightClickToast(false), 2200);
        return false;
      }}
      className="min-h-screen bg-slate-100 flex flex-col pb-16 select-none"
    >
      {/* Toast cảnh báo khóa chuột phải */}
      {showRightClickToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 backdrop-blur-md">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Chuột phải và phím tắt sao chép đã bị khóa theo quy chế phòng thi!</span>
        </div>
      )}

      {/* ================= STICKY EXAM HEADER BAR ================= */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Student identity badge */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="bg-blue-50 border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-xs truncate max-w-[150px] sm:max-w-none">
                <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="font-bold text-slate-800 truncate">{studentInfo.fullName}</span>
                <span className="text-slate-400 hidden sm:inline">|</span>
                <span className="font-semibold text-blue-700 shrink-0">{studentInfo.className}</span>
              </div>

              <div className="bg-purple-50 border border-purple-200 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-purple-700 shrink-0">
                Đề: {exam.code}
              </div>

              {leaveTabCount > 0 && (
                <div className="hidden md:flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rời tab: {leaveTabCount}</span>
                </div>
              )}
            </div>

            {/* Right controls: Fullscreen, Timer, Submit */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={enterFullscreen}
                title={isFullscreen ? 'Đang ở chế độ toàn màn hình' : 'Mở toàn màn hình'}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                  isFullscreen 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200 animate-pulse'
                }`}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5 text-amber-700" />}
                <span className="hidden lg:inline">{isFullscreen ? 'Toàn màn hình: Bật' : 'Bật toàn màn hình'}</span>
              </button>

              {/* Timer */}
              <div className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl font-mono text-sm sm:text-base font-black border transition-all ${
                isLowTime
                  ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                  : 'bg-slate-900 text-white border-slate-900'
              }`}>
                <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLowTime ? 'text-red-500' : 'text-blue-300'}`} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              {/* Submit button (Tablet/Desktop) */}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="hidden sm:flex px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang nộp...' : 'Nộp bài'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thin progress bar along bottom of header */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(answeredCount / allQuestionsCount) * 100}%` }}
          />
        </div>

        {/* Offline notice bar */}
        {!isOnline && (
          <div className="bg-red-600 text-white px-3 py-1 text-xs font-semibold flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Mất kết nối Internet! Câu trả lời đang được lưu trữ tạm thời trên máy.</span>
          </div>
        )}

        {/* Mobile leave tab warning notice if > 0 */}
        {leaveTabCount > 0 && (
          <div className="md:hidden bg-amber-500 text-white px-3 py-0.5 text-[11px] font-bold flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Hệ thống ghi nhận bạn đã chuyển tab {leaveTabCount} lần!</span>
          </div>
        )}
      </div>

      {/* ================= MAIN EXAM LAYOUT ================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 lg:pb-8">
        
        {/* LEFT COLUMN: QUESTION CONTENT (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
            <div>
              {/* Question header info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                  <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-black uppercase ${
                    isCurrentMCQ ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {isCurrentMCQ ? 'Phần I' : 'Phần II'}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isCurrentMCQ ? `Câu ${currentIndex + 1} / 24` : `Câu ${currentIndex - 23} / 4 (Câu ${currentIndex + 1})`}
                  </h3>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    ({isCurrentMCQ ? '0,25đ' : '1,00đ'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick question palette opener on mobile */}
                  <button
                    onClick={() => setShowMobileDrawer(true)}
                    className="lg:hidden px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 active:bg-blue-100 cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                    <span>{answeredCount}/28</span>
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={() => toggleFlagCurrent(currentQId)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isCurrentFlagged
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span className="hidden xs:inline">{isCurrentFlagged ? 'Đã đánh dấu' : 'Xem lại sau'}</span>
                  </button>
                </div>
              </div>

              {/* ================= PHẦN I: MCQ ================= */}
              {isCurrentMCQ && currentMCQ && (
                <div className="pt-3 sm:pt-4 space-y-4">
                  <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                    {currentMCQ.text}
                  </div>

                  <div className="space-y-2.5 sm:space-y-3 pt-1">
                    {currentMCQ.options.map(option => {
                      const isSelected = mcqAnswers[currentMCQ.id] === option.key;
                      return (
                        <div
                          key={option.key}
                          onClick={() => handleSelectMCQ(currentMCQ.id, option.key)}
                          className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 active:scale-[0.99] touch-manipulation ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 shadow-xs'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className={`text-xs sm:text-sm leading-relaxed ${
                            isSelected ? 'text-blue-950 font-bold' : 'text-slate-800'
                          }`}>
                            {option.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= PHẦN II: TF ================= */}
              {!isCurrentMCQ && currentTF && (
                <div className="pt-3 sm:pt-4 space-y-4">
                  {/* Scenario context */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs sm:text-sm leading-relaxed text-indigo-950">
                    <span className="font-bold text-indigo-900 block mb-1">Tình huống / Bối cảnh:</span>
                    {currentTF.context}
                  </div>

                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Xác định Đúng hoặc Sai cho mỗi mệnh đề sau:
                  </div>

                  {/* 4 statements with mobile-first True/False layout */}
                  <div className="space-y-3">
                    {currentTF.items.map(item => {
                      const userChoice = tfAnswers[currentTF.id]?.[item.id];
                      return (
                        <div 
                          key={item.id} 
                          className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                            userChoice !== undefined ? 'bg-slate-50/90 border-slate-300' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed flex-1 font-medium">
                              {item.text}
                            </div>

                            {/* True / False toggles - Side-by-side full width on mobile, inline on desktop */}
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 shrink-0 pt-1 sm:pt-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTF(currentTF.id, item.id, true)}
                                className={`min-h-[42px] sm:min-h-0 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border active:scale-95 touch-manipulation ${
                                  userChoice === true
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-500 hover:text-emerald-700'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Đúng</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleTF(currentTF.id, item.id, false)}
                                className={`min-h-[42px] sm:min-h-0 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border active:scale-95 touch-manipulation ${
                                  userChoice === false
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-rose-500 hover:text-rose-700'
                                }`}
                              >
                                <span>Sai</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Question navigation controls (Desktop & Tablet) */}
            <div className="hidden sm:flex pt-4 border-t border-slate-100 items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="text-xs text-slate-400">
                Lưu tạm: {lastSavedTime}
              </div>

              {currentIndex < allQuestionsCount - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(allQuestionsCount - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Hoàn thành & Nộp bài</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION MATRIX PALETTE (Visible on Desktop, hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Bảng điều hướng câu hỏi
              </h4>
              <span className="text-xs font-bold text-blue-700">
                {answeredCount}/{allQuestionsCount} câu
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-600"></span>
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-200"></span>
                <span>Chưa làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-400"></span>
                <span>Xem lại</span>
              </div>
            </div>

            {/* Matrix 1 to 24 (MCQ) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Phần I: Trắc nghiệm MCQ (Câu 1 - 24)
              </div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = isQuestionAnswered(idx);
                  const isFlagged = flaggedIds.includes(exam.mcqQuestions[idx]?.id);

                  let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                  if (isFlagged) {
                    bgClass = 'bg-amber-400 text-amber-950 font-bold';
                  } else if (isAnswered) {
                    bgClass = 'bg-blue-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs transition-all font-semibold flex items-center justify-center cursor-pointer ${bgClass} ${
                        isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matrix 25 to 28 (TF) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Phần II: Đúng / Sai (Câu 25 - 28)
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => {
                  const actualIdx = 24 + i;
                  const isCurrent = currentIndex === actualIdx;
                  const isAnswered = isQuestionAnswered(actualIdx);
                  const isFlagged = flaggedIds.includes(exam.tfQuestions[i]?.id);

                  let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                  if (isFlagged) {
                    bgClass = 'bg-amber-400 text-amber-950 font-bold';
                  } else if (isAnswered) {
                    bgClass = 'bg-indigo-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setCurrentIndex(actualIdx)}
                      className={`h-10 rounded-xl text-xs transition-all font-semibold flex flex-col items-center justify-center cursor-pointer ${bgClass} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      <span>C{i + 1}</span>
                      <span className="text-[9px] opacity-75 font-normal">Đ/S</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Submit Button in Palette */}
            <div className="pt-2">
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>NỘP BÀI THI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE STICKY BOTTOM NAVIGATION BAR ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shadow-2xl">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-3 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trước</span>
        </button>

        {/* Center toggle button for mobile question drawer */}
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
        >
          <LayoutGrid className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">Câu {currentIndex + 1}/28 ({answeredCount} đã làm)</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </button>

        {currentIndex < allQuestionsCount - 1 ? (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(allQuestionsCount - 1, prev + 1))}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
          >
            <span>Sau</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp bài</span>
          </button>
        )}
      </div>

      {/* ================= MOBILE BOTTOM SHEET DRAWER ================= */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowMobileDrawer(false)}
          />
          
          {/* Drawer sheet container */}
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[82vh] overflow-y-auto p-4 space-y-4 animate-in slide-in-from-bottom duration-200 z-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bảng câu hỏi kiểm tra</h4>
                  <p className="text-xs text-slate-500">Đã làm: <span className="font-bold text-blue-700">{answeredCount}</span>/28 câu</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-around text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600"></span>
                <span>Đã làm ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200"></span>
                <span>Chưa làm ({allQuestionsCount - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400"></span>
                <span>Xem lại ({flaggedIds.length})</span>
              </div>
            </div>

            {/* Section 1: MCQ (Câu 1 - 24) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phần I: Trắc nghiệm (Câu 1 - 24)
              </div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const isCurrent = currentIndex === idx;
                  const isAnswered = isQuestionAnswered(idx);
                  const isFlagged = flaggedIds.includes(exam.mcqQuestions[idx]?.id);

                  let bgClass = 'bg-slate-100 text-slate-700 active:bg-slate-200';
                  if (isFlagged) {
                    bgClass = 'bg-amber-400 text-amber-950 font-bold';
                  } else if (isAnswered) {
                    bgClass = 'bg-blue-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMobileDrawer(false);
                      }}
                      className={`h-11 rounded-xl text-sm transition-all font-semibold flex items-center justify-center cursor-pointer touch-manipulation ${bgClass} ${
                        isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: TF (Câu 25 - 28) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phần II: Đúng / Sai (Câu 25 - 28)
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => {
                  const actualIdx = 24 + i;
                  const isCurrent = currentIndex === actualIdx;
                  const isAnswered = isQuestionAnswered(actualIdx);
                  const isFlagged = flaggedIds.includes(exam.tfQuestions[i]?.id);

                  let bgClass = 'bg-slate-100 text-slate-700 active:bg-slate-200';
                  if (isFlagged) {
                    bgClass = 'bg-amber-400 text-amber-950 font-bold';
                  } else if (isAnswered) {
                    bgClass = 'bg-indigo-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={actualIdx}
                      onClick={() => {
                        setCurrentIndex(actualIdx);
                        setShowMobileDrawer(false);
                      }}
                      className={`h-12 rounded-xl text-xs transition-all font-semibold flex flex-col items-center justify-center cursor-pointer touch-manipulation ${bgClass} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      <span className="font-bold">C{i + 1}</span>
                      <span className="text-[10px] opacity-80">Đúng/Sai</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer footer actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs active:bg-slate-100 cursor-pointer"
              >
                Đóng bảng câu
              </button>
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowSubmitConfirm(true);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp bài ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN EXIT WARNING MODAL ================= */}
      {showExitFullscreenWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in-95 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Maximize className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                CẢNH BÁO: BẠN ĐÃ THOÁT TOÀN MÀN HÌNH!
              </h3>
              <p className="text-xs text-red-700 font-bold">
                Quy chế thi bắt buộc luôn giữ chế độ Toàn màn hình (Full Screen)
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-left bg-red-50 p-3.5 rounded-xl border border-red-200">
              Hành vi thu nhỏ cửa sổ hoặc thoát toàn màn hình đã được máy chủ ghi nhận vào nhật ký kiểm tra (NHAT_KY) đối soát cho giám khảo. Vui lòng nhấn nút bên dưới để quay lại chế độ toàn màn hình.
            </p>

            <button
              type="button"
              onClick={enterFullscreen}
              className="w-full py-3 rounded-xl text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize className="w-4 h-4" />
              <span>QUAY LẠI CHẾ ĐỘ TOÀN MÀN HÌNH</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= ANTI-CHEAT BLUR WARNING MODAL ================= */}
      {showBlurWarning && !showExitFullscreenWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-500 animate-in fade-in zoom-in-95 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                CẢNH BÁO RỜI MÀN HÌNH THI!
              </h3>
              <p className="text-xs text-amber-700 font-semibold">
                Bạn vừa chuyển tab hoặc mất tiêu điểm trình duyệt (Lần thứ {leaveTabCount})
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-left bg-amber-50 p-3 rounded-xl border border-amber-200">
              Quy chế thi nghiêm cấm việc mở tài liệu, tra cứu hoặc chuyển sang cửa sổ khác. Mọi hành vi rời khỏi bài thi đã được máy chủ ghi nhận vào biên bản nhật ký đối soát.
            </p>

            <button
              onClick={() => setShowBlurWarning(false)}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-colors cursor-pointer"
            >
              Tôi đã hiểu và quay lại làm bài
            </button>
          </div>
        </div>
      )}

      {/* ================= SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                XÁC NHẬN NỘP BÀI THI?
              </h3>
              <p className="text-xs text-slate-500">
                Môn: {exam.subject || 'Tin học 11'} – Mã đề: {exam.code}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu đã hoàn thành:</span>
                <span className="font-bold text-emerald-600">{answeredCount} / {allQuestionsCount} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu chưa trả lời:</span>
                <span className="font-bold text-amber-600">{allQuestionsCount - answeredCount} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Thời gian còn lại:</span>
                <span className="font-bold text-slate-800">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {allQuestionsCount - answeredCount > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Bạn vẫn còn câu hỏi chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài lúc này không?</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Nộp bài ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
