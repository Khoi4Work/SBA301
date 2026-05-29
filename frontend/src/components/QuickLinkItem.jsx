import { ChevronRight } from "lucide-react";
import React from "react";

export function QuickLinkItem({ icon, title, description }) {
  return (
    <a
      className="p-5 bg-surface-container-low rounded-xl border border-outline-variant/10 hover:bg-surface-container-high hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group"
      href="#"
    >
      <div className="flex items-center gap-4">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="font-label-md text-sm text-on-surface uppercase tracking-wider">
            {title}
          </p>
          <p className="text-[11px] text-on-surface-variant opacity-60">
            {description}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
    </a>
  );
}
