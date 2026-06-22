import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/services/authService";

export default function ResetPasswordCard() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            sessionStorage.setItem("passwordResetToken", tokenFromUrl);

            // Xóa ?token=... khỏi thanh URL
            navigate("/reset-password", { replace: true });
            return;
        }

        const tokenFromSession = sessionStorage.getItem("passwordResetToken");

        if (tokenFromSession) {
            setToken(tokenFromSession);
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError("Liên kết khôi phục không hợp lệ hoặc đã hết hạn.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, newPassword);

            sessionStorage.removeItem("passwordResetToken");

            setMessage("Đổi mật khẩu thành công. Đang đưa bạn về trang đăng nhập...");

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch (err) {
            setError("Liên kết khôi phục không hợp lệ, đã dùng hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full border border-outline-variant/60 p-10 backdrop-blur-sm bg-surface/40 flex flex-col items-center relative">
            <h2 className="font-serif text-secondary text-[32px] font-semibold mb-4 leading-tight">
                Tạo mật mã mới
            </h2>

            <p className="text-on-surface-variant text-[15px] leading-relaxed mb-10 text-center max-w-[300px]">
                Nhập mật khẩu mới để khôi phục quyền truy cập vào PhiloVerse.
            </p>

            <form className="w-full flex flex-col pt-2" onSubmit={handleSubmit}>
                <div className="mb-5 flex flex-col gap-2">
                    <label
                        htmlFor="newPassword"
                        className="text-[11px] font-bold tracking-[0.1em] uppercase text-secondary/80 ml-0.5"
                    >
                        Mật khẩu mới
                    </label>

                    <div className="relative group">
                        <input
                            type="password"
                            id="newPassword"
                            placeholder="Ít nhất 8 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-transparent border border-outline-variant/60 outline-none text-on-surface placeholder:text-outline-variant px-4 py-3.5 text-sm transition-colors focus:border-secondary/70 focus:bg-primary-container/20"
                            required
                        />

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary/50 transition-colors pointer-events-none">
                            <LockKeyhole size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-col gap-2">
                    <label
                        htmlFor="confirmPassword"
                        className="text-[11px] font-bold tracking-[0.1em] uppercase text-secondary/80 ml-0.5"
                    >
                        Xác nhận mật khẩu
                    </label>

                    <div className="relative group">
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-transparent border border-outline-variant/60 outline-none text-on-surface placeholder:text-outline-variant px-4 py-3.5 text-sm transition-colors focus:border-secondary/70 focus:bg-primary-container/20"
                            required
                        />

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-secondary/50 transition-colors pointer-events-none">
                            <LockKeyhole size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {message && (
                    <p className="mb-4 text-[13px] text-secondary/80 leading-relaxed text-center">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mb-4 text-[13px] text-red-400 leading-relaxed text-center">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-transparent border border-secondary/60 text-secondary text-[11px] font-bold tracking-[0.15em] uppercase py-4 mt-2 hover:bg-secondary/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Đang đổi mật khẩu..." : "Xác nhận mật mã mới"}
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