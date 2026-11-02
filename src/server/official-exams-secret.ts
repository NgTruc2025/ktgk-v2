import { ExamVersion, MCQQuestion, TFQuestion } from '../types/exam.ts';

export const OFFICIAL_EXAMS_SECRET: ExamVersion[] = [
  {
    "code": "101",
    "title": "Đề kiểm tra Giữa học kì I - Tin học 11 (KNTT) - Mã đề 101",
    "grade": 11,
    "subject": "Tin học",
    "durationMinutes": 45,
    "totalPoints": 10,
    "pdfUrl": "/assets/aistudio/DE_GK1_TIN11_MA_101_HOC_SINH_247d1804.pdf",
    "mcqQuestions": [
      {
        "id": "101_MCQ_1",
        "number": 1,
        "text": "Tại sao màn hình có tần số quét 120 Hz có thể hiển thị chuyển động mượt hơn màn hình 60 Hz trong điều kiện thích hợp?",
        "options": [
          {
            "key": "A",
            "text": "Màn hình tự tăng số điểm ảnh theo cả chiều ngang và chiều dọc."
          },
          {
            "key": "B",
            "text": "Màn hình tự làm cho bộ nhớ RAM tăng dung lượng gấp hai."
          },
          {
            "key": "C",
            "text": "Màn hình có thể cập nhật hình ảnh nhiều lần hơn trong mỗi giây."
          },
          {
            "key": "D",
            "text": "Màn hình luôn làm cho mọi video có độ phân giải cao hơn nguồn gốc."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Màn hình máy tính"
      },
      {
        "id": "101_MCQ_2",
        "number": 2,
        "text": "Nhóm trưởng gửi liên kết báo cáo ở chế độ “Bất kỳ ai có liên kết đều chỉnh sửa”, rồi phát hiện một người lạ thay đổi nội dung. Giải pháp nào xử lí nguyên nhân?",
        "options": [
          {
            "key": "A",
            "text": "Chuyển mọi thành viên sang quyền sở hữu tài liệu để giảm rủi ro truy cập lạ."
          },
          {
            "key": "B",
            "text": "Xóa biểu tượng lối tắt trên máy cá nhân rồi cho rằng dữ liệu đã được bảo vệ."
          },
          {
            "key": "C",
            "text": "Đổi tên tài liệu nhưng giữ nguyên liên kết chia sẻ và quyền chỉnh sửa công khai."
          },
          {
            "key": "D",
            "text": "Đổi chia sẻ sang Hạn chế, cấp quyền theo tài khoản thành viên và kiểm tra lịch sử phiên bản."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Chia sẻ trực tuyến an toàn"
      },
      {
        "id": "101_MCQ_3",
        "number": 3,
        "text": "Vì sao không nên chia sẻ tài liệu chứa thông tin nhạy cảm ở chế độ “Bất kỳ ai có liên kết đều có thể chỉnh sửa”?",
        "options": [
          {
            "key": "A",
            "text": "Tài liệu sẽ tự tăng dung lượng tệp lên gấp đôi sau mỗi lần mở."
          },
          {
            "key": "B",
            "text": "Tệp sẽ tự chuyển định dạng từ tài liệu sang video khi có lượt xem."
          },
          {
            "key": "C",
            "text": "Liên kết chia sẻ làm cho máy tính bị giảm số lượng bộ nhớ RAM."
          },
          {
            "key": "D",
            "text": "Người có liên kết có thể truy cập và sửa nội dung vượt ngoài phạm vi dự kiến."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "An toàn dữ liệu"
      },
      {
        "id": "101_MCQ_4",
        "number": 4,
        "text": "Giáo viên gửi thông báo cho nhiều phụ huynh và muốn tránh lộ địa chỉ email giữa các gia đình. Cách nhập địa chỉ nào phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "Nhập toàn bộ địa chỉ vào Cc vì danh sách này mặc định bị ẩn."
          },
          {
            "key": "B",
            "text": "Chỉ nhập một địa chỉ bất kì rồi chuyển tiếp thư liên tục cho từng phụ huynh."
          },
          {
            "key": "C",
            "text": "Đưa địa chỉ phụ huynh vào Bcc, dùng To cho địa chỉ nhận chính phù hợp."
          },
          {
            "key": "D",
            "text": "Nhập toàn bộ phụ huynh vào To để mọi người cùng nhìn thấy địa chỉ."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Thư điện tử (Email)"
      },
      {
        "id": "101_MCQ_5",
        "number": 5,
        "text": "Đối với phần mềm nguồn mở, quyền nào dưới đây gắn trực tiếp với việc cung cấp mã nguồn theo giấy phép thích hợp?",
        "options": [
          {
            "key": "A",
            "text": "Nghiên cứu, sửa đổi và phân phối lại mã nguồn theo điều kiện giấy phép."
          },
          {
            "key": "B",
            "text": "Được tự ý xóa thông tin bản quyền và phủ nhận toàn bộ tác giả ban đầu."
          },
          {
            "key": "C",
            "text": "Luôn phải xin phép riêng tác giả mỗi lần thực hiện bất kì chỉnh sửa nào."
          },
          {
            "key": "D",
            "text": "Chỉ được sử dụng phần mềm dưới dạng tệp thực thi không thể kiểm tra."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Phần mềm nguồn mở"
      },
      {
        "id": "101_MCQ_6",
        "number": 6,
        "text": "Một học sinh nhận xét Linux là hệ điều hành nguồn mở. Cách giải thích phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Linux chỉ dùng trên điện thoại và không cài đặt được cho máy tính để bàn."
          },
          {
            "key": "B",
            "text": "Linux luôn hoạt động mà không cần bộ xử lí, bộ nhớ và thiết bị lưu trữ."
          },
          {
            "key": "C",
            "text": "Người sử dụng có thể tiếp cận, sửa đổi và phân phối mã nguồn theo giấy phép."
          },
          {
            "key": "D",
            "text": "Linux không có quy định giấy phép và người dùng được làm bất cứ điều gì."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Hệ điều hành nguồn mở"
      },
      {
        "id": "101_MCQ_7",
        "number": 7,
        "text": "Nhóm sử dụng kho mã nguồn có giấy phép yêu cầu giữ thông báo bản quyền khi phân phối. Cách xử lí nào phù hợp nhất?",
        "options": [
          {
            "key": "A",
            "text": "Giữ thông báo và tuân thủ các điều khoản đi kèm khi phân phối."
          },
          {
            "key": "B",
            "text": "Chuyển kho mã nguồn thành sản phẩm không có giấy phép."
          },
          {
            "key": "C",
            "text": "Chỉ dùng phần mềm khi tác giả cam kết không có lỗi."
          },
          {
            "key": "D",
            "text": "Xóa thông báo bản quyền vì mã nguồn đã được công khai."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Bản quyền & Giấy phép"
      },
      {
        "id": "101_MCQ_8",
        "number": 8,
        "text": "Công nghệ không dây tầm ngắn nào thường dùng để ghép nối tai nghe với máy tính?",
        "options": [
          {
            "key": "A",
            "text": "Ethernet."
          },
          {
            "key": "B",
            "text": "HDMI."
          },
          {
            "key": "C",
            "text": "Bluetooth."
          },
          {
            "key": "D",
            "text": "VGA."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Kết nối thiết bị"
      },
      {
        "id": "101_MCQ_9",
        "number": 9,
        "text": "Một lớp dùng phần mềm đồ họa cần đồng thời mở nhiều tệp lớn, Task Manager cho thấy RAM gần 100% nhưng CPU còn thấp. Nâng cấp nào phù hợp nhất?",
        "options": [
          {
            "key": "A",
            "text": "Thay loa ngoài nhằm cải thiện tốc độ truy xuất dữ liệu."
          },
          {
            "key": "B",
            "text": "Bổ sung RAM tương thích để giảm áp lực thiếu bộ nhớ khi làm việc."
          },
          {
            "key": "C",
            "text": "Đổi chuột quang sang chuột không dây có pin dung lượng lớn."
          },
          {
            "key": "D",
            "text": "Tăng độ sáng màn hình để giúp hệ thống xử lí nhanh hơn."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Bộ nhớ máy tính"
      },
      {
        "id": "101_MCQ_10",
        "number": 10,
        "text": "Trong một phòng máy, học sinh muốn thay đổi thao tác chọn bằng chuột sao cho nút phải thành nút chính. Em nên làm gì?",
        "options": [
          {
            "key": "A",
            "text": "Tăng tần số quét của màn hình lên giá trị lớn nhất."
          },
          {
            "key": "B",
            "text": "Đổi tùy chọn nút chuột chính trong phần Mouse của hệ điều hành."
          },
          {
            "key": "C",
            "text": "Cắm lại chuột sang một cổng USB ở bên trái thân máy."
          },
          {
            "key": "D",
            "text": "Cài đặt phần mềm trình chiếu rồi khởi động lại máy tính."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "101_MCQ_11",
        "number": 11,
        "text": "Tại sao RAM không thể thay thế hoàn toàn ổ SSD trong việc giữ tài liệu sau khi tắt máy?",
        "options": [
          {
            "key": "A",
            "text": "RAM thường mất dữ liệu khi ngắt điện, còn SSD là thiết bị lưu trữ không mất dữ liệu khi tắt nguồn."
          },
          {
            "key": "B",
            "text": "RAM lưu trữ được dữ liệu lâu hơn SSD vì có tốc độ xử lí cao hơn."
          },
          {
            "key": "C",
            "text": "RAM có dung lượng không giới hạn nên không cần thiết bị lưu trữ khác."
          },
          {
            "key": "D",
            "text": "SSD chỉ dùng để truyền âm thanh nên không thể giữ tài liệu văn bản."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Lưu trữ máy tính"
      },
      {
        "id": "101_MCQ_12",
        "number": 12,
        "text": "Ba thành viên ở những địa điểm khác nhau cần biên tập chung một bảng phân công trực tuyến. Cách thực hiện nào hiệu quả?",
        "options": [
          {
            "key": "A",
            "text": "Đặt bảng tính vào thùng rác của tài khoản để mọi người cùng truy cập."
          },
          {
            "key": "B",
            "text": "Chỉ cung cấp ảnh chụp bảng tính ở chế độ xem mà không có dữ liệu nguồn."
          },
          {
            "key": "C",
            "text": "Xuất bản in giấy rồi nhờ từng bạn sửa bằng bút và gửi qua đường bưu điện."
          },
          {
            "key": "D",
            "text": "Tạo bảng tính trực tuyến và cấp quyền chỉnh sửa cho đúng ba thành viên."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "101_MCQ_13",
        "number": 13,
        "text": "Toán tử nào thường dùng để giới hạn kết quả Google Search theo định dạng tệp PDF?",
        "options": [
          {
            "key": "A",
            "text": "site:pdf"
          },
          {
            "key": "B",
            "text": "format=pdf"
          },
          {
            "key": "C",
            "text": "domain:pdf"
          },
          {
            "key": "D",
            "text": "filetype:pdf"
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "101_MCQ_14",
        "number": 14,
        "text": "Hệ điều hành nào sau đây có các bản phân phối mã nguồn mở?",
        "options": [
          {
            "key": "A",
            "text": "macOS."
          },
          {
            "key": "B",
            "text": "Linux."
          },
          {
            "key": "C",
            "text": "Windows 11."
          },
          {
            "key": "D",
            "text": "MS-DOS."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "101_MCQ_15",
        "number": 15,
        "text": "Muốn truyền đồng thời hình ảnh và âm thanh từ máy tính đến màn hình hỗ trợ tương thích, cổng nào phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "HDMI."
          },
          {
            "key": "B",
            "text": "VGA."
          },
          {
            "key": "C",
            "text": "RJ45."
          },
          {
            "key": "D",
            "text": "PS/2."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Cổng kết nối"
      },
      {
        "id": "101_MCQ_16",
        "number": 16,
        "text": "Bộ ứng dụng văn phòng nguồn mở nào sau đây gồm các công cụ xử lí tài liệu và bảng tính?",
        "options": [
          {
            "key": "A",
            "text": "Adobe Creative Cloud."
          },
          {
            "key": "B",
            "text": "LibreOffice."
          },
          {
            "key": "C",
            "text": "Microsoft 365 bản quyền."
          },
          {
            "key": "D",
            "text": "Apple Final Cut Pro."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Phần mềm văn phòng"
      },
      {
        "id": "101_MCQ_17",
        "number": 17,
        "text": "Người dùng thao tác qua cửa sổ, biểu tượng và con trỏ chuột nhờ loại giao diện nào?",
        "options": [
          {
            "key": "A",
            "text": "Giao diện dòng lệnh (CLI)."
          },
          {
            "key": "B",
            "text": "Giao diện đồ họa (GUI)."
          },
          {
            "key": "C",
            "text": "Giao diện mã máy nhị phân."
          },
          {
            "key": "D",
            "text": "Giao diện bộ nhớ BIOS."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Giao diện người dùng"
      },
      {
        "id": "101_MCQ_18",
        "number": 18,
        "text": "Khi chia sẻ tệp Google Drive, quyền nào chỉ cho phép người được cấp quyền xem nội dung?",
        "options": [
          {
            "key": "A",
            "text": "Người xem (Viewer)."
          },
          {
            "key": "B",
            "text": "Người chỉnh sửa (Editor)."
          },
          {
            "key": "C",
            "text": "Người nhận xét (Commenter)."
          },
          {
            "key": "D",
            "text": "Chủ sở hữu (Owner)."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Lưu trữ đám mây"
      },
      {
        "id": "101_MCQ_19",
        "number": 19,
        "text": "Một lớp học làm bài trên công cụ trực tuyến; khi kết nối mạng gián đoạn, hoạt động cộng tác bị ảnh hưởng. Điều này phản ánh hạn chế nào?",
        "options": [
          {
            "key": "A",
            "text": "Phần mềm trực tuyến bắt buộc phải có mã nguồn được công khai."
          },
          {
            "key": "B",
            "text": "Tài liệu trực tuyến không thể lưu dưới bất kì định dạng tệp nào."
          },
          {
            "key": "C",
            "text": "Hoạt động trực tuyến phụ thuộc kết nối và trạng thái máy chủ dịch vụ."
          },
          {
            "key": "D",
            "text": "Mọi công cụ trực tuyến chỉ có thể sử dụng từ một máy tính duy nhất."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "101_MCQ_20",
        "number": 20,
        "text": "Bạn cần cải thiện thời gian mở chương trình trên máy cũ sử dụng HDD nhưng không muốn thay CPU. Giải pháp nào hợp lí?",
        "options": [
          {
            "key": "A",
            "text": "Thay màn hình lớn hơn nhưng không sửa cấu hình."
          },
          {
            "key": "B",
            "text": "Chọn hình nền đơn sắc và giữ nguyên ổ đĩa."
          },
          {
            "key": "C",
            "text": "Bổ sung chuột cảm ứng thay cho chuột quang."
          },
          {
            "key": "D",
            "text": "Thay ổ hệ thống bằng SSD phù hợp với máy."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Nâng cấp phần cứng"
      },
      {
        "id": "101_MCQ_21",
        "number": 21,
        "text": "Khi tài liệu ghi “màn hình 1920 × 1080, 75 Hz”, cách hiểu nào đúng về hai thông số?",
        "options": [
          {
            "key": "A",
            "text": "1920 × 1080 là tốc độ mạng; 75 Hz là độ phân giải ảnh chụp."
          },
          {
            "key": "B",
            "text": "1920 × 1080 là số điểm ảnh theo hai chiều; 75 Hz là số lần làm mới mỗi giây."
          },
          {
            "key": "C",
            "text": "1920 × 1080 là công suất màn hình; 75 Hz là dung lượng ổ lưu trữ."
          },
          {
            "key": "D",
            "text": "1920 × 1080 là kích thước tính bằng cm; 75 Hz là dung lượng bộ nhớ trong."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Màn hình máy tính"
      },
      {
        "id": "101_MCQ_22",
        "number": 22,
        "text": "Chức năng nào phản ánh đúng mối quan hệ giữa hệ điều hành và phần mềm ứng dụng?",
        "options": [
          {
            "key": "A",
            "text": "Hệ điều hành cung cấp dịch vụ để ứng dụng khai thác thiết bị có kiểm soát."
          },
          {
            "key": "B",
            "text": "Ứng dụng cấp nguồn điện cho tất cả linh kiện khi hệ điều hành chưa hoạt động."
          },
          {
            "key": "C",
            "text": "Hệ điều hành chỉ có tác dụng mở trình duyệt, không điều phối bộ nhớ RAM."
          },
          {
            "key": "D",
            "text": "Phần mềm ứng dụng có quyền thay thế mọi trình điều khiển thiết bị khi chạy."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "101_MCQ_23",
        "number": 23,
        "text": "Trong thông số CPU, đơn vị nào thường được dùng cho tần số xung nhịp?",
        "options": [
          {
            "key": "A",
            "text": "GB."
          },
          {
            "key": "B",
            "text": "Ppm."
          },
          {
            "key": "C",
            "text": "DPI."
          },
          {
            "key": "D",
            "text": "GHz."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Bộ vi xử lý CPU"
      },
      {
        "id": "101_MCQ_24",
        "number": 24,
        "text": "Trong CPU, bộ phận nào thực hiện các phép tính số học và phép toán logic?",
        "options": [
          {
            "key": "A",
            "text": "Bộ phát Wi-Fi (WAP)."
          },
          {
            "key": "B",
            "text": "Bộ điều khiển màn hình (OSD)."
          },
          {
            "key": "C",
            "text": "Đơn vị số học và logic (ALU)."
          },
          {
            "key": "D",
            "text": "Thiết bị lưu trữ HDD."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Bộ vi xử lý CPU"
      }
    ],
    "tfQuestions": [
      {
        "id": "101_TF_1",
        "number": 1,
        "context": "Nhóm lớp khảo sát phần mềm nguồn mở và công cụ trực tuyến trước khi viết báo cáo chung.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Phần mềm nguồn mở & Ứng dụng trực tuyến",
        "items": [
          {
            "id": "a",
            "text": "Phần mềm nguồn mở được phân phối kèm những quyền liên quan đến mã nguồn theo một giấy phép phù hợp.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "Mọi phần mềm nguồn mở đều buộc nhà phát triển phải phát hành miễn phí và không được thu phí.",
            "correctValue": false
          },
          {
            "id": "c",
            "text": "Cộng đồng có thể rà soát và đóng góp sửa lỗi trong phần mềm nguồn mở khi có quyền và điều kiện phù hợp.",
            "correctValue": true
          },
          {
            "id": "d",
            "text": "Để cùng biên tập tài liệu Google Docs, nhóm nên gửi một bản sao riêng cho mỗi thành viên và không cấp quyền chỉnh sửa.",
            "correctValue": false
          }
        ]
      },
      {
        "id": "101_TF_2",
        "number": 2,
        "context": "Học sinh kiểm tra cấu hình một máy tính để giải thích mối quan hệ giữa CPU, RAM và lưu trữ.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Mối quan hệ CPU, RAM & Lưu trữ",
        "items": [
          {
            "id": "a",
            "text": "RAM là bộ nhớ lưu trữ vĩnh viễn các tệp khi máy đã tắt nguồn.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "CPU đảm nhận thực hiện lệnh và xử lí dữ liệu trong máy tính.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Tăng dung lượng RAM có thể hỗ trợ việc mở nhiều ứng dụng đồng thời khi trước đó máy thiếu RAM.",
            "correctValue": true
          },
          {
            "id": "d",
            "text": "Nếu máy khởi động chậm do ổ HDD, thay màn hình thường hiệu quả hơn đổi sang SSD.",
            "correctValue": false
          }
        ]
      },
      {
        "id": "101_TF_3",
        "number": 3,
        "context": "Trong nhóm học tập, Minh dùng Drive để chia sẻ báo cáo; nhóm có người viết nội dung và người chỉ cần kiểm tra.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Phân quyền chia sẻ tài liệu trực tuyến",
        "items": [
          {
            "id": "a",
            "text": "Tệp trên Drive có thể được chia sẻ với những người dùng được chỉ định.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "Giới hạn quyền theo nhiệm vụ giúp giảm rủi ro sửa nhầm hoặc thay đổi không được phép.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Quyền Người xem mặc nhiên cho phép sửa trực tiếp nội dung của tài liệu.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Minh nên bật “Bất kỳ ai có liên kết đều chỉnh sửa” để chắc chắn người ngoài không xem được báo cáo.",
            "correctValue": false
          }
        ]
      },
      {
        "id": "101_TF_4",
        "number": 4,
        "context": "Một nhóm tìm tài liệu PDF và trao đổi qua email để hoàn thành dự án học tập.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Tìm kiếm thông tin & Email",
        "items": [
          {
            "id": "a",
            "text": "Đặt cụm từ trong ngoặc kép làm công cụ tìm kiếm bỏ qua hoàn toàn thứ tự các từ.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "Toán tử filetype:pdf có thể dùng để giới hạn kết quả tìm kiếm theo định dạng PDF.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Đưa địa chỉ của mọi người vào Cc giúp ẩn địa chỉ email của các thành viên đối với nhau.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Nhóm có thể phối hợp site:, filetype: và dấu ngoặc kép để tìm tài liệu sát yêu cầu hơn.",
            "correctValue": true
          }
        ]
      }
    ]
  },
  {
    "code": "102",
    "title": "Đề kiểm tra Giữa học kì I - Tin học 11 (KNTT) - Mã đề 102",
    "grade": 11,
    "subject": "Tin học",
    "durationMinutes": 45,
    "totalPoints": 10,
    "pdfUrl": "/assets/aistudio/DE_GK1_TIN11_MA_102_HOC_SINH_711ab8e9.pdf",
    "mcqQuestions": [
      {
        "id": "102_MCQ_1",
        "number": 1,
        "text": "Khi phân biệt phần mềm nguồn mở với phần mềm thương mại nguồn đóng, nhận xét nào hợp lí nhất?",
        "options": [
          {
            "key": "A",
            "text": "Phần mềm nguồn mở không có tác giả nên mặc nhiên không chịu sự điều chỉnh của giấy phép."
          },
          {
            "key": "B",
            "text": "Phần mềm nguồn mở gắn với quyền đối với mã nguồn; nguồn đóng thường hạn chế quyền đó."
          },
          {
            "key": "C",
            "text": "Tất cả phần mềm thương mại đều không chạy được trên hệ điều hành Linux."
          },
          {
            "key": "D",
            "text": "Phần mềm nguồn đóng được xác định chỉ bởi việc phải sử dụng kết nối Internet."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Phần mềm nguồn mở"
      },
      {
        "id": "102_MCQ_2",
        "number": 2,
        "text": "Một học sinh nhận xét Linux là hệ điều hành nguồn mở. Cách giải thích phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Linux không có quy định giấy phép và người dùng được làm bất cứ điều gì."
          },
          {
            "key": "B",
            "text": "Linux luôn hoạt động mà không cần bộ xử lí, bộ nhớ và thiết bị lưu trữ."
          },
          {
            "key": "C",
            "text": "Người sử dụng có thể tiếp cận, sửa đổi và phân phối mã nguồn theo giấy phép."
          },
          {
            "key": "D",
            "text": "Linux chỉ dùng trên điện thoại và không cài đặt được cho máy tính để bàn."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Hệ điều hành nguồn mở"
      },
      {
        "id": "102_MCQ_3",
        "number": 3,
        "text": "Một máy chiếu có đầu vào HDMI và VGA, người dùng muốn truyền cả tiếng lẫn hình qua một dây. Vì sao nên ưu tiên HDMI?",
        "options": [
          {
            "key": "A",
            "text": "HDMI có khả năng truyền đồng thời tín hiệu hình ảnh và âm thanh."
          },
          {
            "key": "B",
            "text": "HDMI chỉ truyền lệnh điều khiển chuột và bàn phím đến máy chiếu."
          },
          {
            "key": "C",
            "text": "VGA truyền hình ảnh kèm âm thanh số trên cùng cáp theo mặc định."
          },
          {
            "key": "D",
            "text": "VGA luôn tạo độ phân giải cao hơn HDMI với cùng thiết bị nguồn."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Cổng kết nối"
      },
      {
        "id": "102_MCQ_4",
        "number": 4,
        "text": "Khi tìm tài liệu về “an toàn dữ liệu” dạng PDF, học sinh cần loại nội dung có từ “quảng cáo”. Cú pháp nào thích hợp?",
        "options": [
          {
            "key": "A",
            "text": "filetype:docx \"an toàn dữ liệu\" quảng cáo"
          },
          {
            "key": "B",
            "text": "\"an toàn dữ liệu\" site:pdf +\"quảng cáo\""
          },
          {
            "key": "C",
            "text": "\"an toàn dữ liệu\" filetype:pdf -\"quảng cáo\""
          },
          {
            "key": "D",
            "text": "\"an toàn dữ liệu\" format:pdf include:quảng cáo"
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "102_MCQ_5",
        "number": 5,
        "text": "Bộ phận nào là nền tảng kết nối CPU, bộ nhớ và các linh kiện trong thân máy?",
        "options": [
          {
            "key": "A",
            "text": "Ổ đĩa lưu trữ SSD."
          },
          {
            "key": "B",
            "text": "Chuột và bàn phím."
          },
          {
            "key": "C",
            "text": "Màn hình hiển thị LCD."
          },
          {
            "key": "D",
            "text": "Bo mạch chủ (mainboard)."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Phần cứng máy tính"
      },
      {
        "id": "102_MCQ_6",
        "number": 6,
        "text": "Trong các phần mềm sau, đâu là một hệ điều hành thường dùng trên máy tính cá nhân?",
        "options": [
          {
            "key": "A",
            "text": "Windows 11."
          },
          {
            "key": "B",
            "text": "Adobe Photoshop."
          },
          {
            "key": "C",
            "text": "Google Chrome."
          },
          {
            "key": "D",
            "text": "Microsoft Word."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "102_MCQ_7",
        "number": 7,
        "text": "Người dùng thao tác qua cửa sổ, biểu tượng và con trỏ chuột nhờ loại giao diện nào?",
        "options": [
          {
            "key": "A",
            "text": "Giao diện dòng lệnh (CLI)."
          },
          {
            "key": "B",
            "text": "Giao diện bộ nhớ BIOS."
          },
          {
            "key": "C",
            "text": "Giao diện mã máy nhị phân."
          },
          {
            "key": "D",
            "text": "Giao diện đồ họa (GUI)."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Giao diện người dùng"
      },
      {
        "id": "102_MCQ_8",
        "number": 8,
        "text": "Trong các thiết bị sau, thiết bị nào được xếp vào nhóm thiết bị đưa dữ liệu vào máy tính?",
        "options": [
          {
            "key": "A",
            "text": "Loa vi tính."
          },
          {
            "key": "B",
            "text": "Màn hình máy tính."
          },
          {
            "key": "C",
            "text": "Máy in laser."
          },
          {
            "key": "D",
            "text": "Máy quét tài liệu."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Thiết bị vào - ra"
      },
      {
        "id": "102_MCQ_9",
        "number": 9,
        "text": "Tần số quét của màn hình thường được biểu thị bằng đơn vị nào?",
        "options": [
          {
            "key": "A",
            "text": "Dots per inch (DPI)."
          },
          {
            "key": "B",
            "text": "Hertz (Hz)."
          },
          {
            "key": "C",
            "text": "Gigabyte (GB)."
          },
          {
            "key": "D",
            "text": "Megabit (Mb)."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Màn hình máy tính"
      },
      {
        "id": "102_MCQ_10",
        "number": 10,
        "text": "Nhóm 5 học sinh phải cùng chỉnh sửa một báo cáo và nhìn thấy các thay đổi gần như ngay lập tức. Phương án phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Tạo tài liệu Google Docs và chia sẻ quyền chỉnh sửa cho từng thành viên."
          },
          {
            "key": "B",
            "text": "Mỗi bạn sửa một bản Word riêng và chờ cuối tuần mới ghép nội dung."
          },
          {
            "key": "C",
            "text": "Chỉ gửi ảnh chụp bản thảo cho mọi người qua tin nhắn điện thoại."
          },
          {
            "key": "D",
            "text": "Một bạn giữ tệp trên máy tính cá nhân, các bạn khác chỉ đọc kết quả."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "102_MCQ_11",
        "number": 11,
        "text": "Trường cần làm bài trình chiếu trực tuyến theo nhóm, có một thành viên chỉ được góp ý mà không sửa nội dung. Cách cấp quyền nào hợp lí?",
        "options": [
          {
            "key": "A",
            "text": "Cấp quyền chủ sở hữu cho mọi người trong nhóm để thuận tiện."
          },
          {
            "key": "B",
            "text": "Cấp quyền nhận xét cho thành viên đó và quyền chỉnh sửa cho người biên tập."
          },
          {
            "key": "C",
            "text": "Cấp quyền chỉnh sửa công khai cho bất kì ai biết địa chỉ tài liệu."
          },
          {
            "key": "D",
            "text": "Tắt hoàn toàn quyền truy cập của thành viên được phân công góp ý."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Chia sẻ tài nguyên"
      },
      {
        "id": "102_MCQ_12",
        "number": 12,
        "text": "Tại sao RAM không thể thay thế hoàn toàn ổ SSD trong việc giữ tài liệu sau khi tắt máy?",
        "options": [
          {
            "key": "A",
            "text": "SSD chỉ dùng để truyền âm thanh nên không thể giữ tài liệu văn bản."
          },
          {
            "key": "B",
            "text": "RAM có dung lượng không giới hạn nên không cần thiết bị lưu trữ khác."
          },
          {
            "key": "C",
            "text": "RAM thường mất dữ liệu khi ngắt điện, còn SSD là thiết bị lưu trữ không mất dữ liệu khi tắt nguồn."
          },
          {
            "key": "D",
            "text": "RAM lưu trữ được dữ liệu lâu hơn SSD vì có tốc độ xử lí cao hơn."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Bộ nhớ & Lưu trữ"
      },
      {
        "id": "102_MCQ_13",
        "number": 13,
        "text": "Nhóm cần cùng sửa báo cáo trên Drive nhưng không muốn người ngoài truy cập. Cách chia sẻ nào phù hợp nhất?",
        "options": [
          {
            "key": "A",
            "text": "Giữ tệp ở chế độ riêng tư mà không cấp quyền cho các thành viên."
          },
          {
            "key": "B",
            "text": "Mở chế độ bất kỳ ai có liên kết và cấp quyền chỉnh sửa cho mọi người."
          },
          {
            "key": "C",
            "text": "Giữ chế độ Hạn chế và cấp quyền Chỉnh sửa cho email thành viên."
          },
          {
            "key": "D",
            "text": "Đăng tài liệu công khai lên mạng xã hội rồi yêu cầu nhóm cùng sử dụng."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Chia sẻ trực tuyến an toàn"
      },
      {
        "id": "102_MCQ_14",
        "number": 14,
        "text": "Cần lưu 500 bài hát, mỗi bài 5 MB, và 1.000 ảnh, mỗi ảnh 3 MB. Thẻ nhớ nào trong các lựa chọn đủ chứa dữ liệu?",
        "options": [
          {
            "key": "A",
            "text": "2 GB."
          },
          {
            "key": "B",
            "text": "8 GB."
          },
          {
            "key": "C",
            "text": "512 MB."
          },
          {
            "key": "D",
            "text": "4 GB."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Dung lượng lưu trữ"
      },
      {
        "id": "102_MCQ_15",
        "number": 15,
        "text": "Đặc điểm đúng của bộ nhớ RAM là gì?",
        "options": [
          {
            "key": "A",
            "text": "Chỉ cho phép đọc dữ liệu mà không được ghi trong mọi trường hợp."
          },
          {
            "key": "B",
            "text": "Lưu tất cả tài liệu cá nhân lâu dài ngay cả khi tắt máy."
          },
          {
            "key": "C",
            "text": "Lưu tạm dữ liệu khi hoạt động và thường mất nội dung khi ngắt điện."
          },
          {
            "key": "D",
            "text": "Luôn có dung lượng lưu trữ lớn hơn ổ đĩa cứng của máy tính."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Bộ nhớ RAM"
      },
      {
        "id": "102_MCQ_16",
        "number": 16,
        "text": "Một người thuận tay trái thao tác chuột không thuận tiện khi nút trái là nút chính. Giải pháp nào đáp ứng nhu cầu đó?",
        "options": [
          {
            "key": "A",
            "text": "Thay đổi thiết lập nút chính sang Right trong cài đặt Mouse."
          },
          {
            "key": "B",
            "text": "Giảm độ phân giải màn hình xuống mức thấp hơn hiện tại."
          },
          {
            "key": "C",
            "text": "Tăng tốc độ con trỏ nhưng giữ nguyên nút chính là Left."
          },
          {
            "key": "D",
            "text": "Đổi chế độ âm thanh tai nghe từ stereo thành mono."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Cài đặt hệ điều hành"
      },
      {
        "id": "102_MCQ_17",
        "number": 17,
        "text": "Tại sao màn hình có tần số quét 120 Hz có thể hiển thị chuyển động mượt hơn màn hình 60 Hz trong điều kiện thích hợp?",
        "options": [
          {
            "key": "A",
            "text": "Màn hình có thể cập nhật hình ảnh nhiều lần hơn trong mỗi giây."
          },
          {
            "key": "B",
            "text": "Màn hình tự tăng số điểm ảnh theo cả chiều ngang và chiều dọc."
          },
          {
            "key": "C",
            "text": "Màn hình luôn làm cho mọi video có độ phân giải cao hơn nguồn gốc."
          },
          {
            "key": "D",
            "text": "Màn hình tự làm cho bộ nhớ RAM tăng dung lượng gấp hai."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Màn hình máy tính"
      },
      {
        "id": "102_MCQ_18",
        "number": 18,
        "text": "Khi dùng dịch vụ lưu trữ trực tuyến, tệp của người dùng chủ yếu được lưu ở đâu?",
        "options": [
          {
            "key": "A",
            "text": "Trong bộ nhớ đệm CPU của thiết bị đang dùng."
          },
          {
            "key": "B",
            "text": "Trên máy chủ lưu trữ được truy cập qua Internet."
          },
          {
            "key": "C",
            "text": "Trên màn hình hiển thị của máy tính."
          },
          {
            "key": "D",
            "text": "Trong bộ nhớ RAM của máy tính cá nhân."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Lưu trữ đám mây"
      },
      {
        "id": "102_MCQ_19",
        "number": 19,
        "text": "Khi chia sẻ tệp Google Drive, quyền nào chỉ cho phép người được cấp quyền xem nội dung?",
        "options": [
          {
            "key": "A",
            "text": "Người chỉnh sửa (Editor)."
          },
          {
            "key": "B",
            "text": "Chủ sở hữu (Owner)."
          },
          {
            "key": "C",
            "text": "Người nhận xét (Commenter)."
          },
          {
            "key": "D",
            "text": "Người xem (Viewer)."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Chia sẻ tài nguyên"
      },
      {
        "id": "102_MCQ_20",
        "number": 20,
        "text": "Máy tính mở tài liệu rất chậm trong khi Task Manager cho thấy ổ HDD sử dụng gần 100%, RAM còn trống. Hướng kiểm tra nào hợp lí nhất?",
        "options": [
          {
            "key": "A",
            "text": "Tăng kích thước phông chữ trong File Explorer để giảm tải HDD."
          },
          {
            "key": "B",
            "text": "Kết luận RAM chắc chắn hỏng và thay toàn bộ bộ nhớ ngay lập tức."
          },
          {
            "key": "C",
            "text": "Kiểm tra hoạt động truy xuất ổ lưu trữ và khả năng nâng cấp SSD."
          },
          {
            "key": "D",
            "text": "Ngắt nguồn đột ngột để hệ điều hành tự sửa ổ đĩa cứng."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Nâng cấp phần cứng"
      },
      {
        "id": "102_MCQ_21",
        "number": 21,
        "text": "Một trang web có nhiều hình minh họa đẹp nhưng thiếu nguồn trích dẫn và tác giả. Khi đánh giá độ tin cậy, nhận xét nào đúng?",
        "options": [
          {
            "key": "A",
            "text": "Cần kiểm tra nguồn, tác giả và đối chiếu với những tài liệu có uy tín."
          },
          {
            "key": "B",
            "text": "Giao diện đẹp đủ để khẳng định mọi thông tin trên trang đều đúng."
          },
          {
            "key": "C",
            "text": "Trang web thiếu tên tác giả mặc nhiên là trang thuộc cơ quan nhà nước."
          },
          {
            "key": "D",
            "text": "Chỉ cần số lượt chia sẻ cao thì không phải xác minh thông tin nữa."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Đánh giá thông tin"
      },
      {
        "id": "102_MCQ_22",
        "number": 22,
        "text": "Khi máy tính chạy đồng thời trình duyệt, ứng dụng soạn thảo và trình phát nhạc, vai trò quản lí tiến trình của hệ điều hành được thể hiện ra sao?",
        "options": [
          {
            "key": "A",
            "text": "Biến mọi chương trình đang chạy thành một ứng dụng duy nhất."
          },
          {
            "key": "B",
            "text": "Chuyển tất cả dữ liệu đang xử lí thành các tệp lưu vĩnh viễn."
          },
          {
            "key": "C",
            "text": "Ngừng toàn bộ thiết bị ngoại vi để nhường tài nguyên cho CPU."
          },
          {
            "key": "D",
            "text": "Phân phối tài nguyên xử lí cho các chương trình đang cùng hoạt động."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Quản lí tiến trình"
      },
      {
        "id": "102_MCQ_23",
        "number": 23,
        "text": "Công cụ nào có thể dùng để cùng biên tập văn bản trực tiếp trên trình duyệt web?",
        "options": [
          {
            "key": "A",
            "text": "Microsoft Paint."
          },
          {
            "key": "B",
            "text": "Windows Calculator."
          },
          {
            "key": "C",
            "text": "Windows Notepad."
          },
          {
            "key": "D",
            "text": "Google Docs."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "102_MCQ_24",
        "number": 24,
        "text": "Chữ viết tắt FOSS trong lĩnh vực phần mềm thường chỉ loại phần mềm nào?",
        "options": [
          {
            "key": "A",
            "text": "Phần mềm mua bản quyền theo tháng."
          },
          {
            "key": "B",
            "text": "Phần mềm tự do và nguồn mở."
          },
          {
            "key": "C",
            "text": "Phần mềm chỉ hoạt động khi ngoại tuyến."
          },
          {
            "key": "D",
            "text": "Phần mềm điều khiển phần cứng ngoại vi."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Phần mềm nguồn mở"
      }
    ],
    "tfQuestions": [
      {
        "id": "102_TF_1",
        "number": 1,
        "context": "Tổ Tin học dự kiến dùng phần mềm trực tuyến để xây dựng hồ sơ học tập.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Phần mềm trực tuyến & Nguồn mở",
        "items": [
          {
            "id": "a",
            "text": "Ứng dụng Google Docs bắt buộc phải cài đầy đủ chương trình vào ổ C trước khi truy cập trên trình duyệt.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "LibreOffice là một ví dụ về bộ phần mềm văn phòng nguồn mở.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Tài liệu trực tuyến mặc nhiên được công khai cho tất cả người dùng Internet khi vừa tạo xong.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Nếu muốn cùng sửa một tài liệu trực tuyến, người tạo có thể cấp quyền Chỉnh sửa cho nhóm học tập.",
            "correctValue": true
          }
        ]
      },
      {
        "id": "102_TF_2",
        "number": 2,
        "context": "Trong tiết học, giáo viên mô tả các bộ phận chính và hoạt động của máy tính.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Cấu tạo & Hoạt động máy tính",
        "items": [
          {
            "id": "a",
            "text": "Bo mạch chủ là nền tảng kết nối nhiều linh kiện bên trong máy tính.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "SSD là loại bộ nhớ RAM chỉ duy trì dữ liệu khi máy có điện.",
            "correctValue": false
          },
          {
            "id": "c",
            "text": "Tần số xung nhịp CPU tính bằng GHz là yếu tố duy nhất quyết định hiệu năng của máy.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Khi máy dùng HDD khởi động chậm, cân nhắc cài hệ điều hành trên SSD là một giải pháp hợp lí.",
            "correctValue": true
          }
        ]
      },
      {
        "id": "102_TF_3",
        "number": 3,
        "context": "Lan lưu một thư mục bài tập trên Drive và dự định chỉ chia sẻ cho giáo viên, không chia sẻ cho cả lớp.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Lưu trữ & Phân quyền trên Google Drive",
        "items": [
          {
            "id": "a",
            "text": "Chỉ cần tải tệp lên Drive thì tệp mặc nhiên xuất hiện công khai trên kết quả Google Search.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "Nếu giáo viên chỉ cần đọc thì Lan phải cấp quyền Người chỉnh sửa mới có thể mở tệp.",
            "correctValue": false
          },
          {
            "id": "c",
            "text": "Chế độ Hạn chế cùng quyền truy cập cho địa chỉ giáo viên phù hợp hơn liên kết mở công khai.",
            "correctValue": true
          },
          {
            "id": "d",
            "text": "Lan nên kiểm tra quyền chia sẻ sau khi cấp để bảo đảm người không được mời không truy cập được.",
            "correctValue": true
          }
        ]
      },
      {
        "id": "102_TF_4",
        "number": 4,
        "context": "Nhóm lập bảng tài liệu tham khảo từ kết quả tìm kiếm và gửi đường dẫn cho các thành viên.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Tìm kiếm thông tin & Đánh giá nguồn tin",
        "items": [
          {
            "id": "a",
            "text": "Một kết quả đứng đầu danh sách tìm kiếm vẫn cần được đánh giá về nguồn và độ tin cậy.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "Nhóm có thể kết hợp site: với filetype:pdf nếu cần nguồn từ một website xác định ở dạng PDF.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Toán tử site: được dùng chủ yếu để yêu cầu Google chỉ tìm tệp có đuôi .pdf.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Để loại bỏ từ không mong muốn, nhóm nên đặt dấu cộng ngay trước từ đó.",
            "correctValue": false
          }
        ]
      }
    ]
  },
  {
    "code": "103",
    "title": "Đề kiểm tra Giữa học kì I - Tin học 11 (KNTT) - Mã đề 103",
    "grade": 11,
    "subject": "Tin học",
    "durationMinutes": 45,
    "totalPoints": 10,
    "pdfUrl": "/assets/aistudio/DE_GK1_TIN11_MA_103_HOC_SINH_05357024.pdf",
    "mcqQuestions": [
      {
        "id": "103_MCQ_1",
        "number": 1,
        "text": "Trong các phần mềm sau, đâu là một hệ điều hành thường dùng trên máy tính cá nhân?",
        "options": [
          {
            "key": "A",
            "text": "Windows 11."
          },
          {
            "key": "B",
            "text": "Microsoft Word."
          },
          {
            "key": "C",
            "text": "Adobe Photoshop."
          },
          {
            "key": "D",
            "text": "Google Chrome."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "103_MCQ_2",
        "number": 2,
        "text": "Một ứng dụng xử lí văn bản không mở được do hệ điều hành bị lỗi dù phần cứng vẫn hoạt động. Giải thích nào phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "Ứng dụng vốn có thể chạy độc lập không cần hệ điều hành trong mọi trường hợp."
          },
          {
            "key": "B",
            "text": "Lỗi hệ điều hành làm cho ổ đĩa cứng lập tức mất toàn bộ dung lượng."
          },
          {
            "key": "C",
            "text": "Phần mềm ứng dụng sẽ tự động chuyển thành chương trình chạy trong ROM."
          },
          {
            "key": "D",
            "text": "Ứng dụng thiếu môi trường thực thi và các dịch vụ hệ thống cần thiết."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "103_MCQ_3",
        "number": 3,
        "text": "Tại máy tính dùng chung, người dùng muốn ưu tiên thao tác nháy chính bằng nút phải của chuột. Cần thay đổi thông số nào?",
        "options": [
          {
            "key": "A",
            "text": "Tùy chọn Refresh rate của màn hình."
          },
          {
            "key": "B",
            "text": "Tùy chọn số bản in mặc định của máy in."
          },
          {
            "key": "C",
            "text": "Tùy chọn dung lượng lưu trữ đám mây."
          },
          {
            "key": "D",
            "text": "Tùy chọn Select your primary mouse button."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Cài đặt hệ điều hành"
      },
      {
        "id": "103_MCQ_4",
        "number": 4,
        "text": "Muốn tìm các tài liệu PDF về đề thi Tin học 11 trên miền moet.gov.vn, câu lệnh nào phù hợp nhất?",
        "options": [
          {
            "key": "A",
            "text": "site:moet.gov.vn \"đề thi Tin học 11\" filetype:pdf"
          },
          {
            "key": "B",
            "text": "domain:moet.gov.vn pdf \"đề thi Tin học 11\""
          },
          {
            "key": "C",
            "text": "\"site:moet.gov.vn\" \"filetype:pdf\" đề thi Tin học 11"
          },
          {
            "key": "D",
            "text": "filetype:docx -site:moet.gov.vn \"đề thi Tin học 11\""
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "103_MCQ_5",
        "number": 5,
        "text": "Một học sinh nhận xét Linux là hệ điều hành nguồn mở. Cách giải thích phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Linux luôn hoạt động mà không cần bộ xử lí, bộ nhớ và thiết bị lưu trữ."
          },
          {
            "key": "B",
            "text": "Người sử dụng có thể tiếp cận, sửa đổi và phân phối mã nguồn theo giấy phép."
          },
          {
            "key": "C",
            "text": "Linux chỉ dùng trên điện thoại và không cài đặt được cho máy tính để bàn."
          },
          {
            "key": "D",
            "text": "Linux không có quy định giấy phép và người dùng được làm bất cứ điều gì."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Hệ điều hành nguồn mở"
      },
      {
        "id": "103_MCQ_6",
        "number": 6,
        "text": "Bộ phận nào là nền tảng kết nối CPU, bộ nhớ và các linh kiện trong thân máy?",
        "options": [
          {
            "key": "A",
            "text": "Chuột và bàn phím."
          },
          {
            "key": "B",
            "text": "Ổ đĩa lưu trữ SSD."
          },
          {
            "key": "C",
            "text": "Màn hình hiển thị LCD."
          },
          {
            "key": "D",
            "text": "Bo mạch chủ (mainboard)."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Phần cứng máy tính"
      },
      {
        "id": "103_MCQ_7",
        "number": 7,
        "text": "Bạn cần chọn máy để xử lí nhiều tệp đồ họa đồng thời. Hai máy cùng CPU nhưng khác RAM 8 GB và 16 GB; nên nhận định thế nào?",
        "options": [
          {
            "key": "A",
            "text": "Máy RAM 16 GB luôn tính mọi phép toán nhanh gấp đôi máy 8 GB."
          },
          {
            "key": "B",
            "text": "RAM không liên quan gì đến khả năng chạy đồng thời nhiều ứng dụng."
          },
          {
            "key": "C",
            "text": "Máy RAM 16 GB có thể giảm thiếu bộ nhớ khi nhiều ứng dụng cùng hoạt động."
          },
          {
            "key": "D",
            "text": "Máy 8 GB luôn có tốc độ khởi động cao hơn khi dùng cùng loại SSD."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Bộ nhớ RAM"
      },
      {
        "id": "103_MCQ_8",
        "number": 8,
        "text": "Trong tài liệu hướng dẫn, máy in ghi “20 ppm, 1200 dpi”. Kết luận nào phản ánh đúng các thông số?",
        "options": [
          {
            "key": "A",
            "text": "20 ppm thể hiện dung lượng RAM; 1200 dpi thể hiện tần số quét."
          },
          {
            "key": "B",
            "text": "20 ppm thể hiện số màu; 1200 dpi thể hiện số phút khởi động."
          },
          {
            "key": "C",
            "text": "20 ppm thể hiện độ phân giải; 1200 dpi thể hiện tốc độ in."
          },
          {
            "key": "D",
            "text": "20 ppm thể hiện tốc độ in; 1200 dpi thể hiện mật độ chấm in."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Thiết bị vào - ra"
      },
      {
        "id": "103_MCQ_9",
        "number": 9,
        "text": "Toán tử nào thường dùng để giới hạn kết quả Google Search theo định dạng tệp PDF?",
        "options": [
          {
            "key": "A",
            "text": "filetype:pdf"
          },
          {
            "key": "B",
            "text": "format=pdf"
          },
          {
            "key": "C",
            "text": "domain:pdf"
          },
          {
            "key": "D",
            "text": "site:pdf"
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "103_MCQ_10",
        "number": 10,
        "text": "Bộ ứng dụng văn phòng nguồn mở nào sau đây gồm các công cụ xử lí tài liệu và bảng tính?",
        "options": [
          {
            "key": "A",
            "text": "Microsoft 365 bản quyền."
          },
          {
            "key": "B",
            "text": "Adobe Creative Cloud."
          },
          {
            "key": "C",
            "text": "LibreOffice."
          },
          {
            "key": "D",
            "text": "Apple Final Cut Pro."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Phần mềm nguồn mở"
      },
      {
        "id": "103_MCQ_11",
        "number": 11,
        "text": "Khi thay ổ HDD bằng SSD trong cùng máy tính, tốc độ mở ứng dụng thường tăng vì lí do nào?",
        "options": [
          {
            "key": "A",
            "text": "SSD truy xuất bằng linh kiện điện tử, không phải chờ cơ cấu quay và đầu đọc như HDD."
          },
          {
            "key": "B",
            "text": "SSD làm tăng số nhân CPU gấp đôi mà không cần thay bộ vi xử lí."
          },
          {
            "key": "C",
            "text": "SSD có tác dụng bổ sung trực tiếp bộ nhớ đệm cho màn hình."
          },
          {
            "key": "D",
            "text": "SSD cung cấp nguồn điện mạnh hơn để tăng xung nhịp của CPU."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Lưu trữ máy tính"
      },
      {
        "id": "103_MCQ_12",
        "number": 12,
        "text": "Khi lựa chọn công cụ làm việc nhóm cho máy tính không được cài thêm ứng dụng, nhóm học sinh nên thực hiện cách nào?",
        "options": [
          {
            "key": "A",
            "text": "Đổi hệ điều hành trước khi viết bất cứ nội dung nào của báo cáo."
          },
          {
            "key": "B",
            "text": "Sử dụng bộ công cụ trực tuyến trên trình duyệt và phân quyền cộng tác."
          },
          {
            "key": "C",
            "text": "Dùng trình duyệt ở chế độ ngoại tuyến hoàn toàn để đồng bộ tài liệu."
          },
          {
            "key": "D",
            "text": "Yêu cầu mọi thành viên cài cùng một phần mềm trả phí lên ổ hệ thống."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "103_MCQ_13",
        "number": 13,
        "text": "Muốn truyền đồng thời hình ảnh và âm thanh từ máy tính đến màn hình hỗ trợ tương thích, cổng nào phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "HDMI."
          },
          {
            "key": "B",
            "text": "PS/2."
          },
          {
            "key": "C",
            "text": "RJ45."
          },
          {
            "key": "D",
            "text": "VGA."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Cổng kết nối"
      },
      {
        "id": "103_MCQ_14",
        "number": 14,
        "text": "Công nghệ không dây tầm ngắn nào thường dùng để ghép nối tai nghe với máy tính?",
        "options": [
          {
            "key": "A",
            "text": "VGA."
          },
          {
            "key": "B",
            "text": "HDMI."
          },
          {
            "key": "C",
            "text": "Bluetooth."
          },
          {
            "key": "D",
            "text": "Ethernet."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Kết nối thiết bị"
      },
      {
        "id": "103_MCQ_15",
        "number": 15,
        "text": "Mô hình SaaS thường được hiểu là cách cung cấp phần mềm như thế nào?",
        "options": [
          {
            "key": "A",
            "text": "Phần mềm chỉ được lưu trong ROM và không cập nhật qua Internet."
          },
          {
            "key": "B",
            "text": "Người dùng bắt buộc nhận mã nguồn và tự biên dịch trên máy tính."
          },
          {
            "key": "C",
            "text": "Phần mềm cần chạy trực tiếp trên phần cứng mà không có hệ điều hành."
          },
          {
            "key": "D",
            "text": "Người dùng khai thác ứng dụng dưới dạng dịch vụ thông qua Internet."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Điện toán đám mây (SaaS)"
      },
      {
        "id": "103_MCQ_16",
        "number": 16,
        "text": "Một máy in mới cắm vào máy tính chưa thể in và xuất hiện thông báo thiếu trình điều khiển. Nguyên nhân phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Màn hình máy tính chưa thiết lập độ phân giải tối đa."
          },
          {
            "key": "B",
            "text": "Hệ điều hành chưa có trình điều khiển tương thích để điều khiển máy in."
          },
          {
            "key": "C",
            "text": "Bàn phím của máy chưa kích hoạt các phím chức năng."
          },
          {
            "key": "D",
            "text": "Ổ đĩa hệ thống chưa được đổi sang định dạng tệp PDF."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Trình điều khiển thiết bị"
      },
      {
        "id": "103_MCQ_17",
        "number": 17,
        "text": "Người dùng thao tác qua cửa sổ, biểu tượng và con trỏ chuột nhờ loại giao diện nào?",
        "options": [
          {
            "key": "A",
            "text": "Giao diện mã máy nhị phân."
          },
          {
            "key": "B",
            "text": "Giao diện dòng lệnh (CLI)."
          },
          {
            "key": "C",
            "text": "Giao diện đồ họa (GUI)."
          },
          {
            "key": "D",
            "text": "Giao diện bộ nhớ BIOS."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Giao diện người dùng"
      },
      {
        "id": "103_MCQ_18",
        "number": 18,
        "text": "Công cụ nào có thể dùng để cùng biên tập văn bản trực tiếp trên trình duyệt web?",
        "options": [
          {
            "key": "A",
            "text": "Windows Calculator."
          },
          {
            "key": "B",
            "text": "Google Docs."
          },
          {
            "key": "C",
            "text": "Microsoft Paint."
          },
          {
            "key": "D",
            "text": "Windows Notepad."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "103_MCQ_19",
        "number": 19,
        "text": "Trong câu lệnh tìm kiếm, dấu nào giúp yêu cầu tìm chính xác một cụm từ?",
        "options": [
          {
            "key": "A",
            "text": "Dấu gạch chéo giữa từ."
          },
          {
            "key": "B",
            "text": "Dấu ngoặc kép \" \"."
          },
          {
            "key": "C",
            "text": "Dấu trừ trước từ."
          },
          {
            "key": "D",
            "text": "Dấu sao sau từ."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "103_MCQ_20",
        "number": 20,
        "text": "Một nhóm lập trình chia sẻ mã nguồn trên web nhưng không đính kèm giấy phép. Kết luận nào thận trọng và chính xác nhất?",
        "options": [
          {
            "key": "A",
            "text": "Mã nguồn trên web chắc chắn là sản phẩm không có chủ sở hữu."
          },
          {
            "key": "B",
            "text": "Mã nguồn đăng công khai luôn có giấy phép GNU GPL theo mặc định."
          },
          {
            "key": "C",
            "text": "Mọi người được toàn quyền bán lại mã nguồn mà không cần xem điều kiện."
          },
          {
            "key": "D",
            "text": "Không tự suy ra quyền sửa đổi và phân phối lại chỉ từ việc nhìn thấy mã nguồn."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Bản quyền phần mềm"
      },
      {
        "id": "103_MCQ_21",
        "number": 21,
        "text": "Cần lưu 500 bài hát, mỗi bài 5 MB, và 1.000 ảnh, mỗi ảnh 3 MB. Thẻ nhớ nào trong các lựa chọn đủ chứa dữ liệu?",
        "options": [
          {
            "key": "A",
            "text": "2 GB."
          },
          {
            "key": "B",
            "text": "512 MB."
          },
          {
            "key": "C",
            "text": "8 GB."
          },
          {
            "key": "D",
            "text": "4 GB."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Dung lượng lưu trữ"
      },
      {
        "id": "103_MCQ_22",
        "number": 22,
        "text": "Trong thông số CPU, đơn vị nào thường được dùng cho tần số xung nhịp?",
        "options": [
          {
            "key": "A",
            "text": "GHz."
          },
          {
            "key": "B",
            "text": "GB."
          },
          {
            "key": "C",
            "text": "DPI."
          },
          {
            "key": "D",
            "text": "Ppm."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Bộ vi xử lý CPU"
      },
      {
        "id": "103_MCQ_23",
        "number": 23,
        "text": "Một thư chứa hóa đơn giả mạo đến từ địa chỉ lạ, yêu cầu nhập mật khẩu vào trang qua liên kết. Cách xử lí hợp lí nhất?",
        "options": [
          {
            "key": "A",
            "text": "Tải mọi tệp đính kèm và tắt phần mềm bảo vệ để kiểm tra nội dung."
          },
          {
            "key": "B",
            "text": "Không mở liên kết, đối chiếu người gửi qua kênh chính thức và báo cáo thư lừa đảo."
          },
          {
            "key": "C",
            "text": "Nhập mật khẩu để xác nhận rồi đổi mật khẩu nếu thấy trang không đáng tin."
          },
          {
            "key": "D",
            "text": "Chuyển tiếp thư cho toàn bộ nhóm lớp để mọi người cùng thử đường liên kết."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "An toàn thông tin"
      },
      {
        "id": "103_MCQ_24",
        "number": 24,
        "text": "Khi đặt một cụm từ trong dấu ngoặc kép khi tìm kiếm, kết quả thường thay đổi thế nào?",
        "options": [
          {
            "key": "A",
            "text": "Công cụ luôn loại bỏ mọi nội dung được xuất bản trước một năm."
          },
          {
            "key": "B",
            "text": "Công cụ tự chuyển đổi ngôn ngữ của tất cả trang sang tiếng Anh."
          },
          {
            "key": "C",
            "text": "Công cụ ưu tiên những trang có cụm từ đúng theo thứ tự đã nhập."
          },
          {
            "key": "D",
            "text": "Công cụ chỉ tìm trang có hình ảnh và bỏ qua mọi văn bản."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      }
    ],
    "tfQuestions": [
      {
        "id": "103_TF_1",
        "number": 1,
        "context": "Lớp thảo luận quyền sử dụng phần mềm và lựa chọn công cụ cho hoạt động nhóm.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Bản quyền & Công cụ nhóm",
        "items": [
          {
            "id": "a",
            "text": "Một số giấy phép mã nguồn mở cho phép người sử dụng xem, sửa và phân phối lại mã nguồn theo điều kiện.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "Phần mềm thương mại và phần mềm nguồn mở đều mặc nhiên không có tác giả hoặc chủ sở hữu.",
            "correctValue": false
          },
          {
            "id": "c",
            "text": "Công khai mã nguồn trên mạng đồng nghĩa phần mềm không cần bất kì giấy phép nào.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Với công việc cần cùng sửa văn bản khi ở xa, sử dụng Google Docs và cấp quyền phù hợp là lựa chọn hợp lí.",
            "correctValue": true
          }
        ]
      },
      {
        "id": "103_TF_2",
        "number": 2,
        "context": "Nhóm xem thông số bộ nhớ và bộ xử lí trước khi đề xuất nâng cấp máy.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Cấu hình bộ nhớ và vi xử lý",
        "items": [
          {
            "id": "a",
            "text": "Bộ nhớ RAM của PC có nhiệm vụ lưu trữ lâu dài toàn bộ tệp khi tắt máy.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "ALU là bộ phận trong CPU thực hiện các phép toán số học và logic.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Nếu RAM gần đầy khi chạy nhiều phần mềm, kiểm tra các ứng dụng đang dùng RAM là bước hợp lí.",
            "correctValue": true
          },
          {
            "id": "d",
            "text": "SSD có tốc độ truy xuất luôn chậm hơn HDD vì không có đĩa từ quay.",
            "correctValue": false
          }
        ]
      },
      {
        "id": "103_TF_3",
        "number": 3,
        "context": "Một nhóm biên tập báo cáo về an toàn mạng và đặt quyền chia sẻ tài liệu trực tuyến.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "An toàn dữ liệu & Phân quyền trực tuyến",
        "items": [
          {
            "id": "a",
            "text": "Nếu đặt quyền Người xem, mọi thành viên đều được phép xóa nội dung gốc.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "Người được cấp quyền Chỉnh sửa có thể thay đổi nội dung tệp theo quyền đã cấp.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Để tránh lộ dữ liệu, nhóm nên đặt tài liệu nhạy cảm ở chế độ công khai và cho phép bất kì ai sửa.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Chỉ cấp quyền Chỉnh sửa cho thành viên làm nội dung có thể giảm nguy cơ thay đổi ngoài ý muốn.",
            "correctValue": true
          }
        ]
      },
      {
        "id": "103_TF_4",
        "number": 4,
        "context": "An tìm báo cáo PDF trên một tên miền tổ chức rồi gửi tài liệu cho giáo viên và bạn học.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Tìm kiếm chuyên sâu & Thư điện tử",
        "items": [
          {
            "id": "a",
            "text": "Dấu ngoặc kép trong tìm kiếm có thể giúp thu hẹp vào một cụm từ chính xác.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "An có thể dùng site: kết hợp filetype:pdf để giới hạn cả website và loại tệp kết quả.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Trường Bcc trong email hiển thị công khai danh sách người nhận cho tất cả thành viên.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "An nên xem kết quả có số lượt chia sẻ lớn là thông tin luôn chính xác, không cần đối chiếu nguồn.",
            "correctValue": false
          }
        ]
      }
    ]
  },
  {
    "code": "104",
    "title": "Đề kiểm tra Giữa học kì I - Tin học 11 (KNTT) - Mã đề 104",
    "grade": 11,
    "subject": "Tin học",
    "durationMinutes": 45,
    "totalPoints": 10,
    "pdfUrl": "/assets/aistudio/DE_GK1_TIN11_MA_104_HOC_SINH_34ceb322.pdf",
    "mcqQuestions": [
      {
        "id": "104_MCQ_1",
        "number": 1,
        "text": "Sau khi người dùng chia sẻ tệp ở quyền Người xem, thành viên cần góp ý nhưng không được sửa nội dung gốc. Cách điều chỉnh phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "Bật quyền Bất kỳ ai có liên kết đều chỉnh sửa để thành viên bình luận."
          },
          {
            "key": "B",
            "text": "Cấp quyền Chủ sở hữu (Owner) để thành viên kiểm soát mọi phiên bản."
          },
          {
            "key": "C",
            "text": "Xóa tệp gốc rồi yêu cầu thành viên tải lên một phiên bản mới."
          },
          {
            "key": "D",
            "text": "Cấp quyền Người nhận xét (Commenter) để thành viên gửi góp ý trên tài liệu."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Phân quyền tài nguyên"
      },
      {
        "id": "104_MCQ_2",
        "number": 2,
        "text": "Khi dùng dịch vụ lưu trữ trực tuyến, tệp của người dùng chủ yếu được lưu ở đâu?",
        "options": [
          {
            "key": "A",
            "text": "Trên máy chủ lưu trữ được truy cập qua Internet."
          },
          {
            "key": "B",
            "text": "Trong bộ nhớ RAM của máy tính cá nhân."
          },
          {
            "key": "C",
            "text": "Trong bộ nhớ đệm CPU của thiết bị đang dùng."
          },
          {
            "key": "D",
            "text": "Trên màn hình hiển thị của máy tính."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Lưu trữ đám mây"
      },
      {
        "id": "104_MCQ_3",
        "number": 3,
        "text": "Khi laptop chưa tìm được tai nghe Bluetooth đang mở nguồn, bước xử lí nào nên thử trước?",
        "options": [
          {
            "key": "A",
            "text": "Đổi định dạng ổ đĩa hệ thống nhằm nhận thiết bị không dây."
          },
          {
            "key": "B",
            "text": "Kiểm tra Bluetooth trên laptop và đưa tai nghe vào chế độ ghép nối."
          },
          {
            "key": "C",
            "text": "Thay cáp HDMI của màn hình để bổ sung kết nối tai nghe."
          },
          {
            "key": "D",
            "text": "Tắt hoàn toàn hệ điều hành rồi tháo bộ nhớ RAM ra kiểm tra."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Kết nối không dây"
      },
      {
        "id": "104_MCQ_4",
        "number": 4,
        "text": "Cần lưu 500 bài hát, mỗi bài 5 MB, và 1.000 ảnh, mỗi ảnh 3 MB. Thẻ nhớ nào trong các lựa chọn đủ chứa dữ liệu?",
        "options": [
          {
            "key": "A",
            "text": "512 MB."
          },
          {
            "key": "B",
            "text": "8 GB."
          },
          {
            "key": "C",
            "text": "2 GB."
          },
          {
            "key": "D",
            "text": "4 GB."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Dung lượng lưu trữ"
      },
      {
        "id": "104_MCQ_5",
        "number": 5,
        "text": "Trong hệ thống máy tính cá nhân, nhiệm vụ cơ bản nào thuộc về hệ điều hành?",
        "options": [
          {
            "key": "A",
            "text": "Soạn nội dung văn bản theo yêu cầu trực tiếp của người dùng."
          },
          {
            "key": "B",
            "text": "Thiết kế hình ảnh và chỉnh sửa video theo dự án học tập."
          },
          {
            "key": "C",
            "text": "Quản lí, điều phối các tài nguyên của máy tính và phục vụ chương trình."
          },
          {
            "key": "D",
            "text": "Trình bày các trang web do người sử dụng truy cập."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "104_MCQ_6",
        "number": 6,
        "text": "Toán tử nào thường dùng để giới hạn kết quả Google Search theo định dạng tệp PDF?",
        "options": [
          {
            "key": "A",
            "text": "domain:pdf"
          },
          {
            "key": "B",
            "text": "format=pdf"
          },
          {
            "key": "C",
            "text": "site:pdf"
          },
          {
            "key": "D",
            "text": "filetype:pdf"
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "104_MCQ_7",
        "number": 7,
        "text": "Trong các phần mềm sau, đâu là một hệ điều hành thường dùng trên máy tính cá nhân?",
        "options": [
          {
            "key": "A",
            "text": "Windows 11."
          },
          {
            "key": "B",
            "text": "Adobe Photoshop."
          },
          {
            "key": "C",
            "text": "Microsoft Word."
          },
          {
            "key": "D",
            "text": "Google Chrome."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "104_MCQ_8",
        "number": 8,
        "text": "Một máy in mới cắm vào máy tính chưa thể in và xuất hiện thông báo thiếu trình điều khiển. Nguyên nhân phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Hệ điều hành chưa có trình điều khiển tương thích để điều khiển máy in."
          },
          {
            "key": "B",
            "text": "Bàn phím của máy chưa kích hoạt các phím chức năng."
          },
          {
            "key": "C",
            "text": "Màn hình máy tính chưa thiết lập độ phân giải tối đa."
          },
          {
            "key": "D",
            "text": "Ổ đĩa hệ thống chưa được đổi sang định dạng tệp PDF."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Trình điều khiển thiết bị"
      },
      {
        "id": "104_MCQ_9",
        "number": 9,
        "text": "Trong các thiết bị sau, thiết bị nào được xếp vào nhóm thiết bị đưa dữ liệu vào máy tính?",
        "options": [
          {
            "key": "A",
            "text": "Máy in laser."
          },
          {
            "key": "B",
            "text": "Loa vi tính."
          },
          {
            "key": "C",
            "text": "Máy quét tài liệu."
          },
          {
            "key": "D",
            "text": "Màn hình máy tính."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Thiết bị vào - ra"
      },
      {
        "id": "104_MCQ_10",
        "number": 10,
        "text": "Khi thay ổ HDD bằng SSD trong cùng máy tính, tốc độ mở ứng dụng thường tăng vì lí do nào?",
        "options": [
          {
            "key": "A",
            "text": "SSD làm tăng số nhân CPU gấp đôi mà không cần thay bộ vi xử lí."
          },
          {
            "key": "B",
            "text": "SSD cung cấp nguồn điện mạnh hơn để tăng xung nhịp của CPU."
          },
          {
            "key": "C",
            "text": "SSD truy xuất bằng linh kiện điện tử, không phải chờ cơ cấu quay và đầu đọc như HDD."
          },
          {
            "key": "D",
            "text": "SSD có tác dụng bổ sung trực tiếp bộ nhớ đệm cho màn hình."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Lưu trữ máy tính"
      },
      {
        "id": "104_MCQ_11",
        "number": 11,
        "text": "Nhóm 5 học sinh phải cùng chỉnh sửa một báo cáo và nhìn thấy các thay đổi gần như ngay lập tức. Phương án phù hợp nhất là gì?",
        "options": [
          {
            "key": "A",
            "text": "Tạo tài liệu Google Docs và chia sẻ quyền chỉnh sửa cho từng thành viên."
          },
          {
            "key": "B",
            "text": "Một bạn giữ tệp trên máy tính cá nhân, các bạn khác chỉ đọc kết quả."
          },
          {
            "key": "C",
            "text": "Mỗi bạn sửa một bản Word riêng và chờ cuối tuần mới ghép nội dung."
          },
          {
            "key": "D",
            "text": "Chỉ gửi ảnh chụp bản thảo cho mọi người qua tin nhắn điện thoại."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "104_MCQ_12",
        "number": 12,
        "text": "Tại máy tính dùng chung, người dùng muốn ưu tiên thao tác nháy chính bằng nút phải của chuột. Cần thay đổi thông số nào?",
        "options": [
          {
            "key": "A",
            "text": "Tùy chọn Select your primary mouse button."
          },
          {
            "key": "B",
            "text": "Tùy chọn Refresh rate của màn hình."
          },
          {
            "key": "C",
            "text": "Tùy chọn số bản in mặc định của máy in."
          },
          {
            "key": "D",
            "text": "Tùy chọn dung lượng lưu trữ đám mây."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Cài đặt hệ điều hành"
      },
      {
        "id": "104_MCQ_13",
        "number": 13,
        "text": "Mô hình SaaS thường được hiểu là cách cung cấp phần mềm như thế nào?",
        "options": [
          {
            "key": "A",
            "text": "Người dùng bắt buộc nhận mã nguồn và tự biên dịch trên máy tính."
          },
          {
            "key": "B",
            "text": "Phần mềm cần chạy trực tiếp trên phần cứng mà không có hệ điều hành."
          },
          {
            "key": "C",
            "text": "Người dùng khai thác ứng dụng dưới dạng dịch vụ thông qua Internet."
          },
          {
            "key": "D",
            "text": "Phần mềm chỉ được lưu trong ROM và không cập nhật qua Internet."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Điện toán đám mây (SaaS)"
      },
      {
        "id": "104_MCQ_14",
        "number": 14,
        "text": "Một đơn vị cần xem lại quá trình sửa một báo cáo chung và muốn hạn chế chỉnh sửa ngoài nhóm. Cách tổ chức nào tốt nhất?",
        "options": [
          {
            "key": "A",
            "text": "Dùng liên kết công khai cho phép mọi tài khoản đều sửa mà không kiểm soát."
          },
          {
            "key": "B",
            "text": "Tắt tính năng chia sẻ rồi yêu cầu mọi người ghi sửa trực tiếp trên ảnh chụp."
          },
          {
            "key": "C",
            "text": "Mỗi người tạo bản riêng trên máy cá nhân và không ghi nhận lịch sử sửa đổi."
          },
          {
            "key": "D",
            "text": "Dùng tài liệu trực tuyến có lịch sử phiên bản và cấp quyền theo địa chỉ thành viên."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Quản lí tài liệu trực tuyến"
      },
      {
        "id": "104_MCQ_15",
        "number": 15,
        "text": "Công cụ nào có thể dùng để cùng biên tập văn bản trực tiếp trên trình duyệt web?",
        "options": [
          {
            "key": "A",
            "text": "Microsoft Paint."
          },
          {
            "key": "B",
            "text": "Windows Calculator."
          },
          {
            "key": "C",
            "text": "Windows Notepad."
          },
          {
            "key": "D",
            "text": "Google Docs."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Ứng dụng trực tuyến"
      },
      {
        "id": "104_MCQ_16",
        "number": 16,
        "text": "Trong thông số CPU, đơn vị nào thường được dùng cho tần số xung nhịp?",
        "options": [
          {
            "key": "A",
            "text": "GB."
          },
          {
            "key": "B",
            "text": "GHz."
          },
          {
            "key": "C",
            "text": "DPI."
          },
          {
            "key": "D",
            "text": "Ppm."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Bộ vi xử lý CPU"
      },
      {
        "id": "104_MCQ_17",
        "number": 17,
        "text": "Bộ ứng dụng văn phòng nguồn mở nào sau đây gồm các công cụ xử lí tài liệu và bảng tính?",
        "options": [
          {
            "key": "A",
            "text": "Adobe Creative Cloud."
          },
          {
            "key": "B",
            "text": "LibreOffice."
          },
          {
            "key": "C",
            "text": "Apple Final Cut Pro."
          },
          {
            "key": "D",
            "text": "Microsoft 365 bản quyền."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Phần mềm nguồn mở"
      },
      {
        "id": "104_MCQ_18",
        "number": 18,
        "text": "Chức năng nào phản ánh đúng mối quan hệ giữa hệ điều hành và phần mềm ứng dụng?",
        "options": [
          {
            "key": "A",
            "text": "Hệ điều hành chỉ có tác dụng mở trình duyệt, không điều phối bộ nhớ RAM."
          },
          {
            "key": "B",
            "text": "Phần mềm ứng dụng có quyền thay thế mọi trình điều khiển thiết bị khi chạy."
          },
          {
            "key": "C",
            "text": "Hệ điều hành cung cấp dịch vụ để ứng dụng khai thác thiết bị có kiểm soát."
          },
          {
            "key": "D",
            "text": "Ứng dụng cấp nguồn điện cho tất cả linh kiện khi hệ điều hành chưa hoạt động."
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "104_MCQ_19",
        "number": 19,
        "text": "Một ứng dụng xử lí văn bản không mở được do hệ điều hành bị lỗi dù phần cứng vẫn hoạt động. Giải thích nào phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "Lỗi hệ điều hành làm cho ổ đĩa cứng lập tức mất toàn bộ dung lượng."
          },
          {
            "key": "B",
            "text": "Ứng dụng thiếu môi trường thực thi và các dịch vụ hệ thống cần thiết."
          },
          {
            "key": "C",
            "text": "Phần mềm ứng dụng sẽ tự động chuyển thành chương trình chạy trong ROM."
          },
          {
            "key": "D",
            "text": "Ứng dụng vốn có thể chạy độc lập không cần hệ điều hành trong mọi trường hợp."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Hệ điều hành"
      },
      {
        "id": "104_MCQ_20",
        "number": 20,
        "text": "Một máy có ổ SSD còn nhiều dung lượng nhưng ứng dụng thường xuyên báo thiếu bộ nhớ khi mở nhiều tab. Giải pháp nào phù hợp?",
        "options": [
          {
            "key": "A",
            "text": "Chỉ tạo thêm thư mục trên SSD để thay thế dung lượng RAM bị thiếu."
          },
          {
            "key": "B",
            "text": "Đổi tên thư mục chứa ứng dụng nhằm làm bộ nhớ RAM tự mở rộng."
          },
          {
            "key": "C",
            "text": "Chuyển cáp HDMI sang cáp VGA để tăng vùng nhớ khả dụng."
          },
          {
            "key": "D",
            "text": "Kiểm tra mức dùng RAM, đóng bớt ứng dụng và cân nhắc bổ sung RAM."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Bộ nhớ RAM"
      },
      {
        "id": "104_MCQ_21",
        "number": 21,
        "text": "Tần số quét của màn hình thường được biểu thị bằng đơn vị nào?",
        "options": [
          {
            "key": "A",
            "text": "Megabit (Mb)."
          },
          {
            "key": "B",
            "text": "Gigabyte (GB)."
          },
          {
            "key": "C",
            "text": "Dots per inch (DPI)."
          },
          {
            "key": "D",
            "text": "Hertz (Hz)."
          }
        ],
        "correctOption": "D",
        "points": 0.25,
        "topic": "Màn hình máy tính"
      },
      {
        "id": "104_MCQ_22",
        "number": 22,
        "text": "Trong CPU, bộ phận nào thực hiện các phép tính số học và phép toán logic?",
        "options": [
          {
            "key": "A",
            "text": "Bộ điều khiển màn hình (OSD)."
          },
          {
            "key": "B",
            "text": "Đơn vị số học và logic (ALU)."
          },
          {
            "key": "C",
            "text": "Thiết bị lưu trữ HDD."
          },
          {
            "key": "D",
            "text": "Bộ phát Wi-Fi (WAP)."
          }
        ],
        "correctOption": "B",
        "points": 0.25,
        "topic": "Bộ vi xử lý CPU"
      },
      {
        "id": "104_MCQ_23",
        "number": 23,
        "text": "Muốn tìm các tài liệu PDF về đề thi Tin học 11 trên miền moet.gov.vn, câu lệnh nào phù hợp nhất?",
        "options": [
          {
            "key": "A",
            "text": "\"site:moet.gov.vn\" \"filetype:pdf\" đề thi Tin học 11"
          },
          {
            "key": "B",
            "text": "domain:moet.gov.vn pdf \"đề thi Tin học 11\""
          },
          {
            "key": "C",
            "text": "site:moet.gov.vn \"đề thi Tin học 11\" filetype:pdf"
          },
          {
            "key": "D",
            "text": "filetype:docx -site:moet.gov.vn \"đề thi Tin học 11\""
          }
        ],
        "correctOption": "C",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      },
      {
        "id": "104_MCQ_24",
        "number": 24,
        "text": "Khi đặt một cụm từ trong dấu ngoặc kép khi tìm kiếm, kết quả thường thay đổi thế nào?",
        "options": [
          {
            "key": "A",
            "text": "Công cụ ưu tiên những trang có cụm từ đúng theo thứ tự đã nhập."
          },
          {
            "key": "B",
            "text": "Công cụ luôn loại bỏ mọi nội dung được xuất bản trước một năm."
          },
          {
            "key": "C",
            "text": "Công cụ chỉ tìm trang có hình ảnh và bỏ qua mọi văn bản."
          },
          {
            "key": "D",
            "text": "Công cụ tự chuyển đổi ngôn ngữ của tất cả trang sang tiếng Anh."
          }
        ],
        "correctOption": "A",
        "points": 0.25,
        "topic": "Tìm kiếm thông tin"
      }
    ],
    "tfQuestions": [
      {
        "id": "104_TF_1",
        "number": 1,
        "context": "Trước khi chọn công cụ làm báo cáo, học sinh đối chiếu tính năng ứng dụng trên Internet.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Ứng dụng Internet & Nguồn mở",
        "items": [
          {
            "id": "a",
            "text": "Google Sheets chỉ là phần mềm chạy được khi cài trực tiếp từ đĩa cứng, không thể dùng trên web.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "Phần mềm nguồn mở có giấy phép xác định các quyền sử dụng và sửa đổi mã nguồn.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Sử dụng công cụ trực tuyến cho phép cộng tác trên tài liệu nếu người dùng được cấp quyền phù hợp.",
            "correctValue": true
          },
          {
            "id": "d",
            "text": "Để chỉ giáo viên chỉnh sửa bài nộp, học sinh nên cấp quyền chỉnh sửa cho bất kì ai có liên kết.",
            "correctValue": false
          }
        ]
      },
      {
        "id": "104_TF_2",
        "number": 2,
        "context": "Một nhóm kiểm tra cấu hình máy tính đang sử dụng tại phòng thực hành.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Kiểm tra phần cứng phòng thực hành",
        "items": [
          {
            "id": "a",
            "text": "CPU có nhiệm vụ thực hiện lệnh trong quá trình xử lí dữ liệu.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "RAM thường giữ nguyên dữ liệu ngay cả khi máy tính tắt nguồn.",
            "correctValue": false
          },
          {
            "id": "c",
            "text": "Nếu máy đang chậm do mở quá nhiều chương trình và thiếu RAM, thay loa ngoài là giải pháp nâng cao hiệu năng trực tiếp.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "SSD thường có khả năng truy xuất dữ liệu nhanh hơn HDD do không dùng cơ cấu cơ học quay đĩa.",
            "correctValue": true
          }
        ]
      },
      {
        "id": "104_TF_3",
        "number": 3,
        "context": "Hà chuẩn bị gửi tệp tài liệu có nội dung riêng tư cho nhóm trưởng trên Drive.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Phân quyền Google Drive an toàn",
        "items": [
          {
            "id": "a",
            "text": "Chia sẻ cho đúng tài khoản nhóm trưởng phù hợp hơn việc dùng liên kết chỉnh sửa công khai.",
            "correctValue": true
          },
          {
            "id": "b",
            "text": "Hà nên mở cửa sổ Chia sẻ kiểm tra quyền của nhóm trưởng trước khi gửi liên kết.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Quyền Người xem (Viewer) cho phép người nhận chỉnh sửa trực tiếp mọi nội dung gốc.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Một khi đã cấp quyền xem qua Drive, chủ sở hữu không thể thay đổi quyền nữa.",
            "correctValue": false
          }
        ]
      },
      {
        "id": "104_TF_4",
        "number": 4,
        "context": "Nhóm tìm tài liệu Tin học trên mạng và viết email báo cáo tiến độ.",
        "pointsBreakdown": {
          "1": 0.1,
          "2": 0.25,
          "3": 0.5,
          "4": 1
        },
        "topic": "Tìm kiếm mạng & Thư điện tử",
        "items": [
          {
            "id": "a",
            "text": "Toán tử filetype: được sử dụng để chỉ định tài khoản người nhận thư điện tử.",
            "correctValue": false
          },
          {
            "id": "b",
            "text": "Thông tin trên một trang cá nhân cần được đối chiếu với các nguồn đáng tin cậy khi dùng làm tài liệu học tập.",
            "correctValue": true
          },
          {
            "id": "c",
            "text": "Dùng To cho 40 người nhận sẽ ẩn địa chỉ email của từng người với tất cả người nhận còn lại.",
            "correctValue": false
          },
          {
            "id": "d",
            "text": "Nếu cần gửi email mà không để lộ danh sách địa chỉ giữa người nhận, dùng Bcc là phù hợp.",
            "correctValue": true
          }
        ]
      }
    ]
  }
];


/**
 * HELPER: Strip answers before sending questions to students
 */
export function getStudentStrippedExamSecret(code: string, durationMinutes = 45) {
  const exam = OFFICIAL_EXAMS_SECRET.find(e => e.code === code) || OFFICIAL_EXAMS_SECRET[0];
  return {
    code: exam.code,
    title: exam.title,
    grade: exam.grade,
    subject: exam.subject,
    durationMinutes: durationMinutes || exam.durationMinutes,
    totalPoints: exam.totalPoints,
    mcqQuestions: exam.mcqQuestions.map((q: MCQQuestion) => ({
      id: q.id,
      number: q.number,
      text: q.text,
      options: q.options,
      points: q.points,
      topic: q.topic
    })),
    tfQuestions: exam.tfQuestions.map((q: TFQuestion) => ({
      id: q.id,
      number: q.number,
      context: q.context,
      topic: q.topic,
      pointsBreakdown: q.pointsBreakdown,
      items: q.items.map(item => ({
        id: item.id,
        text: item.text
      }))
    }))
  };
}

/**
 * HELPER: Get full official exam with answers (Teacher only)
 */
export function getOfficialExamSecret(code: string): ExamVersion {
  return OFFICIAL_EXAMS_SECRET.find(e => e.code === code) || OFFICIAL_EXAMS_SECRET[0];
}
