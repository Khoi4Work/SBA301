import { Bell, Settings } from "lucide-react";

export function TopNav() {
  return (
    <header className="h-20 flex justify-between items-center px-6 md:px-12 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 sticky top-0 z-40">
      <div className="md:hidden">
        <h1 className="font-display-lg text-headline-md text-primary tracking-tighter">
          PhiloVerse
        </h1>
      </div>
      <div className="hidden md:flex gap-10">
        <a
          className="font-label-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          href="#"
        >
          Học viện
        </a>
        <a
          className="font-label-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          href="#"
        >
          Thư viện
        </a>
        <a
          className="font-label-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          href="#"
        >
          Xưởng sáng tạo
        </a>
      </div>
      <div className="flex items-center gap-6">
        <Bell className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
        <Settings className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
        <button className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/10">
          Bắt đầu đàm đạo
        </button>
      </div>
    </header>
  );
}
