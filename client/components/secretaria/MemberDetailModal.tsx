import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MemberDetail } from "@/components/member-detail/MemberDetail";
import { getPlan } from "@/data/plans";
import { PAYMENT_METHOD_LABELS } from "@/data/payments";
import { branchesMock } from "@/data/branches";
import { toast } from "sonner";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { formatDateShort, parseISODate } from "@/lib/dates";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { onlyDigits } from "@/lib/format";
import { selectAccount, selectClientPayments } from "@/store/selectors";

interface MemberDetailModalProps {
  clientId: string | null;
  onClose: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-lime-400/20 transition-all glass-border"
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0">
      <i className={`ti ${icon} text-sm text-gray-600 w-4 shrink-0`} />
      <span className="text-gray-600 text-[10px] font-semibold tracking-widest w-20 shrink-0">{label}</span>
      <span className="text-white text-sm font-medium truncate">{value}</span>
    </div>
  );
}

export function MemberDetailModal({ clientId, onClose }: MemberDetailModalProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editDni, setEditDni] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editBranchId, setEditBranchId] = React.useState("");

  const client = clientId ? state.clients.find((c) => c.id === clientId) : undefined;
  const clientPlan = getPlan(client?.planId);
  // Estado de cuenta calculado con las reglas de cobro (deuda real, sin montos inventados).
  const account = client ? selectAccount(state, client) : undefined;

  const transactions = client
    ? selectClientPayments(state, client.id).map((p) => ({
        id: p.id,
        type: (p.status === "approved" ? "payment" : "unpaid") as "payment" | "unpaid",
        title: p.description || p.concept,
        date: parseISODate(p.createdAt).toLocaleDateString("es-AR"),
        amount: p.amountArs,
        status: p.status === "approved" ? "Aprobado" : p.status === "rejected" ? "Rechazado" : "Reintegrado",
        paymentMethod: PAYMENT_METHOD_LABELS[p.method],
      }))
    : undefined;

  function openEdit() {
    if (!client) return;
    setEditName(client.fullName);
    setEditEmail(client.email);
    setEditDni(client.dni);
    setEditPhone(client.phone ?? "");
    setEditBranchId(client.branchId);
    setEditing(false);
    setEditOpen(true);
  }

  function handleSave() {
    if (!client) return;
    // Validaciones mínimas antes de guardar en el store.
    if (!editName.trim()) return toast.error("El nombre no puede quedar vacío.");
    if (!/^\S+@\S+\.\S+$/.test(editEmail.trim())) return toast.error("Revisá el email: no parece válido.");
    if (onlyDigits(editDni).length < 7) return toast.error("Revisá el DNI: tiene que tener al menos 7 números.");
    const duplicated = state.clients.some((c) => c.id !== client.id && onlyDigits(c.dni) === onlyDigits(editDni));
    if (duplicated) return toast.error("Ya hay otro alumno con ese DNI.");
    actions.updateClient(client.id, {
      fullName: editName.trim(),
      email: editEmail.trim(),
      dni: editDni.trim(),
      phone: editPhone.trim() || undefined,
      branchId: editBranchId,
    });
    toast.success("Datos del alumno actualizados");
    setEditing(false);
    setEditOpen(false);
  }

  function handleCollect() {
    onClose();
    navigate("/secretaria/cobros", { state: { clientId: client?.id } });
  }


  return (
    <>
      <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl bg-neutral-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
          {client && account && (
            <div className="p-2">
              <DialogTitle className="sr-only">Ficha de {client.fullName}</DialogTitle>
              <DialogDescription className="sr-only">Datos, estado de cuenta y pagos del alumno.</DialogDescription>
              <MemberDetail
                member={{
                  id: client.id,
                  fullName: client.fullName,
                  email: client.email,
                  dni: client.dni,
                  status: account.status,
                  planName: clientPlan?.name,
                }}
                pendingPayment={{
                  amount: account.owedAmount,
                  overdueDays: account.overdueDays,
                }}
                isAccessBlocked={!!client.manualRestriction || account.status === "bloqueado"}
                blockReason={client.manualRestriction?.reason ?? (account.status === "bloqueado" ? "Bloqueado por deuda" : undefined)}
                transactions={transactions}
                onEditProfile={openEdit}
                onCollectPayment={handleCollect}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditOpen(false)}>
        <DialogContent className="max-w-md bg-[#111111] border-zinc-800/60 text-white p-0 overflow-hidden">
          {client && (
            <div className="flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
              <div className="p-6 pt-8 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/[0.07] flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-base">{getInitials(editName || client.fullName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {editing && <p className="text-lime-400/60 text-[10px] font-bold tracking-widest mb-1">EDITANDO</p>}
                        <h2 className="text-white font-extrabold text-base leading-tight">
                          {editing ? (editName || client.fullName) : client.fullName}
                        </h2>
                        {!editing && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {clientPlan && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-zinc-800/80 text-gray-300 border border-white/[0.06]">
                                {clientPlan.name}
                              </span>
                            )}
                            {account && <AccountStatusBadge status={account.status} />}
                          </div>
                        )}
                      </div>
                      {!editing && (
                        <button
                          onClick={() => setEditing(true)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-gray-400 text-[10px] font-bold hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <i className="ti ti-pencil text-xs" />
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {editing ? (
                  <div className="flex flex-col gap-3">
                    <Field label="NOMBRE" value={editName} onChange={setEditName} />
                    <Field label="EMAIL" value={editEmail} onChange={setEditEmail} />
                    <Field label="DNI" value={editDni} onChange={setEditDni} />
                    <Field label="TELÉFONO" value={editPhone} onChange={setEditPhone} />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">SUCURSAL</span>
                      <select
                        value={editBranchId}
                        onChange={(e) => setEditBranchId(e.target.value)}
                        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer glass-border"
                      >
                        {branchesMock.map((b) => (
                          <option key={b.id} value={b.id}>{b.code} – {b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/[0.05] overflow-hidden">
                    <InfoRow icon="ti-mail" label="EMAIL" value={client.email} />
                    <InfoRow icon="ti-id" label="DNI" value={client.dni} />
                    {client.phone && <InfoRow icon="ti-phone" label="TELÉFONO" value={client.phone} />}
                    <InfoRow icon="ti-building" label="SUCURSAL" value={branchesMock.find((b) => b.id === client.branchId)?.name ?? "—"} />
                    {clientPlan && <InfoRow icon="ti-crown" label="PLAN" value={clientPlan.name} />}
                    {client.enrolledAt && (
                      <InfoRow icon="ti-calendar-check" label="ALTA" value={formatDateShort(client.enrolledAt)} />
                    )}
                  </div>
                )}

                {editing ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => { setEditing(false); setEditName(client.fullName); setEditEmail(client.email); setEditDni(client.dni); setEditPhone(client.phone ?? ""); setEditBranchId(client.branchId); }}
                      className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-gray-400 text-xs font-bold hover:bg-white/[0.07] transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-gray-400 text-xs font-bold hover:bg-white/[0.07] transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
