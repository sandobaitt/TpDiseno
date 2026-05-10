"use client";
import * as React from "react";

interface AccessControlCardProps {
  isBlocked?: boolean;
  blockReason?: string;
  onToggleAccess?: (blocked: boolean) => void;
}

export function AccessControlCard({
  isBlocked = false,
  blockReason = "Acceso Restringido (Deuda)",
  onToggleAccess,
}: AccessControlCardProps) {
  const [blocked, setBlocked] = React.useState(isBlocked);

  const handleToggle = () => {
    const next = !blocked;
    setBlocked(next);
    onToggleAccess?.(next);
  };

  return (
    <article className="flex flex-col gap-3 p-6 rounded-2xl bg-stone-900">
      <header className="flex justify-between items-center">
        <h3 className="text-base font-bold text-white">Control de Acceso</h3>
        <button
          className={`flex justify-end items-center pr-1 w-11 h-6 rounded-xl cursor-pointer transition-colors ${
            blocked ? "bg-red-500" : "bg-lime-400"
          }`}
          onClick={handleToggle}
        >
          <div
            className={`bg-white rounded-full h-[18px] w-[18px] transition-transform ${
              blocked ? "translate-x-0" : "translate-x-4"
            }`}
          />
        </button>
      </header>

      <p className="text-xs leading-normal text-zinc-500">
        {blocked
          ? "Acceso bloqueado para este usuario."
          : "Permitir acceso para este usuario."}
      </p>

      {blocked && (
        <div className="flex gap-1.5 items-center mt-1">
          <i className="ti ti-lock text-sm text-red-400" />
          <p className="text-xs font-semibold tracking-wide text-red-400 uppercase">
            {blockReason}
          </p>
        </div>
      )}
    </article>
  );
}
