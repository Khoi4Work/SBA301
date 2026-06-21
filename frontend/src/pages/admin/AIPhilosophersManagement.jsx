import Footer from "@/components/Footer.jsx";
import React from "react";

export default function AIPhilosophersManagement() {
  return (
    <div className="animate-fade-in pb-12 w-full">
      {/* Section Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="font-display text-5xl text-on-surface mb-3 tracking-tight font-bold">Quản lý Triết gia AI</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl opacity-80">
            Điều chỉnh và cấu hình các thực thể triết gia trong hệ thống. Mỗi AI được đào tạo dựa trên các văn bản cổ điển và trường phái tư tưởng tương ứng.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <span className="font-semibold text-sm text-secondary block mb-1 uppercase tracking-widest">TRẠNG THÁI HỆ THỐNG</span>
          <span className="text-on-surface opacity-60">12 Triết gia Đang Hoạt động</span>
        </div>
      </div>
      
      <div className="greek-divider mb-12"></div>

      {/* Bento Grid of Philosophers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Philosopher Card: Socrates */}
        <div className="folio-card p-8 bg-surface-container-low hover:border-secondary/40 transition-all duration-300 relative group group-hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-8 -mt-8">
            <span className="material-symbols-outlined text-[120px] text-secondary">format_quote</span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-surface-container-high border border-secondary/20 overflow-hidden shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6R5LzgGm95RAVmlHJucJWpLG8WfAs-hi3OYiTyqBFSR0j1-2po04wVjK6WIS26izxBJMjVheTUla2jFCSDb6G-Pc6A7714MyoYBhJQRKDZOr42-9NqW2i9tzVa9gz13h2boZizqUQkPMaQkClEoAl9hZsKm8zzobMi95OFVyYkVZ-NixuE5q88ZfCok6ITyrg1jtEkmxecc8gJuBKzGf_llnuzW2F5GMRbX9uvYbOQIA3zqbI0M_6QgTCpVE5feLUHiu_iWgqZ1o" 
                alt="Socrates" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-secondary/20 hover:bg-secondary/10 text-secondary transition-all" title="Sửa">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button className="p-2 border border-error/20 hover:bg-error/10 text-error transition-all" title="Xóa">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
          <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">Socrates</h3>
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-secondary/10 text-secondary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-secondary/20">Khắc kỷ học</span>
          </div>
          <div className="space-y-3 pt-4 border-t border-outline/20">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant opacity-60 uppercase">Cập nhật lần cuối</span>
              <span className="text-on-surface opacity-80 uppercase">12/10/2023</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant opacity-60 uppercase">Độ tin cậy AI</span>
              <span className="text-secondary text-base">98%</span>
            </div>
          </div>
        </div>

        {/* Philosopher Card: Marcus Aurelius */}
        <div className="folio-card p-8 bg-surface-container-low hover:border-secondary/40 transition-all duration-300 relative group group-hover:-translate-y-1">
           <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-8 -mt-8">
            <span className="material-symbols-outlined text-[120px] text-secondary">format_quote</span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-surface-container-high border border-secondary/20 overflow-hidden shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMC43xTCxZlEld1Ljnffs9Qsvfo4yZPATK8EJobvdahsw99mPCp3isE2LreqKWKAFJa4Cw8udjfURPrGg44n71ZX7dgBPk6R5Id9SD7ypnA64MYn9kM8Ch7ZEOEBQ895yCYVJIcyjK9Jxv8E7yyaDV5OoptP6YcycCQQB_jzXwgPnahB1bIxRyPxuj6Mji_gPtYBgq8nLW_lznZuvffmHuAvaLI_3rbjGmJkofhoIBn6Rx9lVxcSNGTW6Kvg7UcBsNpg-LHPPdZFc" 
                alt="Marcus Aurelius" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-secondary/20 hover:bg-secondary/10 text-secondary transition-all" title="Sửa">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button className="p-2 border border-error/20 hover:bg-error/10 text-error transition-all" title="Xóa">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
          <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">Marcus Aurelius</h3>
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-secondary/10 text-secondary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-secondary/20">Khắc kỷ học</span>
          </div>
          <div className="space-y-3 pt-4 border-t border-outline/20">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant opacity-60 uppercase">Cập nhật lần cuối</span>
              <span className="text-on-surface opacity-80 uppercase">05/11/2023</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant opacity-60 uppercase">Độ tin cậy AI</span>
              <span className="text-secondary text-base">94%</span>
            </div>
          </div>
        </div>

        {/* Philosopher Card: Aristotle */}
        <div className="folio-card p-8 bg-surface-container-low hover:border-secondary/40 transition-all duration-300 relative group group-hover:-translate-y-1">
           <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-8 -mt-8">
            <span className="material-symbols-outlined text-[120px] text-secondary">format_quote</span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-surface-container-high border border-secondary/20 overflow-hidden shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuClqdRpM23r1snnWCaayse3tGLt9J9b2s6DDVwEDie5qNhw0G8zzj-3z-JoVxpOIme0en83NrQ-JtUrK27zIjmexMedhdnVcf1tpF67yTu31DVlc26nJcdgvix_aSkX6SDN0XCQ1RbjJxOfcVdo81tx9Z59E8TpsNRWD2C_pWFw0NwMHEEr9eATTo2y7jD8cixanYHITqdvKhk2k8K239n_LqBc7ZG9gcWvqUqIHCIQNnDFfWUF5nYI1aG8jtuFYhXnqb9RXoiskwE" 
                alt="Aristotle" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-secondary/20 hover:bg-secondary/10 text-secondary transition-all" title="Sửa">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button className="p-2 border border-error/20 hover:bg-error/10 text-error transition-all" title="Xóa">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
          <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">Aristotle</h3>
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-secondary/10 text-secondary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-secondary/20">Lyceum School</span>
          </div>
          <div className="space-y-3 pt-4 border-t border-outline/20">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant opacity-60 uppercase">Cập nhật lần cuối</span>
              <span className="text-on-surface opacity-80 uppercase">28/10/2023</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant opacity-60 uppercase">Độ tin cậy AI</span>
              <span className="text-secondary text-base">96%</span>
            </div>
          </div>
        </div>

        {/* Add New Placeholder */}
        <button className="p-8 border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center gap-4 hover:border-secondary/60 hover:bg-secondary/5 transition-all group min-h-[300px]">
          <div className="w-12 h-12 rounded border border-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform bg-surface">
            <span className="material-symbols-outlined text-secondary">add</span>
          </div>
          <span className="font-semibold text-sm text-secondary uppercase tracking-widest mt-2">Thêm triết gia mới</span>
        </button>
      </div>

      {/* Detailed List View (Archives Style) */}
      <div className="mt-24">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-display text-3xl font-semibold text-secondary">Danh sách Lưu trữ</h3>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <select className="bg-transparent border-none text-on-surface-variant font-semibold text-sm focus:ring-0 cursor-pointer outline-none">
              <option className="bg-surface">Tất cả trường phái</option>
              <option className="bg-surface">Khắc kỷ</option>
              <option className="bg-surface">Hư vô</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto bg-surface-container-lowest border border-secondary/10 p-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-secondary/20 text-left">
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px]">Triết gia</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px]">Trường phái</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px]">Cập nhật</th>
                <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              <tr className="hover:bg-secondary/5 transition-colors group cursor-pointer">
                <td className="py-6 px-6 flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container-high border border-secondary/20 flex items-center justify-center group-hover:border-secondary/50">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">person</span>
                  </div>
                  <span className="font-display text-2xl font-semibold text-on-surface group-hover:text-secondary transition-colors">Plato</span>
                </td>
                <td className="py-6 px-6">
                  <span className="text-on-surface-variant opacity-80">Chủ nghĩa Duy tâm</span>
                </td>
                <td className="py-6 px-6 text-sm text-on-surface-variant">
                  Oct 15, 2023
                </td>
                <td className="py-6 px-6 text-right space-x-4">
                  <button className="text-secondary font-semibold text-xs uppercase tracking-widest hover:underline opacity-80 hover:opacity-100">Sửa</button>
                  <button className="text-error font-semibold text-xs uppercase tracking-widest hover:underline opacity-60 hover:opacity-100">Xóa</button>
                </td>
              </tr>
              
              <tr className="hover:bg-secondary/5 transition-colors group cursor-pointer">
                <td className="py-6 px-6 flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-container-high border border-secondary/20 flex items-center justify-center group-hover:border-secondary/50">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">person</span>
                  </div>
                  <span className="font-display text-2xl font-semibold text-on-surface group-hover:text-secondary transition-colors">Epicurus</span>
                </td>
                <td className="py-6 px-6">
                  <span className="text-on-surface-variant opacity-80">Chủ nghĩa Khoái lạc</span>
                </td>
                <td className="py-6 px-6 text-sm text-on-surface-variant">
                  Oct 02, 2023
                </td>
                <td className="py-6 px-6 text-right space-x-4">
                  <button className="text-secondary font-semibold text-xs uppercase tracking-widest hover:underline opacity-80 hover:opacity-100">Sửa</button>
                  <button className="text-error font-semibold text-xs uppercase tracking-widest hover:underline opacity-60 hover:opacity-100">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-24 mb-12 text-center">
        <div className="greek-divider w-32 mx-auto relative group">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary bg-surface px-2 text-lg group-hover:rotate-180 transition-transform duration-700">•</span>

        </div>

      </div>

      <Footer/>
    </div>
  );
}
