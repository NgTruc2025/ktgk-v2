import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Copy, 
  Check, 
  Activity, 
  Lock, 
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ExamAttempt, Student, ExamConfig, AuditLogEntry, ExamVersion } from '../types/exam';
import { apiClient } from '../services/apiClient';

interface TeacherDashboardProps {
  onLogout: () => void;
  onOpenSheetsGuide: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onLogout,
  onOpenSheetsGuide
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'results' | 'stats' | 'students' | 'exams' | 'sheets' | 'logs'>('results');

  // Data states
  const [results, setResults] = useState<ExamAttempt[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<ExamVersion[]>([]);
  const [config, setConfig] = useState<ExamConfig | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters & search for results table
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [codeFilter, setCodeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState<{ attempt: ExamAttempt; exam: ExamVersion } | null>(null);
  const [adjustScoreModal, setAdjustScoreModal] = useState<{ attemptId: string; studentName: string; currentScore: number } | null>(null);
  const [adjustNewScore, setAdjustNewScore] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [studentPasscodeModal, setStudentPasscodeModal] = useState<{ studentId: string; fullName: string; passcode: string } | null>(null);

  // Add / Import student modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newClassName, setNewClassName] = useState('11A1');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // Google sheets test connection
  const [testUrl, setTestUrl] = useState('');
  const [testKey, setTestKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncAllMsg, setSyncAllMsg] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Preview exam modal
  const [previewExamCode, setPreviewExamCode] = useState<string>('101');

  // Load all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resResults, resStudents, resExams, resConfig, resLogs, resStats] = await Promise.all([
        apiClient.getResults(),
        apiClient.getStudents(),
        apiClient.getExams(),
        apiClient.getAdminConfig(),
        apiClient.getLogs(),
        apiClient.getStats()
      ]);

      if (resResults.success) setResults(resResults.results || []);
      if (resStudents.success) setStudents(resStudents.students || []);
      if (resExams.success) setExams(resExams.exams || []);
      if (resConfig.success && resConfig.config) {
        setConfig(resConfig.config);
        setTestUrl(resConfig.config.googleSheetWebAppUrl || '');
        setTestKey(resConfig.config.googleSheetSecretKey || '');
      }
      if (resLogs.success) setLogs(resLogs.logs || []);
      if (resStats.success) setStats(resStats.stats);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (window.confirm('Bạn có muốn đăng xuất khỏi hệ thống quản trị không?')) {
      try {
        await apiClient.logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
      onLogout();
    }
  };

