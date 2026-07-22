import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, visible }) {
    if (!visible) return null;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === "success" ? "bg-emerald-500/10" : "bg-error/10";
    const textColor = type === "success" ? "text-emerald-400" : "text-error";
    const borderColor = type === "success" ? "border-emerald-500/20" : "border-error/20";
    const icon = type === "success" ? "check_circle" : "error";

    return (
        <div className="fixed bottom-6 right-6 z-[10000] animate-slide-in-up flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md shadow-xl transition-all duration-300">
            <div className={`${bgColor} ${borderColor} ${textColor} border p-1 rounded-full`}>
                <span className="material-symbols-outlined text-[20px]">
                    {icon}
                </span>
            </div>
            <p className={`text-sm font-medium ${textColor}`}>
                {message}
            </p>
            <button
                onClick={onClose}
                className="p-1 hover:opacity-70 transition-opacity"
            >
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    close
                </span>
            </button>
        </div>
    );
}
