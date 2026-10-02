import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  employeesMock,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
} from "@/data/employees";
import type { Client, ClientStatus } from "@/data/clients";
import { branchesMock } from "@/data/branches";
import { getPlan, plansMock } from "@/data/plans";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/domain/billing";
import { formatDateShort, todayISO } from "@/lib/dates";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { onlyDigits } from "@/lib/format";
import { selectAccount } from "@/store/selectors";
import { FilterSelect } from "@/components/common/FilterSelect";
import { matchesPersonSearch } from "@/lib/format";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";

type TabId = "staff" | "students";

const ITEMS_PER_PAGE = 4;

const roleLabels: Record<EmployeeRole, string> = {
  reception: "Recepcionista",
  manager: "Gerente",
  trainer: "Entrenador",
  accounting: "Contabilidad",
  admin: "Administrativo",
};

const statusLabels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  enabled: "Habilitado",
  debtor: "Deudor",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPersonalPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("staff");
  const [staffPage, setStaffPage] = React.useState(1);
  const [studentPage, setStudentPage] = React.useState(1);

  const [staffList, setStaffList] = React.useState<Employee[]>(employeesMock);
  const state = useAppState();
  const actions = useStoreActions();
  // Los alumnos salen del store: una baja acá se ve también en la pantalla de secretaría.
  const studentList = state.clients;

  // Search & filters
  const [search, setSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const selectedClient = studentList.find((c) => c.id === selectedClientId) ?? null;
  const [editing, setEditing] = React.useState(false);
  // Confirmación de baja (lógica): qué registro se quiere dar de baja.
  const [pendingDeactivation, setPendingDeactivation] = React.useState<"employee" | "client" | null>(null);

  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editDni, setEditDni] = React.useState("");
  const [editRole, setEditRole] = React.useState<EmployeeRole>("trainer");
  const [editStatus, setEditStatus] = React.useState<EmployeeStatus>("active");
  const [editBranchId, setEditBranchId] = React.useState("");

  const [editClientName, setEditClientName] = React.useState("");
  const [editClientEmail, setEditClientEmail] = React.useState("");
  const [editClientDni, setEditClientDni] = React.useState("");
  const [editClientPhone, setEditClientPhone] = React.useState("");
  const [editClientBranchId, setEditClientBranchId] = React.useState("");

  // Filtered data
  const filteredStaff = React.useMemo(() => {
    return staffList.filter((emp) => {
      const matchesSearch = matchesPersonSearch(search, { name: emp.fullName, dni: emp.dni, email: emp.email });
      const matchesRole = !filterRole || emp.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [staffList, search, filterRole]);

  const filteredStudents = React.useMemo(() => {
    return studentList.filter((cli) => {
      const matchesSearch = matchesPersonSearch(search, { name: cli.fullName, dni: cli.dni, email: cli.email });
      const matchesPlan = !filterPlan || cli.planId === filterPlan;
      const matchesStatus = !filterStatus || selectAccount(state, cli).status === filterStatus;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [studentList, search, filterPlan, filterStatus]);

  // Reset page when filters change
  React.useEffect(() => { setStaffPage(1); }, [search, filterRole]);
  React.useEffect(() => { setStudentPage(1); }, [search, filterPlan, filterStatus]);

  const staffTotalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const studentTotalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const staffStart = (staffPage - 1) * ITEMS_PER_PAGE;
  const studentStart = (studentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStaff = filteredStaff.slice(staffStart, staffStart + ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(studentStart, studentStart + ITEMS_PER_PAGE);

  function openEmployee(emp: Employee) {
    setSelectedEmployee(emp);
    setSelectedClientId(null);
    setEditing(false);
    setEditName(emp.fullName);
    setEditEmail(emp.email);
    setEditDni(emp.dni ?? "");
    setEditRole(emp.role);
    setEditStatus(emp.status);
    setEditBranchId(emp.branchId);
  }

  function openClient(cli: Client) {
    setSelectedClientId(cli.id);
    setSelectedEmployee(null);
    setEditing(false);
    setEditClientName(cli.fullName);
    setEditClientEmail(cli.email);
    setEditClientDni(cli.dni);
    setEditClientPhone(cli.phone ?? "");
    setEditClientBranchId(cli.branchId);
  }

  function closeDialog() {
    setSelectedEmployee(null);
    setSelectedClientId(null);
    setEditing(false);
  }

  function handleEditEmployee() {
    if (!selectedEmployee) return;
    setStaffList((prev) =>
      prev.map((e) =>
        e.id === selectedEmployee.id
          ? {
              ...e,
              fullName: editName,
              email: editEmail,
              dni: editDni,
              role: editRole,
              status: editStatus,
              branchId: editBranchId,
            }
          : e,
      ),
    );
    setSelectedEmployee((prev) =>
      prev
        ? {
            ...prev,
            fullName: editName,
            email: editEmail,
            dni: editDni,
            role: editRole,
            status: editStatus,
            branchId: editBranchId,
          }
        : null,
    );
    setEditing(false);
    toast.success("Personal actualizado");
  }

  /** Baja lógica: el registro queda inactivo y conserva su historial. */
  function setEmployeeStatus(status: EmployeeStatus) {
    if (!selectedEmployee) return;
    setStaffList((prev) => prev.map((e) => (e.id === selectedEmployee.id ? { ...e, status } : e)));
    setSelectedEmployee((prev) => (prev ? { ...prev, status } : null));
    setEditStatus(status);
    toast.success(status === "inactive" ? "Personal dado de baja" : "Personal reactivado");
  }

  function handleEditClient() {
    if (!selectedClient) return;
    if (!editClientName.trim()) return toast.error("El nombre no puede quedar vacío.");
    if (!/^\S+@\S+\.\S+$/.test(editClientEmail.trim())) return toast.error("Revisá el email: no parece válido.");
    if (onlyDigits(editClientDni).length < 7) return toast.error("Revisá el DNI: tiene que tener al menos 7 números.");
    if (studentList.some((c) => c.id !== selectedClient.id && onlyDigits(c.dni) === onlyDigits(editClientDni))) {
      return toast.error("Ya hay otro alumno con ese DNI.");
    }
    actions.updateClient(selectedClient.id, {
      fullName: editClientName.trim(),
      email: editClientEmail.trim(),
      dni: editClientDni.trim(),
      phone: editClientPhone.trim() || undefined,
      branchId: editClientBranchId,
    });
    setEditing(false);
    toast.success("Alumno actualizado");
  }

  /** Baja lógica: el alumno queda inactivo y conserva su historial de pagos y asistencias. */
  function setClientStatus(status: ClientStatus) {
    if (!selectedClient) return;
    if (status === "inactive") actions.deactivateClient(selectedClient.id, "Baja registrada por administración.");
    else actions.reactivateClient(selectedClient.id);
    toast.success(status === "inactive" ? "Alumno dado de baja" : "Alumno reactivado");
  }

  function confirmDeactivation() {
    if (pendingDeactivation === "employee") setEmployeeStatus("inactive");
    if (pendingDeactivation === "client") setClientStatus("inactive");
    setPendingDeactivation(null);
  }

  return (
    <>
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        <PageHeader title="Gestión de personal" subtitle="Administrá el personal y los alumnos del gimnasio." />

        <SegmentedTabs<TabId>
          label="Qué querés administrar"
          value={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setStaffPage(1);
            setStudentPage(1);
            setSearch("");
            setFilterRole("");
            setFilterPlan("");
            setFilterStatus("");
          }}
          items={[
            { id: "staff", label: "Personal", icon: "ti-briefcase", count: staffList.length },
            { id: "students", label: "Alumnos", icon: "ti-users", count: studentList.length },
          ]}
        />

        {/* Search + filters */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <SearchInput value={search} onChange={setSearch} placeholder="Nombre, correo o DNI…" label="Buscar por nombre, correo o DNI" />

            {/* Dropdown filters */}
            {activeTab === "staff" ? (
              <FilterSelect
                value={filterRole}
                onChange={setFilterRole}
                placeholder="Cargo"
                options={(["manager", "reception", "trainer", "accounting", "admin"] as EmployeeRole[]).map(
                  (role) => ({ value: role, label: roleLabels[role] }),
                )}
              />
            ) : (
              <>
                <FilterSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Estado"
                  options={(Object.keys(ACCOUNT_STATUS_LABELS) as AccountStatus[]).map((value) => ({
                    value,
                    label: ACCOUNT_STATUS_LABELS[value],
                  }))}
                />
                <FilterSelect
                  value={filterPlan}
                  onChange={setFilterPlan}
                  placeholder="Plan"
                  options={plansMock.filter((p) => p.status === "active").map((p) => ({ value: p.id, label: p.name }))}
                />
              </>
            )}
          </div>

          {/* Results count */}
          <p className="text-gray-400 text-[11px]">
            {activeTab === "staff"
              ? `${filteredStaff.length} resultado${filteredStaff.length !== 1 ? "s" : ""}`
              : `${filteredStudents.length} resultado${filteredStudents.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {activeTab === "staff" ? (
          <div className="flex flex-col gap-4">
            {paginatedStaff.length === 0 ? (
              <EmptyState icon="ti-search-off" title="No hay resultados con esos filtros" />
            ) : null}
            {paginatedStaff.map((emp) => {
              const branch = branchesMock.find((b) => b.id === emp.branchId);
              return (
                <button
                  key={emp.id}
                  onClick={() => openEmployee(emp)}
                  className="w-full text-left bg-black/60 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/70 transition-all duration-150 cursor-pointer group shadow-card glass-border hover:border-white/[0.10]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {getInitials(emp.fullName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {emp.fullName}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {emp.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                      emp.role === "trainer"
                        ? "bg-lime-950/60 text-lime-400"
                        : emp.role === "manager"
                          ? "bg-violet-950/60 text-violet-400"
                          : emp.role === "reception"
                            ? "bg-blue-950/60 text-blue-400"
                            : emp.role === "accounting"
                              ? "bg-amber-950/60 text-amber-400"
                              : "bg-zinc-800 text-gray-300"
                    }`}
                  >
                    {roleLabels[emp.role]}
                  </span>
                  <span className={`text-xs font-semibold ${emp.status === "active" ? "text-success" : "text-gray-400"}`}>
                    {emp.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                  <i className="ti ti-chevron-right text-gray-400 text-sm group-hover:text-gray-400 transition-colors" />
                </button>
              );
            })}
            <Pagination
              currentPage={staffPage}
              totalPages={staffTotalPages}
              onPageChange={setStaffPage}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paginatedStudents.length === 0 ? (
              <EmptyState icon="ti-search-off" title="No hay resultados con esos filtros" />
            ) : null}
            {paginatedStudents.map((cli) => {
              const branch = branchesMock.find((b) => b.id === cli.branchId);
              const plan = getPlan(cli.planId);
              return (
                <button
                  key={cli.id}
                  onClick={() => openClient(cli)}
                  className="w-full text-left bg-black/60 rounded-2xl p-5 flex items-center gap-4 hover:bg-black/70 transition-all duration-150 cursor-pointer group shadow-card glass-border hover:border-white/[0.10]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {getInitials(cli.fullName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {cli.fullName}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {cli.email}
                    </p>
                  </div>
                  <span className="text-gray-400 text-[11px] hidden md:block">
                    {plan?.name ?? "Sin plan"}
                  </span>
                  <AccountStatusBadge status={selectAccount(state, cli).status} />
                  <i className="ti ti-chevron-right text-gray-400 text-sm group-hover:text-gray-400 transition-colors" />
                </button>
              );
            })}
            <Pagination
              currentPage={studentPage}
              totalPages={studentTotalPages}
              onPageChange={setStudentPage}
            />
          </div>
        )}
      </div>

      {/* Dialog: Employee CRUD */}
      <Dialog open={!!selectedEmployee} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-md bg-[#111111] border-zinc-800/60 text-white p-0 overflow-hidden">
          {selectedEmployee && (
            <div className="flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
              <div className="p-6 pt-8 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRoleStyle(selectedEmployee.role).avatar} border border-white/[0.07] flex items-center justify-center shrink-0`}>
                    <span className="text-white font-extrabold text-base">{getInitials(selectedEmployee.fullName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {editing && <p className="text-lime-400/60 text-[11px] font-bold tracking-widest mb-1">EDITANDO</p>}
                        <h2 className="text-white font-extrabold text-base leading-tight">
                          {editing ? (editName || selectedEmployee.fullName) : selectedEmployee.fullName}
                        </h2>
                        {!editing && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${getRoleStyle(selectedEmployee.role).badge}`}>
                              {roleLabels[selectedEmployee.role]}
                            </span>
                            <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${selectedEmployee.status === "active" ? "text-lime-400" : "text-gray-400"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${selectedEmployee.status === "active" ? "bg-lime-400 shadow-[0_0_5px_rgba(163,230,53,0.7)]" : "bg-gray-600"}`} />
                              {statusLabels[selectedEmployee.status]}
                            </span>
                          </div>
                        )}
                      </div>
                      {!editing && (
                        <button onClick={() => setEditing(true)} className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-gray-400 text-[11px] font-bold hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer flex items-center gap-1.5">
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
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-400 text-[11px] font-semibold tracking-widest">ROL</span>
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value as EmployeeRole)} className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                        {(Object.keys(roleLabels) as EmployeeRole[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-400 text-[11px] font-semibold tracking-widest">ESTADO</span>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as EmployeeStatus)} className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-400 text-[11px] font-semibold tracking-widest">SUCURSAL</span>
                      <select value={editBranchId} onChange={(e) => setEditBranchId(e.target.value)} className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                        {branchesMock.map((b) => <option key={b.id} value={b.id}>{b.code} – {b.name}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/[0.05] overflow-hidden">
                    <InfoIconRow icon="ti-mail" label="EMAIL" value={selectedEmployee.email} />
                    <InfoIconRow icon="ti-id" label="DNI" value={selectedEmployee.dni ?? "—"} />
                    <InfoIconRow icon="ti-building" label="SUCURSAL" value={branchesMock.find((b) => b.id === selectedEmployee.branchId)?.name ?? "—"} />
                    <InfoIconRow icon="ti-calendar" label="ALTA" value={formatDate(selectedEmployee.createdAt)} />
                  </div>
                )}

                {editing ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => { setEditing(false); setEditName(selectedEmployee.fullName); setEditEmail(selectedEmployee.email); setEditDni(selectedEmployee.dni ?? ""); setEditRole(selectedEmployee.role); setEditStatus(selectedEmployee.status); setEditBranchId(selectedEmployee.branchId); }}
                      className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-gray-400 text-xs font-bold hover:bg-white/[0.07] transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button onClick={handleEditEmployee} className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
                      Guardar Cambios
                    </button>
                  </div>
                ) : (
                  selectedEmployee.status === "inactive" ? (
                    <button onClick={() => setEmployeeStatus("active")} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-lime-400/20 text-lime-400 text-xs font-bold hover:bg-lime-400/[0.06] transition-all cursor-pointer">
                      <i className="ti ti-user-check text-sm" aria-hidden="true" />
                      Reactivar
                    </button>
                  ) : (
                    <button onClick={() => setPendingDeactivation("employee")} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/[0.06] hover:border-red-500/30 transition-all cursor-pointer">
                      <i className="ti ti-user-off text-sm" aria-hidden="true" />
                      Dar de baja
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Client CRUD */}
      <Dialog open={!!selectedClient} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-md bg-[#111111] border-zinc-800/60 text-white p-0 overflow-hidden">
          {selectedClient && (
            <div className="flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
              <div className="p-6 pt-8 flex flex-col gap-5">
                {(() => {
                  const clientPlan = getPlan(selectedClient.planId);
                  return (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/[0.07] flex items-center justify-center shrink-0">
                          <span className="text-white font-extrabold text-base">{getInitials(selectedClient.fullName)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {editing && <p className="text-lime-400/60 text-[11px] font-bold tracking-widest mb-1">EDITANDO</p>}
                              <h2 className="text-white font-extrabold text-base leading-tight">
                                {editing ? (editClientName || selectedClient.fullName) : selectedClient.fullName}
                              </h2>
                              {!editing && (
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {clientPlan && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-zinc-800/80 text-gray-300 border border-white/[0.06]">
                                      {clientPlan.name}
                                    </span>
                                  )}
                                  <AccountStatusBadge status={selectAccount(state, selectedClient).status} />
                                </div>
                              )}
                            </div>
                            {!editing && (
                              <button onClick={() => setEditing(true)} className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-gray-400 text-[11px] font-bold hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer flex items-center gap-1.5">
                                <i className="ti ti-pencil text-xs" />
                                Editar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {editing ? (
                        <div className="flex flex-col gap-3">
                          <Field label="NOMBRE" value={editClientName} onChange={setEditClientName} />
                          <Field label="EMAIL" value={editClientEmail} onChange={setEditClientEmail} />
                          <Field label="DNI" value={editClientDni} onChange={setEditClientDni} />
                          <Field label="TELÉFONO" value={editClientPhone} onChange={setEditClientPhone} />
                          <div className="flex flex-col gap-1.5">
                            <span className="text-gray-400 text-[11px] font-semibold tracking-widest">SUCURSAL</span>
                            <select value={editClientBranchId} onChange={(e) => setEditClientBranchId(e.target.value)} className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                              {branchesMock.map((b) => <option key={b.id} value={b.id}>{b.code} – {b.name}</option>)}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-white/[0.05] overflow-hidden">
                          <InfoIconRow icon="ti-mail" label="EMAIL" value={selectedClient.email} />
                          <InfoIconRow icon="ti-id" label="DNI" value={selectedClient.dni} />
                          {selectedClient.phone && <InfoIconRow icon="ti-phone" label="TELÉFONO" value={selectedClient.phone} />}
                          <InfoIconRow icon="ti-building" label="SUCURSAL" value={branchesMock.find((b) => b.id === selectedClient.branchId)?.name ?? "—"} />
                          {clientPlan && <InfoIconRow icon="ti-crown" label="PLAN" value={clientPlan.name} />}
                          <InfoIconRow icon="ti-calendar-check" label="ALTA" value={formatDateShort(selectedClient.enrolledAt)} />
                        </div>
                      )}

                      {editing ? (
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => { setEditing(false); setEditClientName(selectedClient.fullName); setEditClientEmail(selectedClient.email); setEditClientDni(selectedClient.dni); setEditClientPhone(selectedClient.phone ?? ""); setEditClientBranchId(selectedClient.branchId); }}
                            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-gray-400 text-xs font-bold hover:bg-white/[0.07] transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button onClick={handleEditClient} className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
                            Guardar Cambios
                          </button>
                        </div>
                      ) : (
                        selectedClient.status === "inactive" ? (
                          <button onClick={() => setClientStatus("active")} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-lime-400/20 text-lime-400 text-xs font-bold hover:bg-lime-400/[0.06] transition-all cursor-pointer">
                            <i className="ti ti-user-check text-sm" aria-hidden="true" />
                            Reactivar
                          </button>
                        ) : (
                          <button onClick={() => setPendingDeactivation("client")} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/[0.06] hover:border-red-500/30 transition-all cursor-pointer">
                            <i className="ti ti-user-off text-sm" aria-hidden="true" />
                            Dar de baja
                          </button>
                        )
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeactivation !== null}
        onOpenChange={(open) => !open && setPendingDeactivation(null)}
        title={pendingDeactivation === "client" ? "¿Dar de baja al alumno?" : "¿Dar de baja a esta persona?"}
        description={
          <>
            <span className="font-semibold text-white">
              {pendingDeactivation === "client" ? selectedClient?.fullName : selectedEmployee?.fullName}
            </span>{" "}
            va a quedar inactivo. Su historial se conserva y se puede reactivar cuando quieras.
          </>
        }
        confirmLabel="Sí, dar de baja"
        onConfirm={confirmDeactivation}
        tone="danger"
        iconClassName="ti ti-user-off"
      />
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-gray-400 text-[11px] font-semibold tracking-widest">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-lime-400/20 transition-all"
      />
    </div>
  );
}

function InfoIconRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0 bg-black/20">
      <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
        <i className={`ti ${icon} text-gray-400 text-sm`} />
      </div>
      <span className="text-gray-400 text-[11px] font-semibold tracking-widest w-20 shrink-0">{label}</span>
      <span className="text-white text-xs font-medium ml-auto text-right truncate">{value}</span>
    </div>
  );
}

function getRoleStyle(role: EmployeeRole): { avatar: string; badge: string } {
  switch (role) {
    case "trainer":    return { avatar: "from-lime-900/80 to-zinc-950",   badge: "bg-lime-950/60 text-lime-400 border border-lime-800/40" };
    case "manager":    return { avatar: "from-violet-900/80 to-zinc-950", badge: "bg-violet-950/60 text-violet-400 border border-violet-800/40" };
    case "reception":  return { avatar: "from-blue-900/80 to-zinc-950",   badge: "bg-blue-950/60 text-blue-400 border border-blue-800/40" };
    case "accounting": return { avatar: "from-amber-900/80 to-zinc-950",  badge: "bg-amber-950/60 text-amber-400 border border-amber-800/40" };
    default:           return { avatar: "from-zinc-700 to-zinc-900",      badge: "bg-zinc-800 text-gray-300 border border-zinc-700/40" };
  }
}
