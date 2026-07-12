import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import Footer from "@/components/Footer.jsx";
import { useAuth } from "@/features/auth/hooks/useAuth.jsx";
import {useContext, useState} from "react";
import {AuthContext} from "@/contexts/AuthContext.jsx";
import { LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const { logout } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const avatarSeed = user?.fullName || user?.username || "Admin";

  const avatarSrc =
    user?.avatarUrl ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <div className="font-sans min-h-screen overflow-x-hidden selection:bg-secondary/30">
      <div className="paper-texture fixed inset-0 z-[-1] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r-[0.5px] border-outline/30 bg-surface-container-lowest flex flex-col py-gutter z-50">
        <div className="px-6 mb-10">
          <h1 className="text-center font-display text-2xl text-secondary tracking-widest uppercase">Philoverse</h1>
          <p className="text-center font-sans text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-semibold mt-1">Quản trị hệ thống</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink
            to="/admin" end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 ${isActive ? 'text-secondary border-l-2 border-secondary bg-secondary-container/10' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-secondary-container/5 hover:text-secondary'}`
            }
          >
            <span className="material-symbols-outlined mr-2">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/chapters"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 ${isActive ? 'text-secondary border-l-2 border-secondary bg-secondary-container/10' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-secondary-container/5 hover:text-secondary'}`
            }
          >
            <span className="material-symbols-outlined mr-2">account_balance</span>
            <span className="text-sm">Học viện</span>
          </NavLink>
          <NavLink
            to="/admin/philosophers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 ${isActive ? 'text-secondary border-l-2 border-secondary bg-secondary-container/10' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-secondary-container/5 hover:text-secondary'}`
            }
          >
            <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="text-sm">Triết gia AI</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 ${isActive ? 'text-secondary border-l-2 border-secondary bg-secondary-container/10' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-secondary-container/5 hover:text-secondary'}`
            }
          >
            <span className="material-symbols-outlined mr-2">group</span>
            <span className="text-sm">Quản lý người dùng</span>
          </NavLink>
        </nav>


          <footer className="relative border-t border-outline/10 pt-4 space-y-1">
              <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="w-full flex items-center text-on-surface-variant px-4 py-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                  <span className="material-symbols-outlined mr-3">settings</span>
                  <span className="text-sm font-semibold">Settings</span>
              </button>

              {showMenu && (
                  <div className="absolute left-4 bottom-full mb-2 w-48 bg-surface-container border border-outline-variant rounded-lg shadow-lg overflow-hidden z-50">
                      <button
                          type="button"
                          onClick={() => {
                              setShowMenu(false);
                              navigate("/profile");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-on-surface hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-[20px]">
                            account_circle
                          </span>

                          <span className="text-sm font-medium">
                            Thông tin cá nhân
                          </span>
                      </button>

                      <button
                          type="button"
                          disabled={isLoggingOut}
                          onClick={async () => {
                              setIsLoggingOut(true);

                              try {
                                  await logout();
                              } catch (e) {
                                  console.warn("Logout failed but forcing UI exit");
                              } finally {
                                  navigate("/");
                              }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {!isLoggingOut && <LogOut size={18} />}

                          <span className="text-sm font-medium">
                              {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
                          </span>
                      </button>
                  </div>
              )}
          </footer>
      </aside>

      <div className="ml-64 min-h-screen flex flex-col">

        {/* Main Content */}
        <main className="flex-1 p-margin-desktop relative">
          <div className="max-w-container-max mx-auto relative z-10">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
