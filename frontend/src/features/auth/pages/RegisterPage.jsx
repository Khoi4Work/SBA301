import {  useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Circle, Menu} from 'lucide-react';
import {Background} from "@/features/auth/components/Background.jsx";
import Footer from "@/components/Footer.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import {useAuth} from "@/features/auth/hooks/useAuth.jsx";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState(null);

    const handleRegisterSubmit = async (data) => {
        setGlobalError(null);
        setFieldErrors(null);
        setLoading(true);

        try {
            await register(data);

            navigate('/login', {
                state: {
                    success: 'Đăng ký thành công, hãy đăng nhập'
                }
            });
        } catch (err) {
            const apiResponse = err.response?.data;
            if (apiResponse) {
                if (apiResponse.errors) {
                    setFieldErrors(apiResponse.errors);
                } else if (apiResponse.message) {
                    const msg = apiResponse.message;
                    if (msg.includes("Username already exists")) {
                        setFieldErrors({ username: "Tên đăng nhập đã tồn tại trong hệ thống" });
                    } else if (msg.includes("Email already exists")) {
                        setFieldErrors({ email: "Địa chỉ email đã được đăng ký" });
                    } else {
                        setGlobalError(msg);
                    }
                } else {
                    setGlobalError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
                }
            } else {
                setGlobalError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-surface font-body selection:bg-secondary/30 selection:text-secondary-fixed min-h-screen relative">
            <Background />

            {/* Header / Brand Anchor */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 py-8 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md">
                <div className="font-headline-md text-2xl text-secondary tracking-widest font-medium">
                    PhiloVerse
                </div>
                <button className="text-secondary hover:text-secondary-fixed-dim transition-colors">
                    <Menu className="w-8 h-8" strokeWidth={1.5} />
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center px-4 md:px-16 pt-48 pb-32 min-h-screen">
                <section className="w-full max-w-md">
                    <div className="auth-card bg-surface-container/60 p-8 md:p-12 shadow-2xl relative">
                        {/* Folio Rule */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container/20"></div>

                        <div className="mb-12 text-center">
                            <h1 className="font-headline-md text-3xl md:text-4xl text-secondary mb-2 font-semibold italic">Gia Nhập Viện Đào Tạo</h1>
                            <p className="font-body text-sm text-on-surface-variant uppercase tracking-widest font-semibold">Kiến tạo hành trình tri thức</p>
                        </div>

                        {/* REGISTER FORM */}
                        <RegisterForm
                            onSubmit={handleRegisterSubmit}
                            isLoading={loading}
                            globalError={globalError}
                            externalErrors={fieldErrors}
                        />

                        <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
                            <p className="font-body text-base text-on-surface-variant">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    className="text-secondary font-semibold underline underline-offset-8 hover:text-secondary-fixed-dim transition-colors"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>

                <div className="mt-24 mb-16 flex items-center justify-center gap-4 text-secondary/30">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent to-current"></span>
                    <Circle className="w-3 h-3" fill="currentColor" strokeWidth={0} />
                    <span className="h-px w-16 bg-gradient-to-l from-transparent to-current"></span>
                </div>

                {/* Philosopher Quote */}
                <div className="max-w-2xl text-center px-6 md:px-8">
                    <p className="font-headline text-2xl text-tertiary italic mb-4 font-medium">
                        "Một cuộc đời không được xem xét thì không đáng sống."
                    </p>
                    <p className="font-body text-sm font-semibold text-secondary-fixed-dim tracking-[0.3em] uppercase">
                        — SOCRATES
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}