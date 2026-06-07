import { Menu } from 'lucide-react';
import { Background } from '../../components/Background.jsx';
import { SignatureInput } from '../../components/SignatureInput.jsx';
import { AestheticDivider } from '../../components/AestheticDivider.jsx';
import {useContext, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AuthContext} from "@/contexts/AuthContext.jsx";
import Footer from "@/components/Footer.jsx";
import {getSlogan} from "@/services/SloganService.js";
// import '../assets/styles/philoverse.css';

export default function Register() {

    const { register } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentSloganContent, setCurrentSloganContent] = useState("Một cuộc đời không được xem xét thì không đáng sống.");
    const [currentSloganAuthor, setCurrentSloganAuthor] = useState("SOCRATES");

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [validationErrors, setValidationErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const [focusedField, setFocusedField] = useState(null);

    const fetchSlogan = async () => {
        try {
            const slogan = await getSlogan() ;
            setCurrentSloganContent(slogan.result.content);
            setCurrentSloganAuthor(slogan.result.author);
        } catch (error) {
            console.error("Lỗi khi tải slogan:", error);
        }
    }

    fetchSlogan();


    const validateField = (name, value, passwordVal = formData.password) => {
        switch (name) {
            case 'username':
                if (!value.trim()) {
                    return 'Tên đăng nhập không được để trống';
                }
                if (value.length < 3 || value.length > 100) {
                    return 'Tên đăng nhập phải từ 3 đến 100 ký tự';
                }
                return '';
            case 'email':
                if (!value.trim()) {
                    return 'Địa chỉ email không được để trống';
                }
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                if (!emailRegex.test(value)) {
                    return 'Định dạng email không hợp lệ (ví dụ: scholar@lyceum.edu)';
                }
                return '';
            case 'password':
                if (!value) {
                    return 'Mật mã không được để trống';
                }
                if (value.length < 6 || value.length > 100) {
                    return 'Mật khẩu phải từ 6 đến 100 ký tự';
                }
                const hasLowercase = /[a-z]/.test(value);
                const hasUppercase = /[A-Z]/.test(value);
                const hasNumber = /\d/.test(value);
                if (!hasLowercase || !hasUppercase || !hasNumber) {
                    return 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 chữ số';
                }
                return '';
            case 'confirmPassword':
                if (!value) {
                    return 'Vui lòng xác nhận mật mã';
                }
                if (value !== passwordVal) {
                    return 'Mật khẩu xác nhận không trùng khớp';
                }
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (name, value) => {
        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);
        setError(null);

        // Run validation in real-time if field was already touched
        if (touched[name]) {
            const fieldError = validateField(name, value, name === 'password' ? value : formData.password);
            setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
        }

        // Revalidate confirm password if it has been touched when password changes
        if (name === 'password' && touched.confirmPassword) {
            const confirmErrorMsg = validateField('confirmPassword', formData.confirmPassword, value);
            setValidationErrors(prev => ({ ...prev, confirmPassword: confirmErrorMsg }));
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        setFocusedField(null);
        const fieldError = validateField(name, formData[name]);
        setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleFocus = (name) => {
        setFocusedField(name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Mark all fields as touched
        const allTouched = {
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        };
        setTouched(allTouched);

        // Run full validation check
        const usernameError = validateField('username', formData.username);
        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);
        const confirmError = validateField('confirmPassword', formData.confirmPassword);

        const currentErrors = {
            username: usernameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmError
        };

        setValidationErrors(currentErrors);

        if (usernameError || emailError || passwordError || confirmError) {
            return;
        }

        setLoading(true);

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
            const apiResponse = err.response?.data;
            if (apiResponse) {
                // Handle Field Validation Errors from Backend (code 4000)
                if (apiResponse.errors) {
                    setValidationErrors(prev => ({
                        ...prev,
                        ...apiResponse.errors
                    }));
                } 
                // Handle Specific Logic Errors like Username / Email duplication
                else if (apiResponse.message) {
                    const msg = apiResponse.message;
                    if (msg.includes("Username already exists")) {
                        setValidationErrors(prev => ({
                            ...prev,
                            username: "Tên đăng nhập đã tồn tại trong hệ thống"
                        }));
                    } else if (msg.includes("Email already exists")) {
                        setValidationErrors(prev => ({
                            ...prev,
                            email: "Địa chỉ email đã được đăng ký"
                        }));
                    } else {
                        setError(msg);
                    }
                } else {
                    setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
                }
            } else {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate password requirements checklist status
    const passwordChecks = {
        length: formData.password.length >= 6,
        lowercase: /[a-z]/.test(formData.password),
        uppercase: /[A-Z]/.test(formData.password),
        number: /\d/.test(formData.password),
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

                        <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                            {error && (
                                <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <SignatureInput
                                label="Tên đăng nhập"
                                name="username"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                onBlur={() => handleBlur('username')}
                                onFocus={() => handleFocus('username')}
                                error={touched.username ? validationErrors.username : ''}
                                placeholder="Username"
                            />

                            <SignatureInput
                                label="Địa chỉ Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                onFocus={() => handleFocus('email')}
                                error={touched.email ? validationErrors.email : ''}
                                placeholder="scholar@lyceum.edu"
                            />

                            <div className="flex flex-col">
                                <SignatureInput
                                    label="Mật mã"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    onFocus={() => handleFocus('password')}
                                    error={touched.password ? validationErrors.password : ''}
                                    placeholder="••••••••"
                                />

                                {/* Password requirements checklist helper */}
                                {(focusedField === 'password' || formData.password.length > 0) && (
                                    <div className="mt-3 p-4 bg-surface-container-lowest/70 border border-outline-variant/30 rounded shadow-inner space-y-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="font-caption text-[11px] uppercase tracking-wider text-on-surface-variant/80 font-bold mb-1.5 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
                                            Điều kiện bảo mật mật mã:
                                        </p>
                                        <ul className="text-xs space-y-1.5 font-body">
                                            <li className={`flex items-center gap-2 transition-colors duration-200 ${passwordChecks.length ? 'text-emerald-400 font-medium' : 'text-on-surface-variant/50'}`}>
                                                <span className="text-[14px] flex items-center justify-center w-4 h-4 border border-current rounded-full text-center text-[10px]">
                                                    {passwordChecks.length ? '✓' : '1'}
                                                </span>
                                                <span>Dài từ 6 đến 100 ký tự</span>
                                            </li>
                                            <li className={`flex items-center gap-2 transition-colors duration-200 ${passwordChecks.lowercase ? 'text-emerald-400 font-medium' : 'text-on-surface-variant/50'}`}>
                                                <span className="text-[14px] flex items-center justify-center w-4 h-4 border border-current rounded-full text-center text-[10px]">
                                                    {passwordChecks.lowercase ? '✓' : '2'}
                                                </span>
                                                <span>Chứa ít nhất 1 chữ cái thường (a-z)</span>
                                            </li>
                                            <li className={`flex items-center gap-2 transition-colors duration-200 ${passwordChecks.uppercase ? 'text-emerald-400 font-medium' : 'text-on-surface-variant/50'}`}>
                                                <span className="text-[14px] flex items-center justify-center w-4 h-4 border border-current rounded-full text-center text-[10px]">
                                                    {passwordChecks.uppercase ? '✓' : '3'}
                                                </span>
                                                <span>Chứa ít nhất 1 chữ cái hoa (A-Z)</span>
                                            </li>
                                            <li className={`flex items-center gap-2 transition-colors duration-200 ${passwordChecks.number ? 'text-emerald-400 font-medium' : 'text-on-surface-variant/50'}`}>
                                                <span className="text-[14px] flex items-center justify-center w-4 h-4 border border-current rounded-full text-center text-[10px]">
                                                    {passwordChecks.number ? '✓' : '4'}
                                                </span>
                                                <span>Chứa ít nhất 1 chữ số (0-9)</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <SignatureInput
                                label="Xác nhận mật mã"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                onBlur={() => handleBlur('confirmPassword')}
                                onFocus={() => handleFocus('confirmPassword')}
                                error={touched.confirmPassword ? validationErrors.confirmPassword : ''}
                                placeholder="••••••••"
                            />

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-secondary-container border border-secondary text-secondary-fixed py-4 font-body text-sm font-semibold uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all duration-500 active:scale-95 shadow-lg shadow-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                        {currentSloganContent}
                    </p>
                    <p className="font-body text-sm font-semibold text-secondary-fixed-dim tracking-[0.3em] uppercase">
                        — {currentSloganAuthor}
                    </p>
                </div>
            </main>

            <Footer />

        </div>
    );
}
