import { ArrowRight, ChevronLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPasswordCard() {
    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="w-full border border-outline-variant/60 p-10 backdrop-blur-sm bg-surface/40 flex flex-col items-center relative">
            <h2 className="font-serif text-secondary text-[32px] font-semibold mb-4 leading-tight">
                Quên mật mã?
            </h2>

            <p className="text-on-surface-variant text-[15px] leading-relaxed mb-10 text-center max-w-[280px]">
                Nhập địa chỉ email của bạn để bắt đầu quá trình khôi phục tài khoản từ kho lưu trữ.
            </p>

            <form className="w-full flex flex-col pt-2" onSubmit={handleSubmit}>
                <div className="mb-6 flex flex-col gap-2">
                    <label
                        htmlFor="email"
                        className="text-[11px] font-bold tracking-[0.1em] uppercase text-secondary/80 ml-0.5"
                    >
                        Địa chỉ Email
                    </label>

                    <div className="relative group">
                        <input
                            type="email"
                            id="email"
                            placeholder="name@lyceum.edu"
                            className="w-full bg-transparent border border-outline-variant/60 outline-none text-on-surface placeholder:text-outline-variant px-4 py-3.5 text-sm transition-colors focus:border-secondary/70 focus:bg-primary-container/20"
                        />

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary/50 transition-colors pointer-events-none">
                            <Mail size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-transparent border border-secondary/60 text-secondary text-[11px] font-bold tracking-[0.15em] uppercase py-4 mt-2 hover:bg-secondary/10 transition-colors flex items-center justify-center gap-3"
                >
                    Khôi phục mật mã
                    <ArrowRight size={14} strokeWidth={2} />
                </button>
            </form>

            <Link
                to="/login"
                className="mt-12 text-on-surface-variant text-[10px] sm:text-[11px] font-bold tracking-[0.1em] uppercase hover:text-on-surface transition-colors flex items-center justify-center gap-2 group"
            >
                <ChevronLeft size={14} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
            </Link>
        </div>
    );
}