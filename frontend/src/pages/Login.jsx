import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/philoverse.css';

export default function Login() {
  const canvasRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let animationFrameId;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5,
          speedX: Math.random() * 0.2 - 0.1,
          speedY: Math.random() * 0.2 - 0.1,
          opacity: Math.random() * 0.5,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(233, 193, 118, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric Background Overlay */}
      <div className="fixed inset-0 z-0 bg-background">
        <div className="absolute inset-0 paper-texture"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale contrast-125"
          alt="A grand, dimly lit ancient library at midnight"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRj_MhC7-SR5tngD9HdjULjzL9QUNjGmK8bAWxqnpsibOxCeq3tM9ZGqCJexxu3liU3ZLnYiNJs5ZJi08tx-eOVrITcAnLICL1U37uVwUK1R-lD5XVctj2WaS5KY1y6Y_xbPBhfBWej5JQBLSd3Wozess_tRp4aIaVZ4XzuylgOS5p4rvQ3TxXh2EphnQ87csyzsVveP6kQ2y7m4FjdLg2Wssr5CvF8ibWNa-MRNugrR9vTrZES-oc5dtw2V4FySkwu-PL_IbKmVg"
        />
        <div className="absolute inset-0 ink-fade"></div>
      </div>

      {/* Visual Embellishment: Dust Motes / Particles */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-20"></canvas>

      {/* Main Content Wrapper */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-margin-mobile">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          {/* Brand Anchor */}
          <Link to="/" className="mb-12 text-center group cursor-pointer inline-block">
            <h1 className="font-headline-md text-headline-md text-secondary tracking-tight mb-2 group-hover:scale-105 transition-transform">
              PhiloVerse
            </h1>
            <div className="greek-divider w-16 mx-auto opacity-40"></div>
          </Link>

          {/* Login Folio Card */}
          <div className="w-full bg-surface-container-lowest/40 backdrop-blur-xl border border-outline-variant/30 px-8 py-10 shadow-2xl relative">
            {/* Subtle corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-secondary/40"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-secondary/40"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-secondary/40"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-secondary/40"></div>

            <div className="text-center mb-10">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2 italic">
                Chào mừng trở lại, Nhà hiền triết
              </h2>
              <p className="font-caption text-caption text-on-surface-variant tracking-widest uppercase">
                Hãy thắp sáng ngọn đuốc tri thức
              </p>
            </div>

            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
            >
              {/* Email Field */}
              <div className="relative group">
                <label
                  className="block font-label-md text-label-md text-tertiary mb-1 opacity-70 group-focus-within:opacity-100 transition-opacity"
                  htmlFor="email"
                >
                  Tên đăng nhập
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-3 text-on-surface block outline-none placeholder:text-on-surface-variant/30 focus-ring transition-all font-body-md"
                  id="email"
                  placeholder="scholar@lyceum.edu"
                  type="email"
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
                  className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-3 text-on-surface block outline-none placeholder:text-on-surface-variant/30 focus-ring transition-all font-body-md"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
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
                <a
                  className="font-caption text-caption text-on-surface-variant hover:text-secondary underline decoration-secondary/30 transition-all"
                  href="#"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <button
                className="w-full bg-surface-container-highest border border-secondary text-secondary py-4 font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-secondary hover:text-on-secondary transition-all duration-300 active:scale-[0.98]"
                type="submit"
              >
                Đăng nhập
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex items-center w-full gap-4">
                <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
                <span className="font-caption text-caption text-on-surface-variant italic">Hoặc tham gia học viện</span>
                <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
              </div>
              <a
                className="font-label-md text-label-md text-tertiary hover:text-secondary transition-colors group flex items-center gap-2"
                href="#"
              >
                Tạo tài khoản mới
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_right_alt
                </span>
              </a>
            </div>
          </div>

          {/* Footer Quote */}
          <footer className="mt-12 text-center max-w-[300px]">
            <p className="font-caption text-caption text-on-surface-variant/50 italic leading-relaxed">
              "Cuộc đời không được kiểm chứng là một cuộc đời không đáng sống."
            </p>
            <p className="font-caption text-caption text-secondary/40 mt-1 uppercase tracking-widest">— Socrates</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
