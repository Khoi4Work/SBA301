import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginForm({ onSubmit, isLoading, error }) {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Gọi hàm do LoginPage truyền xuống, gom dữ liệu đẩy lên
        onSubmit({ usernameOrEmail, password });
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded">
                    {error}
                </div>
            )}

            {/* Email Field */}
            <div className="relative group">
                <label
                    className="block font-label-md text-label-md text-tertiary mb-1 opacity-70 group-focus-within:opacity-100 transition-opacity"
                    htmlFor="usernameOrEmail"
                >
                    Tên đăng nhập hoặc Email
                </label>
                <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-3 text-on-surface block outline-none placeholder:text-on-surface-variant/30 focus-ring transition-all font-body-md"
                    id="usernameOrEmail"
                    placeholder="Tên học giả..."
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                <div className="absolute right-0 bottom-3 text-on-surface-variant/30 group-focus-within:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">history_edu</span>
                </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
                <label
                    className="block font-label-md text-label-md text-tertiary mb-1 opacity-70 group-focus-within:opacity-100 transition-opacity"
                    htmlFor="password"
                >
                    Mật khẩu
                </label>
                <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-3 text-on-surface block outline-none"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="absolute right-0 bottom-3 text-on-surface-variant/30 hover:text-secondary transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>

            <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                        className="w-4 h-4 bg-transparent border-outline-variant rounded-none checked:bg-secondary checked:border-secondary focus:ring-0 focus:ring-offset-0 transition-all accent-secondary"
                        type="checkbox"
                    />
                    <span className="font-caption text-caption text-on-surface-variant group-hover:text-on-surface transition-colors">
                        Ghi nhớ tôi
                    </span>
                </label>
                <Link
                    to="/forgot-password"
                    className="font-caption text-caption text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-all"
                >
                    Quên mật khẩu?
                </Link>
            </div>

            {/* Login Button */}
            <button
                disabled={isLoading}
                className={`w-full bg-surface-container-highest border border-secondary text-secondary py-4 font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-secondary hover:text-on-secondary transition-all duration-300 active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="submit"
            >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
        </form>
    );
}