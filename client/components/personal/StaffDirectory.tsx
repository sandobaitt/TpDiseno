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
import type { Employee, EmployeeRole, EmployeeStatus } from "@/data/employees";
import { branchesMock } from "@/data/branches";
import { getUserName } from "@/data/users";
import {
  validateEmployee,
  type EmployeeErrors,
  type EmployeeForm,
} from "@/domain/staff";
import { formatDate, formatDateTime, nowISO } from "@/lib/dates";
import {
  cleanText,
  formatDni,
  getInitials,
  matchesPersonSearch,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

const ITEMS_PER_PAGE = 6;

const ROLE_LABELS: Record<EmployeeRole, string> = {
  reception: "Recepcionista",
  manager: "Gerente",
  trainer: "Entrenador",
  accounting: "Contabilidad",
  admin: "Administrativo",
};

const emptyForm = (): EmployeeForm => ({
  fullName: "",
  email: "",
  dni: "",
  role: "reception",
  branchId: branchesMock[0].id,
});

/**
 * Gestión del personal administrativo (requisito 3.1.1): alta, modificación
 * (con el cargo y la sede) y baja lógica. Cada cambio queda en el registro de
 * actividad. Los alumnos se administran desde su propio menú.
 */
export function StaffDirectory() {
  const state = useAppState();
  const actions = useStoreActions();
  const staff = state.staff;
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState<EmployeeForm>(emptyForm);
  const [errors, setErrors] = React.useState<EmployeeErrors>({});
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
  const history = selected
    ? state.activity.filter(
        (a) => a.entity === "personal" && a.entityId === selected.id,
      )
    : [];

  React.useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  function open(employee: Employee) {
    setSelectedId(employee.id);
    setCreating(false);
    setEditing(false);
    setErrors({});
    setForm({
      fullName: employee.fullName,
      email: employee.email,
      dni: employee.dni ?? "",
      role: employee.role,
      branchId: employee.branchId,
    });
  }

  function openCreate() {
    setSelectedId(null);
    setCreating(true);
    setEditing(true);
    setErrors({});
    setForm(emptyForm());
  }

  function closeDialog() {
    setSelectedId(null);
    setCreating(false);
    setEditing(false);
  }

  function clean(f: EmployeeForm): EmployeeForm {
    return {
      ...f,
      fullName: cleanText(f.fullName),
      email: f.email.trim(),
      dni: formatDni(f.dni),
    };
  }

  function save() {
    const found = validateEmployee(form, staff, selected?.id);
    setErrors(found);
    if (Object.keys(found).length > 0)
      return toast.error("Revisá los datos marcados.");
    if (creating) {
      const employee: Employee = {
        id: `em_${Date.now().toString(36)}`,
        ...clean(form),
        status: "active",
        createdAt: nowISO(),
      };
      actions.registerEmployee(employee);
      toast.success(`${employee.fullName} quedó dado de alta.`);
      closeDialog();
      return;
    }
    if (!selected) return;
    actions.updateEmployee(selected.id, clean(form));
    setEditing(false);
    toast.success("Datos actualizados.");
  }

  function setStatus(status: EmployeeStatus) {
    if (!selected) return;
    actions.setEmployeeStatus(selected.id, status);
    toast.success(
      status === "inactive"
        ? "Baja registrada. Se conserva el historial."
        : "Reactivado.",
    );
  }

  const field = (key: keyof EmployeeForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Gestión de personal"
        subtitle="Alta, modificación y baja del personal administrativo de las sedes. Los alumnos se administran desde «Alumnos»."
        actions={
          <Button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-xl font-bold"
          >
            <i className="ti ti-user-plus text-base" aria-hidden="true" />
            Dar de alta
          </Button>
        }
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
        <span
          className="ml-auto text-xs text-muted-foreground"
          aria-live="polite"
        >
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
                className="h-auto w-full justify-start gap-4 whitespace-normal rounded-2xl bg-card p-5 text-left font-normal shadow-card glass-border hover:bg-secondary/80"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-primary">
                  {getInitials(e.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">
                    {e.fullName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
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
                  className="ti ti-chevron-right text-muted-foreground"
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

      <Dialog
        open={!!selected || creating}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent className="max-w-md rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {creating ? "Dar de alta en el personal" : selected?.fullName}
            </DialogTitle>
            <DialogDescription>
              {creating
                ? "Completá los datos y elegí el cargo y la sede."
                : selected
                  ? `${ROLE_LABELS[selected.role]} · ${selected.status === "active" ? "Activo" : "Inactivo"}`
                  : ""}
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="flex flex-col gap-3">
              <FormField
                label="Nombre y apellido"
                required
                error={errors.fullName}
              >
                {(id) => (
                  <input
                    id={id}
                    {...field("fullName")}
                    className={cn(
                      inputClasses,
                      errors.fullName && "border-danger",
                    )}
                  />
                )}
              </FormField>
              <FormField label="Email" required error={errors.email}>
                {(id) => (
                  <input
                    id={id}
                    type="email"
                    {...field("email")}
                    className={cn(
                      inputClasses,
                      errors.email && "border-danger",
                    )}
                  />
                )}
              </FormField>
              <FormField label="DNI" required error={errors.dni}>
                {(id) => (
                  <input
                    id={id}
                    inputMode="numeric"
                    {...field("dni")}
                    className={cn(inputClasses, errors.dni && "border-danger")}
                  />
                )}
              </FormField>
              <FormField label="Cargo" required>
                {(id) => (
                  <select id={id} {...field("role")} className={inputClasses}>
                    {(Object.keys(ROLE_LABELS) as EmployeeRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
              <FormField label="Sede" required error={errors.branchId}>
                {(id) => (
                  <select
                    id={id}
                    {...field("branchId")}
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
            selected && (
              <>
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
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Historial de cambios
                  </h3>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Todavía no hay cambios registrados.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {history.map((a) => (
                        <li key={a.id} className="text-sm text-foreground/80">
                          <span className="text-foreground">{a.summary}</span>
                          <span className="block text-xs text-muted-foreground">
                            {formatDateTime(a.at)} · {getUserName(a.userId)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )
          )}

          <DialogFooter className="gap-2">
            {editing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (creating ? closeDialog() : setEditing(false))}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={save}
                  className="rounded-xl font-bold"
                >
                  {creating ? "Dar de alta" : "Guardar cambios"}
                </Button>
              </>
            ) : (
              selected && (
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
                    onClick={() => {
                      setErrors({});
                      setEditing(true);
                    }}
                    className="rounded-xl font-bold"
                  >
                    <i className="ti ti-pencil text-base" aria-hidden="true" />
                    Editar
                  </Button>
                </>
              )
            )}
          </DialogFooter>
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
