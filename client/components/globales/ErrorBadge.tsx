import * as React from "react";

interface ErrorBadgeProps {
  children: React.ReactNode;
}

export function ErrorBadge({ children }: ErrorBadgeProps) {
  return (
    <div className="px-4 py-1.5 text-xs font-semibold tracking-wide text-lime-500 uppercase rounded-full border border-lime-900 border-solid bg-lime-950">
      {children}
    </div>
  );
}
