import * as React from "react";

interface ActionButtonProps {
  variant?: "primary" | "secondary";
  icon?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function ActionButton({
  variant = "primary",
  icon,
  children,
  onClick,
}: ActionButtonProps) {
  const baseClasses =
    "flex gap-2 justify-center items-center px-7 py-3.5 text-sm font-bold tracking-wide uppercase cursor-pointer transition-all duration-150 active:scale-[0.98] max-sm:justify-center max-sm:w-full";

  const variantClasses =
    variant === "primary"
      ? "bg-lime-400 rounded-xl text-stone-950 shadow-btn-lime hover:brightness-105"
      : "text-lime-400 rounded-xl border border-lime-400/30 hover:border-lime-400/60 hover:bg-lime-400/5";

  return (
    <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
      {icon && <i className={`ti ${icon} text-lg`} />}
      {children}
    </button>
  );
}
