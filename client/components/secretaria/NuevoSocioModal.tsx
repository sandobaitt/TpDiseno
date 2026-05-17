"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { plansMock } from "@/data/plans";
import type { Client } from "@/data/clients";

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Contacto" },
  { id: 3, label: "Salud" },
  { id: 4, label: "Plan" },
];

interface FormData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  genero: string;
  email: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  enfermedadCardiaca: boolean;
  hipertension: boolean;
  diabetes: boolean;
  epilepsia: boolean;
  lesionFisica: boolean;
  tratamientoMedico: boolean;
  aceptaDeclaracion: boolean;
  planId: string;
  fechaInicio: string;
}

const TODAY = new Date().toISOString().split("T")[0];

const EMPTY_FORM: FormData = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  genero: "",
  email: "",
  telefono: "",
  ciudad: "",
  direccion: "",
  enfermedadCardiaca: false,
  hipertension: false,
  diabetes: false,
  epilepsia: false,
  lesionFisica: false,
  tratamientoMedico: false,
  aceptaDeclaracion: false,
  planId: "",
  fechaInicio: TODAY,
};

const HEALTH_CONDITIONS: { key: keyof Pick<FormData, "enfermedadCardiaca" | "hipertension" | "diabetes" | "epilepsia" | "lesionFisica" | "tratamientoMedico">; label: string }[] = [
  { key: "enfermedadCardiaca", label: "Enfermedades cardíacas" },
  { key: "hipertension",       label: "Hipertensión arterial" },
  { key: "diabetes",           label: "Diabetes" },
  { key: "epilepsia",          label: "Epilepsia u otras convulsiones" },
  { key: "lesionFisica",       label: "Lesión o limitación física" },
  { key: "tratamientoMedico",  label: "Tratamiento médico activo" },
];

const GENERO_OPTIONS = [
  { value: "masculino",      label: "Masculino" },
  { value: "femenino",       label: "Femenino" },
  { value: "no_especificar", label: "No especificar" },
];

function canProceed(step: number, form: FormData): boolean {
  switch (step) {
    case 1: return form.nombre.trim() !== "" && form.apellido.trim() !== "" && form.dni.trim() !== "";
    case 2: return form.email.trim() !== "";
    case 3: return form.aceptaDeclaracion;
    case 4: return form.planId !== "";
    default: return false;
  }
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-gray-600 outline-none focus:ring-1 focus:ring-lime-400/30 focus:border-lime-400/40 transition-all"
      />
    </div>
  );
}

