

const Footer = () => {
    return (
        <footer className="w-full py-16 bg-surface-container-lowest border-t border-outline-variant/5 mt-20">
            <div className="flex flex-col items-center gap-8 px-6 max-w-container-max mx-auto">
                <h2 className="font-display-lg text-4xl text-on-surface tracking-tighter opacity-10">
                    PhiloVerse
                </h2>

                <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                    <a
                        className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
                        href="#"
                    >
                        Tuyên ngôn
                    </a>

                    <a
                        className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
                        href="#"
                    >
                        Hư vô Socratic
                    </a>

                    <a
                        className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
                        href="#"
                    >
                        Quyền truy cập
                    </a>

                    <a
                        className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
                        href="#"
                    >
                        Đạo đức
                    </a>
                </div>

                <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant opacity-50 text-center">
                    © 2026 THE PhiloVerse. MỘT SỰ THEO ĐUỔI SỰ THẬT BỀN BỈ.
                </p>
            </div>
        </footer>
    )
}

export default Footer;