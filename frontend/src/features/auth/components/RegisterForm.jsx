import { useState, useEffect } from "react";
import { SignatureInput } from '@/features/auth/components/SignatureInput.jsx';

export default function RegisterForm({ onSubmit, isLoading, globalError, externalErrors }) {
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

    // Lắng nghe lỗi từ Backend (Page) truyền xuống
    useEffect(() => {
        if (externalErrors) {
            setValidationErrors(prev => ({ ...prev, ...externalErrors }));
        }
    }, [externalErrors]);

    const validateField = (name, value, passwordVal = formData.password) => {
        switch (name) {
            case 'username':
                if (!value.trim()) return 'Tên đăng nhập không được để trống';
                if (value.length < 3 || value.length > 100) return 'Tên đăng nhập phải từ 3 đến 100 ký tự';
                return '';
            case 'email':
                if (!value.trim()) return 'Địa chỉ email không được để trống';
                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                if (!emailRegex.test(value)) return 'Định dạng email không hợp lệ (ví dụ: scholar@lyceum.edu)';
                return '';
            case 'password':
                if (!value) return 'Mật mã không được để trống';
                if (value.length < 6 || value.length > 100) return 'Mật khẩu phải từ 6 đến 100 ký tự';
                const hasLowercase = /[a-z]/.test(value);
                const hasUppercase = /[A-Z]/.test(value);
                const hasNumber = /\d/.test(value);
                if (!hasLowercase || !hasUppercase || !hasNumber) return 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 chữ số';
                return '';
            case 'confirmPassword':
                if (!value) return 'Vui lòng xác nhận mật mã';
                if (value !== passwordVal) return 'Mật khẩu xác nhận không trùng khớp';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (name, value) => {
        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);

        if (touched[name]) {
            const fieldError = validateField(name, value, name === 'password' ? value : formData.password);
            setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
        }

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

    const handleSubmit = (e) => {
        e.preventDefault();

        const allTouched = { username: true, email: true, password: true, confirmPassword: true };
        setTouched(allTouched);

        const usernameError = validateField('username', formData.username);
        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);
        const confirmError = validateField('confirmPassword', formData.confirmPassword);

        setValidationErrors({
            username: usernameError,
            email: emailError,
            password: passwordError,
            confirmPassword: confirmError
        });

        // Nếu tất cả input đều hợp lệ (không có lỗi), gọi hàm do Page truyền xuống
        if (!usernameError && !emailError && !passwordError && !confirmError) {
            onSubmit({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
        }
    };

    const passwordChecks = {
        length: formData.password.length >= 6,
        lowercase: /[a-z]/.test(formData.password),
        uppercase: /[A-Z]/.test(formData.password),
        number: /\d/.test(formData.password),
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            {globalError && (
                <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    {globalError}
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
                    disabled={isLoading}
                    className="w-full bg-secondary-container border border-secondary text-secondary-fixed py-4 font-body text-sm font-semibold uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all duration-500 active:scale-95 shadow-lg shadow-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isLoading ? "Đang tạo..." : "Tạo Tài Khoản"}
                </button>
            </div>
        </form>
    );
}