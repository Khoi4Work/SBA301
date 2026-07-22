import React from "react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in">
            <section className="w-full max-w-md bg-surface-container-lowest border border-secondary/20 shadow-2xl animate-zoom-in">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-on-surface mb-3">
                        {title}
                    </h3>

                    <p className="text-on-surface-variant mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 border border-secondary/20 text-on-surface-variant hover:bg-secondary/5 transition-all text-xs uppercase tracking-widest font-semibold rounded-sm"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 bg-error text-white hover:bg-error/60 transition-all text-xs uppercase tracking-widest font-semibold rounded-sm shadow-lg shadow-error/20"
                        >
                            Xác nhận xóa
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
