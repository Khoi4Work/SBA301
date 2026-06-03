import { Bell, Settings } from 'lucide-react';
import {Link} from "react-router-dom";

export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 h-20 px-6 md:px-16 flex justify-between items-center">
            <div className="flex items-center gap-12">
                <h1 className="font-display text-4xl text-primary tracking-tighter font-bold">
                    PhiloVerse
                </h1>
                <nav className="hidden md:flex gap-8 items-center">
                    <Link
                        to="/study"
                        className="font-body-md text-body-md uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                        Học viện
                    </Link>

                    <Link
                        to="/"
                        className="font-body-md text-body-md uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                        Xưởng sáng tạo
                    </Link>

                    <Link
                        to="/chat"
                        className="font-body-md text-body-md uppercase tracking-wider text-on-surface-variant hover:text-secondary transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                        Luận đàm
                    </Link>
                </nav>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all cursor-pointer">
                        <Bell size={24} />
                    </button>
                    <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all cursor-pointer">
                        <Settings size={24} />
                    </button>
                </div>
                <button className="hidden sm:block bg-primary-container text-primary border border-primary/30 px-6 py-2 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all active:scale-95">
                    Bắt đầu đối thoại
                </button>
            </div>
        </header>
    );
}
