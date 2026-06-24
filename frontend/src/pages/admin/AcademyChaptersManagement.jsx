import Footer from "@/components/Footer.jsx";
import React from "react";

export default function AcademyChaptersManagement() {
  return (
    <div className="animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <nav className="flex items-center text-[10px] font-semibold text-secondary/60 tracking-widest uppercase mb-3">
            <span>Học viện</span>
            <span className="material-symbols-outlined text-[12px] mx-2">chevron_right</span>
            <span>Quản lý chương học</span>
          </nav>
          <h3 className="font-display text-4xl font-semibold text-on-surface">Danh Mục Chương Trình</h3>
          <p className="text-on-surface-variant/70 mt-3 max-w-2xl">Quản lý và biên soạn các chương học cốt lõi trong hệ thống tri thức Lyceum. Mỗi chương đại diện cho một trụ cột của sự hiểu biết.</p>
        </div>
        <div>
          <button className="bg-secondary text-on-secondary px-8 py-3 text-sm font-semibold uppercase tracking-widest border border-secondary hover:bg-transparent hover:text-secondary transition-all duration-500 shadow-lg shadow-secondary/10">
            Thêm chương mới
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low border border-secondary/10 p-gutter folio-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">auto_stories</span>
          </div>
          <p className="text-secondary font-semibold uppercase tracking-tighter text-xs mb-2">Tổng quan nội dung</p>
          <h4 className="font-display text-2xl font-semibold text-on-surface mb-6">24 Chương Học Đã Xuất Bản</h4>
          <div className="flex space-x-12">
            <div>
              <span className="block text-4xl font-display text-on-surface">156</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Bài học tổng cộng</span>
            </div>
            <div>
              <span className="block text-4xl font-display text-on-surface">1.2k</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Học viên tham gia</span>
            </div>
            <div>
              <span className="block text-4xl font-display text-secondary">98%</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Tỉ lệ hoàn thành</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 bg-secondary-container/10 border border-secondary/20 p-gutter flex flex-col justify-between">
          <div>
            <p className="text-secondary font-semibold uppercase tracking-tighter text-xs mb-2">Trạng thái hệ thống</p>
            <p className="text-on-surface text-sm italic">&quot;Tri thức là ngọn đèn duy nhất soi sáng bóng tối của sự vô tri.&quot;</p>
          </div>
          <div className="flex items-center space-x-2 text-secondary mt-6">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-[11px] font-semibold uppercase tracking-widest">Máy chủ Archive-01: Hoạt động</span>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container-lowest border border-secondary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-secondary/20">
                <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em]">Tên chương</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em]">Mô tả</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-center">Số bài học</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              <tr className="hover:bg-secondary/5 transition-colors group cursor-pointer">
                <td className="px-6 py-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-surface-container flex items-center justify-center border border-secondary/30 mr-4 group-hover:border-secondary transition-colors">
                      <span className="material-symbols-outlined text-secondary text-xl">menu_book</span>
                    </div>
                    <span className="font-display text-lg text-on-surface group-hover:text-secondary transition-colors">Nhập môn Triết học</span>
                  </div>
                </td>
                <td className="px-6 py-6 border-l border-secondary/5">
                  <p className="text-on-surface-variant text-sm line-clamp-1 max-w-xs">Tìm hiểu những khái niệm cơ bản về sự tồn tại và nhận thức luận.</p>
                </td>
                <td className="px-6 py-6 text-center border-l border-secondary/5">
                  <span className="text-on-surface">12</span>
                </td>
                <td className="px-6 py-6 border-l border-secondary/5">
                  <span className="inline-flex items-center px-2 py-0.5 border border-secondary/40 text-[10px] text-secondary uppercase tracking-widest font-bold bg-secondary/5">
                    Đã xuất bản
                  </span>
                </td>
                <td className="px-6 py-6 text-right border-l border-secondary/5">
                  <div className="flex justify-end space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button className="text-on-surface-variant hover:text-secondary transition-colors flex items-center space-x-1" title="Sửa">
                      <span className="material-symbols-outlined text-lg">edit</span>
                      <span className="text-[11px] uppercase tracking-tighter font-medium">Sửa</span>
                    </button>
                    <button className="text-on-surface-variant hover:text-error transition-colors flex items-center space-x-1" title="Xóa">
                      <span className="material-symbols-outlined text-lg">delete</span>
                      <span className="text-[11px] uppercase tracking-tighter font-medium">Xóa</span>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr className="hover:bg-secondary/5 transition-colors group cursor-pointer">
                <td className="px-6 py-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-surface-container flex items-center justify-center border border-secondary/30 mr-4 group-hover:border-secondary transition-colors">
                      <span className="material-symbols-outlined text-secondary text-xl">architecture</span>
                    </div>
                    <span className="font-display text-lg text-on-surface group-hover:text-secondary transition-colors">Logic học Hình thức</span>
                  </div>
                </td>
                <td className="px-6 py-6 border-l border-secondary/5">
                  <p className="text-on-surface-variant text-sm line-clamp-1 max-w-xs">Nghiên cứu về các quy luật tư duy và lập luận chính xác.</p>
                </td>
                <td className="px-6 py-6 text-center border-l border-secondary/5">
                  <span className="text-on-surface">08</span>
                </td>
                <td className="px-6 py-6 border-l border-secondary/5">
                  <span className="inline-flex items-center px-2 py-0.5 border border-outline/40 text-[10px] text-on-surface-variant uppercase tracking-widest font-bold bg-surface-variant/20">
                    Bản nháp
                  </span>
                </td>
                <td className="px-6 py-6 text-right border-l border-secondary/5">
                  <div className="flex justify-end space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button className="text-on-surface-variant hover:text-secondary transition-colors flex items-center space-x-1">
                      <span className="material-symbols-outlined text-lg">edit</span>
                      <span className="text-[11px] uppercase tracking-tighter font-medium">Sửa</span>
                    </button>
                    <button className="text-on-surface-variant hover:text-error transition-colors flex items-center space-x-1">
                      <span className="material-symbols-outlined text-lg">delete</span>
                      <span className="text-[11px] uppercase tracking-tighter font-medium">Xóa</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-secondary/5 transition-colors group cursor-pointer">
                <td className="px-6 py-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-surface-container flex items-center justify-center border border-secondary/30 mr-4 group-hover:border-secondary transition-colors">
                      <span className="material-symbols-outlined text-secondary text-xl">balance</span>
                    </div>
                    <span className="font-display text-lg text-on-surface group-hover:text-secondary transition-colors">Đạo đức học Hellenistic</span>
                  </div>
                </td>
                <td className="px-6 py-6 border-l border-secondary/5">
                  <p className="text-on-surface-variant text-sm line-clamp-1 max-w-xs">Khám phá tư tưởng của Stoics, Epicureans và Skeptics.</p>
                </td>
                <td className="px-6 py-6 text-center border-l border-secondary/5">
                  <span className="text-on-surface">15</span>
                </td>
                <td className="px-6 py-6 border-l border-secondary/5">
                  <span className="inline-flex items-center px-2 py-0.5 border border-secondary/40 text-[10px] text-secondary uppercase tracking-widest font-bold bg-secondary/5">
                    Đã xuất bản
                  </span>
                </td>
                <td className="px-6 py-6 text-right border-l border-secondary/5">
                  <div className="flex justify-end space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button className="text-on-surface-variant hover:text-secondary transition-colors flex items-center space-x-1">
                      <span className="material-symbols-outlined text-lg">edit</span>
                      <span className="text-[11px] uppercase tracking-tighter font-medium">Sửa</span>
                    </button>
                    <button className="text-on-surface-variant hover:text-error transition-colors flex items-center space-x-1">
                      <span className="material-symbols-outlined text-lg">delete</span>
                      <span className="text-[11px] uppercase tracking-tighter font-medium">Xóa</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-secondary/10 bg-surface-container-low/50">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Hiển thị 1-3 trong 24 chương</p>
          <div className="flex items-center space-x-2">
            <button className="p-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all disabled:opacity-30">
              <span className="material-symbols-outlined">navigate_before</span>
            </button>
            <button className="px-3 py-1 border border-secondary bg-secondary/10 text-secondary text-xs font-bold">1</button>
            <button className="px-3 py-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary text-xs transition-all">2</button>
            <button className="px-3 py-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary text-xs transition-all">3</button>
            <button className="p-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all">
              <span className="material-symbols-outlined">navigate_next</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Detail Column */}
      <div className="mt-16 border-t border-secondary/20 pt-8 flex gap-12 flex-wrap md:flex-nowrap">
        <div className="flex-1">
          <h5 className="font-display text-2xl text-on-surface mb-4">Ghi chú Hành chính</h5>
          <div className="p-6 bg-surface-container border-l-[3px] border-secondary italic text-on-surface-variant text-sm leading-relaxed">
            Mọi thay đổi đối với chương trình học cốt lõi cần được Hội đồng Học thuật phê duyệt trước khi xuất bản. Hãy đảm bảo các thẻ siêu dữ liệu (metadata) được gắn đầy đủ để hỗ trợ việc truy xuất hồ sơ trong tương lai.
          </div>
        </div>
        <div className="w-full md:w-80 space-y-4">
          <h5 className="font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] mb-4">Hoạt động gần đây</h5>
          <ul className="space-y-4 border-l border-secondary/20 pl-4">
            <li className="flex items-start space-x-3 text-sm relative">
              <div className="absolute -left-[21px] top-1.5 w-[9px] h-[9px] rounded-full bg-secondary"></div>
              <span className="text-on-surface-variant leading-tight"><strong className="text-on-surface">Admin_X</strong> đã chỉnh sửa chương &quot;Nhập môn Triết học&quot; <br/><em className="text-xs opacity-60">2 giờ trước</em></span>
            </li>
            <li className="flex items-start space-x-3 text-sm relative">
               <div className="absolute -left-[21px] top-1.5 w-[9px] h-[9px] rounded-full bg-surface-bright border border-secondary"></div>
              <span className="text-on-surface-variant leading-tight"><strong className="text-on-surface">System</strong> đã tự động sao lưu Archives <br/><em className="text-xs opacity-60">5 giờ trước</em></span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-24 mb-12 text-center">
        <div className="greek-divider w-32 mx-auto relative group">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary bg-surface px-2 text-lg group-hover:rotate-180 transition-transform duration-700">•</span>

        </div>

      </div>

    </div>
  );
}
