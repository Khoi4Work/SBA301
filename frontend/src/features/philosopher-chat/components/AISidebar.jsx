import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Trash2, Pencil, Loader2 } from "lucide-react";
import { useSession } from '@/contexts/SessionContext.jsx';
import { getChatSessions, deleteChatSession, updateChatSessionTitle } from "@/services/sessionService.js";

export function AISidebar({ isOpen = true, onClose = null }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentSessionId, switchSession, clearSession, currentPhilosopherId, refreshSignal } = useSession();
    const [sessions, setSessions] = useState([]);
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [processingSessionId, setProcessingSessionId] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await getChatSessions(currentPhilosopherId);
                setSessions(data);
            } catch (error) {
                console.error("Lỗi tải lịch sử hội thoại:", error);
            }
        };
        fetchSessions();
    }, [currentPhilosopherId, refreshSignal]);

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        if (!id) return;
        try {
            setProcessingSessionId(id);
            await deleteChatSession(id);
            const updatedSessions = sessions.filter(s => s.sessionId !== id);
            setSessions(updatedSessions);
            if (currentSessionId === id) {
                clearSession();
            }
        } catch (error) {
            console.error("Lỗi xóa phiên hội thoại:", error);
        } finally {
            setProcessingSessionId(null);
        }
    };

    const startEditing = (e, session) => {
        e.stopPropagation();
        setEditingSessionId(session.sessionId);
        setEditTitle(session.title || "");
    };

    const cancelEditing = () => {
        setEditingSessionId(null);
        setEditTitle("");
    };

    const saveEditSession = async (id) => {
        if (!id) return;
        const trimmedTitle = editTitle.trim();
        if (trimmedTitle === "") {
            cancelEditing();
            return;
        }

        try {
            setProcessingSessionId(id);
            await updateChatSessionTitle(id, trimmedTitle);
            const updatedSessions = sessions.map(s =>
                s.sessionId === id ? { ...s, title: trimmedTitle } : s
            );
            setSessions(updatedSessions);
        } catch (error) {
            console.error("Lỗi cập nhật tiêu đề:", error);
            alert("Không thể cập nhật tiêu đề.");
        } finally {
            setProcessingSessionId(null);
            cancelEditing();
        }
    };

    return (
        <nav
            className={`hidden md:flex flex-col h-screen py-8 bg-surface-container-low border-r border-outline-variant/10 fixed left-0 top-0 w-64 z-50 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="px-10 mb-6 text-center">
                <h1 style={{ fontSize: '2.2rem' }}
                    className="font-display-lg text-headline-md text-primary tracking-tight">
                    PhiloVerse
                </h1>
            </div>

            <div className="flex-1 space-y-1 px-4 overflow-y-auto scroll-hide">
                <div className="pt-6 pb-2 px-4">
                    <button
                        onClick={() => {
                            clearSession();
                            navigate("/ai", {
                                state: {
                                    openChat: true
                                }
                            });
                            if (onClose) onClose();
                        }}
                        className="w-full py-3.5 mb-4 border border-outline-variant/30 text-on-surface-variant font-label-md rounded-lg uppercase tracking-widest hover:bg-surface-container-highest hover:text-primary transition-all cursor-pointer active:scale-[0.98] text-center text-xs"
                    >
                        Cuộc vấn tin mới
                    </button>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-semibold mb-3">
                        Lịch sử luận đàm
                    </p>
                    <div className="space-y-1">
                        {sessions.length === 0 ? (
                            <p className="text-xs italic text-on-surface-variant/40 px-4 py-2">
                                Chưa có phiên đàm đạo nào...
                            </p>
                        ) : (
                            sessions.map(session => (
                                <div
                                    key={session.sessionId}
                                    onClick={() => {
                                        if (processingSessionId === session.sessionId) return;
                                        switchSession(session.sessionId, session.philosopherId);
                                        navigate("/ai", {
                                            state: {
                                                philosopher: {
                                                    id: session.philosopherId,
                                                    name: session.philosopherName
                                                },
                                                openChat: true
                                            }
                                        });
                                        if (onClose) onClose();
                                    }}
                                    className={`group flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        processingSessionId === session.sessionId ? "opacity-50 pointer-events-none" : ""
                                    } ${currentSessionId === session.sessionId
                                        ? "bg-primary/10 text-primary"
                                        : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <MessageSquare className="w-4 h-4 shrink-0" />
                                        {editingSessionId === session.sessionId ? (
                                            <input
                                                className="text-xs bg-surface border border-primary/30 px-1 rounded outline-none w-full"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEditSession(session.sessionId);
                                                    if (e.key === "Escape") cancelEditing();
                                                }}
                                                onBlur={() => saveEditSession(session.sessionId)}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className="text-xs truncate font-label-md">
                                                {session.title || `Phiên ${session.sessionId.slice(0, 8)}...`}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {processingSessionId === session.sessionId ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => editingSessionId === session.sessionId ? cancelEditing() : startEditing(e, session)}
                                                    className="p-1 hover:text-primary transition-colors"
                                                    title={editingSessionId === session.sessionId ? "Hủy" : "Đổi tên"}
                                                >
                                                    {editingSessionId === session.sessionId ? (
                                                        <span className="text-[10px] font-bold">Hủy</span>
                                                    ) : (
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteSession(e, session.sessionId)}
                                                    className="p-1 hover:text-error transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default AISidebar;
