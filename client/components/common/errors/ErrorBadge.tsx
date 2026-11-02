import * as React from "react";

interface ErrorBadgeProps {
  children: React.ReactNode;
}

export function ErrorBadge({ children }: ErrorBadgeProps) {
  return (
    <div className="px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase rounded-full border border-primary/30 border-solid bg-primary/15">
      {children}
    </div>
  );
}
