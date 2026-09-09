import * as React from "react";
import type { GymClass } from "@/data/schedule";
import { toast } from "sonner";

interface ClassCardProps {
  classItem: GymClass;
}

export function ClassCard({ classItem }: ClassCardProps) {
  const c = classItem;
  const [booked, setBooked] = React.useState(false);

  const handleBook = () => {
    if (booked) {
      setBooked(false);
      toast.success("Reserva cancelada");
    } else {
      setBooked(true);
      toast.success("Clase reservada con éxito");
    }
  };

  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-2 shadow-card glass-border hover:border-white/[0.10] transition-all duration-150 ${booked ? 'bg-lime-400/5 border-lime-400/20' : 'bg-neutral-900'}`}>
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-bold">{c.time}</span>
        <span className="text-lime-400 text-[10px] font-bold tracking-wider">
          {c.durationMin} MIN
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          {c.isPro && (
            <span className="text-[10px] font-bold tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-md w-fit mb-1">
              PRO
            </span>
          )}
          <h4 className="text-white text-base font-extrabold leading-tight">
            {c.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
        <i className="ti ti-user-circle text-sm" />
        {c.coach}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-auto">
        {c.isFull && !booked ? (
          <span className="text-red-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
            <i className="ti ti-alert-circle text-xs" />
            Lleno
          </span>
        ) : (
          <span className="text-gray-500 text-[10px] font-medium">
            {booked ? c.booked + 1 : c.booked}/{c.capacity} Lugares
          </span>
        )}

        <button
          onClick={handleBook}
          disabled={c.isFull && !booked}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            booked
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : c.isFull
                ? "bg-zinc-800 text-gray-600 cursor-not-allowed"
                : "bg-lime-400 text-black hover:brightness-110 shadow-btn-lime"
          }`}
        >
          {booked ? "CANCELAR" : c.isFull ? "COMPLETA" : "RESERVAR"}
        </button>
      </div>
    </div>
  );
}
