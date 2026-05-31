import { Award } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="max-w-md w-full mx-4 bg-surface-container border border-secondary/30 p-12 text-center relative rounded-md shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="absolute inset-0 paper-texture pointer-events-none"></div>

                <Award className="w-16 h-16 text-secondary mx-auto mb-6" strokeWidth={1.5} />

                <h4 className="font-display text-4xl text-on-background mb-4 tracking-tight font-bold">
                    Đạt được đức hạnh
                </h4>
                <p className="text-lg text-on-surface-variant mb-8">
                    Sự thấu hiểu của bạn về các cuộc đối thoại của Plato đã được xác nhận.
                </p>

                <div className="bg-secondary/10 border border-secondary/20 p-6 mb-8 rounded">
                    <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] block mb-2">
                        Phần thưởng
                    </span>
                    <span className="font-display text-2xl font-semibold text-secondary">
                        +500 Điểm kinh nghiệm
                    </span>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 border border-outline-variant text-on-surface text-sm font-bold uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all rounded"
                >
                    Quay lại Lyceum
                </button>
            </div>
        </div>
    );
}
