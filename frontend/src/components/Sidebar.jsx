import {
  Archive,
  BookMarked,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Medal,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col h-screen py-8 bg-surface-container-low border-r border-outline-variant/10 fixed left-0 top-0 w-64 z-50">
      <div className="px-8 mb-12">
        <h1 className="font-display-lg text-headline-md text-primary tracking-tight">
            PhiloVerse
        </h1>
      </div>
      <div className="flex-1 space-y-1 px-4">
        <a
          className="flex items-center gap-4 px-4 py-3 text-primary bg-primary/10 rounded-lg transition-all duration-200"
          href="#"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-label-md text-label-md">Bảng điều khiển</span>
        </a>
        <a
          className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors"
          href="#"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-label-md text-label-md">Triết gia AI</span>
        </a>
        <a
          className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors"
          href="#"
        >
          <GraduationCap className="w-5 h-5" />
          <span className="font-label-md text-label-md">Học viện</span>
        </a>
        <a
          className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors"
          href="#"
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-label-md text-label-md">Di vật</span>
        </a>
        <a
          className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors"
          href="#"
        >
          <Medal className="w-5 h-5" />
          <span className="font-label-md text-label-md">Học bổng</span>
        </a>
      </div>
      <div className="px-6 mb-8">
        <button className="w-full py-3.5 border border-outline-variant/30 text-on-surface-variant font-label-md rounded-lg uppercase tracking-widest hover:bg-surface-container-highest hover:text-primary transition-all cursor-pointer active:scale-[0.98]">
          Cuộc vấn tin mới
        </button>
      </div>
      <div className="px-4 mb-6 space-y-1">
        <a
          className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
          href="#"
        >
          <Archive className="w-5 h-5" />
          <span className="font-label-md text-label-md">Lưu trữ</span>
        </a>
        <a
          className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
          href="#"
        >
          <BookMarked className="w-5 h-5" />
          <span className="font-label-md text-label-md">Thư viện</span>
        </a>
      </div>
      <div className="mt-auto px-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden">
          <img
            alt="Hồ sơ Học giả"
            className="w-full h-full object-cover grayscale contrast-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-oK0dsp_C3vIjE4vXMXguDKTcYSJV_GbLTg1U8QdDvz0BE_MMpaa-IRRRpZQj-cMH4shRhuPcvsiGKI_D1MPkHDpcffkI0yix7TWuk5iLRSHX0WcTx0EB60i9zGNDWQKSecrxLOlkjFTAg6wt-xEUUnMbxKeLUhti-qJ6fNYL79V29FsTcWGuTEenzTrwLTZON1_8bC4KaG-0Son1-gGnKRMAVVt4drFWfozCx82870IJgk2NEnFzJBWOwpQYcK6VOriIiBmgAJw"
          />
        </div>
        <div className="truncate">
          <p className="font-label-md text-on-surface text-sm">
            Marcus Aurelius
          </p>
          <p className="text-[11px] text-on-surface-variant opacity-70 uppercase tracking-wider">
            Học giả tập sự
          </p>
        </div>
      </div>
    </nav>
  );
}