function Checkbox({ checked, onChange, label, bold = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; bold?: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
        checked ? "bg-lime-400/20 border-lime-400/50" : "bg-zinc-900 border-zinc-600 group-hover:border-zinc-500"
      }`}>
        {checked && <i className="ti ti-check text-lime-400 text-[11px]" />}
      </div>
      <span className={`text-sm ${bold ? "text-white font-semibold" : "text-gray-300"}`}>{label}</span>
    </label>
  );
}

interface NuevoSocioModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (client: Client) => void;
}

export function NuevoSocioModal({ open, onClose, onAdd }: NuevoSocioModalProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = React.useState(false);

  function reset() {
    setStep(1);
    setForm({ ...EMPTY_FORM, fechaInicio: new Date().toISOString().split("T")[0] });
    setSubmitted(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    const endDate = new Date(form.fechaInicio);
    endDate.setMonth(endDate.getMonth() + 1);

    const newClient: Client = {
      id: `cl_new_${Date.now()}`,
      branchId: "br_001",
      fullName: `${form.nombre.trim()} ${form.apellido.trim()}`,
      email: form.email.trim(),
      dni: form.dni.trim(),
      phone: form.telefono.trim() || undefined,
      status: "enabled",
      membership: form.planId
        ? {
            planId: form.planId,
            startDate: form.fechaInicio,
            endDate: endDate.toISOString().split("T")[0],
            status: "active",
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    onAdd(newClient);
    setSubmitted(true);
  }

  const activePlans = plansMock.filter((p) => p.status === "active");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl bg-neutral-900 border border-white/[0.08] text-white max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-white text-xl font-extrabold tracking-wider">AGREGAR SOCIO NUEVO</DialogTitle>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-4">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                      s.id < step  ? "bg-lime-400 text-squat-ink" :
                      s.id === step ? "bg-lime-400/15 border border-lime-400 text-lime-400" :
                                      "bg-zinc-800 border border-zinc-700 text-gray-600"
                    }`}>
                      {s.id < step ? <i className="ti ti-check text-[11px]" /> : s.id}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                      s.id === step ? "text-lime-400" : s.id < step ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${s.id < step ? "bg-lime-400/40" : "bg-zinc-800"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step content */}
            <div className="flex flex-col gap-4 min-h-[260px]">

              {/* Step 1 — Datos personales */}
              {step === 1 && (
                <>
                  <p className="text-gray-500 text-sm">Datos personales del nuevo socio.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nombre *" value={form.nombre} onChange={(v) => setField("nombre", v)} placeholder="Martín" />
                    <Field label="Apellido *" value={form.apellido} onChange={(v) => setField("apellido", v)} placeholder="Rodríguez" />
                  </div>
                  <Field label="DNI *" value={form.dni} onChange={(v) => setField("dni", v)} placeholder="34.567.890" />
                  <Field label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={(v) => setField("fechaNacimiento", v)} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Género</label>
                    <div className="flex gap-2 flex-wrap">
                      {GENERO_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setField("genero", form.genero === opt.value ? "" : opt.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            form.genero === opt.value
                              ? "bg-lime-400/10 border-lime-400/40 text-lime-400"
                              : "bg-zinc-800 border-zinc-700 text-gray-500 hover:text-gray-300 hover:border-zinc-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 — Contacto */}
              {step === 2 && (
                <>
                  <p className="text-gray-500 text-sm">Información de contacto del socio.</p>
                  <Field label="Email *" type="email" value={form.email} onChange={(v) => setField("email", v)} placeholder="ejemplo@correo.com" />
                  <Field label="Teléfono" value={form.telefono} onChange={(v) => setField("telefono", v)} placeholder="+54 11 5555-0000" />
                  <Field label="Ciudad" value={form.ciudad} onChange={(v) => setField("ciudad", v)} placeholder="Buenos Aires" />
                  <Field label="Dirección" value={form.direccion} onChange={(v) => setField("direccion", v)} placeholder="Av. Corrientes 1234" />
                </>
              )}

              {/* Step 3 — Declaración de salud */}
              {step === 3 && (
                <>
                  <p className="text-gray-500 text-sm">El socio declara bajo juramento su estado de salud para la práctica de actividad física.</p>
                  <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">¿Presenta o presentó alguna de las siguientes condiciones?</p>
                    {HEALTH_CONDITIONS.map((c) => (
                      <Checkbox
                        key={c.key}
                        checked={form[c.key] as boolean}
                        onChange={(v) => setField(c.key, v)}
                        label={c.label}
                      />
                    ))}
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex gap-3">
                      <i className="ti ti-alert-triangle text-amber-400/70 text-base shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-400/80 leading-relaxed">
                        Al continuar, el socio declara que la información brindada es verídica y que se encuentra apto/a para realizar actividad física. SquatGym no se responsabiliza por lesiones derivadas de información incorrecta o incompleta.
                      </p>
                    </div>
                  </div>

                  <Checkbox
                    checked={form.aceptaDeclaracion}
                    onChange={(v) => setField("aceptaDeclaracion", v)}
                    label="El socio acepta la declaración jurada de salud. *"
                    bold
                  />
                </>
              )}

              {/* Step 4 — Plan */}
              {step === 4 && (
                <>
                  <p className="text-gray-500 text-sm">Seleccioná el plan de membresía del nuevo socio.</p>
                  <div className="flex flex-col gap-2.5">
                    {activePlans.map((plan) => {
                      const selected = form.planId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setField("planId", plan.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            selected
                              ? "bg-lime-400/10 border-lime-400/40 shadow-[0_0_16px_rgba(163,230,53,0.06)]"
                              : "bg-neutral-800 border-zinc-700 hover:border-zinc-600"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              selected ? "border-lime-400" : "border-zinc-600"
                            }`}>
                              {selected && <div className="w-2 h-2 rounded-full bg-lime-400" />}
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${selected ? "text-lime-400" : "text-white"}`}>{plan.name}</p>
                              {plan.description && <p className="text-gray-500 text-xs mt-0.5">{plan.description}</p>}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className={`font-extrabold text-base ${selected ? "text-lime-400" : "text-white"}`}>
                              ${plan.monthlyPriceArs.toLocaleString()}
                            </p>
                            <p className="text-gray-600 text-[10px]">/ mes</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <Field label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={(v) => setField("fechaInicio", v)} />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-2">
              <button
                type="button"
                onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-zinc-700 text-gray-300 text-sm font-semibold hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
              >
                {step === 1 ? "Cancelar" : "Anterior"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed(step, form)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-squat-ink text-sm font-extrabold hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Siguiente
                  <i className="ti ti-arrow-right text-xs" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed(4, form)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-squat-ink text-sm font-extrabold hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <i className="ti ti-user-plus text-xs" />
                  Registrar Socio
                </button>
              )}
            </div>
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="w-20 h-20 rounded-2xl bg-lime-400/10 flex items-center justify-center">
              <i className="ti ti-user-check text-lime-400 text-4xl" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-white text-xl font-extrabold">¡Socio registrado!</h3>
              <p className="text-gray-400 text-sm">
                <span className="text-white font-semibold">{form.nombre} {form.apellido}</span> fue agregado exitosamente al sistema.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 border border-zinc-700 text-gray-300 text-sm font-semibold hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-squat-ink text-sm font-extrabold hover:brightness-105 transition-all cursor-pointer"
              >
                <i className="ti ti-user-plus text-xs" />
                Agregar otro
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
