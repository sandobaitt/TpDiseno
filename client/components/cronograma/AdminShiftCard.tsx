import * as React from "react";
import type { TimeBlock } from "@/data/adminAttendance";

interface AdminShiftCardProps {
  shift: TimeBlock;
  onSelect: (shift: TimeBlock) => void;
}

export function AdminShiftCard({ shift, onSelect }: AdminShiftCardProps) {
  if (shift.isFree) {
    return (
      <div className="min-h-[60px] rounded-xl border border-dashed border-zinc-800 flex items-center justify-center p-3">
        <span className="text-gray-700 text-[10px] font-medium tracking-wider">
          LIBRE
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(shift)}
      className={`w-full text-left rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-card ${
        shift.isConflict
          ? "bg-amber-950/40 border border-amber-500/25 hover:border-amber-500/40"
          : "bg-[#1a1a1a] glass-border hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[9px] font-bold tracking-wider ${
            shift.isConflict ? "text-amber-400" : "text-lime-400"
          }`}
        >
          {shift.start} – {shift.end}
        </span>
        {shift.isPro && (
          <span className="px-1.5 py-0.5 rounded bg-lime-400/15 text-lime-400 text-[8px] font-bold tracking-wider">
            PRO
          </span>
        )}
        {shift.isConflict && (
          <i className="ti ti-alert-triangle text-amber-400 text-[10px]" />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-white text-xs font-bold leading-tight">
          {shift.trainer}
        </span>
        <span className="text-gray-500 text-[10px]">{shift.type}</span>
      </div>
    </button>
  );
}
