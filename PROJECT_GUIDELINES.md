# 🛠️ PROJECT GUIDELINES: SBA301 - RAG Project

Đây là tài liệu quy định về tiêu chuẩn code và quy trình làm việc (workflow) giữa Koda và Khôi cho dự án SBA301. Mọi thay đổi trong project phải tuân thủ nghiêm ngặt các quy tắc này.

## 1. 🔄 Workflow Thực Thi (Strict Execution)
Để tránh gây ức chế và tốn thời gian, Koda tuân thủ quy trình **"Silent Action $\rightarrow$ Verified Result $\rightarrow$ Detailed Report"**:

- **KHÔNG** báo "Tôi sẽ làm...", "Tôi bắt đầu...", "Tôi thực hiện ngay...".
- **THỰC HIỆN** toàn bộ các bước (đọc, viết, sửa, chạy test/compile) một cách âm thầm.
- **XÁC MINH** kết quả bằng công cụ thực tế (ví dụ: chạy `mvn compile` hoặc `spring-boot:run`) trước khi phản hồi.
- **BÁO CÁO** sau khi đã xong, với nội dung chi tiết:
    - File nào đã thay đổi?
    - Dòng nào được sửa/thêm/xóa?
    - Tại sao lại sửa như vậy (logic)?
    - Bằng chứng xác nhận đã chạy thành công (log output).

## 2. 🏗️ Kiến Trúc Hệ Thống (Core Architecture)

### 2.1. Exception Handling (Gom Chung)
Tuân thủ tuyệt đối cơ chế xử lý lỗi tập trung:
- **ErrorCode**: Là nơi duy nhất định nghĩa tất cả các mã lỗi, thông điệp và HTTP Status. Khi có lỗi mới $\rightarrow$ Thêm vào `ErrorCode`.
- **ApiException**: Là lớp exception chung duy nhất được sử dụng để ném lỗi trong toàn bộ project. Không tự ý tạo các class Exception con (như `RagException`, `AuthException`...) trừ khi có yêu cầu đặc biệt.
- **Luồng đi**: `Service/Controller` $\rightarrow$ `throw new ApiException(ErrorCode.XXX)` $\rightarrow$ `GlobalExceptionHandler` $\rightarrow$ `ApiResponse`.

### 2.2. Unified Response (ApiResponse)
- Mọi Endpoint trong Controller **BẮT BUỘC** phải trả về `ResponseEntity<ApiResponse<T>>`.
- Sử dụng `ApiResponse.success()` cho luồng thành công.
- Sử dụng `ApiResponse.error()` (hoặc qua `GlobalExceptionHandler`) cho luồng thất bại.

### 2.3. Security & Dependency
- Không được tạo vòng lặp phụ thuộc (Circular Dependency). 
- Luôn tách biệt logic cấu hình (`SecurityConfig`) và logic thực thi (`UserDetailsService`, `Filter`).

## 3. ⚠️ Lưu Ý Khi Code (Developer Notes)
- **Surgical Changes**: Chỉ chạm vào những phần cần sửa. Không refactor lung tung hoặc thay đổi style code hiện có.
- **Dependency Inversion**: Ưu tiên tiêm (inject) Interface thay vì implementation cụ thể.
- **Logging**: Sử dụng `@Slf4j` để log thông tin quan trọng, không dùng `System.out.println`.
- **Validation**: Luôn sử dụng `@Validated` và các constraint như `@NotBlank`, `@NotNull` tại Controller.

---
*Ngày cập nhật cuối: 2026-05-24*
*Trạng thái: Áp dụng bắt buộc*
