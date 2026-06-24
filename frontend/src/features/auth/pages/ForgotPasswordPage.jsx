import "@/assets/styles/philoverse.css";
import { Link } from "react-router-dom";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm.jsx";


export default function ForgotPasswordPage() {
    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 z-0 bg-background">
                <div className="absolute inset-0 paper-texture"></div>

                <img
                    className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale contrast-125"
                    alt="A grand, dimly lit ancient library at midnight"
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 blur-md pointer-events-none mix-blend-luminosity"
                />

                <div className="absolute inset-0 ink-fade"></div>
            </div>

            <main className="relative z-10 flex min-h-screen items-center justify-center px-margin-mobile">
                <div className="w-full max-w-[440px] flex flex-col items-center">
                    <Link to="/" className="mb-12 text-center group cursor-pointer inline-block">
                        <h1 className="font-headline-md text-headline-md text-secondary tracking-tight mb-2 group-hover:scale-105 transition-transform">
                            PhiloVerse
                        </h1>
                        <div className="greek-divider w-16 mx-auto opacity-40"></div>
                    </Link>

                    <ForgotPasswordForm />

                    <footer className="mt-12 text-center max-w-[300px]">
                        <p className="font-caption text-caption text-on-surface-variant/50 italic leading-relaxed">
                            "Cuộc đời không được kiểm chứng là một cuộc đời không đáng sống."
                        </p>
                        <p className="font-caption text-caption text-secondary/40 mt-1 uppercase tracking-widest">
                            — Socrates
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}