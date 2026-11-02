import { 
  ExamConfig, 
  ExamAttempt, 
  Student, 
  AuditLogEntry, 
  ExamVersion 
} from '../types/exam';

const TEACHER_TOKEN_KEY = 'gvr_teacher_auth_token';

// Helper to get stored teacher session token
function getTeacherToken(): string | null {
  try {
    return sessionStorage.getItem(TEACHER_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setTeacherToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(TEACHER_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TEACHER_TOKEN_KEY);
    }
  } catch {}
}

/**
 * Universal Secure API Client for KTTX11 PRO v2.0
 * 
 * BẢO MẬT TUYỆT ĐỐI THEO NGUYÊN TẮC:
 * 1. Không import OFFICIAL_EXAMS hay đáp án chuẩn vào frontend.
 * 2. Không chứa mật khẩu quản trị hay khóa bí mật Google Sheets.
 * 3. Chấm điểm 100% tại máy chủ backend qua /api/exam/submit.
 * 4. Không dùng localStorage để lưu điểm chính thức hay giả lập thành công.
 * 5. Báo lỗi thật khi mất kết nối máy chủ để giáo viên phòng máy xử lý.
 */
export const apiClient = {
  // 1. Lấy cấu hình kỳ thi công khai từ Backend
  async getConfig(): Promise<ExamConfig> {
    try {
      const res = await fetch('/api/config', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      throw new Error(`Máy chủ cấu hình phản hồi mã lỗi ${res.status}`);
    } catch (err: any) {
      console.error('[apiClient.getConfig] Lỗi tải cấu hình:', err);
      // Trả về cấu hình mặc định an toàn (Khóa đề) khi chưa kết nối được
      return {
        academicYear: '2026-2027',
        schoolName: 'Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực',
        examTitle: 'KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2026 - 2027',
        subject: 'Tin học 11',
        durationMinutes: 45,
        isOpen: false, // Mặc định khóa nếu không kết nối được backend
        allowRetake: false,
        showScoreImmediately: false,
        showCorrectAnswersAfterSubmit: false,
        allowedGrades: [10, 11, 12],
        allowedExamCodes: ['101', '102', '103', '104']
      };
    }
  },

  // 2. Khóa / Mở đề thi với mật khẩu giáo viên (Xác thực tại Server)
  async toggleExamLock(password: string, isOpen?: boolean): Promise<{ success: boolean; isOpen: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/exam/toggle-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ password, isOpen }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && typeof data.isOpen === 'boolean') {
        return {
          success: true,
          isOpen: data.isOpen,
          message: data.message || `Đã ${data.isOpen ? 'MỞ' : 'KHÓA'} đề thi thành công!`
        };
      }

      if (res.status === 401) {
        return {
          success: false,
          isOpen: false,
          error: data?.error || 'Mật khẩu giáo viên không chính xác. Vui lòng kiểm tra lại.'
        };
      }

      return {
        success: false,
        isOpen: false,
        error: data?.error || `Lỗi máy chủ (${res.status}): Không thể đổi trạng thái khóa đề thi.`
      };
    } catch (err: any) {
      return {
        success: false,
        isOpen: false,
        error: `Không thể kết nối đến máy chủ quản trị: ${err.message || 'Mất kết nối mạng'}`
      };
    }
  },

  // 3. Xác thực học sinh trước khi vào phòng thi (Chống thi trùng)
  async verifyStudent(payload: {
    studentId: string;
    passcode: string;
    examCode: string;
    fullName?: string;
    className?: string;
    grade?: number;
  }): Promise<{ success: boolean; student?: Student; error?: string; alreadySubmitted?: boolean }> {
    try {
      const res = await fetch('/api/students/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        return data;
      }

      if (res.status === 403) {
        return {
          success: false,
          error: data?.error || 'Kỳ kiểm tra hiện đang ĐÓNG hoặc bạn đã nộp bài trước đó.',
          alreadySubmitted: Boolean(data?.alreadySubmitted)
        };
      }

      return {
        success: false,
        error: data?.error || 'Không thể xác thực thông tin học sinh. Vui lòng kiểm tra lại.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Lỗi kết nối máy chủ xác thực: ${err.message}. Vui lòng báo giám thị phòng máy.`
      };
    }
  },

  // 4. Bắt đầu lượt thi và nhận đề thi BẢO MẬT (Máy chủ đã bóc tách toàn bộ đáp án)
  async startExam(payload: {
    studentId: string;
    fullName: string;
    className: string;
    grade: number;
    examCode: string;
  }): Promise<{
    success: boolean;
    attemptId: string;
    startTime: string;
    expiresAt: string;
    durationMinutes: number;
    exam: any;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.exam) {
        return data;
      }

      if (res.status === 403) {
        return {
          success: false,
          attemptId: '',
          startTime: '',
          expiresAt: '',
          durationMinutes: 45,
          exam: null,
          error: data?.error || 'Kỳ kiểm tra hiện đang ĐÓNG. Vui lòng liên hệ giáo viên phụ trách.'
        };
      }

      return {
        success: false,
        attemptId: '',
        startTime: '',
        expiresAt: '',
        durationMinutes: 45,
        exam: null,
        error: data?.error || 'Máy chủ không thể phát đề thi. Vui lòng thử lại.'
      };
    } catch (err: any) {
      return {
        success: false,
        attemptId: '',
        startTime: '',
        expiresAt: '',
        durationMinutes: 45,
        exam: null,
        error: `Không thể kết nối máy chủ phòng thi: ${err.message}. Vui lòng kiểm tra mạng LAN phòng máy.`
      };
    }
  },

  // 5. Lưu tiến độ làm bài tạm thời lên máy chủ (Chống rớt mạng / mất điện)
  async saveProgress(payload: {
    attemptId: string;
    mcqAnswers: any;
    tfAnswers: any;
    flaggedQuestionIds: string[];
    leaveTabCount: number;
  }): Promise<{ success: boolean; savedAt?: string; error?: string }> {
    try {
      const res = await fetch('/api/exam/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({ success: true }));
        return data;
      }
      return { success: false, error: 'Máy chủ bận' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 6. Ghi nhận vi phạm chống gian lận (Rời tab / Mất tiêu điểm / Chống chuột phải)
  async logEvent(payload: { attemptId: string; eventType: string; details: string }): Promise<{ success: boolean; count?: number }> {
    try {
      const res = await fetch('/api/exam/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({ success: true, count: 0 }));
        return data;
      }
      return { success: false, count: 0 };
    } catch {
      return { success: false, count: 0 };
    }
  },

  // 7. NỘP BÀI THI & CHẤM ĐIỂM ĐỘC QUYỀN TẠI MÁY CHỦ BACKEND (SERVER-SIDE GRADING)
  async submitExam(payload: {
    attemptId: string;
    examCode: string;
    mcqAnswers: { [qId: string]: 'A' | 'B' | 'C' | 'D' };
    tfAnswers: { [qId: string]: { [item: string]: boolean } };
    leaveTabCount: number;
  }): Promise<{
    success: boolean;
    attemptId: string;
    fullName?: string;
    studentId?: string;
    className?: string;
    examCode?: string;
    submittedTime?: string;
    durationSeconds?: number;
    leaveTabCount?: number;
    syncedToGoogleSheets?: boolean;
    googleSheetsError?: string;
    showScore?: boolean;
    totalScore?: number;
    mcqScore?: number;
    tfScore?: number;
    mcqCorrectCount?: number;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        return data;
      }

      throw new Error(data?.error || `Máy chủ chấm thi trả về lỗi ${res.status}`);
    } catch (err: any) {
      console.error('[apiClient.submitExam] Lỗi nộp bài tại máy chủ:', err);
      // Báo lỗi thật để học sinh gọi giám thị, KHÔNG tự chấm giả lập ở frontend
      return {
        success: false,
        attemptId: payload.attemptId,
        examCode: payload.examCode,
        leaveTabCount: payload.leaveTabCount,
        error: `Không thể kết nối máy chủ chấm thi: ${err.message}. Bài làm đã được lưu tạm. Vui lòng giữ nguyên màn hình và báo ngay cho giám thị phòng thi!`
      };
    }
  },

  // 8. Đăng nhập Giáo viên Quản trị qua Google (OAuth)
  async adminGoogleAuth(idToken: string): Promise<{ success: boolean; token?: string; email?: string; fullName?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.token) {
        setTeacherToken(data.token);
        return data;
      }

      return {
        success: false,
        error: data?.error || 'Xác thực Google thất bại hoặc email không được cấp quyền.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Lỗi kết nối máy chủ: ${err.message || 'Mất kết nối'}`
      };
    }
  },

  // 8b. Đăng xuất Giáo viên
  async logout(): Promise<{ success: boolean }> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: this.getAdminHeaders()
      });
    } catch {}
    setTeacherToken(null);
    return { success: true };
  },

  // 8c. Đăng nhập Giáo viên dự phòng (Mật khẩu cũ)
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ password }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.token) {
        setTeacherToken(data.token);
        return data;
      }

      return {
        success: false,
        error: data?.error || 'Mật khẩu giáo viên không chính xác.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Lỗi kết nối máy chủ: ${err.message || 'Mất kết nối'}`
      };
    }
  },

  // Helper tạo header cho các yêu cầu quản trị
  getAdminHeaders(): HeadersInit {
    const token = getTeacherToken() || 'ADMIN_AUTH_TOKEN_SECURE';
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  },

  // 9. Lấy danh sách kết quả tất cả học sinh (Yêu cầu quyền giáo viên)
  async getResults(): Promise<{ success: boolean; results: ExamAttempt[]; totalCount: number; submittedCount: number; error?: string }> {
    try {
      const res = await fetch('/api/admin/results', {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return data;
      }

      return {
        success: false,
        results: [],
        totalCount: 0,
        submittedCount: 0,
        error: data?.error || `Lỗi tải danh sách kết quả (${res.status})`
      };
    } catch (err: any) {
      return {
        success: false,
        results: [],
        totalCount: 0,
        submittedCount: 0,
        error: `Không thể kết nối máy chủ: ${err.message}`
      };
    }
  },

  // 10. Xem bài làm chi tiết của 1 học sinh (đối chiếu đáp án chuẩn tại máy chủ)
  async getAttemptDetail(attemptId: string): Promise<{ success: boolean; attempt?: ExamAttempt; exam?: ExamVersion; error?: string }> {
    try {
      const res = await fetch(`/api/admin/attempt/${encodeURIComponent(attemptId)}`, {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return data;
      }

      return { success: false, error: data?.error || 'Không tìm thấy bài làm' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 11. Giáo viên điều chỉnh điểm (Kèm nhật ký kiểm toán tại máy chủ)
  async adjustScore(payload: { attemptId: string; newScore: number; reason: string; teacherName: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/results/adjust', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true };
      }

      return { success: false, error: data?.error || 'Không thể điều chỉnh điểm' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 12. Cho phép học sinh làm lại bài (Xóa lượt thi cũ tại máy chủ)
  async allowRetake(attemptId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/results/allow-retake', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify({ attemptId }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, message: data.message };
      }

      return { success: false, error: data?.error || 'Không thể cấp quyền làm lại' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 13. Quản lý danh sách học sinh (CRUD tại máy chủ)
  async getStudents(): Promise<{ success: boolean; students: Student[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/students', {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, students: data.students || [] };
      }

      return { success: false, students: [], error: data?.error || 'Không thể tải danh sách học sinh' };
    } catch (err: any) {
      return { success: false, students: [], error: err.message };
    }
  },

  async addStudent(payload: { studentId: string; fullName: string; className: string; grade: number }): Promise<{ success: boolean; students?: Student[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return data;
      }
      return { success: false, error: data?.error || 'Không thể lưu học sinh' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async importStudents(importedList: Array<{ studentId: string; fullName: string; className: string; grade: number }>): Promise<{ success: boolean; count?: number; students?: Student[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify({ students: importedList }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return data;
      }
      return { success: false, error: data?.error || 'Lỗi nhập danh sách học sinh' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/admin/students/${encodeURIComponent(studentId)}`, {
        method: 'DELETE',
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true };
      }
      return { success: false, error: data?.error || 'Không thể xóa học sinh' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 14. Lấy danh sách đề thi gốc từ máy chủ (Chỉ dành cho giáo viên)
  async getExams(): Promise<{ success: boolean; exams: ExamVersion[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/exams', {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, exams: data.exams || [] };
      }
      return { success: false, exams: [], error: data?.error || 'Không thể tải đề thi' };
    } catch (err: any) {
      return { success: false, exams: [], error: err.message };
    }
  },

  // 15. Lấy và lưu cấu hình kỳ thi quản trị
  async getAdminConfig(): Promise<{ success: boolean; config?: ExamConfig; error?: string }> {
    try {
      const res = await fetch('/api/admin/config', {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(8000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, config: data.config };
      }
      return { success: false, error: data?.error || 'Không thể tải cấu hình quản trị' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async saveAdminConfig(updated: Partial<ExamConfig>): Promise<{ success: boolean; config?: ExamConfig; error?: string }> {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify(updated),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, config: data.config };
      }
      return { success: false, error: data?.error || 'Không thể lưu cấu hình' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 16. Kiểm tra kết nối Google Sheets (thực hiện qua máy chủ Backend bảo mật)
  async testGoogleSheets(targetUrl?: string, key?: string): Promise<{ success: boolean; latencyMs?: number; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/sheets/test', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify({ webAppUrl: targetUrl, secretKey: key }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, latencyMs: data.latencyMs, data: data.data };
      }
      return { success: false, error: data?.error || 'Kiểm tra kết nối thất bại' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Mất kết nối máy chủ' };
    }
  },

  // 17. Đồng bộ thủ công tất cả bài thi sang Google Sheets
  async syncAllToSheets(): Promise<{ success: boolean; total?: number; synced?: number; failed?: number; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/sheets/sync-all', {
        method: 'POST',
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(30000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return data;
      }
      return { success: false, error: data?.error || 'Đồng bộ thất bại' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 18. Lấy nhật ký kiểm toán hệ thống
  async getLogs(): Promise<{ success: boolean; logs: AuditLogEntry[]; error?: string }> {
    try {
      const res = await fetch('/api/admin/logs', {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, logs: data.logs || [] };
      }
      return { success: false, logs: [], error: data?.error || 'Không thể tải nhật ký' };
    } catch (err: any) {
      return { success: false, logs: [], error: err.message };
    }
  },

  // 19. Lấy thống kê chuyên sâu kết quả kỳ thi
  async getStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        return { success: true, stats: data.stats };
      }
      return { success: false, error: data?.error || 'Không thể tải số liệu thống kê' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
