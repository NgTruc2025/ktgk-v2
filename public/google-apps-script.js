/**
 * HỆ THỐNG KIỂM TRA GIỮA HỌC KỲ I - TIN HỌC THPT
 * TRƯỜNG THPT GIÁ RAI - PHÂN HIỆU NGUYỄN TRUNG TRỰC
 * 
 * GOOGLE APPS SCRIPT BACKEND & GOOGLE SHEETS CONNECTOR
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Sheets mới (hoặc bảng tính hiện tại).
 * 2. Đặt tên bảng tính: "KET_QUA_KIEM_TRA_TIN_12_THPT_GIA_RAI"
 * 3. Vào Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa toàn bộ mã mặc định và dán toàn bộ nội dung file này vào.
 * 5. Chạy hàm `setupSheets()` một lần đầu tiên để tự động tạo 7 Worksheet chuẩn.
 * 6. Nhấn "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 * 7. Chọn loại: "Ứng dụng web" (Web app).
 * 8. Cấu hình:
 *    - Mô tả: "Backend Thi Tin Học THPT Giá Rai"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me - tài khoản Google của bạn)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 9. Nhấn Triển khai (Deploy), cấp quyền truy cập tài khoản khi được hỏi.
 * 10. Sao chép "URL ứng dụng web" (Web App URL) và dán vào phần "Tích hợp Google Sheets" trong Dashboard Giáo viên!
 */

// KHÓA BẢO MẬT ĐỒNG BỘ GIỮA SERVER VÀ GOOGLE SHEETS
// Hãy thay đổi chuỗi này trùng khớp với GOOGLE_SHEET_SECRET_KEY trên server của bạn
var SHARED_SECRET_KEY = "YOUR_GOOGLE_SHEET_SECRET_KEY_HERE";

