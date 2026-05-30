import { Bell, Settings } from "lucide-react";
import {useNavigate} from "react-router-dom";



export function TopBar({ currentView, philosopherName, onNavigate }) {
  const navagate = useNavigate();
  if (currentView === "dialogue") {
    return (
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-50 bg-gradient-to-b from-surface/90 to-transparent px-8 h-20 flex justify-between items-center transition-all duration-500">
        <div className="flex flex-col">
          <h2 className="font-display text-2xl text-primary tracking-tighter">
            Đàm đạo cùng {philosopherName}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8 text-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            <button className="hover:text-secondary transition-colors">
              Thư viện
            </button>
            <button className="hover:text-secondary transition-colors">
              Luận đàm
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-secondary transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Selection View Top Bar
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-8 lg:px-16 h-20 transition-all duration-500">
      <div
        className="font-display text-4xl text-primary tracking-tighter cursor-pointer"
        onClick={() => onNavigate?.("selection")}
      >
        Philoverse
      </div>

      <div className="hidden lg:flex gap-8 items-center justify-center absolute left-1/2 transform -translate-x-1/2">
        <button onClick={() => navagate("/study")} className="text-[13px] uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors font-semibold">
          Học viện
        </button>
        <button onClick={() => navagate("/study")}  className="text-[13px] uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors font-semibold">
          Thư viện
        </button>
        <button onClick={() => navagate("/")} className="text-[13px] uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors font-semibold">
          Xưởng sáng tạo
        </button>
        <button onClick={() => navagate("/chat")}  className="text-[13px] uppercase tracking-widest text-secondary border-b-2 border-secondary pb-[2px] font-semibold">
          Đàm đạo
        </button>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 transition-all duration-300 rounded-full">
          <Bell size={20} />
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 transition-all duration-300 rounded-full">
          <Settings size={20} />
        </button>
        <button className="hidden lg:block ml-4 px-6 py-2.5 bg-primary-container text-primary ink-border font-semibold text-[11px] uppercase tracking-[0.2em] hover:bg-primary/10 active:scale-95 transition-all outline-none">
          Bắt đầu đối thoại
        </button>
      </div>
    </nav>
  );
}
