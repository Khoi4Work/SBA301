import React from "react";
import { useUserManagement } from "@/features/admin/hooks/useUserManagement.js";

export default function UserManagementPage() {
    const {
        users,
        loading,
        error,
        editingUser,
        editForm,
        saving,
        updateMessage,
        updateError,
        handleUpdateUser,
        handleEditChange,
        handleCancelUpdate,
        handleSubmitUpdate,
        handleDeleteUser,
    } = useUserManagement();

  return (
    <div className="animate-fade-in pb-12 w-full">
      {/* Header Section */}
      <section className="space-y-4 mb-12">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-secondary font-semibold tracking-widest uppercase text-xs">Cộng đồng học giả</span>
            <h3 className="font-display text-5xl font-bold text-on-surface mt-3">Quản lý Người dùng</h3>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-secondary/50 via-secondary/10 to-transparent"></div>
      </section>

        {error && (
            <div className="mb-6 border border-error/30 bg-error/10 text-error px-5 py-4 text-sm">
                {error}
            </div>
        )}

        {loading && (
            <div className="mb-6 border border-secondary/20 bg-secondary/5 text-secondary px-5 py-4 text-sm">
                Đang tải danh sách user...
            </div>
        )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-container-low border border-secondary/10 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold group-hover:text-secondary transition-colors">Tổng Học Giả</p>
            <p className="font-display text-4xl font-semibold text-secondary">
                {users.length}
            </p>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                Dữ liệu từ hệ thống
            </div>
        </div>

        {/*<div className="bg-surface-container-low border border-secondary/10 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors">*/}
        {/*  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold group-hover:text-secondary transition-colors">Hiền Triết (Sage)</p>*/}
        {/*  <p className="font-display text-4xl font-semibold text-secondary">142</p>*/}
        {/*  <div className="text-xs text-on-surface-variant opacity-80">Hội đồng tối cao</div>*/}
        {/*</div>*/}

        <div className="bg-surface-container-low border border-secondary/10 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold group-hover:text-secondary transition-colors">Đang Hoạt Động</p>
          <p className="font-display text-4xl font-semibold text-primary">1,104</p>
          <div className="flex gap-1 h-1.5 mt-3">
            <div className="h-full bg-primary w-2/3 rounded-full"></div>
            <div className="h-full bg-secondary/20 w-1/3 rounded-full"></div>
          </div>
        </div>
        
        {/*<div className="bg-surface-container-low border border-error/20 p-6 space-y-3 folio-border group hover:bg-surface-container transition-colors relative overflow-hidden">*/}
        {/*  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">*/}
        {/*    <span className="material-symbols-outlined text-6xl text-error">warning</span>*/}
        {/*  </div>*/}
        {/*  <p className="text-error text-xs uppercase tracking-widest font-semibold">Yêu Cầu Mới</p>*/}
        {/*  <p className="font-display text-4xl font-semibold text-error">24</p>*/}
        {/*  <p className="text-xs text-error/80 italic font-medium">Chờ phê duyệt</p>*/}
        {/*</div>*/}
      </div>

      {/* Main Table Section */}
      <div className="bg-surface-container-lowest border border-secondary/10 overflow-hidden shadow-lg shadow-surface-lowest">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/30 border-b border-secondary/20">
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Học giả</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Email</th>
                {/*<th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Vai trò</th>*/}
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Ngày tham gia</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-5 font-semibold text-secondary/80 text-[11px] uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-secondary/10">
              {users.map((user) => (
                  <tr
                      key={user.userId}
                      className="group hover:bg-secondary/5 transition-colors duration-200 cursor-pointer"
                  >
                      <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-surface border border-secondary/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-secondary transition-colors">
                                  <img
                                      src={
                                          user.avatarUrl ||
                                          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                                              user.fullName || user.username || "User"
                                          )}`
                                      }
                                      alt="Scholar Profile"
                                      className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                  />
                              </div>

                              <div>
                                  <p className="font-display text-xl font-semibold text-on-surface group-hover:text-secondary transition-colors">
                                      {user.fullName || user.username || "Unknown User"}
                                  </p>

                              </div>
                          </div>
                      </td>

                      <td className="px-6 py-5 text-on-surface-variant text-sm italic font-medium">
                          {user.email || "-"}
                      </td>

                      {/*<td className="px-6 py-5">*/}
                      {/*  <span className="px-2 py-1 bg-surface-container border border-outline/30 text-on-surface-variant text-[10px] uppercase font-bold tracking-widest shadow-sm">*/}
                      {/*    {user.role || "User"}*/}
                      {/*  </span>*/}
                      {/*</td>*/}

                      <td className="px-6 py-5 text-on-surface-variant text-sm">
                          {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                              : "-"}
                      </td>

                      <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                              <span className="text-xs text-on-surface-variant uppercase font-semibold">
            Hoạt động
          </span>
                          </div>
                      </td>

                      <td className="px-6 py-5 text-right space-x-3 text-on-surface-variant">
                          {/*<button*/}
                          {/*    type="button"*/}
                          {/*    className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all"*/}
                          {/*    title="Xem hồ sơ"*/}
                          {/*    onClick={() => console.log("View user:", user)}*/}
                          {/*>*/}
                          {/*<span className="material-symbols-outlined text-[20px]">*/}
                          {/*  visibility*/}
                          {/*</span>*/}
                          {/*</button>*/}

                          <button
                              type="button"
                              className="p-1 hover:text-secondary hover:bg-secondary/10 rounded transition-all"
                              title="Chỉnh sửa"
                              onClick={() => handleUpdateUser(user)}
                          >
          <span className="material-symbols-outlined text-[20px]">
            edit_note
          </span>
                          </button>

                          <button
                              type="button"
                              className="p-1 hover:text-error hover:bg-error/10 rounded transition-all"
                              title="Xóa người dùng"
                              onClick={() => handleDeleteUser(user)}
                          >
          <span className="material-symbols-outlined text-[20px]">
            person_off
          </span>
                          </button>
                      </td>
                  </tr>
              ))}

              {!loading && users.length === 0 && (
                  <tr>
                      <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-on-surface-variant"
                      >
                          Chưa có user nào.
                      </td>
                  </tr>
              )}
              </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface flex justify-between items-center border-t border-secondary/10">
            <p className="text-xs text-on-surface-variant font-medium italic opacity-80">
                {loading ? "Đang tải học giả..." : `Hiển thị ${users.length} học giả`}
            </p>
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

        {editingUser && (
            <div
                className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
                onClick={handleCancelUpdate}
            >
                <section
                    className="w-full max-w-4xl max-h-[85vh] bg-surface-container-lowest border border-secondary/20 overflow-hidden shadow-2xl shadow-black/50"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="px-6 py-5 bg-surface-container-high/30 border-b border-secondary/20 flex items-center justify-between">
                        <div>
                            <p className="text-secondary/80 text-[11px] uppercase tracking-widest font-semibold">
                                Chỉnh sửa học giả
                            </p>

                            <h4 className="font-display text-2xl font-semibold text-on-surface mt-1">
                                {editingUser.fullName || editingUser.username || "Unknown User"}
                            </h4>
                        </div>

                        <button
                            type="button"
                            onClick={handleCancelUpdate}
                            className="p-1 hover:text-error hover:bg-error/10 rounded transition-all text-on-surface-variant"
                            title="Đóng"
                        >
                    <span className="material-symbols-outlined text-[22px]">
                        close
                    </span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmitUpdate}>
                        {(updateMessage || updateError) && (
                            <div className="px-6 py-4 border-b border-secondary/10 bg-surface">
                                {updateMessage && (
                                    <p className="text-sm text-emerald-400 font-medium">
                                        {updateMessage}
                                    </p>
                                )}

                                {updateError && (
                                    <p className="text-sm text-error font-medium">
                                        {updateError}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="overflow-y-auto max-h-[58vh]">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-secondary/10">

                                <EditRow label="Username">
                                    <input
                                        value={editForm.username}
                                        onChange={(event) =>
                                            handleEditChange("username", event.target.value)
                                        }
                                        className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                        required
                                    />
                                </EditRow>

                                <EditRow label="Email">
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(event) =>
                                            handleEditChange("email", event.target.value)
                                        }
                                        className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                        required
                                    />
                                </EditRow>

                                <EditRow label="Full Name">
                                    <input
                                        value={editForm.fullName}
                                        onChange={(event) =>
                                            handleEditChange("fullName", event.target.value)
                                        }
                                        className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                    />
                                </EditRow>

                                <EditRow label="Biography">
                                <textarea
                                    value={editForm.biography}
                                    onChange={(event) =>
                                        handleEditChange("biography", event.target.value)
                                    }
                                    rows={4}
                                    className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary resize-none"
                                />
                                </EditRow>

                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-5 bg-surface border-t border-secondary/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelUpdate}
                                className="px-5 py-2 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all text-xs uppercase tracking-widest font-semibold"
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 border border-secondary bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary transition-all text-xs uppercase tracking-widest font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Đang lưu..." : updateMessage ? "Đã lưu" : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        )}

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
    </div>
  );
}

function EditRow({ label, children }) {
    return (
        <tr className="hover:bg-secondary/5 transition-colors">
            <td className="px-6 py-5 w-56 align-top">
                <p className="text-secondary/80 text-[11px] uppercase tracking-widest font-semibold">
                    {label}
                </p>
            </td>

            <td className="px-6 py-5">
                {children}
            </td>
        </tr>
    );
}
