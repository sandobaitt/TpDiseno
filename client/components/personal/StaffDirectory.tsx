import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterSelect } from "@/components/common/FilterSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DetailList } from "@/components/common/DetailList";
import { FormField, inputClasses } from "@/components/common/FormField";
import {
  employeesMock,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
} from "@/data/employees";
import { branchesMock } from "@/data/branches";
import { formatDate } from "@/lib/dates";
import { getInitials, matchesPersonSearch } from "@/lib/format";

const ITEMS_PER_PAGE = 6;

const ROLE_LABELS: Record<EmployeeRole, string> = {
  reception: "Recepcionista",
  manager: "Gerente",
  trainer: "Entrenador",
  accounting: "Contabilidad",
  admin: "Administrativo",
};

interface EditForm {
  fullName: string;
  email: string;
  dni: string;
  role: EmployeeRole;
  branchId: string;
}

/**
 * Gestión del personal administrativo (pantalla anterior del admin, sin los
 * alumnos: ahora tienen su propio menú). Los cambios quedan en esta pantalla.
 */
export function StaffDirectory() {
  const [staff, setStaff] = React.useState<Employee[]>(employeesMock);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState<EditForm | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);

  const selected = staff.find((e) => e.id === selectedId) ?? null;
  const filtered = staff.filter(
    (e) =>
      matchesPersonSearch(search, {
        name: e.fullName,
        dni: e.dni,
        email: e.email,
      }) &&
      (!roleFilter || e.role === roleFilter),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageRows = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  function open(employee: Employee) {
    setSelectedId(employee.id);
    setEditing(false);
    setForm({
      fullName: employee.fullName,
      email: employee.email,
      dni: employee.dni ?? "",
      role: employee.role,
      branchId: employee.branchId,
    });
  }

  function update(id: string, changes: Partial<Employee>) {
    setStaff((list) =>
      list.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    );
  }

  function save() {
    if (!selected || !form) return;
    if (!form.fullName.trim())
      return toast.error("El nombre no puede quedar vacío.");
    update(selected.id, {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    });
    setEditing(false);
    toast.success("Datos actualizados.");
  }

  function setStatus(status: EmployeeStatus) {
    if (!selected) return;
    update(selected.id, { status });
    toast.success(
      status === "inactive"
        ? "Baja registrada. Se conserva el historial."
        : "Reactivado.",
    );
  }

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Gestión de personal"
        subtitle="Datos del personal administrativo de las sedes. Los alumnos se administran desde «Alumnos»."
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Nombre, correo o DNI…"
          label="Buscar personal por nombre, correo o DNI"
        />
        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="Cargo"
          options={(Object.keys(ROLE_LABELS) as EmployeeRole[]).map((role) => ({
            value: role,
            label: ROLE_LABELS[role],
          }))}
        />
        <span className="ml-auto text-xs text-gray-400" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "persona" : "personas"}
        </span>
      </div>

      {pageRows.length === 0 ? (
        <EmptyState
          icon="ti-search-off"
          title="No hay resultados con esos filtros"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {pageRows.map((e) => (
            <li key={e.id}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => open(e)}
                className="h-auto w-full justify-start gap-4 whitespace-normal rounded-2xl bg-neutral-900 p-5 text-left font-normal shadow-card glass-border hover:bg-neutral-800/80"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs font-bold text-primary">
                  {getInitials(e.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">
                    {e.fullName}
                  </span>
                  <span className="block truncate text-xs text-gray-400">
                    {ROLE_LABELS[e.role]} ·{" "}
                    {branchesMock.find((b) => b.id === e.branchId)?.name ??
                      "Sin sede"}
                  </span>
                </span>
                <StatusBadge
                  tone={e.status === "active" ? "success" : "neutral"}
                  icon={
                    e.status === "active" ? "ti-circle-check" : "ti-user-off"
                  }
                >
                  {e.status === "active" ? "Activo" : "Inactivo"}
                </StatusBadge>
                <i
                  className="ti ti-chevron-right text-gray-400"
                  aria-hidden="true"
                />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          {selected && form && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  {selected.fullName}
                </DialogTitle>
                <DialogDescription>
                  {ROLE_LABELS[selected.role]} ·{" "}
                  {selected.status === "active" ? "Activo" : "Inactivo"}
                </DialogDescription>
              </DialogHeader>

              {editing ? (
                <div className="flex flex-col gap-3">
                  <FormField label="Nombre y apellido" required>
                    {(id) => (
                      <input
                        id={id}
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        className={inputClasses}
                      />
                    )}
                  </FormField>
                  <FormField label="Email">
                    {(id) => (
                      <input
                        id={id}
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className={inputClasses}
                      />
                    )}
                  </FormField>
                  <FormField label="DNI">
                    {(id) => (
                      <input
                        id={id}
                        value={form.dni}
                        onChange={(e) =>
                          setForm({ ...form, dni: e.target.value })
                        }
                        className={inputClasses}
                      />
                    )}
                  </FormField>
                  <FormField label="Cargo">
                    {(id) => (
                      <select
                        id={id}
                        value={form.role}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            role: e.target.value as EmployeeRole,
                          })
                        }
                        className={inputClasses}
                      >
                        {(Object.keys(ROLE_LABELS) as EmployeeRole[]).map(
                          (r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ),
                        )}
                      </select>
                    )}
                  </FormField>
                  <FormField label="Sede">
                    {(id) => (
                      <select
                        id={id}
                        value={form.branchId}
                        onChange={(e) =>
                          setForm({ ...form, branchId: e.target.value })
                        }
                        className={inputClasses}
                      >
                        {branchesMock.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormField>
                </div>
              ) : (
                <DetailList
                  items={[
                    { label: "Email", value: selected.email, icon: "ti-mail" },
                    { label: "DNI", value: selected.dni ?? "—", icon: "ti-id" },
                    {
                      label: "Sede",
                      value:
                        branchesMock.find((b) => b.id === selected.branchId)
                          ?.name ?? "—",
                      icon: "ti-building",
                    },
                    {
                      label: "Alta",
                      value: formatDate(selected.createdAt.slice(0, 10)),
                      icon: "ti-calendar",
                    },
                  ]}
                />
              )}

              <DialogFooter className="gap-2">
                {editing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="rounded-xl"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={save}
                      className="rounded-xl font-bold"
                    >
                      Guardar cambios
                    </Button>
                  </>
                ) : (
                  <>
                    {selected.status === "active" ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmDeactivate(true)}
                        className="rounded-xl border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
                      >
                        <i
                          className="ti ti-user-off text-base"
                          aria-hidden="true"
                        />
                        Dar de baja
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStatus("active")}
                        className="rounded-xl"
                      >
                        <i
                          className="ti ti-user-check text-base"
                          aria-hidden="true"
                        />
                        Reactivar
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="rounded-xl font-bold"
                    >
                      <i
                        className="ti ti-pencil text-base"
                        aria-hidden="true"
                      />
                      Editar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="¿Dar de baja a esta persona?"
        description={`${selected?.fullName ?? ""} va a quedar inactivo. Su historial se conserva y se puede reactivar.`}
        confirmLabel="Sí, dar de baja"
        tone="danger"
        iconClassName="ti ti-user-off"
        onConfirm={() => setStatus("inactive")}
      />
    </div>
  );
}
