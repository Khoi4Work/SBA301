import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/features/auth/services/authService";

export default function ResetPasswordForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({
        newPassword: false,
        confirmPassword: false,
    });

    const [validationErrors, setValidationErrors] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [focusedField, setFocusedField] = useState(null);

    const validateField = (name, value, passwordVal = newPassword) => {
        switch (name) {
            case "newPassword": {
                if (!value) return "Mật khẩu mới không được để trống";
                if (value.length < 6 || value.length > 100) {
                    return "Mật khẩu phải từ 6 đến 100 ký tự";
                }

                const hasLowercase = /[a-z]/.test(value);
                const hasUppercase = /[A-Z]/.test(value);
                const hasNumber = /\d/.test(value);

                if (!hasLowercase || !hasUppercase || !hasNumber) {
                    return "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 chữ số";
                }

                return "";
            }

            case "confirmPassword": {
                if (!value) return "Vui lòng xác nhận mật khẩu";
                if (value !== passwordVal) return "Mật khẩu xác nhận không trùng khớp";
                return "";
            }

            default:
                return "";
        }
    };

    const handlePasswordChange = (value) => {
        setNewPassword(value);

        if (touched.newPassword) {
            const passwordError = validateField("newPassword", value);
            setValidationErrors((prev) => ({
                ...prev,
                newPassword: passwordError,
            }));
        }

        if (touched.confirmPassword) {
            const confirmError = validateField("confirmPassword", confirmPassword, value);
            setValidationErrors((prev) => ({
                ...prev,
                confirmPassword: confirmError,
            }));
        }
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);

        if (touched.confirmPassword) {
            const confirmError = validateField("confirmPassword", value, newPassword);
            setValidationErrors((prev) => ({
                ...prev,
                confirmPassword: confirmError,
            }));
        }
    };

    const handleBlur = (name) => {
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));

        setFocusedField(null);

        const value = name === "newPassword" ? newPassword : confirmPassword;
        const fieldError = validateField(name, value);

        setValidationErrors((prev) => ({
            ...prev,
            [name]: fieldError,
        }));
    };

    const handleFocus = (name) => {
        setFocusedField(name);
    };

    const passwordChecks = {
        length: newPassword.length >= 6 && newPassword.length <= 100,
        lowercase: /[a-z]/.test(newPassword),
        uppercase: /[A-Z]/.test(newPassword),
        number: /\d/.test(newPassword),
    };

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

        const passwordError = validateField("newPassword", newPassword);
        const confirmError = validateField("confirmPassword", confirmPassword, newPassword);

        setTouched({
            newPassword: true,
            confirmPassword: true,
        });

        setValidationErrors({
            newPassword: passwordError,
            confirmPassword: confirmError,
        });

        if (passwordError || confirmError) {
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
                            placeholder="Ít nhất 6 ký tự"
                            value={newPassword}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            onBlur={() => handleBlur("newPassword")}
                            onFocus={() => handleFocus("newPassword")}
                            className="w-full bg-transparent border border-outline-variant/60 outline-none text-on-surface placeholder:text-outline-variant px-4 py-3.5 text-sm transition-colors focus:border-secondary/70 focus:bg-primary-container/20"
                            required
                        />
                    </div>

                    {(focusedField === "newPassword" || newPassword.length > 0) && (
                        <div className="mt-3 p-4 bg-surface-container-lowest/70 border border-outline-variant/30 rounded shadow-inner space-y-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                            <p className="font-caption text-[11px] uppercase tracking-wider text-on-surface-variant/80 font-bold mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                    info
                </span>
                                Điều kiện bảo mật mật mã:
                            </p>

                            <ul className="text-xs space-y-1.5 font-body">
                                <PasswordRule checked={passwordChecks.length}>
                                    Dài từ 6 đến 100 ký tự
                                </PasswordRule>

                                <PasswordRule checked={passwordChecks.lowercase}>
                                    Chứa ít nhất 1 chữ cái thường (a-z)
                                </PasswordRule>

                                <PasswordRule checked={passwordChecks.uppercase}>
                                    Chứa ít nhất 1 chữ cái hoa (A-Z)
                                </PasswordRule>

                                <PasswordRule checked={passwordChecks.number}>
                                    Chứa ít nhất 1 chữ số (0-9)
                                </PasswordRule>
                            </ul>
                        </div>
                    )}

                    {touched.newPassword && validationErrors.newPassword && (
                        <p className="mt-2 text-[12px] text-red-400">
                            {validationErrors.newPassword}
                        </p>
                    )}
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
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            onBlur={() => handleBlur("confirmPassword")}
                            onFocus={() => handleFocus("confirmPassword")}
                            className="w-full bg-transparent border border-outline-variant/60 outline-none text-on-surface placeholder:text-outline-variant px-4 py-3.5 text-sm transition-colors focus:border-secondary/70 focus:bg-primary-container/20"
                            required
                        />

                        {touched.confirmPassword && validationErrors.confirmPassword && (
                            <p className="mt-2 text-[12px] text-red-400">
                                {validationErrors.confirmPassword}
                            </p>
                        )}
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

function PasswordRule({ checked, children }) {
    return (
        <li
            className={`flex items-center gap-2 transition-colors duration-200 ${
                checked
                    ? "text-emerald-400 font-medium"
                    : "text-on-surface-variant/50"
            }`}
        >
            <span className="flex items-center justify-center w-4 h-4 border border-current rounded-full text-[10px]">
                {checked ? "✓" : "•"}
            </span>

            <span>{children}</span>
        </li>
    );
}