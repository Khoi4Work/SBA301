import React, {useEffect, useState} from "react";
import {philosopherService} from "@/services/philosopherService.js";

export default function AIPhilosophersManagement() {
    const emptyForm = {
        name: "",
        avatarUrl: "",
        shortQuote: "",
        category: "",
        core: "",
        biography: "",
        systemPrompt: "",
    };

    const [philosophers, setPhilosophers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [modalMode, setModalMode] = useState(null); // "create" | "edit"
    const [selectedPhilosopher, setSelectedPhilosopher] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);
    const [idleFile, setIdleFile] = useState(null);
    const [talkingFile, setTalkingFile] = useState(null);
    const [thinkingFile, setThinkingFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalError, setModalError] = useState("");

    const extractPhilosophers = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.result)) return data.result;
        if (Array.isArray(data?.content)) return data.content;
        if (Array.isArray(data?.philosophers)) return data.philosophers;

        console.warn("Không tìm thấy mảng philosophers:", data);
        return [];
    };

    const fetchPhilosophers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await philosopherService.getAll();
            setPhilosophers(extractPhilosophers(data));
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Không tải được danh sách triết gia."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhilosophers();
    }, []);

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedPhilosopher(null);
        setForm(emptyForm);
        setFile(null);
        setIdleFile(null);
        setTalkingFile(null);
        setThinkingFile(null);
        setModalMessage("");
        setModalError("");
    };

    const openEditModal = (philosopher) => {
        setModalMode("edit");
        setSelectedPhilosopher(philosopher);

        setForm({
            name: philosopher.name || "",
            avatarUrl: philosopher.imageUrl || "",
            shortQuote: philosopher.quote || "",
            category: philosopher.category || "",
            core: philosopher.core || "",
            biography: philosopher.biography || "",
            systemPrompt: philosopher.systemPrompt || "",
        });

        setFile(null);
        setIdleFile(null);
        setTalkingFile(null);
        setThinkingFile(null);
        setModalMessage("");
        setModalError("");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedPhilosopher(null);
        setForm(emptyForm);
        setFile(null);
        setIdleFile(null);
        setTalkingFile(null);
        setThinkingFile(null);
        setModalMessage("");
        setModalError("");
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setModalMessage("");
            setModalError("");

            if (modalMode === "create") {
                await philosopherService.create(form, file, idleFile, talkingFile, thinkingFile);
                setModalMessage("Thêm triết gia thành công.");
            }

            if (modalMode === "edit" && selectedPhilosopher?.id) {
                await philosopherService.update(selectedPhilosopher.id, form, file, idleFile, talkingFile, thinkingFile);
                setModalMessage("Cập nhật triết gia thành công.");
            }

            await fetchPhilosophers();
        } catch (err) {
            console.error(err);
            setModalError(
                err.response?.data?.message ||
                "Lưu triết gia thất bại. Check dữ liệu hoặc quyền tài khoản."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (philosopher) => {
        const ok = window.confirm(
            `Xóa triết gia "${philosopher.name}" thật hả?`
        );

        if (!ok) return;

        try {
            await philosopherService.deleteById(philosopher.id);
            await fetchPhilosophers();
            alert("Xóa triết gia thành công.");
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                "Xóa triết gia thất bại. Check quyền ADMIN hoặc API delete by id."
            );
        }
    };

    return (
        <div className="animate-fade-in pb-12 w-full">
            {/* Section Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="font-display text-5xl text-on-surface mb-3 tracking-tight font-bold">Quản lý Triết
                        gia AI</h2>
                    <p className="text-lg text-on-surface-variant max-w-2xl opacity-80">
                        Điều chỉnh và cấu hình các thực thể triết gia trong hệ thống. Mỗi AI được đào tạo dựa trên các
                        văn bản cổ điển và trường phái tư tưởng tương ứng.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <span className="font-semibold text-sm text-secondary block mb-1 uppercase tracking-widest">TRẠNG THÁI HỆ THỐNG</span>
                    <span className="text-on-surface opacity-60">
                        {loading ? "Đang tải..." : `${philosophers.length} Triết gia Đang Hoạt động`}
                    </span>
                </div>
            </div>

            <div className="greek-divider mb-12"></div>

            {/* Bento Grid of Philosophers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {philosophers.map((philosopher) => (
                    <div
                        key={philosopher.id}
                        className="folio-card p-8 bg-surface-container-low hover:border-secondary/40 transition-all duration-300 relative group group-hover:-translate-y-1"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-8 -mt-8">
                <span className="material-symbols-outlined text-[120px] text-secondary">
                    format_quote
                </span>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div
                                className="w-16 h-16 bg-surface-container-high border border-secondary/20 overflow-hidden shrink-0">
                                <img
                                    src={
                                        philosopher.imageUrl ||
                                        `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                                            philosopher.name || "Philosopher"
                                        )}`
                                    }
                                    alt={philosopher.name || "Philosopher"}
                                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(philosopher)}
                                    className="p-2 border border-secondary/20 hover:bg-secondary/10 text-secondary transition-all"
                                    title="Sửa"
                                >
                        <span className="material-symbols-outlined text-[18px]">
                            edit
                        </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(philosopher)}
                                    className="p-2 border border-error/20 hover:bg-error/10 text-error transition-all"
                                    title="Xóa"
                                >
                        <span className="material-symbols-outlined text-[18px]">
                            delete
                        </span>
                                </button>
                            </div>
                        </div>

                        <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">
                            {philosopher.name || "Unknown"}
                        </h3>

                        <div className="flex items-center gap-2 mb-6">
                            <span
                                className="bg-secondary/10 text-secondary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-secondary/20">
                                {philosopher.category || "Chưa có trường phái"}
                            </span>
                        </div>

                        <p className="text-sm text-on-surface-variant italic leading-relaxed min-h-[48px]">
                            {philosopher.quote || "Chưa có trích dẫn."}
                        </p>

                        <div className="space-y-3 pt-4 mt-4 border-t border-outline/20">
                            <div className="grid grid-cols-[70px_1fr] gap-4 text-xs font-semibold items-start">
                                <span className="text-on-surface-variant opacity-60 uppercase shrink-0">
                                    Core
                                </span>

                                <span
                                    className="text-on-surface opacity-80 uppercase leading-relaxed break-words whitespace-normal text-right line-clamp-2"
                                    title={philosopher.core || "-"}
                                >
                                    {philosopher.core || "-"}
                                </span>
                            </div>

                            {/*<div className="flex justify-between text-xs font-semibold">*/}
                            {/*    <span className="text-on-surface-variant opacity-60 uppercase">*/}
                            {/*        Độ tin cậy AI*/}
                            {/*    </span>*/}
                            {/*    <span className="text-secondary text-base">Ready</span>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                ))}

                {!loading && philosophers.length === 0 && (
                    <div
                        className="folio-card p-8 bg-surface-container-low border border-secondary/10 text-on-surface-variant min-h-[300px] flex items-center justify-center text-center">
                        Chưa có triết gia nào.
                    </div>
                )}

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="p-8 border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center gap-4 hover:border-secondary/60 hover:bg-secondary/5 transition-all group min-h-[300px]"
                >
                    <div
                        className="w-12 h-12 rounded border border-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform bg-surface">
                        <span className="material-symbols-outlined text-secondary">add</span>
                    </div>
                    <span className="font-semibold text-sm text-secondary uppercase tracking-widest mt-2">
                        Thêm triết gia mới
                    </span>
                </button>
            </div>

            {/* Detailed List View (Archives Style) */}
            <div className="mt-24">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-display text-3xl font-semibold text-secondary">Danh sách Lưu trữ</h3>
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
                        <select
                            className="bg-transparent border-none text-on-surface-variant font-semibold text-sm focus:ring-0 cursor-pointer outline-none">
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
                            <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px]">Triết
                                gia
                            </th>
                            <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px]">Trường
                                phái
                            </th>
                            <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px]">Cập
                                nhật
                            </th>
                            <th className="py-4 px-6 font-semibold text-on-surface-variant uppercase tracking-wider text-[12px] text-right">Thao
                                tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                        {philosophers.map((philosopher) => (
                            <tr
                                key={philosopher.id}
                                className="hover:bg-secondary/5 transition-colors group cursor-pointer"
                            >
                                <td className="py-6 px-6 flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 bg-surface-container-high border border-secondary/20 flex items-center justify-center group-hover:border-secondary/50 overflow-hidden">
                                        {philosopher.imageUrl ? (
                                            <img
                                                src={philosopher.imageUrl}
                                                alt={philosopher.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">
                                                person
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className="font-display text-2xl font-semibold text-on-surface group-hover:text-secondary transition-colors">
                                        {philosopher.name || "Unknown"}
                                    </span>
                                </td>

                                <td className="py-6 px-6">
                                    <span className="text-on-surface-variant opacity-80">
                                        {philosopher.category || "-"}
                                    </span>
                                </td>

                                <td className="py-6 px-6 text-sm text-on-surface-variant">
                                    {philosopher.core || "-"}
                                </td>

                                <td className="py-6 px-6 text-right space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(philosopher)}
                                        className="text-secondary font-semibold text-xs uppercase tracking-widest hover:underline opacity-80 hover:opacity-100"
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(philosopher)}
                                        className="text-error font-semibold text-xs uppercase tracking-widest hover:underline opacity-60 hover:opacity-100"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && philosophers.length === 0 && (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="py-10 px-6 text-center text-on-surface-variant"
                                >
                                    Chưa có triết gia nào.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {modalMode && (
                    <div
                        className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
                        onClick={closeModal}
                    >
                        <section
                            className="w-full max-w-4xl max-h-[85vh] bg-surface-container-lowest border border-secondary/20 overflow-hidden shadow-2xl shadow-black/50"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div
                                className="px-6 py-5 bg-surface-container-high/30 border-b border-secondary/20 flex items-center justify-between">
                                <div>
                                    <p className="text-secondary/80 text-[11px] uppercase tracking-widest font-semibold">
                                        {modalMode === "create" ? "Thêm triết gia mới" : "Chỉnh sửa triết gia"}
                                    </p>

                                    <h4 className="font-display text-2xl font-semibold text-on-surface mt-1">
                                        {modalMode === "create"
                                            ? "New Philosopher"
                                            : selectedPhilosopher?.name}
                                    </h4>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="p-1 hover:text-error hover:bg-error/10 rounded transition-all text-on-surface-variant"
                                    title="Đóng"
                                >
                                <span className="material-symbols-outlined text-[22px]">
                                    close
                                </span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {(modalMessage || modalError) && (
                                    <div className="px-6 py-4 border-b border-secondary/10 bg-surface">
                                        {modalMessage && (
                                            <p className="text-sm text-emerald-400 font-medium">
                                                {modalMessage}
                                            </p>
                                        )}

                                        {modalError && (
                                            <p className="text-sm text-error font-medium">
                                                {modalError}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="overflow-y-auto max-h-[58vh]">
                                    <table className="w-full text-left border-collapse">
                                        <tbody className="divide-y divide-secondary/10">
                                        <EditRow label="Tên triết gia">
                                            <input
                                                value={form.name}
                                                onChange={(event) => handleChange("name", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                                required
                                            />
                                        </EditRow>

                                        <EditRow label="Trường phái">
                                            <input
                                                value={form.category}
                                                onChange={(event) => handleChange("category", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                                required
                                            />
                                        </EditRow>

                                        <EditRow label="Core">
                                            <input
                                                value={form.core}
                                                onChange={(event) => handleChange("core", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                            />
                                        </EditRow>

                                        <EditRow label="Short Quote">
                                            <input
                                                value={form.shortQuote}
                                                onChange={(event) => handleChange("shortQuote", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                            />
                                        </EditRow>
                                        <EditRow label="Biography">
                                            <textarea
                                                value={form.biography}
                                                onChange={(event) => handleChange("biography", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary resize-none"
                                                rows="4"
                                            />
                                        </EditRow>
                                        <EditRow label="System Prompt">
                                            <textarea
                                                value={form.systemPrompt}
                                                onChange={(event) => handleChange("systemPrompt", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary resize-none"
                                                rows="6"
                                            />
                                        </EditRow>

                                        <EditRow label="Avatar URL">
                                            <input
                                                value={form.avatarUrl}
                                                onChange={(event) => handleChange("avatarUrl", event.target.value)}
                                                className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus:border-secondary"
                                                placeholder="Dán URL ảnh hoặc upload file bên dưới"
                                            />
                                        </EditRow>

                                        <EditRow label="Upload Avatar">
                                            <label className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus-within:border-secondary cursor-pointer flex items-center justify-between">
                                                <span className="truncate">{file ? file.name : "Choose File..."}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </EditRow>
                                        <EditRow label="Model 3D: Idle (.glb)">
                                            <label className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus-within:border-secondary cursor-pointer flex items-center justify-between">
                                                <span className="truncate">{idleFile ? idleFile.name : "Choose File..."}</span>
                                                <input
                                                    type="file"
                                                    accept=".glb"
                                                    onChange={(event) => setIdleFile(event.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </EditRow>
                                        <EditRow label="Model 3D: Talking (.glb)">
                                            <label className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus-within:border-secondary cursor-pointer flex items-center justify-between">
                                                <span className="truncate">{talkingFile ? talkingFile.name : "Choose File..."}</span>
                                                <input
                                                    type="file"
                                                    accept=".glb"
                                                    onChange={(event) => setTalkingFile(event.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </EditRow>
                                        <EditRow label="Model 3D: Thinking (.glb)">
                                            <label className="w-full bg-surface border border-secondary/20 px-4 py-3 text-on-surface text-sm outline-none focus-within:border-secondary cursor-pointer flex items-center justify-between">
                                                <span className="truncate">{thinkingFile ? thinkingFile.name : "Choose File..."}</span>
                                                <input
                                                    type="file"
                                                    accept=".glb"
                                                    onChange={(event) => setThinkingFile(event.target.files?.[0] || null)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </EditRow>

                                        </tbody>
                                    </table>
                                </div>

                                <div
                                    className="px-6 py-5 bg-surface border-t border-secondary/10 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all text-xs uppercase tracking-widest font-semibold"
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2 border border-secondary bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary transition-all text-xs uppercase tracking-widest font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving
                                            ? "Đang lưu..."
                                            : modalMode === "create"
                                                ? "Thêm triết gia"
                                                : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </div>

            {/* Footer Meta */}
        </div>
    );
}

function EditRow({label, children}) {
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
