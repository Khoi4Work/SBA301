import { useEffect, useState, useCallback } from "react";
import { philosopherService } from "@/services/philosopherService.js";
import { extractResponse } from "@/features/admin/utils/extractResponse.js";

const emptyForm = {
    name: "",
    shortQuote: "",
    category: "",
    core: "",
    biography: "",
    systemPrompt: "",
};

export function usePhilosopherManagement() {
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

    const fetchPhilosophers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await philosopherService.getAll();
            setPhilosophers(extractResponse(data));
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Không tải được danh sách triết gia."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhilosophers();
    }, [fetchPhilosophers]);

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

    const handleFormChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        if (!form.name || form.name.trim() === "") {
            setModalError("Vui lòng nhập tên triết gia.");
            return false;
        }
        if (!form.systemPrompt || form.systemPrompt.trim() === "") {
            setModalError("Vui lòng nhập System Prompt (đây là hướng dẫn cho AI).");
            return false;
        }
        if (!form.biography || form.biography.trim() === "") {
            setModalError("Vui lòng nhập tiểu sử triết gia.");
            return false;
        }
        if (form.name.length > 200) {
            setModalError("Tên triết gia không được vượt quá 200 ký tự.");
            return false;
        }
        if (form.systemPrompt.length > 5000) {
            setModalError("System Prompt không được vượt quá 5000 ký tự.");
            return false;
        }

        return true;
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);
            setModalMessage("");
            setModalError("");

            await philosopherService.create(form, file, idleFile, talkingFile, thinkingFile);
            setModalMessage("Thêm triết gia thành công.");

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

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!selectedPhilosopher?.id) return;
        if (!validateForm()) return;

        try {
            setSaving(true);
            setModalMessage("");
            setModalError("");

            await philosopherService.update(selectedPhilosopher.id, form, file, idleFile, talkingFile, thinkingFile);
            setModalMessage("Cập nhật triết gia thành công.");

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

    return {
        // Data
        philosophers,
        loading,
        error,

        // Modal state
        modalMode,
        selectedPhilosopher,
        form,
        file,
        idleFile,
        talkingFile,
        thinkingFile,
        saving,
        modalMessage,
        modalError,

        // File setters (used directly in JSX onChange)
        setFile,
        setIdleFile,
        setTalkingFile,
        setThinkingFile,

        // Handlers
        fetchPhilosophers,
        openCreateModal,
        openEditModal,
        closeModal,
        handleFormChange,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}
