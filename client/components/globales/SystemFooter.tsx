import * as React from "react";

export function SystemFooter() {
  return (
    <footer className="flex relative z-10 flex-row justify-between items-end px-10 pb-8 max-sm:flex-col max-sm:gap-4 max-sm:items-start max-sm:px-6">
      <div className="flex gap-3 items-center">
        <div className="w-8 h-0.5 bg-lime-400" />
        <div className="text-xs font-semibold tracking-wide uppercase text-zinc-500">
          LABORATORIO CINÉTICO
        </div>
      </div>
      <div className="text-right max-sm:text-left">
        <div className="text-xs tracking-wider leading-relaxed text-neutral-600">
          LAT: 40.7128° N | LONG: 74.0060° W
        </div>
        <div className="text-xs tracking-wider leading-relaxed text-neutral-600">
          SQUATGYM_CORE_OS // V.4.0.4_KINETIC
        </div>
        <div className="text-xs tracking-wider leading-relaxed text-lime-400">
          STATUS: CONNECTION_LOST_RECLAIMING_POWER
        </div>
      </div>
    </footer>
  );
}
