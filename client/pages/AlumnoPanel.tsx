import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { attendanceMock, type AttendanceRecord } from "@/data/attendance";

function formatDate(iso: string) {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr}, ${timeStr}`;
}

const ITEMS_PER_PAGE = 4;

export default function AlumnoPanel() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(attendanceMock.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = attendanceMock.slice(start, start + ITEMS_PER_PAGE);

  const columns = [
    {
      key: "date",
      header: "FECHA",
      render: (row: AttendanceRecord) => (
        <span className="text-gray-400 text-sm">{formatDate(row.date)}</span>
      ),
    },
    {
      key: "className",
      header: "CLASE",
      render: (row: AttendanceRecord) => (
        <span className="text-white text-sm font-semibold">
          {row.className}
        </span>
      ),
    },
    {
      key: "trainer",
      header: "ENTRENADOR",
      render: (row: AttendanceRecord) => (
        <span className="text-gray-400 text-sm">{row.trainer}</span>
      ),
    },
    {
      key: "status",
      header: "ESTADO",
      render: (row: AttendanceRecord) =>
        row.status === "present" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/40 text-lime-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            Asistió
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/40 text-red-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Ausente
          </span>
        ),
    },
  ];

  return (
    <DashboardLayout headerNav="Mi Perfil y Asistencia">
      <div className="px-7 pb-7 max-sm:px-4">
        <div className="flex items-center gap-2 mb-6">
          <i className="ti ti-arrow-left text-gray-500 text-lg" />
          <span className="text-lime-400 text-xs font-bold tracking-widest">
            MI PERFIL Y ASISTENCIA
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          {/* ── LEFT: Attendance Table ── */}
          <div className="bg-black/60 rounded-2xl p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-extrabold">
                Historial de Asistencias
              </h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-lime-400 text-xs font-bold hover:brightness-110 transition-all cursor-pointer">
                  <i className="ti ti-file-text text-sm" />
                  PDF
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-lime-400 text-xs font-bold hover:brightness-110 transition-all cursor-pointer">
                  <i className="ti ti-table text-sm" />
                  CSV
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={paginatedData}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[600px]"
              gridTemplateClass="grid-cols-[1fr_1fr_1fr_1fr]"
              rowClassName="hover:bg-neutral-800/30 transition-colors"
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* ── RIGHT: Cards ── */}
          <div className="flex flex-col gap-5">
            {/* Card 1: Certificado Médico */}
            <div className="bg-black/60 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
                  <i className="ti ti-certificate text-lg text-lime-400" />
                </div>
                <h3 className="text-white text-sm font-extrabold">
                  Certificado Médico
                </h3>
              </div>

              <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-zinc-700 transition-colors cursor-pointer">
                <i className="ti ti-file-upload text-2xl text-gray-600" />
                <div>
                  <p className="text-white text-xs font-semibold">
                    Subir PDF o JPG
                  </p>
                  <p className="text-gray-600 text-[10px] mt-0.5">
                    Máx 5MB. Apto físico obligatorio.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: DDJJ de Salud */}
            <div className="bg-black/60 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
              <div
                className="pointer-events-none absolute -right-12 -bottom-12 w-40 h-40 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)",
                }}
              />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
                  <i className="ti ti-clipboard-text text-lg text-lime-400" />
                </div>
                <h3 className="text-white text-sm font-extrabold">
                  DDJJ de Salud
                </h3>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Declaración Jurada actualizada de estado físico y lesiones
                previas.
              </p>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 hover:shadow-[0_0_16px_rgba(163,230,53,0.1)] transition-all cursor-pointer group">
                COMPLETAR FORMULARIO
                <i className="ti ti-arrow-right text-sm text-lime-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.5)]" />
                <span className="text-gray-600 text-[10px]">
                  Válido hasta 24/09/2027
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
