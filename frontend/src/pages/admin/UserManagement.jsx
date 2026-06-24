import Footer from "@/components/Footer.jsx";
import React from "react";

export default function UserManagement() {
  return (
    <div className="animate-fade-in pb-12 w-full">
      {/* Header Section */}
      <section className="space-y-4 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-secondary font-semibold tracking-widest uppercase text-xs">Cộng đồng học giả</span>
            <h3 className="font-display text-5xl font-bold text-on-surface mt-3">Quản lý Người dùng</h3>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 border border-secondary/40 text-secondary hover:bg-secondary/5 transition-all text-sm uppercase tracking-widest font-semibold">
              Xuất dữ liệu
            </button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-secondary/50 via-secondary/10 to-transparent"></div>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-low border border-secondary/10 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold group-hover:text-secondary transition-colors">Tổng Học Giả</p>
          <p className="font-display text-4xl font-semibold text-secondary">2,841</p>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% tháng này
          </div>
        </div>
        
        <div className="bg-surface-container-low border border-secondary/10 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold group-hover:text-secondary transition-colors">Hiền Triết (Sage)</p>
          <p className="font-display text-4xl font-semibold text-secondary">142</p>
          <div className="text-xs text-on-surface-variant opacity-80">Hội đồng tối cao</div>
        </div>
        
        <div className="bg-surface-container-low border border-secondary/10 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold group-hover:text-secondary transition-colors">Đang Hoạt Động</p>
          <p className="font-display text-4xl font-semibold text-primary">1,104</p>
          <div className="flex gap-1 h-1.5 mt-3">
            <div className="h-full bg-primary w-2/3 rounded-full"></div>
            <div className="h-full bg-secondary/20 w-1/3 rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-surface-container-low border border-error/20 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-6xl text-error">warning</span>
          </div>
          <p className="text-error text-xs uppercase tracking-widest font-semibold">Yêu Cầu Mới</p>
          <p className="font-display text-4xl font-semibold text-error">24</p>
          <p className="text-xs text-error/80 italic font-medium">Chờ phê duyệt</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-surface-container-lowest border border-secondary/10 overflow-hidden shadow-lg shadow-surface-lowest">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/30 border-b border-secondary/20">
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Học giả</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Email</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Vai trò</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Ngày tham gia</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              
              <tr className="group hover:bg-secondary/5 transition-colors duration-200 cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface border border-secondary/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-secondary transition-colors">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDJdA5ndsUwXDSzeZ-oWcGzsGdEP9xPaxYPU3i81m5SIATWcLQGr4ZiOEoCNh9_zh8lGVnBrlCh61Tk5oGlXtDushKw58K48I5ktXIuepn57XfrIprXVBipYE2s6uw-gwRtO_7hO8TNnvuXu_xn74csF-E0VdqkgpKHEjLMvyb5pD9wsdPu2XuCTrTjfi_Rlf1l1ZQ8sMTIrNkHE1LH0eVACvvGSlJA66z7U0jiJSF3q5fCcNxSdH8v3yyCmxz9gyLWVk1dwh1UDY" 
                        alt="Scholar ProfilePage"
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold text-on-surface group-hover:text-secondary transition-colors">Alexandre de Rhodes</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-semibold">ID: SCH-2024-001</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm italic font-medium">alexandre@lyceum.edu</td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-secondary-container/10 border border-secondary/30 text-secondary text-[10px] uppercase font-bold tracking-widest shadow-sm">Sage</span>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm">12/01/2024</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Hoạt động</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right space-x-3 text-on-surface-variant">
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Xem hồ sơ">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Chỉnh sửa">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                  <button className="p-1 hover:text-error hover:bg-error/10 rounded transition-all" title="Vô hiệu hóa">
                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                  </button>
                </td>
              </tr>

              <tr className="group hover:bg-secondary/5 transition-colors duration-200 cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface border border-secondary/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-secondary transition-colors">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmdi7j946Z1vMZQRpzdLaL6-cJsV01BPCC88lAZllY-8Mk8loNAQ_Ocq23xofIR_77sUTyIvVqtJ_yqmQFJ8-2Jw6BzzPEqtd07YkSrggGWgwGuEtk4gEWfUTbRN84vPJIVj9aFHmCJlrWtrws8h_rxDP5BNYecmwkZS7Bp3J45S6wUYswW6TAPG8wcKdhqbTDkAhsEWOQOmLhSVyXfSJsawnEG9TyzALGYENNGyn4qxFqMBI24jc8FJDxbNzCgI_5RnUUDciH_uA" 
                        alt="Scholar ProfilePage"
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold text-on-surface group-hover:text-secondary transition-colors">Minh Khai Trương</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-semibold">ID: SCH-2024-104</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm italic font-medium">m.khai@lyceum.edu</td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-surface-container border border-outline/30 text-on-surface-variant text-[10px] uppercase font-bold tracking-widest shadow-sm">Scholar</span>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm">28/02/2024</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Hoạt động</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right space-x-3 text-on-surface-variant">
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Xem hồ sơ">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Chỉnh sửa">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                  <button className="p-1 hover:text-error hover:bg-error/10 rounded transition-all" title="Vô hiệu hóa">
                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                  </button>
                </td>
              </tr>

              <tr className="group hover:bg-secondary/5 transition-colors duration-200 cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface border border-secondary/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-secondary transition-colors">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsl2EngLZ-2vH1P8oxmLLt9Yk1yk3sdCcZHygcdSRM4LrlhJjgz9XmnJrwtX9YazVK7i0wr3DTWogdiUCSuGzqWrZ-d73aT_JRxWy_2P1KdR6XbY__WZBRCjsj1F57Xy-3dwZhjlsAsQvhBtBuPPfd4yiTuhzXZGMaDzKim4YdFjgRnHNZQ61H55mU-AdBpKhd2YVjKKaYcwY59k4pp8VyfafofgUEfRFhxaC5DQMUN_HhHVGP76spl4TNNnLql2NZWO_yRthS1hg" 
                        alt="Scholar ProfilePage"
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold text-on-surface group-hover:text-secondary transition-colors">Lê Quý Đôn</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-semibold">ID: SCH-2023-992</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm italic font-medium">don.le@archive.org</td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-secondary-container/10 border border-secondary/30 text-secondary text-[10px] uppercase font-bold tracking-widest shadow-sm">Sage</span>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm">15/11/2023</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-surface-bright shadow-[0_0_8px_rgba(255,255,255,0.1)]"></span>
                    <span className="text-xs text-on-surface-variant uppercase font-semibold opacity-60 italic">Ngoại tuyến</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right space-x-3 text-on-surface-variant">
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Xem hồ sơ">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Chỉnh sửa">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                  <button className="p-1 hover:text-error hover:bg-error/10 rounded transition-all" title="Vô hiệu hóa">
                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                  </button>
                </td>
              </tr>

              <tr className="group hover:bg-error/5 transition-colors duration-200 cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface border border-error/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-error transition-colors">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhQsDcqdGo1ov99IAQWFIlW8kfb5WfpMYDfwmMrGVgKqJxoBFsdb8lk5HU4w6a2puBUpHta03S02ZVSpu_UQB27oyf04guxjHRbiWnABc4YnRsfHga8mQqj94F2zStvTIPSnv3ty5RK1Wf6C3wK29mZcROVTxHt21X9kg9ArwE0xA2U-iTAp0oGBWLZo_vH0I_efn68knAZNiLRd4yKaQRbiVG0V0FOdgsUiItLoRKI7DBE5FkDPBpJjU_KxSN-NUjOq_r5mj50Vc" 
                        alt="Scholar ProfilePage"
                        className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold text-on-surface group-hover:text-error transition-colors">Elena Võ</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-semibold">ID: SCH-2024-210</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm italic font-medium">elena.vo@lyceum.edu</td>
                <td className="px-6 py-5">
                   <span className="px-2 py-1 bg-surface-container border border-outline/30 text-on-surface-variant text-[10px] uppercase font-bold tracking-widest shadow-sm">Scholar</span>
                </td>
                <td className="px-6 py-5 text-on-surface-variant text-sm">03/03/2024</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]"></span>
                    <span className="text-xs text-error uppercase font-semibold">Đã vô hiệu</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right space-x-3 text-on-surface-variant">
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Xem hồ sơ">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all" title="Chỉnh sửa">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                   <button className="p-1 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-all" title="Kích hoạt lại">
                    <span className="material-symbols-outlined text-[20px]">person_check</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface flex justify-between items-center border-t border-secondary/10">
          <p className="text-xs text-on-surface-variant font-medium italic opacity-80">Hiển thị 1 - 4 trong tổng số 2,841 học giả</p>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-secondary/20 text-on-surface-variant opacity-40 cursor-not-allowed rounded">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-1 border border-secondary bg-secondary/10 text-secondary text-xs font-bold rounded">1</button>
            <button className="px-3 py-1 border border-secondary/20 text-on-surface-variant text-xs hover:border-secondary hover:text-secondary transition-colors rounded font-semibold">2</button>
            <button className="px-3 py-1 border border-secondary/20 text-on-surface-variant text-xs hover:border-secondary hover:text-secondary transition-colors rounded font-semibold">3</button>
            <span className="text-secondary/50 mx-1">...</span>
            <button className="px-3 py-1 border border-secondary/20 text-on-surface-variant text-xs hover:border-secondary hover:text-secondary transition-colors rounded font-semibold">711</button>
            <button className="p-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all rounded">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary opacity-80 text-3xl">description</span>
            <h4 className="font-display text-2xl font-semibold text-on-surface">Nhật ký Hệ thống Gần đây</h4>
          </div>
          <div className="space-y-4 text-sm text-on-surface-variant mt-6">
            <div className="flex gap-6 items-start folio-border pl-6 py-2 bg-surface-container-low border border-transparent hover:border-secondary/20 hover:bg-surface-container transition-all">
              <span className="text-xs text-secondary/60 font-semibold w-20 shrink-0 uppercase tracking-widest translate-y-[2px]">10:45 AM</span>
              <p className="flex-1 leading-relaxed">Sage <strong className="text-secondary font-semibold">Alexandre de Rhodes</strong> đã cập nhật tài liệu lưu trữ chương VI: &quot;Kiến trúc Hellenistic&quot;.</p>
            </div>
            <div className="flex gap-6 items-start folio-border pl-6 py-2 bg-surface-container-low border border-transparent hover:border-error/20 hover:bg-error/5 transition-all">
              <span className="text-xs text-secondary/60 font-semibold w-20 shrink-0 uppercase tracking-widest translate-y-[2px]">09:12 AM</span>
              <p className="flex-1 leading-relaxed">Hệ thống tự động vô hiệu hóa tài khoản <strong className="text-error font-semibold">Elena Võ</strong> do vi phạm quy tắc thảo luận bậc II.</p>
            </div>
            <div className="flex gap-6 items-start folio-border pl-6 py-2 bg-surface-container-low border border-transparent hover:border-secondary/20 hover:bg-surface-container transition-all">
             <span className="text-xs text-secondary/60 font-semibold w-20 shrink-0 uppercase tracking-widest translate-y-[2px]">Yesterday</span>
              <p className="flex-1 leading-relaxed">Phê duyệt 12 đơn đăng ký gia nhập học viện từ khu vực Chapter Bắc Âu.</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 bg-surface-container-low border border-secondary/10 p-8 space-y-6 folio-card flex flex-col">
          <h4 className="font-semibold text-secondary uppercase tracking-widest text-xs mb-2">Phân bổ Vai trò</h4>
          
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                <span>Sage</span>
                <span className="text-secondary">5%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[5%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                <span>Scholar</span>
                <span className="text-primary">82%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[82%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                <span>Initiate</span>
                <span className="text-surface-bright">13%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-surface-bright w-[13%]"></div>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-on-surface-variant italic font-medium pt-6 border-t border-secondary/10 opacity-70">
            Dữ liệu được cập nhật thời gian thực từ mạng lưới Lyceum toàn cầu.
          </p>
        </div>
      </section>

      {/* Footer Minimal */}
      <div className="mt-24 mb-12 text-center">
        <div className="greek-divider w-32 mx-auto relative group">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary bg-surface px-2 text-lg group-hover:rotate-180 transition-transform duration-700">•</span>

        </div>

      </div>

      <Footer/>
    </div>
  );
}
