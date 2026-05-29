import React from "react";

export function DialogueItem({
  icon,
  title,
  description,
  time,
  statusLabel,
  isActive,
  colorClass,
}) {
  return (
    <div className="p-6 hover:bg-surface-container transition-colors flex items-center gap-6 cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-outline-variant/10">
        <div className={colorClass}>{icon}</div>
      </div>
      <div className="flex-1">
        <h4 className="font-headline-md text-lg text-on-surface mb-1">
          {title}
        </h4>
        <p className="text-on-surface-variant text-sm line-clamp-1 opacity-70">
          {description}
        </p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
          {time}
        </p>
        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            isActive
              ? "bg-secondary/10 text-secondary"
              : "bg-outline-variant/10 text-on-surface-variant"
          }`}
        >
          {statusLabel}
        </div>
      </div>
    </div>
  );
}
