import React from "react";

export function StatCard({
  icon,
  title,
  subtitle,
  postfix,
  progress,
  colorClass,
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 hover:-translate-y-0.5 transition-all duration-300 group">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-6 bg-opacity-10 dark:bg-opacity-10 bg-current text-current`}
        style={{ color: "inherit" }}
      >
        <div className={colorClass}>{icon}</div>
      </div>
      <h3 className="text-3xl font-display-lg text-on-surface mb-1">
        {title}
        {postfix && <span className="text-lg opacity-40 ml-1">{postfix}</span>}
      </h3>
      <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label-md">
        {subtitle}
      </p>
      {progress !== undefined && (
        <div className="mt-4 w-full h-1 bg-outline-variant/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass.replace(
              "text-",
              "bg-",
            )}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
