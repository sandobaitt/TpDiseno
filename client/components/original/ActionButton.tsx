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
    onClick
}: ActionButtonProps) {
    const baseClasses = "flex gap-2 justify-center items-center px-7 py-4 text-sm font-bold tracking-wide uppercase cursor-pointer max-sm:justify-center max-sm:w-full";

    const variantClasses = variant === "primary"
        ? "bg-lime-400 rounded-md text-stone-950"
        : "text-lime-400";

    return (
        <button
            className={`${baseClasses} ${variantClasses}`}
            onClick={onClick}
        >
            {icon && <i className={`ti ${icon} text-lg`} />}
            {children}
        </button>
    );
}
