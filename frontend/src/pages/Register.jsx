import { Menu } from 'lucide-react';
import { Background } from '../components/Background';
import { SignatureInput } from '../components/SignatureInput';
import { AestheticDivider } from '../components/AestheticDivider';
import {useContext, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AuthContext} from "@/contexts/AuthContext.jsx";

export default function Register() {

    const { register } = useContext(AuthContext);
    const[error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            navigate('/login', {
                state: {
                    success: 'Đăng ký thành công, hãy đăng nhập'
                }
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Đăng ký thất bại'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-surface font-body selection:bg-secondary/30 selection:text-secondary-fixed min-h-screen relative">
            <Background />

            {/* Header / Brand Anchor */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 py-8 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md">
                <div className="font-headline text-2xl text-secondary uppercase tracking-widest font-medium">
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
                            <h1 className="font-headline text-3xl md:text-4xl text-secondary mb-2 font-semibold">Gia Nhập Viện Đào Tạo</h1>
                            <p className="font-body text-sm text-on-surface-variant uppercase tracking-widest font-semibold">Kiến tạo hành trình tri thức</p>
                        </div>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <SignatureInput
                                label="Tên đăng nhập"
                                name="username"
                                value={formData.username}
                                onChange={(e) => {
                                    setError(null);

                                    setFormData({
                                        ...formData,
                                        username: e.target.value
                                    });
                                }}
                                minLength={3}
                                maxLength={100}
                                placeholder="Username"
                            />
                            <SignatureInput
                                label="Địa chỉ Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setError(null);

                                    setFormData({
                                        ...formData,
                                        email: e.target.value
                                    });
                                }}
                                minLength={5}
                                maxLength={100}
                                pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                                placeholder="scholar@lyceum.edu"
                            />

                            <SignatureInput
                                label="Mật mã"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => {
                                    setError(null);
                                    setFormData({
                                        ...formData,
                                        password: e.target.value
                                    });
                                }}
                                minLength={6}
                                maxLength={100}
                                pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                                placeholder="••••••••"
                            />

                            <SignatureInput
                                label="Xác nhận mật mã"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setError(null);
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value
                                    });
                                }}
                                minLength={6}
                                maxLength={100}
                                pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                                placeholder="••••••••"
                            />

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-secondary-container border border-secondary text-secondary-fixed py-4 font-body text-sm font-semibold uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all duration-500 active:scale-95 shadow-lg shadow-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
                                </button>
                            </div>
                        </form>

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

                <AestheticDivider />

                {/* Philosopher Quote */}
                <div className="max-w-2xl text-center px-6 md:px-8">
                    <p className="font-headline text-2xl text-tertiary italic mb-4 font-medium">
                        "Học vấn là một hạt giống của hạnh phúc."
                    </p>
                    <p className="font-body text-sm font-semibold text-secondary-fixed-dim tracking-[0.3em] uppercase">
                        — Aristotle
                    </p>
                </div>
            </main>

            {/* Visual Artifacts */}
            <div className="fixed bottom-12 left-12 hidden lg:block opacity-40 z-10 pointer-events-none">
                <div className="w-24 h-[1px] bg-secondary-fixed-dim mb-4"></div>
                <p className="font-body text-xs text-secondary uppercase tracking-[0.2em] transform -rotate-90 origin-left translate-y-24">
                    ANNO MMXXIV
                </p>
            </div>

            {/* Global Footer */}
            <footer className="relative z-20 w-full py-12 px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-outline-variant/20 bg-surface">
                <div className="font-headline text-2xl font-medium text-secondary">The Lyceum</div>
                <div className="flex flex-wrap justify-center gap-6">
                    <a href="#" className="font-body text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors duration-300">Curriculum</a>
                    <a href="#" className="font-body text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors duration-300">Library</a>
                    <a href="#" className="font-body text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors duration-300">Socratic Method</a>
                    <a href="#" className="font-body text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors duration-300">Privacy</a>
                </div>
                <div className="font-body text-sm font-semibold text-on-surface-variant uppercase tracking-tighter">
                    © MMXXIV THE LYCEUM ARCHIVE
                </div>
            </footer>
        </div>
    );
}
