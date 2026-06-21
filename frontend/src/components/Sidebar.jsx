import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Clapperboard,
  Sparkles,
  MessageSquare,
  Trash2,
  Pencil,
  Archive
} from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext.jsx";
import { useSession } from "@/contexts/SessionContext.jsx";
import { getChatSessions, deleteChatSession, updateChatSessionTitle } from "@/services/sessionService.js";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { currentSessionId, switchSession, clearSession, currentPhilosopherId } = useSession();
  const [sessions, setSessions] = useState([]);
  const { user } = useContext(AuthContext);

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
    }, [currentPhilosopherId]);

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        if (!id) return;
        try {
            await deleteChatSession(id);
            const updatedSessions = sessions.filter(s => s.sessionId !== id);
            setSessions(updatedSessions);
            if (currentSessionId === id) {
                clearSession();
            }
        } catch (error) {
            console.error("Lỗi xóa phiên hội thoại:", error);
        }
    };

    const handleEditSession = async (e, session) => {
        e.stopPropagation();
        const newTitle = window.prompt("Nhập tiêu đề mới cho cuộc hội thoại:", session.title);
        if (newTitle && newTitle.trim() !== "" && newTitle !== session.title) {
            try {
                await updateChatSessionTitle(session.sessionId, newTitle.trim());
                const updatedSessions = sessions.map(s =>
                    s.sessionId === session.sessionId ? { ...s, title: newTitle.trim() } : s
                );
                setSessions(updatedSessions);
            } catch (error) {
                console.error("Lỗi cập nhật tiêu đề:", error);
                alert("Không thể cập nhật tiêu đề.");
            }
        }
    };


  const getMenuItemClass = (path, alternativePaths = []) => {
    const isActive = path === "/"
      ? currentPath === "/"
      : currentPath.startsWith(path) || alternativePaths.some(p => currentPath.startsWith(p));

    return isActive
      ? "flex items-center gap-4 px-4 py-3 text-primary bg-primary/10 rounded-lg transition-all duration-200"
      : "flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors";
  };

  return (
    <nav className="hidden md:flex flex-col h-screen py-8 bg-surface-container-low border-r border-outline-variant/10 fixed left-0 top-0 w-64 z-50">
      <div className="px-10 mb-6 text-center">
        <h1 style={{ fontSize: '2.2rem' }} className="font-display-lg text-headline-md text-primary tracking-tight">
          PhiloVerse
        </h1>
      </div >
      <div className="flex-1 space-y-1 px-4 overflow-y-auto scroll-hide">
        <Link
          className={getMenuItemClass("/dashboard")}
          to="/dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-label-md text-label-md">Bảng điều khiển</span >
        </Link>
        <Link
          className={getMenuItemClass("/study")}
          to="/study"
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-label-md text-label-md">Học viện</span >
        </Link>
        <Link
          className={getMenuItemClass("/")}
          to="/"
        >
          <Clapperboard className="w-5 h-5" />
          <span className="font-label-md text-label-md">Xưởng sáng tạo</span >
        </Link>
        <Link
          className={getMenuItemClass("/chat", ["/ai"])}
          to="/chat"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-label-md text-label-md">Luận đàm</span >
        </Link>
        <Link
          className={getMenuItemClass("/review")}
          to="/review"
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-label-md text-label-md">Ôn tập</span >
        </Link>

        {currentPath.startsWith("/ai") && (
          <div className="pt-6 pb-2 px-4">
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
                    }}
                    className={`group flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentSessionId === session.sessionId
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate font-label-md">
                        {session.title || `Phiên ${session.sessionId.slice(0, 8)}...`}
                      </span >
                    </div >
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditSession(e, session)}
                        className="p-1 hover:text-primary transition-colors"
                        title="Đổi tên"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.sessionId)}
                        className="p-1 hover:text-error transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div >
                  </div >
                ))
              )}
            </div >
          </div >
        )}
      </div >
      {currentPath.startsWith("/ai") && (
        <div className="px-6 mb-8">
          <button
            onClick={clearSession}
            className="w-full py-3.5 border border-outline-variant/30 text-on-surface-variant font-label-md rounded-lg uppercase tracking-widest hover:bg-surface-container-highest hover:text-primary transition-all cursor-pointer active:scale-[0.98] text-center"
          >
            Cuộc vấn tin mới
          </button>
        </div >
      )}
      <div className="px-4 mb-6 space-y-1">
        <a
          className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
          href="#"
        >
          <Archive className="w-5 h-5" />
          <span className="font-label-md text-label-md">Lưu trữ</span >
        </a >
        {/*<a*/}
        {/*  className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors"*/}
        {/*  href="#"*/}
        {/*>*/}
        {/*  <BookMarked className="w-5 h-5" />*/}
        {/*  <span className="font-label-md text-label-md">Thư viện</span>*/}
        {/*</a>*/}
      </div >
        <Link
            to="/profile"
            className="mt-auto px-6 flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden">
                <img
                    alt="Hồ sơ Học giả"
                    className="w-full h-full object-cover grayscale contrast-110"
                    src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuC-oK0dsp_C3vIjE4vXMXguDKTcYSJV_GbLTg1U8QdDvz0BE_MMpaa-IRRRpZQj-cMH4shRhuPcvsiGKI_D1MPkHDpcffkI0yix7TWuk5iLRSHX0WcTx0EB60i9zGNDWQKSecrxLOlkjFTAg6wt-xEUUnMbxKeLUhti-qJ6fNYL79V29FsTcWGuTEenzTrwLTZON1_8bC4KaG-0Son1-gGnKRMAVVt4drFWfozCx82870IJgk2NEnFzJBWOwpQYcK6VOriIiBmgAJw"}
                />
            </div >

            <div className="truncate">
                <p className="font-label-md text-on-surface text-sm">
                    {user?.fullName || user?.username}
                </p>

                <p className="text-[11px] text-on-surface-variant opacity-70 uppercase tracking-wider">
                    Học giả tập sự
                </p>
            </div >
        </Link>
    </nav>
  );
}

export default Sidebar;
