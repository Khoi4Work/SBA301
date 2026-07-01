import { useEffect, useState, useCallback } from "react";
import { userService } from "@/services/userService.js";
import { extractResponse } from "@/features/admin/utils/extractResponse.js";

const INITIAL_EDIT_FORM = {
    username: "",
    email: "",
    fullName: "",
    biography: "",
};

export function useUserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
    const [saving, setSaving] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");
    const [updateError, setUpdateError] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await userService.getAllUsers();
            const userList = extractResponse(data);

            setUsers(userList);
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
        fetchUsers();
    }, [fetchUsers]);

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

            await fetchUsers();

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
            await fetchUsers();
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

        // Handlers
        handleUpdateUser,
        handleEditChange,
        handleCancelUpdate,
        handleSubmitUpdate,
        handleDeleteUser,
    };
}
