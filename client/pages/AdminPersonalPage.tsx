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
import { clientsMock, type Client, type ClientStatus } from "@/data/clients";
import { branchesMock } from "@/data/branches";
import { plansMock } from "@/data/plans";
import { FilterSelect } from "@/components/common/FilterSelect";

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
  const [studentList, setStudentList] = React.useState<Client[]>(clientsMock);

  // Search & filters
  const [search, setSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null,
  );
  const [editing, setEditing] = React.useState(false);

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
  const [editClientStatus, setEditClientStatus] =
    React.useState<ClientStatus>("enabled");
  const [editClientBranchId, setEditClientBranchId] = React.useState("");

  // Filtered data
  const filteredStaff = React.useMemo(() => {
    const q = search.toLowerCase();
    return staffList.filter((emp) => {
      const matchesSearch = !q || emp.fullName.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
      const matchesRole = !filterRole || emp.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [staffList, search, filterRole]);

  const filteredStudents = React.useMemo(() => {
    const q = search.toLowerCase();
    return studentList.filter((cli) => {
      const matchesSearch = !q || cli.fullName.toLowerCase().includes(q) || cli.email.toLowerCase().includes(q);
      const matchesPlan = !filterPlan || (cli.membership != null && cli.membership.planId === filterPlan);
      const matchesStatus = !filterStatus || cli.status === filterStatus;
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
    setSelectedClient(null);
    setEditing(false);
    setEditName(emp.fullName);
    setEditEmail(emp.email);
    setEditDni(emp.dni ?? "");
    setEditRole(emp.role);
    setEditStatus(emp.status);
    setEditBranchId(emp.branchId);
  }

  function openClient(cli: Client) {
    setSelectedClient(cli);
    setSelectedEmployee(null);
    setEditing(false);
    setEditClientName(cli.fullName);
    setEditClientEmail(cli.email);
    setEditClientDni(cli.dni);
    setEditClientPhone(cli.phone ?? "");
    setEditClientStatus(cli.status);
    setEditClientBranchId(cli.branchId);
  }

  function closeDialog() {
    setSelectedEmployee(null);
    setSelectedClient(null);
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

  function handleDeleteEmployee() {
    if (!selectedEmployee) return;
    setStaffList((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
    closeDialog();
    toast.success("Personal eliminado");
  }

  function handleEditClient() {
    if (!selectedClient) return;
    setStudentList((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              fullName: editClientName,
              email: editClientEmail,
              dni: editClientDni,
              phone: editClientPhone || undefined,
              status: editClientStatus,
              branchId: editClientBranchId,
            }
          : c,
      ),
    );
    setSelectedClient((prev) =>
      prev
        ? {
            ...prev,
            fullName: editClientName,
            email: editClientEmail,
            dni: editClientDni,
            phone: editClientPhone || undefined,
            status: editClientStatus,
            branchId: editClientBranchId,
          }
        : null,
    );
    setEditing(false);
    toast.success("Alumno actualizado");
  }

  function handleDeleteClient() {
    if (!selectedClient) return;
    setStudentList((prev) => prev.filter((c) => c.id !== selectedClient.id));
    closeDialog();
    toast.success("Alumno eliminado");
  }

  return (
    <>
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-app-text text-3xl md:text-4xl font-extrabold">
            GESTIÓN DE PERSONAL
          </h1>
          <p className="text-app-faint text-sm">
            Administrá el personal y los alumnos del gimnasio.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("staff");
              setStaffPage(1);
              setSearch("");
              setFilterRole("");
            }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
              activeTab === "staff"
                ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                : "text-app-subtle hover:text-app-muted hover:bg-app-hover/[0.03]"
            }`}
          >
            <i className="ti ti-briefcase text-base mr-2" />
            Personal
          </button>
          <button
            onClick={() => {
              setActiveTab("students");
              setStudentPage(1);
              setSearch("");
              setFilterPlan("");
              setFilterStatus("");
            }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
              activeTab === "students"
                ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                : "text-app-subtle hover:text-app-muted hover:bg-app-hover/[0.03]"
            }`}
          >
            <i className="ti ti-users text-base mr-2" />
            Alumnos
          </button>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {/* Search bar */}
            <div className="relative flex-1 min-w-[200px]">
              <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-app-subtle text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-app-card/60 glass-border text-sm text-app-text placeholder:text-app-faint outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-subtle hover:text-app-muted transition-colors cursor-pointer"
                >
                  <i className="ti ti-x text-sm" />
                </button>
              )}
            </div>

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
                  options={[
                    { value: "enabled", label: "Habilitado" },
                    { value: "debtor", label: "Deudor" },
                    { value: "inactive", label: "Inactivo" },
                  ]}
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
          <p className="text-app-faint text-[11px]">
            {activeTab === "staff"
              ? `${filteredStaff.length} resultado${filteredStaff.length !== 1 ? "s" : ""}`
              : `${filteredStudents.length} resultado${filteredStudents.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {activeTab === "staff" ? (
          <div className="flex flex-col gap-4">
            {paginatedStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-app-faint">
                <i className="ti ti-search-off text-3xl" />
                <p className="text-sm font-medium">Sin resultados para tu búsqueda</p>
              </div>
            ) : null}
            {paginatedStaff.map((emp) => {
              const branch = branchesMock.find((b) => b.id === emp.branchId);
              return (
                <button
                  key={emp.id}
                  onClick={() => openEmployee(emp)}
                  className="w-full text-left bg-app-surface rounded-2xl p-5 flex items-center gap-4 hover:bg-app-card transition-all duration-150 cursor-pointer group shadow-card glass-border hover:border-app-border/[0.10]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {getInitials(emp.fullName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-app-text text-sm font-bold truncate">
                      {emp.fullName}
                    </p>
                    <p className="text-app-subtle text-xs truncate">
                      {emp.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      emp.role === "trainer"
                        ? "bg-lime-400/15 text-lime-400"
                        : emp.role === "manager"
                          ? "bg-violet-500/15 text-violet-400"
                          : emp.role === "reception"
                            ? "bg-blue-500/15 text-blue-400"
                            : emp.role === "accounting"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-app-card text-app-muted"
                    }`}
                  >
                    {roleLabels[emp.role]}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${emp.status === "active" ? "bg-lime-400" : "bg-gray-500"}`}
                  />
                  <i className="ti ti-chevron-right text-app-faint text-sm group-hover:text-app-muted transition-colors" />
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
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-app-faint">
                <i className="ti ti-search-off text-3xl" />
                <p className="text-sm font-medium">Sin resultados para tu búsqueda</p>
              </div>
            ) : null}
            {paginatedStudents.map((cli) => {
              const branch = branchesMock.find((b) => b.id === cli.branchId);
              const plan = cli.membership
                ? plansMock.find((p) => p.id === cli.membership.planId)
                : undefined;
              return (
                <button
                  key={cli.id}
                  onClick={() => openClient(cli)}
                  className="w-full text-left bg-app-surface rounded-2xl p-5 flex items-center gap-4 hover:bg-app-card transition-all duration-150 cursor-pointer group shadow-card glass-border hover:border-app-border/[0.10]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {getInitials(cli.fullName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-app-text text-sm font-bold truncate">
                      {cli.fullName}
                    </p>
                    <p className="text-app-subtle text-xs truncate">
                      {cli.email}
                    </p>
                  </div>
                  <span className="text-app-subtle text-[10px] hidden md:block">
                    {plan?.name ?? "Sin plan"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      cli.status === "enabled"
                        ? "bg-green-500/15 text-green-400"
                        : cli.status === "debtor"
                          ? "bg-orange-500/15 text-orange-400"
                          : "bg-app-card text-app-muted"
                    }`}
                  >
                    {statusLabels[cli.status] ?? cli.status}
                  </span>
                  <i className="ti ti-chevron-right text-app-faint text-sm group-hover:text-app-muted transition-colors" />
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
        <DialogContent className="max-w-md bg-app-bg border-app-border/[0.07] text-app-text p-0 overflow-hidden">
          {selectedEmployee && (
            <div className="flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
              <div className="p-6 pt-8 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRoleStyle(selectedEmployee.role).avatar} border border-app-border/[0.07] flex items-center justify-center shrink-0`}>
                    <span className="text-white font-extrabold text-base">{getInitials(selectedEmployee.fullName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {editing && <p className="text-lime-400/60 text-[10px] font-bold tracking-widest mb-1">EDITANDO</p>}
                        <h2 className="text-app-text font-extrabold text-base leading-tight">
                          {editing ? (editName || selectedEmployee.fullName) : selectedEmployee.fullName}
                        </h2>
                        {!editing && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${getRoleStyle(selectedEmployee.role).badge}`}>
                              {roleLabels[selectedEmployee.role]}
                            </span>
                            <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${selectedEmployee.status === "active" ? "text-lime-400" : "text-app-subtle"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${selectedEmployee.status === "active" ? "bg-lime-400 shadow-[0_0_5px_rgba(163,230,53,0.7)]" : "bg-gray-600"}`} />
                              {statusLabels[selectedEmployee.status]}
                            </span>
                          </div>
                        )}
                      </div>
                      {!editing && (
                        <button onClick={() => setEditing(true)} className="shrink-0 px-3 py-1.5 rounded-lg bg-app-hover/[0.04] border border-app-border/[0.07] text-app-muted text-[10px] font-bold hover:bg-app-hover/[0.08] hover:text-app-text transition-all cursor-pointer flex items-center gap-1.5">
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
                      <span className="text-app-subtle text-[10px] font-semibold tracking-widest">ROL</span>
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value as EmployeeRole)} className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                        {(Object.keys(roleLabels) as EmployeeRole[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-app-subtle text-[10px] font-semibold tracking-widest">ESTADO</span>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as EmployeeStatus)} className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-app-subtle text-[10px] font-semibold tracking-widest">SUCURSAL</span>
                      <select value={editBranchId} onChange={(e) => setEditBranchId(e.target.value)} className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                        {branchesMock.map((b) => <option key={b.id} value={b.id}>{b.code} – {b.name}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-app-border/[0.05] overflow-hidden">
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
                      className="flex-1 py-3 rounded-xl bg-app-hover/[0.04] border border-app-border/[0.07] text-app-muted text-xs font-bold hover:bg-white/[0.07] transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button onClick={handleEditEmployee} className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
                      Guardar Cambios
                    </button>
                  </div>
                ) : (
                  <button onClick={handleDeleteEmployee} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/[0.12] text-red-400/60 text-[11px] font-bold hover:bg-red-500/[0.06] hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer">
                    <i className="ti ti-trash text-sm" />
                    Eliminar Personal
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Client CRUD */}
      <Dialog open={!!selectedClient} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-md bg-app-bg border-app-border/[0.07] text-app-text p-0 overflow-hidden">
          {selectedClient && (
            <div className="flex flex-col">
              <div className="h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
              <div className="p-6 pt-8 flex flex-col gap-5">
                {(() => {
                  const clientPlan = selectedClient.membership
                    ? plansMock.find((p) => p.id === selectedClient.membership!.planId)
                    : undefined;
                  const st = selectedClient.status;
                  const stStyle = st === "enabled"
                    ? { dot: "bg-lime-400 shadow-[0_0_5px_rgba(163,230,53,0.7)]", text: "text-lime-400" }
                    : st === "debtor"
                    ? { dot: "bg-orange-400", text: "text-orange-400" }
                    : { dot: "bg-gray-600", text: "text-app-subtle" };
                  return (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-app-border/[0.07] flex items-center justify-center shrink-0">
                          <span className="text-white font-extrabold text-base">{getInitials(selectedClient.fullName)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {editing && <p className="text-lime-400/60 text-[10px] font-bold tracking-widest mb-1">EDITANDO</p>}
                              <h2 className="text-app-text font-extrabold text-base leading-tight">
                                {editing ? (editClientName || selectedClient.fullName) : selectedClient.fullName}
                              </h2>
                              {!editing && (
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {clientPlan && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-app-card/80 text-app-muted border border-app-border/[0.06]">
                                      {clientPlan.name}
                                    </span>
                                  )}
                                  <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${stStyle.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dot}`} />
                                    {statusLabels[st]}
                                  </span>
                                </div>
                              )}
                            </div>
                            {!editing && (
                              <button onClick={() => setEditing(true)} className="shrink-0 px-3 py-1.5 rounded-lg bg-app-hover/[0.04] border border-app-border/[0.07] text-app-muted text-[10px] font-bold hover:bg-app-hover/[0.08] hover:text-app-text transition-all cursor-pointer flex items-center gap-1.5">
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
                            <span className="text-app-subtle text-[10px] font-semibold tracking-widest">ESTADO</span>
                            <select value={editClientStatus} onChange={(e) => setEditClientStatus(e.target.value as ClientStatus)} className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                              <option value="enabled">Habilitado</option>
                              <option value="debtor">Deudor</option>
                              <option value="inactive">Inactivo</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-app-subtle text-[10px] font-semibold tracking-widest">SUCURSAL</span>
                            <select value={editClientBranchId} onChange={(e) => setEditClientBranchId(e.target.value)} className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer">
                              {branchesMock.map((b) => <option key={b.id} value={b.id}>{b.code} – {b.name}</option>)}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-app-border/[0.05] overflow-hidden">
                          <InfoIconRow icon="ti-mail" label="EMAIL" value={selectedClient.email} />
                          <InfoIconRow icon="ti-id" label="DNI" value={selectedClient.dni} />
                          {selectedClient.phone && <InfoIconRow icon="ti-phone" label="TELÉFONO" value={selectedClient.phone} />}
                          <InfoIconRow icon="ti-building" label="SUCURSAL" value={branchesMock.find((b) => b.id === selectedClient.branchId)?.name ?? "—"} />
                          {clientPlan && <InfoIconRow icon="ti-crown" label="PLAN" value={clientPlan.name} />}
                          {selectedClient.membership && <InfoIconRow icon="ti-calendar-check" label="MEMBRESÍA" value={`Desde ${formatDate(selectedClient.membership.startDate)}`} />}
                        </div>
                      )}

                      {editing ? (
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => { setEditing(false); setEditClientName(selectedClient.fullName); setEditClientEmail(selectedClient.email); setEditClientDni(selectedClient.dni); setEditClientPhone(selectedClient.phone ?? ""); setEditClientStatus(selectedClient.status); setEditClientBranchId(selectedClient.branchId); }}
                            className="flex-1 py-3 rounded-xl bg-app-hover/[0.04] border border-app-border/[0.07] text-app-muted text-xs font-bold hover:bg-white/[0.07] transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button onClick={handleEditClient} className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer">
                            Guardar Cambios
                          </button>
                        </div>
                      ) : (
                        <button onClick={handleDeleteClient} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/[0.12] text-red-400/60 text-[11px] font-bold hover:bg-red-500/[0.06] hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer">
                          <i className="ti ti-trash text-sm" />
                          Eliminar Alumno
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-app-subtle text-[10px] font-semibold tracking-widest">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text placeholder:text-app-faint outline-none focus:ring-1 focus:ring-lime-400/20 transition-all"
      />
    </div>
  );
}

function InfoIconRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-app-border/[0.04] last:border-b-0 bg-app-surface/50">
      <div className="w-7 h-7 rounded-lg bg-app-elevated border border-app-border/[0.05] flex items-center justify-center shrink-0">
        <i className={`ti ${icon} text-app-subtle text-sm`} />
      </div>
      <span className="text-app-subtle text-[10px] font-semibold tracking-widest w-20 shrink-0">{label}</span>
      <span className="text-app-text text-xs font-medium ml-auto text-right truncate">{value}</span>
    </div>
  );
}

function getRoleStyle(role: EmployeeRole): { avatar: string; badge: string } {
  switch (role) {
    case "trainer":    return { avatar: "from-lime-900/80 to-zinc-950",   badge: "bg-lime-400/15 text-lime-400 border border-lime-800/40" };
    case "manager":    return { avatar: "from-violet-900/80 to-zinc-950", badge: "bg-violet-500/15 text-violet-400 border border-violet-800/40" };
    case "reception":  return { avatar: "from-blue-900/80 to-zinc-950",   badge: "bg-blue-500/15 text-blue-400 border border-blue-800/40" };
    case "accounting": return { avatar: "from-amber-900/80 to-zinc-950",  badge: "bg-amber-500/15 text-amber-400 border border-amber-800/40" };
    default:           return { avatar: "from-zinc-700 to-zinc-900",      badge: "bg-app-card text-app-muted border border-app-input-border/40" };
  }
}
