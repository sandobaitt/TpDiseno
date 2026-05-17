import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
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

  // Search & filters (multi-select)
  const [search, setSearch] = React.useState("");
  const [filterRoles, setFilterRoles] = React.useState<Set<EmployeeRole>>(new Set());
  const [filterPlans, setFilterPlans] = React.useState<Set<string>>(new Set());
  const [filterStatuses, setFilterStatuses] = React.useState<Set<ClientStatus>>(new Set());

  const toggleRole = (role: EmployeeRole) =>
    setFilterRoles((prev) => { const s = new Set(prev); s.has(role) ? s.delete(role) : s.add(role); return s; });
  const togglePlan = (id: string) =>
    setFilterPlans((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleStatus = (st: ClientStatus) =>
    setFilterStatuses((prev) => { const s = new Set(prev); s.has(st) ? s.delete(st) : s.add(st); return s; });

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
      const matchesRole = filterRoles.size === 0 || filterRoles.has(emp.role);
      return matchesSearch && matchesRole;
    });
  }, [staffList, search, filterRoles]);

  const filteredStudents = React.useMemo(() => {
    const q = search.toLowerCase();
    return studentList.filter((cli) => {
      const matchesSearch = !q || cli.fullName.toLowerCase().includes(q) || cli.email.toLowerCase().includes(q);
      const matchesPlan = filterPlans.size === 0 || (cli.membership != null && filterPlans.has(cli.membership.planId));
      const matchesStatus = filterStatuses.size === 0 || filterStatuses.has(cli.status);
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [studentList, search, filterPlans, filterStatuses]);

  // Reset page when filters change
  React.useEffect(() => { setStaffPage(1); }, [search, filterRoles]);
  React.useEffect(() => { setStudentPage(1); }, [search, filterPlans, filterStatuses]);

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
    <DashboardLayout headerNav="Gestión de Personal">
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold">
            GESTIÓN DE PERSONAL
          </h1>
          <p className="text-gray-600 text-sm">
            Administrá el personal y los alumnos del gimnasio.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("staff");
              setStaffPage(1);
              setSearch("");
              setFilterRoles(new Set());
            }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
              activeTab === "staff"
                ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.03]"
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
              setFilterPlans(new Set());
              setFilterStatuses(new Set());
            }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
              activeTab === "students"
                ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.03]"
            }`}
          >
            <i className="ti ti-users text-base mr-2" />
            Alumnos
          </button>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "staff" ? "Buscar por nombre o correo..." : "Buscar por nombre o correo..."}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-800/60 glass-border text-sm text-white placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <i className="ti ti-x text-sm" />
              </button>
            )}
          </div>

          {/* Filters */}
          {activeTab === "staff" ? (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-600 text-[10px] font-semibold tracking-widest">CARGO</span>
              {(["manager", "reception", "trainer", "accounting", "admin"] as EmployeeRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                    filterRoles.has(role)
                      ? "bg-lime-400/15 text-lime-400 border border-lime-400/40"
                      : "bg-zinc-800/60 text-gray-500 border border-zinc-700/40 hover:text-gray-300 hover:border-zinc-600"
                  }`}
                >
                  {roleLabels[role]}
                </button>
              ))}
              {filterRoles.size > 0 && (
                <button
                  onClick={() => setFilterRoles(new Set())}
                  className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer ml-1"
                >
                  Limpiar
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 items-start">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-600 text-[10px] font-semibold tracking-widest">ESTADO</span>
                {(["enabled", "debtor", "inactive"] as ClientStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => toggleStatus(st)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                      filterStatuses.has(st)
                        ? "bg-lime-400/15 text-lime-400 border border-lime-400/40"
                        : "bg-zinc-800/60 text-gray-500 border border-zinc-700/40 hover:text-gray-300 hover:border-zinc-600"
                    }`}
                  >
                    {statusLabels[st]}
                  </button>
                ))}
                {filterStatuses.size > 0 && (
                  <button onClick={() => setFilterStatuses(new Set())} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer ml-1">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-600 text-[10px] font-semibold tracking-widest">PLAN</span>
                {plansMock.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => togglePlan(plan.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                      filterPlans.has(plan.id)
                        ? "bg-lime-400/15 text-lime-400 border border-lime-400/40"
                        : "bg-zinc-800/60 text-gray-500 border border-zinc-700/40 hover:text-gray-300 hover:border-zinc-600"
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
                {filterPlans.size > 0 && (
                  <button onClick={() => setFilterPlans(new Set())} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer ml-1">
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results count */}
          <p className="text-gray-600 text-[11px]">
            {activeTab === "staff"
              ? `${filteredStaff.length} resultado${filteredStaff.length !== 1 ? "s" : ""}`
              : `${filteredStudents.length} resultado${filteredStudents.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {activeTab === "staff" ? (
          <div className="flex flex-col gap-4">
            {paginatedStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-600">
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
                    <p className="text-gray-500 text-xs truncate">
                      {emp.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
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
                  <div
                    className={`w-2 h-2 rounded-full ${emp.status === "active" ? "bg-lime-400" : "bg-gray-500"}`}
                  />
                  <i className="ti ti-chevron-right text-gray-600 text-sm group-hover:text-gray-400 transition-colors" />
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
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-600">
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
                    <p className="text-gray-500 text-xs truncate">
                      {cli.email}
                    </p>
                  </div>
                  <span className="text-gray-500 text-[10px] hidden md:block">
                    {plan?.name ?? "Sin plan"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      cli.status === "enabled"
                        ? "bg-green-900/60 text-green-400"
                        : cli.status === "debtor"
                          ? "bg-orange-950/60 text-orange-400"
                          : "bg-zinc-800 text-gray-400"
                    }`}
                  >
                    {statusLabels[cli.status] ?? cli.status}
                  </span>
                  <i className="ti ti-chevron-right text-gray-600 text-sm group-hover:text-gray-400 transition-colors" />
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
      <Dialog
        open={!!selectedEmployee}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent className="max-w-lg bg-stone-950 border-zinc-800 text-white">
          {selectedEmployee && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getInitials(selectedEmployee.fullName)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-white text-base font-extrabold">
                      {editing ? "EDITAR PERSONAL" : selectedEmployee.fullName}
                    </h2>
                    <p className="text-gray-600 text-[10px]">
                      ID: {selectedEmployee.id}
                    </p>
                  </div>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-lg bg-lime-400/10 text-lime-400 text-[10px] font-bold hover:bg-lime-400/20 transition-colors cursor-pointer"
                  >
                    <i className="ti ti-pencil text-xs mr-1" />
                    Editar
                  </button>
                )}
              </div>

              <div className="bg-black/40 rounded-xl p-4 flex flex-col gap-3">
                {editing ? (
                  <>
                    <Field
                      label="NOMBRE"
                      value={editName}
                      onChange={setEditName}
                    />
                    <Field
                      label="EMAIL"
                      value={editEmail}
                      onChange={setEditEmail}
                    />
                    <Field label="DNI" value={editDni} onChange={setEditDni} />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
                        ROL
                      </span>
                      <select
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(e.target.value as EmployeeRole)
                        }
                        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
                      >
                        {(Object.keys(roleLabels) as EmployeeRole[]).map(
                          (r) => (
                            <option key={r} value={r}>
                              {roleLabels[r]}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
                        ESTADO
                      </span>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as EmployeeStatus)
                        }
                        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
                        SUCURSAL
                      </span>
                      <select
                        value={editBranchId}
                        onChange={(e) => setEditBranchId(e.target.value)}
                        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
                      >
                        {branchesMock.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.code} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow label="EMAIL" value={selectedEmployee.email} />
                    <InfoRow label="DNI" value={selectedEmployee.dni ?? "-"} />
                    <InfoRow
                      label="ROL"
                      value={roleLabels[selectedEmployee.role]}
                    />
                    <InfoRow
                      label="ESTADO"
                      value={
                        statusLabels[selectedEmployee.status] ??
                        selectedEmployee.status
                      }
                    />
                    <InfoRow
                      label="SUCURSAL"
                      value={
                        branchesMock.find(
                          (b) => b.id === selectedEmployee.branchId,
                        )?.code ?? "-"
                      }
                    />
                    <InfoRow
                      label="CREADO"
                      value={formatDate(selectedEmployee.createdAt)}
                    />
                  </>
                )}
              </div>

              {editing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditName(selectedEmployee.fullName);
                      setEditEmail(selectedEmployee.email);
                      setEditDni(selectedEmployee.dni ?? "");
                      setEditRole(selectedEmployee.role);
                      setEditStatus(selectedEmployee.status);
                      setEditBranchId(selectedEmployee.branchId);
                    }}
                    className="flex-1 py-3 rounded-xl bg-neutral-900 text-gray-300 text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditEmployee}
                    className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              )}

              <button
                onClick={handleDeleteEmployee}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/30 text-red-400 text-xs font-bold hover:bg-red-950/50 transition-colors cursor-pointer"
              >
                <i className="ti ti-trash text-sm" />
                Eliminar Personal
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Client CRUD */}
      <Dialog open={!!selectedClient} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg bg-stone-950 border-zinc-800 text-white">
          {selectedClient && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getInitials(selectedClient.fullName)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-white text-base font-extrabold">
                      {editing ? "EDITAR ALUMNO" : selectedClient.fullName}
                    </h2>
                    <p className="text-gray-600 text-[10px]">
                      ID: {selectedClient.id}
                    </p>
                  </div>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-lg bg-lime-400/10 text-lime-400 text-[10px] font-bold hover:bg-lime-400/20 transition-colors cursor-pointer"
                  >
                    <i className="ti ti-pencil text-xs mr-1" />
                    Editar
                  </button>
                )}
              </div>

              <div className="bg-black/40 rounded-xl p-4 flex flex-col gap-3">
                {editing ? (
                  <>
                    <Field
                      label="NOMBRE"
                      value={editClientName}
                      onChange={setEditClientName}
                    />
                    <Field
                      label="EMAIL"
                      value={editClientEmail}
                      onChange={setEditClientEmail}
                    />
                    <Field
                      label="DNI"
                      value={editClientDni}
                      onChange={setEditClientDni}
                    />
                    <Field
                      label="TELÉFONO"
                      value={editClientPhone}
                      onChange={setEditClientPhone}
                    />
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
                        ESTADO
                      </span>
                      <select
                        value={editClientStatus}
                        onChange={(e) =>
                          setEditClientStatus(e.target.value as ClientStatus)
                        }
                        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
                      >
                        <option value="enabled">Habilitado</option>
                        <option value="debtor">Deudor</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
                        SUCURSAL
                      </span>
                      <select
                        value={editClientBranchId}
                        onChange={(e) => setEditClientBranchId(e.target.value)}
                        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
                      >
                        {branchesMock.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.code} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow label="EMAIL" value={selectedClient.email} />
                    <InfoRow label="DNI" value={selectedClient.dni} />
                    {selectedClient.phone && (
                      <InfoRow label="TELÉFONO" value={selectedClient.phone} />
                    )}
                    <InfoRow
                      label="ESTADO"
                      value={
                        statusLabels[selectedClient.status] ??
                        selectedClient.status
                      }
                    />
                    <InfoRow
                      label="SUCURSAL"
                      value={
                        branchesMock.find(
                          (b) => b.id === selectedClient.branchId,
                        )?.code ?? "-"
                      }
                    />
                    {(() => {
                      const plan = selectedClient.membership
                        ? plansMock.find(
                            (p) => p.id === selectedClient.membership!.planId,
                          )
                        : undefined;
                      return plan ? (
                        <InfoRow label="PLAN" value={plan.name} />
                      ) : null;
                    })()}
                    {selectedClient.membership && (
                      <InfoRow
                        label="MEMBRESÍA"
                        value={`${statusLabels[selectedClient.membership.status] ?? selectedClient.membership.status} (desde ${formatDate(selectedClient.membership.startDate)})`}
                      />
                    )}
                    <InfoRow
                      label="CREADO"
                      value={formatDate(selectedClient.createdAt)}
                    />
                  </>
                )}
              </div>

              {editing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditClientName(selectedClient.fullName);
                      setEditClientEmail(selectedClient.email);
                      setEditClientDni(selectedClient.dni);
                      setEditClientPhone(selectedClient.phone ?? "");
                      setEditClientStatus(selectedClient.status);
                      setEditClientBranchId(selectedClient.branchId);
                    }}
                    className="flex-1 py-3 rounded-xl bg-neutral-900 text-gray-300 text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditClient}
                    className="flex-1 py-3 rounded-xl bg-lime-400 text-black text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              )}

              <button
                onClick={handleDeleteClient}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/30 text-red-400 text-xs font-bold hover:bg-red-950/50 transition-colors cursor-pointer"
              >
                <i className="ti ti-trash text-sm" />
                Eliminar Alumno
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-lime-400/20 transition-all"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40 last:border-b-0">
      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
        {label}
      </span>
      <span className="text-white text-xs font-bold text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}
