import { NavLink, Outlet } from 'react-router-dom';
import Footer from "@/components/Footer.jsx";
import {useAuth} from "@/features/auth/hooks/useAuth.jsx";

export default function AdminLayout() {
    const { user } = useAuth();

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
          <h1 className="font-display text-2xl text-secondary tracking-widest uppercase">Philoverse</h1>
          <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-semibold mt-1">Central Administration</p>
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
            <span className="material-symbols-outlined mr-2">description</span>
            <span className="text-sm">Academy Documents</span>
          </NavLink>
          <NavLink 
            to="/admin/philosophers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 ${isActive ? 'text-secondary border-l-2 border-secondary bg-secondary-container/10' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-secondary-container/5 hover:text-secondary'}`
            }
          >
            <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="text-sm">AI Philosophers</span>
          </NavLink>
          <NavLink 
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 ${isActive ? 'text-secondary border-l-2 border-secondary bg-secondary-container/10' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-secondary-container/5 hover:text-secondary'}`
            }
          >
            <span className="material-symbols-outlined mr-2">group</span>
            <span className="text-sm">User Management</span>
          </NavLink>
        </nav>


        <footer className="border-t border-outline/10 pt-4 space-y-1">
          <a href="#" className="flex items-center text-on-surface-variant px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined mr-3">settings</span>
            <span className="text-sm font-semibold">Settings</span>
          </a>
          <a href="#" className="flex items-center text-on-surface-variant px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined mr-3">help_outline</span>
            <span className="text-sm font-semibold">Support</span>
          </a>
        </footer>
      </aside>

      {/* Top App Bar */}
        <div className="ml-64 min-h-screen flex flex-col">
            {/* Top App Bar */}
            <header className="flex justify-between items-center w-full px-gutter h-16 border-b-[0.5px] border-outline/30 bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="flex items-center justify-end space-x-6 w-full">
                    <div className="relative flex items-center group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            className="bg-transparent border-b border-outline/30 text-on-surface px-4 py-1 focus:outline-none focus:border-secondary transition-colors w-64 text-sm placeholder:text-on-surface-variant/40"
                        />
                        <span className="material-symbols-outlined absolute right-2 text-on-surface-variant text-lg">
                    search
                </span>
                    </div>

                    <button className="text-on-surface-variant hover:text-secondary transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-secondary rounded-full"></span>
                    </button>

                    <div className="w-8 h-8 rounded border border-secondary/40 overflow-hidden bg-secondary-container">
                        <img
                            src={avatarSrc}
                            alt={avatarSeed}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </header>

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
