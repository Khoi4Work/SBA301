import { useEffect, useState, useCallback } from "react";
import { userService } from "@/services/userService.js";

const INITIAL_EDIT_FORM = {
    username: "",
    email: "",
    fullName: "",
    biography: "",
};

const PAGE_SIZE = 5;

export function useUserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
    const [saving, setSaving] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");
    const [updateError, setUpdateError] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0); // 0-based (Backend)
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchUsers = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError("");

            const data = await userService.getAllUsers(page, PAGE_SIZE);

            // Spring Page response: { content, totalPages, totalElements, number, ... }
            if (data && Array.isArray(data.content)) {
                setUsers(data.content);
                setTotalPages(data.totalPages ?? 1);
                setTotalElements(data.totalElements ?? data.content.length);
                setCurrentPage(data.number ?? page);
            } else {
                // Fallback: if server returns plain array (non-paginated)
                const list = Array.isArray(data) ? data : [];
                setUsers(list);
                setTotalPages(1);
                setTotalElements(list.length);
                setCurrentPage(0);
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Không tải được danh sách user. Check quyền ADMIN/STAFF."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(0);
    }, [fetchUsers]);

    const goToPage = useCallback((page) => {
        if (page < 0 || page >= totalPages) return;
        fetchUsers(page);
    }, [fetchUsers, totalPages]);

    const handleUpdateUser = (user) => {
        setEditingUser(user);
        setUpdateMessage("");
        setUpdateError("");

        setEditForm({
            username: user.username || "",
            email: user.email || "",
            fullName: user.fullName || "",
            biography: user.biography || "",
        });
    };

    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCancelUpdate = () => {
        setEditingUser(null);
        setEditForm(INITIAL_EDIT_FORM);
        setUpdateMessage("");
        setUpdateError("");
    };

    const handleSubmitUpdate = async (event) => {
        event.preventDefault();

        if (!editingUser?.userId) return;

        try {
            setSaving(true);
            setUpdateMessage("");
            setUpdateError("");

            const updatedUser = await userService.updateUser(editingUser.userId, {
                username: editForm.username,
                email: editForm.email,
                fullName: editForm.fullName,
                biography: editForm.biography,
            });

            await fetchUsers(currentPage);

            setEditingUser((prev) => ({
                ...prev,
                ...(updatedUser || {}),
                username: editForm.username,
                email: editForm.email,
                fullName: editForm.fullName,
                biography: editForm.biography,
            }));

            setUpdateMessage("Cập nhật user thành công.");
        } catch (err) {
            console.error(err);
            setUpdateError(
                err.response?.data?.message ||
                "Cập nhật thất bại. Có thể username/email bị trùng."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (user) => {
        const ok = window.confirm(
            `Xóa user "${user.username || user.email}" thật hả?`
        );

        if (!ok) return;

        try {
            await userService.deleteUser(user.userId);
            // If last item on page and not first page, go back one page
            const newPage = users.length === 1 && currentPage > 0 ? currentPage - 1 : currentPage;
            await fetchUsers(newPage);
            alert("Xóa user thành công.");
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                "Xóa user thất bại. Check quyền ADMIN."
            );
        }
    };

    return {
        // State
        users,
        loading,
        error,
        editingUser,
        editForm,
        saving,
        updateMessage,
        updateError,
        // Pagination
        currentPage,
        totalPages,
        totalElements,

        // Handlers
        handleUpdateUser,
        handleEditChange,
        handleCancelUpdate,
        handleSubmitUpdate,
        handleDeleteUser,
        goToPage,
    };
}