  useEffect(() => {
    fetchAllData();
    // Auto refresh for live monitoring every 30 seconds if on results tab
    const interval = setInterval(() => {
      if (activeTab === 'results' && !loading) {
        fetchAllData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Filtered and sorted results
  const filteredResults = results
    .filter(item => {
      const matchSearch = item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'ALL' || item.className === classFilter;
      const matchCode = codeFilter === 'ALL' || item.examCode === codeFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === 'in_progress';
      return matchSearch && matchClass && matchCode && matchStatus;
    })
    .sort((a, b) => {
      if (statusFilter === 'LIVE') {
        // Sort by start time for live
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();
        return timeB - timeA;
      }
      const scoreA = a.totalScore ?? 0;
      const scoreB = b.totalScore ?? 0;
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });

  const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort();

  // View detailed attempt
  const handleViewDetail = async (attemptId: string) => {
    try {
      const data = await apiClient.getAttemptDetail(attemptId) as any;
      if (data.success) {
        setSelectedAttemptDetail(data);
      }
    } catch (e) {
      alert('Không thể tải bài làm chi tiết');
    }
  };

  // Adjust score
  const handleSaveAdjustScore = async () => {
    if (!adjustScoreModal || !adjustReason.trim()) {
      alert('Vui lòng nhập lý do điều chỉnh điểm');
      return;
    }
    const val = parseFloat(adjustNewScore);
    if (isNaN(val) || val < 0 || val > 10) {
      alert('Điểm số phải là số từ 0.0 đến 10.0');
      return;
    }

    try {
      const data = await apiClient.adjustScore({
        attemptId: adjustScoreModal.attemptId,
        newScore: val,
        reason: adjustReason.trim(),
        teacherName: 'Giáo viên phụ trách'
      });
      if (data.success) {
        setAdjustScoreModal(null);
        setAdjustReason('');
        fetchAllData();
      }
    } catch (e: any) {
      alert('Lỗi cập nhật điểm: ' + e.message);
    }
  };

  // Allow retake
  const handleAllowRetake = async (attemptId: string, studentName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn cho học sinh ${studentName} LÀM LẠI bài thi không? Dữ liệu bài làm cũ sẽ được đặt lại.`)) {
      return;
    }
    try {
      const data = await apiClient.allowRetake(attemptId);
      if (data.success) {
        fetchAllData();
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Test connection to Google Sheets
  const handleTestGoogleSheets = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const data = await apiClient.testGoogleSheets(testUrl.trim(), testKey.trim());
      setConnectionTestResult(data);
    } catch (e: any) {
      setConnectionTestResult({ success: false, error: e.message });
    } finally {
      setTestingConnection(false);
    }
  };

  // Save config
  const handleSaveConfig = async (updated: Partial<ExamConfig>) => {
    try {
      const data = await apiClient.saveAdminConfig(updated);
      if (data.success && data.config) {
        setConfig(data.config);
        alert('Đã cập nhật cấu hình thành công!');
      }
    } catch (e: any) {
      alert('Lỗi lưu cấu hình: ' + e.message);
    }
  };

  // Sync all to sheets
  const handleSyncAllToSheets = async () => {
    setSyncingAll(true);
    setSyncAllMsg(null);
    try {
      const data = await apiClient.syncAllToSheets();
      if (data.success) {
        setSyncAllMsg(data.message || 'Đồng bộ thành công.');
        fetchAllData();
      } else {
        setSyncAllMsg('Đồng bộ thất bại: ' + ((data as any).error || 'Kiểm tra lại kết nối'));
      }
    } catch (e: any) {
      setSyncAllMsg('Lỗi đồng bộ: ' + e.message);
    } finally {
      setSyncingAll(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Mã lượt thi', 'Mã HS', 'Họ tên', 'Lớp', 'Khối', 'Mã đề', 'Ngày thi', 'Giờ bắt đầu', 'Giờ nộp', 'Thời gian làm bài', 'MCQ Đúng', 'Điểm MCQ', 'Điểm TF', 'Tổng điểm', 'Trạng thái', 'Rời tab', 'Ghi chú'];
    const rows = filteredResults.map((r, i) => [
      i + 1,
      r.attemptId,
      r.studentId,
      `"${r.fullName}"`,
      r.className,
      r.grade,
      r.examCode,
      r.submittedTime ? r.submittedTime.split('T')[0] : '',
      r.startTime ? new Date(r.startTime).toLocaleTimeString('vi-VN') : '',
      r.submittedTime ? new Date(r.submittedTime).toLocaleTimeString('vi-VN') : '',
      r.durationSeconds ? `${Math.floor(r.durationSeconds / 60)}p ${r.durationSeconds % 60}s` : '',
      r.mcqCorrectCount ?? 0,
      r.mcqScore ?? 0,
      r.tfScore ?? 0,
      r.totalScore ?? 0,
      r.status,
      r.leaveTabCount ?? 0,
      `"${r.scoreAdjustmentReason || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_Tin12_GK1_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Google Apps Script code
  const handleCopyScript = () => {
    fetch('/public/google-apps-script.js')
      .then(r => r.text())
      .then(code => {
        navigator.clipboard.writeText(code);
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2500);
      })
      .catch(() => {
        alert('Vui lòng mở file /public/google-apps-script.js để xem mã nguồn.');
      });
  };

  // Add single student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId.trim() || !newFullName.trim()) return;
    try {
      const data = await apiClient.addStudent({
        studentId: newStudentId.trim().toUpperCase(),
        fullName: newFullName.trim(),
        className: newClassName.trim().toUpperCase(),
        grade: 12
      });
      if (data.success) {
        setShowAddStudentModal(false);
        setNewStudentId('');
        setNewFullName('');
        fetchAllData();
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Bulk import students
  const handleImportStudents = async () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const parsed: Array<{ studentId: string; fullName: string; className: string; grade: number }> = [];

    for (const line of lines) {
      const parts = line.split(/[,\t;]/).map(p => p.trim());
      if (parts.length >= 2) {
        const studentId = parts[0];
        const fullName = parts[1];
        const className = parts[2] || '11A1';
        parsed.push({
          studentId,
          fullName,
          className,
          grade: 11
        });
      }
    }

    if (parsed.length === 0) {
      alert('Không thể nhận diện định dạng dữ liệu (Mã HS, Họ tên, Lớp)');
      return;
    }

    try {
      const data = await apiClient.importStudents(parsed);
      if (data.success) {
        setShowImportModal(false);
        setImportText('');
        alert(`Đã nhập thành công ${data.count} học sinh!`);
        fetchAllData();
      }
    } catch (e: any) {
      alert('Lỗi nhập danh sách: ' + e.message);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm(`Xác nhận xóa học sinh có mã ${studentId}?`)) return;
    try {
      await apiClient.deleteStudent(studentId);
      fetchAllData();
    } catch (e) {
      alert('Lỗi xóa học sinh');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar for Teacher Portal */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            Cổng quản trị dành cho Giáo viên
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-0.5">
            BẢNG ĐIỀU KHIỂN KHẢO THÍ & CHẤM ĐIỂM
          </h2>
          <p className="text-xs text-slate-500">
            Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Thoát quản trị</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 gap-1 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('results')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'results'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quản lý kết quả ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Thống kê & Báo cáo</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách học sinh ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Đề thi & Cấu hình</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Tích hợp Google Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Nhật ký (NHAT_KY)</span>
        </button>
      </div>

      {/* ================= TAB 1: KẾT QUẢ BÀI THI ================= */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Controls: Search, Filter, Sort, Export */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Tab Toggle: All vs Live */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tất cả bài nộp
                </button>
                <button
                  onClick={() => setStatusFilter('LIVE')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'LIVE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Activity className={`w-3 h-3 ${statusFilter === 'LIVE' ? 'animate-pulse' : ''}`} />
                  Giám sát Live ({results.filter(r => r.status === 'in_progress').length})
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên hoặc mã học sinh..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Class Filter */}
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="ALL">Tất cả lớp</option>
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Exam Code Filter */}
              <select
                value={codeFilter}
                onChange={e => setCodeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="ALL">Tất cả mã đề</option>
                <option value="101">Mã đề 101</option>
                <option value="102">Mã đề 102</option>
                <option value="103">Mã đề 103</option>
                <option value="104">Mã đề 104</option>
              </select>

              {/* Sort score */}
              {statusFilter === 'ALL' && (
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Điểm: {sortOrder === 'desc' ? 'Cao -> Thấp' : 'Thấp -> Cao'}</span>
                </button>
              )}
            </div>

            {/* Actions: Export CSV & Print */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV / Excel</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In bảng điểm</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Mã HS</th>
                    <th className="py-3 px-3 text-center">Lớp</th>
                    <th className="py-3 px-3 text-center">Mã đề</th>
                    <th className="py-3 px-3 text-center">{statusFilter === 'LIVE' ? 'Bắt đầu' : 'MCQ (6đ)'}</th>
                    <th className="py-3 px-3 text-center">{statusFilter === 'LIVE' ? 'Tiến độ' : 'TF (4đ)'}</th>
                    <th className="py-3 px-3 text-center">{statusFilter === 'LIVE' ? 'Trạng thái' : 'Tổng điểm'}</th>
                    <th className="py-3 px-3 text-center">Rời tab</th>
                    <th className="py-3 px-3 text-center">{statusFilter === 'LIVE' ? 'Cập nhật' : 'Thời gian nộp'}</th>
                    <th className="py-3 px-3 text-center">Google Sheets</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        {statusFilter === 'LIVE' ? 'Không có học sinh nào đang làm bài.' : 'Chưa có bài thi nào được nộp hoặc không khớp với bộ lọc.'}
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, idx) => (
                      <tr key={r.attemptId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{r.fullName}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{r.studentId}</td>
                        <td className="py-3 px-3 text-center font-bold text-blue-700">{r.className}</td>
                        <td className="py-3 px-3 text-center font-bold text-purple-700">{r.examCode}</td>
                        
                        {statusFilter === 'LIVE' ? (
                          <>
                            <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                              {r.startTime ? new Date(r.startTime).toLocaleTimeString('vi-VN') : '—'}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500">
                                  {Object.keys(r.mcqAnswers || {}).length}/24 MCQ
                                </span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all" 
                                    style={{ width: `${(Object.keys(r.mcqAnswers || {}).length / 24) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] animate-pulse">
                                Đang làm bài...
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-3 text-center text-slate-700 font-medium">{r.mcqScore?.toFixed(2)}</td>
                            <td className="py-3 px-3 text-center text-slate-700 font-medium">{r.tfScore?.toFixed(2)}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2.5 py-1 rounded-md font-black text-sm ${
                                (r.totalScore ?? 0) >= 8.0 ? 'bg-emerald-100 text-emerald-800' :
                                (r.totalScore ?? 0) >= 5.0 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {r.totalScore?.toFixed(2)}
                              </span>
                              {r.scoreAdjusted && (
                                <span className="block text-[10px] text-amber-600 mt-0.5" title={r.scoreAdjustmentReason}>
                                  *Đã chỉnh
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        <td className="py-3 px-3 text-center">
                          {r.leaveTabCount > 0 ? (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              r.leaveTabCount >= 3 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.leaveTabCount} lần
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                          {statusFilter === 'LIVE' 
                            ? (r.submittedTime ? new Date(r.submittedTime).toLocaleTimeString('vi-VN') : 'Vừa xong')
                            : (r.submittedTime ? new Date(r.submittedTime).toLocaleTimeString('vi-VN') : '—')
                          }
                        </td>
                        <td className="py-3 px-3 text-center">
                          {r.syncedToGoogleSheets ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                              {statusFilter === 'LIVE' ? 'Chờ nộp...' : 'Cục bộ'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewDetail(r.attemptId)}
                              title="Xem chi tiết bài làm"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setAdjustScoreModal({
                                  attemptId: r.attemptId,
                                  studentName: r.fullName,
                                  currentScore: r.totalScore ?? 0
                                });
                                setAdjustNewScore((r.totalScore ?? 0).toString());
                              }}
                              title="Điều chỉnh điểm"
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAllowRetake(r.attemptId, r.fullName)}
                              title="Cho phép làm lại"
                              className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: THỐNG KÊ & BÁO CÁO ================= */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Học sinh đã làm bài</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats.completedCount} <span className="text-xs text-slate-400 font-normal">/ {stats.totalStudents}</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-1">
                Tỷ lệ tham gia: {Math.round((stats.completedCount / Math.max(1, stats.totalStudents)) * 100)}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Điểm trung bình</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {stats.averageScore.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Cao nhất: {stats.maxScore} • Thấp nhất: {stats.minScore}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Tỷ lệ đạt (≥ 5.0)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {stats.passRate}%
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                {Math.round((stats.passRate * stats.completedCount) / 100)} học sinh đạt
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Tỷ lệ chưa đạt (&lt; 5.0)</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {100 - stats.passRate}%
              </div>
              <div className="text-[11px] text-rose-700 mt-1">
                {stats.completedCount - Math.round((stats.passRate * stats.completedCount) / 100)} học sinh
              </div>
            </div>
          </div>

          {/* Stats by Class Table */}
          {stats.byClass && Object.keys(stats.byClass).length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Thống kê chi tiết theo từng lớp
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="py-2 px-3">Lớp</th>
                      <th className="py-2 px-3 text-center">Sĩ số</th>
                      <th className="py-2 px-3 text-center">Đã thi</th>
                      <th className="py-2 px-3 text-center">Điểm TB</th>
                      <th className="py-2 px-3 text-center">Tỷ lệ đạt</th>
                      <th className="py-2 px-3">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(stats.byClass).map(([cls, data]: [string, any]) => (
                      <tr key={cls} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-blue-700">{cls}</td>
                        <td className="py-2.5 px-3 text-center font-medium text-slate-600">{data.total}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{data.completed}</td>
                        <td className="py-2.5 px-3 text-center font-black text-slate-900">{data.avg}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${data.passRate >= 80 ? 'text-emerald-600' : data.passRate >= 50 ? 'text-blue-600' : 'text-rose-600'}`}>
                            {data.passRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 w-40">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${data.completed === data.total ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.round((data.completed / data.total) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Score distribution histogram */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Phổ điểm bài thi (Phân bố tần số điểm)
            </h3>
            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 pb-2 border-b border-slate-200">
              {[
                { range: '0 - <2', count: stats.distribution['0-2'], color: 'bg-red-400' },
                { range: '2 - <4', count: stats.distribution['2-4'], color: 'bg-rose-400' },
                { range: '4 - <5', count: stats.distribution['4-5'], color: 'bg-amber-400' },
                { range: '5 - <6.5', count: stats.distribution['5-6.5'], color: 'bg-blue-400' },
                { range: '6.5 - <8', count: stats.distribution['6.5-8'], color: 'bg-indigo-500' },
                { range: '8 - 10', count: stats.distribution['8-10'], color: 'bg-emerald-500' }
              ].map(bar => {
                const maxBar = Math.max(1, ...Object.values(stats.distribution) as number[]);
                const heightPct = Math.max(12, Math.round((bar.count / maxBar) * 100));
                return (
                  <div key={bar.range} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-xs font-bold text-slate-700">{bar.count}</span>
                    <div 
                      className={`w-full rounded-t-lg ${bar.color} transition-all duration-300 min-h-[12px]`}
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="text-[11px] font-medium text-slate-500 text-center whitespace-nowrap">{bar.range}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardest Questions Analysis */}
          {stats.hardestQuestions && stats.hardestQuestions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Các câu hỏi có tỷ lệ học sinh làm sai cao nhất
              </h3>
              <div className="space-y-2.5">
                {stats.hardestQuestions.map((q: any, i: number) => (
                  <div key={q.questionId} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <span className="font-bold text-blue-700 mr-2">Top {i + 1} ({q.questionId}):</span>
                      <span className="text-slate-800">{q.text}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-black text-rose-600 text-sm">{q.errorRate}% sai</span>
                      <span className="block text-[10px] text-slate-400">({q.wrongCount}/{q.total} bài)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: DANH SÁCH HỌC SINH ================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Tổng số học sinh trong cơ sở dữ liệu: <strong className="text-slate-900 font-bold">{students.length}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm học sinh</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nhập danh sách (CSV / Text)</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Mã học sinh</th>
                  <th className="py-3 px-3">Họ và tên</th>
                  <th className="py-3 px-3 text-center">Lớp</th>
                  <th className="py-3 px-3 text-center">Khối</th>
                  <th className="py-3 px-3 text-center">Trạng thái thi</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.studentId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700">{s.className}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">Khối {s.grade}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Đã nộp bài' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'Đang làm bài' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={async () => {
                            const res = await apiClient.resetPasscode(s.studentId);
                            if (res.success && res.passcode) {
                              setStudentPasscodeModal({
                                studentId: s.studentId,
                                fullName: s.fullName,
                                passcode: res.passcode
                              });
                            } else {
                              alert('Lỗi: ' + (res.error || 'Không thể cấp mã'));
                            }
                          }}
                          title="Cấp lại mã đăng nhập"
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.studentId)}
                          title="Xóa học sinh"
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: HIỂN THỊ MÃ ĐĂNG NHẬP MỚI ================= */}
      {studentPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-blue-200 text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">MÃ ĐĂNG NHẬP MỚI</h3>
              <p className="text-sm text-slate-500">
                Cấp cho học sinh: <strong>{studentPasscodeModal.fullName}</strong>
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div className="text-4xl font-black text-blue-700 tracking-widest font-mono">
                {studentPasscodeModal.passcode}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tighter">
                Vui lòng chép mã này cho học sinh
              </div>
            </div>

            <button
              onClick={() => setStudentPasscodeModal(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Đã ghi lại - Đóng
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: ĐỀ THI & CẤU HÌNH ================= */}
      {activeTab === 'exams' && config && (
        <div className="space-y-6">
          {/* General Exam Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Cấu hình phiên thi & Trạng thái kỳ thi
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-medium">Trạng thái kỳ thi:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveConfig({ isOpen: !config.isOpen })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      config.isOpen
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-red-600 text-white shadow-xs'
                    }`}
                  >
                    {config.isOpen ? 'ĐANG MỞ THI' : 'ĐANG ĐÓNG THI'}
                  </button>
                  <span className="text-[11px] text-slate-500">
                    {config.isOpen ? '(Học sinh có thể vào thi)' : '(Khóa không cho vào thi)'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-medium">Thời gian làm bài:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    defaultValue={config.durationMinutes}
                    onBlur={(e) => handleSaveConfig({ durationMinutes: Number(e.target.value) })}
                    className="w-20 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                  <span className="text-xs font-semibold text-slate-700">phút</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-medium">Hiển thị điểm cho học sinh:</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <button
                    onClick={() => handleSaveConfig({ showScoreImmediately: !config.showScoreImmediately })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                      config.showScoreImmediately
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    {config.showScoreImmediately ? 'Hiện điểm sau khi nộp' : 'Ẩn điểm làm bài (Đang chọn)'}
                  </button>
                  <span className="text-[11px] text-slate-500">
                    {config.showScoreImmediately 
                      ? 'Học sinh sẽ thấy điểm tổng và phân tích câu sau khi nộp bài.' 
                      : 'Học sinh không nhìn thấy điểm sau nộp; chỉ giáo viên xem được điểm.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Codes Bank Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Xem trước các mã đề thi chính thức (101, 102, 103, 104)
              </h3>

              <div className="flex items-center gap-1.5">
                {['101', '102', '103', '104'].map(code => (
                  <button
                    key={code}
                    onClick={() => setPreviewExamCode(code)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                      previewExamCode === code
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mã đề {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Selected Exam */}
            {(() => {
              const currentExam = exams.find(e => e.code === previewExamCode) || exams[0];
              if (!currentExam) return null;
              return (
                <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50 max-h-[600px] overflow-y-auto">
                  <div className="font-extrabold text-blue-900 text-sm border-b pb-2 flex flex-wrap items-center justify-between gap-2">
                    <span>{currentExam.title} (Thời gian: {currentExam.durationMinutes} phút • Tổng: 10 điểm)</span>
                    {currentExam.pdfUrl && (
                      <a
                        href={currentExam.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>Xem tệp PDF gốc</span>
                      </a>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-700">
                    Phần I: 24 câu MCQ (Đáp án đúng màu xanh)
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    {currentExam.mcqQuestions.map(q => (
                      <div key={q.id} className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                        <div className="font-semibold text-slate-900">
                          Câu {q.number}. {q.text}
                        </div>
                        <div className="space-y-1 pl-2">
                          {q.options.map(opt => (
                            <div 
                              key={opt.key}
                              className={`p-1.5 rounded flex items-center gap-1.5 ${opt.key === q.correctOption ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'text-slate-600'}`}
                            >
                              {opt.key === q.correctOption && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-slate-700 pt-3 border-t">
                    Phần II: 4 câu Đúng / Sai (TF)
                  </div>
                  <div className="space-y-3 text-xs">
                    {currentExam.tfQuestions.map(q => (
                      <div key={q.id} className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900">
                          Câu {q.number}. {q.context}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.items.map(item => (
                            <div key={item.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                              <span>{item.text}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.correctValue ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {item.correctValue ? 'Đúng' : 'Sai'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= TAB 5: TÍCH HỢP GOOGLE SHEETS ================= */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-700 text-emerald-200 text-xs font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Kết nối Google Sheets & Google Apps Script
              </div>
              <h3 className="text-lg font-black">
                TÍCH HỢP GOOGLE SHEETS CHÍNH THỨC
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Hệ thống lưu trực tiếp kết quả, chi tiết bài làm của từng thí sinh vào Google Sheets theo 7 worksheet chuẩn quy định.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSheetsGuide}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
              >
                Hướng dẫn từng bước
              </button>

              <button
                onClick={handleCopyScript}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-yellow-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Đã sao chép mã!' : 'Copy mã Apps Script'}</span>
              </button>
            </div>
          </div>

          {/* Connection Test & Config Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900">
              Kiểm tra & Cấu hình Web App Google Sheets
            </h4>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL ỨNG DỤNG WEB GOOGLE APPS SCRIPT (WEB APP URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={testUrl}
                  onChange={e => setTestUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  URL nhận được sau khi bấm &quot;Triển khai mới&quot; -&gt; &quot;Ứng dụng web&quot; với quyền &quot;Bất kỳ ai&quot; (Anyone).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  MÃ BẢO MẬT ĐỒNG BỘ (SHARED SECRET KEY)
                </label>
                <input
                  type="text"
                  value={testKey}
                  onChange={e => setTestKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleTestGoogleSheets}
                  disabled={testingConnection || !testUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối Google Sheets'}</span>
                </button>

                <button
                  onClick={() => handleSaveConfig({ googleSheetWebAppUrl: testUrl.trim(), googleSheetSecretKey: testKey.trim() })}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Lưu cấu hình
                </button>

                <button
                  onClick={handleSyncAllToSheets}
                  disabled={syncingAll}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
                  <span>Đồng bộ tất cả bài thi</span>
                </button>
              </div>

              {syncAllMsg && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                  {syncAllMsg}
                </div>
              )}
            </div>

            {/* Diagnostic Results Box */}
            {connectionTestResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                connectionTestResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
              }`}>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  {connectionTestResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Xác thực thành công! Phản hồi từ Google Apps Script:</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Kết nối thất bại:</span>
                    </>
                  )}
                </div>

                {connectionTestResult.success ? (
                  <div className="space-y-1.5 pt-1">
                    <div>• Tên bảng tính: <strong>{connectionTestResult.data.spreadsheetName}</strong></div>
                    <div>• Thời gian phản hồi mạng: <strong>{connectionTestResult.latencyMs} ms</strong></div>
                    <div>• Các worksheet đã sẵn sàng: <strong className="text-emerald-700">{connectionTestResult.data.sheets.join(', ')}</strong></div>
                    {connectionTestResult.data.missingSheets?.length > 0 && (
                      <div className="text-amber-700">• Còn thiếu: {connectionTestResult.data.missingSheets.join(', ')}</div>
                    )}
                  </div>
                ) : (
                  <div>{typeof connectionTestResult.error === 'string' ? connectionTestResult.error : (connectionTestResult.error?.message || JSON.stringify(connectionTestResult.error || ''))}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 6: NHẬT KÝ HỆ THỐNG ================= */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Nhật ký kiểm toán & Giám sát (Worksheet NHAT_KY)
            </h3>
            <span className="text-xs text-slate-500">{logs.length} bản ghi</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 text-xs">
            {logs.map(log => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                      log.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.eventType}
                    </span>
                    <span className="text-slate-800 font-medium">{log.details}</span>
                  </div>
                  {log.studentId && (
                    <div className="text-[11px] text-slate-400">
                      Mã HS: {log.studentId} {log.attemptId && `• Mã lượt thi: ${log.attemptId}`}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: XEM BÀI LÀM CHI TIẾT CỦA THÍ SINH ================= */}
      {selectedAttemptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-blue-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  BÀI LÀM CHI TIẾT: {selectedAttemptDetail.attempt.fullName}
                </h3>
                <p className="text-xs text-blue-200">
                  Lớp: {selectedAttemptDetail.attempt.className} • Mã đề: {selectedAttemptDetail.attempt.examCode} • Điểm: {selectedAttemptDetail.attempt.totalScore?.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptDetail(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* MCQ Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm border-b pb-1">
                  Phần I: 24 câu MCQ (Điểm: {selectedAttemptDetail.attempt.mcqScore?.toFixed(2)} / 6.0)
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedAttemptDetail.exam.mcqQuestions.map(q => {
                    const studentAns = selectedAttemptDetail.attempt.mcqAnswers[q.id];
                    const isCorrect = studentAns === q.correctOption;
                    return (
                      <div key={q.id} className={`p-3 rounded-xl border ${
                        isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                      }`}>
                        <div className="font-semibold text-slate-800">
                          Câu {q.number}. {q.text}
                        </div>
                        <div className="mt-1 flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                          <span>
                            HS chọn: <strong className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>{studentAns || 'Chưa chọn'}</strong>
                          </span>
                          <span>
                            Đáp án chuẩn: <strong className="text-emerald-700 font-bold">{q.correctOption}</strong>
                          </span>
                          <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isCorrect ? '+0.25đ' : '0.00đ'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TF Breakdown */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-bold text-slate-900 text-sm border-b pb-1">
                  Phần II: 4 câu Đúng/Sai (Điểm: {selectedAttemptDetail.attempt.tfScore?.toFixed(2)} / 4.0)
                </h4>
                <div className="space-y-4">
                  {selectedAttemptDetail.exam.tfQuestions.map(q => {
                    const tfAns = selectedAttemptDetail.attempt.tfAnswers[q.id] || {};
                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <div className="font-bold text-slate-900">
                          Câu {q.number}. {q.context}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.items.map(item => {
                            const val = tfAns[item.id];
                            const isMatch = val === item.correctValue;
                            return (
                              <div key={item.id} className={`p-2 rounded-lg border ${
                                isMatch ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                              }`}>
                                <div className="text-slate-800">
                                  {item.text}
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[11px]">
                                  <span>HS chọn: <strong>{val === undefined ? 'Chưa chọn' : val ? 'Đúng' : 'Sai'}</strong></span>
                                  <span>Chuẩn: <strong>{item.correctValue ? 'Đúng' : 'Sai'}</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ĐIỀU CHỈNH ĐIỂM ================= */}
      {adjustScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Điều chỉnh điểm: {adjustScoreModal.studentName}
            </h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Điểm mới (0.0 đến 10.0):</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={adjustNewScore}
                onChange={e => setAdjustNewScore(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lý do điều chỉnh (Bắt buộc để lưu nhật ký):</label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Phúc khảo câu 3 TF do mạng chập chờn..."
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustScoreModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustScore}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
              >
                Lưu điều chỉnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM HỌC SINH ================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddStudent} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Thêm học sinh mới</h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã học sinh:</label>
              <input
                type="text"
                required
                placeholder="HS120111"
                value={newStudentId}
                onChange={e => setNewStudentId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và tên:</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={newFullName}
                onChange={e => setNewFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lớp:</label>
              <input
                type="text"
                required
                placeholder="11A1"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Lưu học sinh
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: NHẬP DANH SÁCH ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Nhập danh sách học sinh hàng loạt</h3>
            <p className="text-slate-500">
              Dán dữ liệu từ Excel / Sheets với cấu trúc: <code>Mã HS, Họ tên, Lớp</code> (mỗi học sinh 1 dòng)
            </p>
            <textarea
              rows={8}
              placeholder={`HS110111, Lê Văn Hùng, 11A1\nHS110112, Trần Thị Mai, 11A1`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full p-3 border rounded-xl font-mono text-[11px]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleImportStudents}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Bắt đầu nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
