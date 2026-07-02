import {
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    Clapperboard,
    Sparkles,
    History
} from "lucide-react";
import {useLocation, Link, useNavigate} from "react-router-dom";
import {useContext} from "react";
import {AuthContext} from "@/contexts/AuthContext.jsx";

export function Sidebar({ isOpen = true }) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const {user} = useContext(AuthContext);

    const getMenuItemClass = (path, alternativePaths = []) => {
        const isActive = path === "/"
            ? currentPath === "/"
            : (path === "/review"
                ? (currentPath === "/review" || (currentPath.startsWith("/review/") && !currentPath.startsWith("/review/history")))
                : currentPath.startsWith(path) || alternativePaths.some(p => currentPath.startsWith(p)));

        return isActive
            ? "flex items-center gap-4 px-4 py-3 text-primary bg-primary/10 rounded-lg transition-all duration-200"
            : "flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors";
    };

    const fallbackSidebarAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC-oK0dsp_C3vIjE4vXMXguDKTcYSJV_GbLTg1U8QdDvz0BE_MMpaa-IRRRpZQj-cMH4shRhuPcvsiGKI_D1MPkHDpcffkI0yix7TWuk5iLRSHX0WcTx0EB60i9zGNDWQKSecrxLOlkjFTAg6wt-xEUUnMbxKeLUhti-qJ6fNYL79V29FsTcWGuTEenzTrwLTZON1_8bC4KaG-0Son1-gGnKRMAVVt4drFWfozCx82870IJgk2NEnFzJBWOwpQYcK6VOriIiBmgAJw";

    const sidebarAvatarSrc = user?.avatarUrl
        ? user.avatarUrl.startsWith("blob:")
            ? user.avatarUrl
            : `${user.avatarUrl}?v=${user?.avatarVersion || ""}`
        : fallbackSidebarAvatar;

    return (
        <nav
            className={`hidden md:flex flex-col h-screen py-8 bg-surface-container-low border-r border-outline-variant/10 fixed left-0 top-0 w-64 z-50 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="px-10 mb-6 text-center">
                <h1 style={{fontSize: '2.2rem'}}
                    className="font-display-lg text-headline-md text-primary tracking-tight">
                    PhiloVerse
                </h1>
            </div>
            <div className="flex-1 space-y-1 px-4 overflow-y-auto scroll-hide">
                <Link
                    className={getMenuItemClass("/dashboard")}
                    to="/dashboard"
                >
                    <LayoutDashboard className="w-5 h-5"/>
                    <span className="font-label-md text-label-md">Bảng điều khiển</span>
                </Link>
                <Link
                    className={getMenuItemClass("/study")}
                    to="/study"
                >
                    <GraduationCap className="w-5 h-5"/>
                    <span className="font-label-md text-label-md">Học viện</span>
                </Link>
                {/*<Link*/}
                {/*    className={getMenuItemClass("/")}*/}
                {/*    to="/"*/}
                {/*>*/}
                {/*    <Clapperboard className="w-5 h-5"/>*/}
                {/*    <span className="font-label-md text-label-md">Góc nhìn triết học</span>*/}
                {/*</Link>*/}
                <Link
                    className={getMenuItemClass("/chat", ["/ai"])}
                    to="/chat"
                >
                    <Sparkles className="w-5 h-5"/>
                    <span className="font-label-md text-label-md">Luận đàm</span>
                </Link>
                <Link
                    className={getMenuItemClass("/review")}
                    to="/review"
                >
                    <BookOpen className="w-5 h-5"/>
                    <span className="font-label-md text-label-md">Ôn tập</span>
                </Link>
                <Link
                    className={getMenuItemClass("/review/history")}
                    to="/review/history"
                >
                    <History className="w-5 h-5"/>
                    <span className="font-label-md text-label-md">Lịch sử ôn tập</span>
                </Link>
            </div>
            <Link
                to="/profile"
                className="mt-auto px-6 flex items-center gap-4 hover:opacity-80 transition-opacity"
            >
                <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden">
                    <img
                        key={`${user?.avatarUrl || "default"}-${user?.avatarVersion || ""}`}
                        alt="Hồ sơ Học giả"
                        className="w-full h-full object-cover grayscale contrast-110"
                        src={sidebarAvatarSrc}
                    />
                </div>

                <div className="truncate">
                    <p className="font-label-md text-on-surface text-sm">
                        {user?.fullName || user?.username}
                    </p>

                    <p className="text-[11px] text-on-surface-variant opacity-70 uppercase tracking-wider">
                        Học giả tập sự
                    </p>
                </div>
            </Link>
        </nav>
    );
}

export default Sidebar;