/**
 * 1. Hàm tự động khởi tạo 7 Worksheet với tiêu đề chuẩn
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetsDef = [
    {
      name: "DANH_SACH_HS",
      headers: ["STT", "Mã HS", "Họ tên", "Lớp", "Khối", "Trạng thái"]
    },
    {
      name: "DANH_SACH_DE",
      headers: ["Mã đề", "Tên đề", "Khối", "Môn", "Thời gian", "Số MCQ", "Số TF", "Trạng thái", "Phiên bản đề"]
    },
    {
      name: "KET_QUA",
      headers: ["STT", "Mã lượt thi", "Mã HS", "Họ tên", "Lớp", "Khối", "Mã đề", "Ngày thi", "Giờ bắt đầu", "Giờ nộp", "Thời gian làm bài", "Số MCQ đúng", "Điểm MCQ", "Điểm TF", "Tổng điểm", "Trạng thái nộp", "Số lần rời trang", "Ghi chú"]
    },
    {
      name: "CHI_TIET_BAI_LAM",
      headers: ["Mã lượt thi", "Mã đề", "Phiên bản đề", "Mã câu hỏi", "Loại câu", "Đáp án HS", "Điểm câu", "Thời điểm ghi nhận"]
    },
    {
      name: "CAU_HOI",
      headers: ["Mã câu", "Khối", "Chủ đề", "Bài học", "Loại câu", "Mức độ", "Nội dung", "Phương án/Ý", "Đáp án chuẩn", "Trạng thái"]
    },
    {
      name: "CAU_HINH",
      headers: ["Tham số", "Giá trị", "Mô tả"]
    },
    {
      name: "NHAT_KY",
      headers: ["Thời điểm", "Mã HS", "Mã lượt thi", "Loại sự kiện", "Nội dung", "Trạng thái xử lý"]
    }
  ];

  sheetsDef.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    
    // Nếu sheet còn trống hoặc chưa có header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1e40af");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  });

  // Điền dữ liệu cấu hình ban đầu nếu sheet CAU_HINH mới tạo
  var configSheet = ss.getSheetByName("CAU_HINH");
  if (configSheet && configSheet.getLastRow() <= 1) {
    var configs = [
      ["academic_year", "2026-2027", "Năm học"],
      ["exam_title", "Kiểm tra Giữa Học kỳ I - Môn Tin học 11", "Tên kỳ kiểm tra"],
      ["duration_minutes", "45", "Thời gian làm bài (phút)"],
      ["exam_status", "OPEN", "Trạng thái mở/đóng kỳ thi (OPEN/CLOSED)"],
      ["mcq_weight", "0.25", "Điểm mỗi câu trắc nghiệm MCQ đúng"],
      ["tf_rule", "1 ý: 0.1đ | 2 ý: 0.25đ | 3 ý: 0.5đ | 4 ý: 1.0đ", "Quy tắc thang điểm Đúng/Sai"],
      ["timezone", "Asia/Ho_Chi_Minh", "Múi giờ hệ thống"]
    ];
    configs.forEach(function(row) {
      configSheet.appendRow(row);
    });
  }

  Logger.log("Thiết lập hoàn tất 7 Worksheet!");
  return "OK";
}

/**
 * 2. Xử lý yêu cầu POST từ Hệ thống
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Đảm bảo đồng bộ và chống ghi trùng đồng thời
    
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return jsonResponse({ success: false, error: "Không tìm thấy dữ liệu POST" }, 400);
    }

    // Kiểm tra khóa bảo mật
    if (data.secretKey !== SHARED_SECRET_KEY) {
      return jsonResponse({ success: false, error: "Sai khóa bảo mật (secretKey không hợp lệ)" }, 403);
    }

    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Kiểm tra kết nối và cấu trúc bảng tính
    if (action === "test_connection") {
      var sheetNames = ss.getSheets().map(function(s) { return s.getName(); });
      var requiredSheets = ["DANH_SACH_HS", "DANH_SACH_DE", "KET_QUA", "CHI_TIET_BAI_LAM", "CAU_HOI", "CAU_HINH", "NHAT_KY"];
      var missing = requiredSheets.filter(function(r) { return sheetNames.indexOf(r) === -1; });
      
      // Thử ghi nhật ký kiểm tra
      var nhatKySheet = ss.getSheetByName("NHAT_KY");
      if (nhatKySheet) {
        var nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
        nhatKySheet.appendRow([nowStr, "SYSTEM", "TEST", "TEST_CONNECTION", "Kiểm tra kết nối từ hệ thống thi thành công", "SUCCESS"]);
      }

      return jsonResponse({
        success: true,
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        sheets: sheetNames,
        missingSheets: missing,
        isReady: missing.length === 0,
        message: missing.length === 0 ? "Kết nối và xác thực Google Sheets thành công!" : "Thiếu worksheet: " + missing.join(", ")
      });
    }

    // 2. Ghi điểm và lưu kết quả bài làm học sinh
    if (action === "sync_result") {
      var result = data.result;
      if (!result || !result.attemptId) {
        return jsonResponse({ success: false, error: "Thiếu dữ liệu kết quả lượt thi" }, 400);
      }

      var ketQuaSheet = ss.getSheetByName("KET_QUA");
      if (!ketQuaSheet) {
        setupSheets();
        ketQuaSheet = ss.getSheetByName("KET_QUA");
      }

      // Kiểm tra xem lượt thi đã tồn tại chưa để tránh ghi trùng (Idempotent lock)
      var rows = ketQuaSheet.getDataRange().getValues();
      var existingRowIndex = -1;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] === result.attemptId) {
          existingRowIndex = i + 1;
          break;
        }
      }

      var stt = existingRowIndex > 0 ? rows[existingRowIndex - 1][0] : rows.length;
      var newRow = [
        stt,
        result.attemptId,
        result.studentId,
        result.fullName,
        result.className,
        result.grade || 12,
        result.examCode,
        result.submittedDate || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd"),
        result.startTime || "",
        result.submittedTime || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "HH:mm:ss"),
        result.durationText || "",
        result.mcqCorrectCount || 0,
        result.mcqScore !== undefined ? result.mcqScore : 0,
        result.tfScore !== undefined ? result.tfScore : 0,
        result.totalScore !== undefined ? result.totalScore : 0,
        result.status || "Đã nộp bài",
        result.leaveTabCount || 0,
        result.note || ""
      ];

      var targetRow = existingRowIndex;
      if (existingRowIndex > 0) {
        // Cập nhật dòng hiện có
        ketQuaSheet.getRange(existingRowIndex, 1, 1, newRow.length).setValues([newRow]);
      } else {
        // Thêm dòng mới
        ketQuaSheet.appendRow(newRow);
        targetRow = ketQuaSheet.getLastRow();
      }

      // Cập nhật trạng thái trong DANH_SACH_HS
      var hsSheet = ss.getSheetByName("DANH_SACH_HS");
      if (hsSheet) {
        var hsData = hsSheet.getDataRange().getValues();
        for (var j = 1; j < hsData.length; j++) {
          if (hsData[j][1] === result.studentId) {
            hsSheet.getRange(j + 1, 6).setValue("Đã nộp bài");
            break;
          }
        }
      }

      // Lưu chi tiết từng câu vào CHI_TIET_BAI_LAM
      var chiTietSheet = ss.getSheetByName("CHI_TIET_BAI_LAM");
      if (chiTietSheet && data.details && data.details.length > 0) {
        var timeNow = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
        var detailRows = [];
        for (var k = 0; k < data.details.length; k++) {
          var d = data.details[k];
          detailRows.push([
            result.attemptId,
            result.examCode,
            d.version || "1.0",
            d.questionId,
            d.type,
            typeof d.studentAnswer === 'object' ? JSON.stringify(d.studentAnswer) : (d.studentAnswer || ""),
            d.score !== undefined ? d.score : 0,
            timeNow
          ]);
        }
        if (detailRows.length > 0) {
          chiTietSheet.getRange(chiTietSheet.getLastRow() + 1, 1, detailRows.length, detailRows[0].length).setValues(detailRows);
        }
      }

      // Ghi nhật ký
      var nkSheet = ss.getSheetByName("NHAT_KY");
      if (nkSheet) {
        var logTime = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
        nkSheet.appendRow([
          logTime,
          result.studentId,
          result.attemptId,
          "SUBMIT_EXAM",
          "Nộp bài thành công. Điểm: " + result.totalScore + " (MCQ: " + result.mcqScore + ", TF: " + result.tfScore + ")",
          "SUCCESS"
        ]);
      }

      return jsonResponse({
        success: true,
        attemptId: result.attemptId,
        rowNumber: targetRow,
        message: "Lưu điểm và chi tiết bài làm vào Google Sheets thành công!"
      });
    }

    // 3. Lấy danh sách kết quả đã lưu
    if (action === "get_results") {
      var kqSheet = ss.getSheetByName("KET_QUA");
      if (!kqSheet) return jsonResponse({ success: true, results: [] });
      var kqValues = kqSheet.getDataRange().getValues();
      var resultsList = [];
      for (var r = 1; r < kqValues.length; r++) {
        var row = kqValues[r];
        if (row[1]) {
          resultsList.push({
            stt: row[0],
            attemptId: row[1],
            studentId: row[2],
            fullName: row[3],
            className: row[4],
            grade: row[5],
            examCode: row[6],
            date: row[7],
            startTime: row[8],
            submittedTime: row[9],
            duration: row[10],
            mcqCorrectCount: row[11],
            mcqScore: row[12],
            tfScore: row[13],
            totalScore: row[14],
            status: row[15],
            leaveTabCount: row[16],
            note: row[17]
          });
        }
      }
      return jsonResponse({ success: true, results: resultsList });
    }

    // 4. Đồng bộ danh sách học sinh
    if (action === "sync_students") {
      var dsHsSheet = ss.getSheetByName("DANH_SACH_HS");
      if (!dsHsSheet) {
        setupSheets();
        dsHsSheet = ss.getSheetByName("DANH_SACH_HS");
      }
      var students = data.students || [];
      if (students.length > 0) {
        var studentRows = students.map(function(s, idx) {
          return [idx + 1, s.studentId, s.fullName, s.className, s.grade || 12, s.status || "Chưa thi"];
        });
        // Giữ lại dòng 1 (header), xóa các dòng cũ và ghi lại
        var lastR = dsHsSheet.getLastRow();
        if (lastR > 1) {
          dsHsSheet.getRange(2, 1, lastR - 1, 6).clearContent();
        }
        dsHsSheet.getRange(2, 1, studentRows.length, 6).setValues(studentRows);
      }
      return jsonResponse({ success: true, count: students.length, message: "Đồng bộ danh sách học sinh thành công!" });
    }

    return jsonResponse({ success: false, error: "Hành động không hợp lệ: " + action }, 400);

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * 3. Xử lý yêu cầu GET để kiểm tra trạng thái hoạt động của Web App
 */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === "ping") {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ONLINE",
      app: "Hệ thống kiểm tra Tin học THPT Giá Rai",
      time: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss")
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    message: "Google Apps Script Backend cho Hệ Thống Kiểm Tra Tin Học - THPT Giá Rai đang hoạt động!",
    version: "1.0.0",
    timezone: "Asia/Ho_Chi_Minh"
  })).setMimeType(ContentService.MimeType.JSON);
}

function jsonResponse(obj, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
