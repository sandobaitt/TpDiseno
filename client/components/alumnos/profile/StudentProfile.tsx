import * as React from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SectionCard } from "@/components/common/SectionCard";
import { DetailList } from "@/components/common/DetailList";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CheckoutDialog } from "@/components/alumnos/payments/CheckoutDialog";
import { getPlan } from "@/data/plans";
import { getMockSession } from "@/data/users";
import { getRecordChecklist } from "@/domain/enrollment";
import { studentCapabilities } from "@/domain/permissions";
import { todayISO } from "@/lib/dates";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import {
  selectAccess,
  selectAccount,
  selectClientAttendance,
  selectClientPayments,
} from "@/store/selectors";
import { ProfileHeader } from "./ProfileHeader";
import { AccountCard } from "./AccountCard";
import { AccessCard } from "./AccessCard";
import { RecordChecklistCard } from "./RecordChecklistCard";
import { PersonalDataSection } from "./PersonalDataSection";
import { HealthSection } from "./HealthSection";
import { PaymentsSection } from "./PaymentsSection";
import { HistorySection } from "./HistorySection";
import { StudentEditDialog } from "./StudentEditDialog";
import { HealthEditDialog } from "./HealthEditDialog";
import { AttachmentDialog } from "./AttachmentDialog";
import { RestrictDialog } from "./RestrictDialog";

type TabId = "resumen" | "datos" | "salud" | "pagos" | "historial";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "resumen", label: "Resumen", icon: "ti-layout-grid" },
  { id: "datos", label: "Datos", icon: "ti-id" },
  { id: "salud", label: "Salud y documentos", icon: "ti-heartbeat" },
  { id: "pagos", label: "Pagos", icon: "ti-receipt" },
  { id: "historial", label: "Historial", icon: "ti-history" },
];

interface StudentProfileProps {
  clientId: string;
  /** Lista de alumnos del rol (para volver). */
  basePath: string;
}

/** Estado de navegación para abrir el cobro apenas se entra (después de inscribir). */
export interface StudentProfileLocationState {
  openCheckout?: boolean;
}

/**
 * Ficha única del alumno: estado de cuenta, habilitación, datos, legajo
 * médico, pagos e historial. Lo que se puede hacer depende del rol.
 */
export function StudentProfile({ clientId, basePath }: StudentProfileProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [dialog, setDialog] = React.useState<
    | "datos"
    | "salud"
    | "documento"
    | "cobro"
    | "restringir"
    | "quitarRestriccion"
    | null
  >(null);

  const caps = studentCapabilities(getMockSession()?.role);

  // "Registrar e ir a cobrar": la ficha se abre con el cobro listo.
  React.useEffect(() => {
    const navState = location.state as StudentProfileLocationState | null;
    if (navState?.openCheckout && caps.collect) {
      setDialog("cobro");
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const requested = params.get("tab");
  const tab: TabId = TABS.some((t) => t.id === requested)
    ? (requested as TabId)
    : "resumen";
  const client = state.clients.find((c) => c.id === clientId);

  const backLink = (
    <Button
      asChild
      variant="ghost"
      className="self-start rounded-xl text-gray-300"
    >
      <Link to={basePath}>
        <i className="ti ti-arrow-left text-base" aria-hidden="true" />
        Volver a alumnos
      </Link>
    </Button>
  );

  if (!client) {
    return (
      <div className="flex flex-col gap-4 px-7 pb-7 max-sm:px-4">
        {backLink}
        <EmptyState
          icon="ti-user-question"
          title="No encontramos ese alumno"
          description="Puede que el enlace esté mal escrito. Buscalo desde la lista de alumnos."
        />
      </div>
    );
  }

  const today = todayISO();
  const plan = getPlan(client.planId);
  const account = selectAccount(state, client, today);
  const access = selectAccess(state, client, undefined, today);
  const payments = selectClientPayments(state, client.id);
  const paymentIds = new Set(payments.map((p) => p.id));
  const activity = state.activity.filter(
    (entry) =>
      (entry.entity === "alumno" && entry.entityId === client.id) ||
      (entry.entity === "pago" && paymentIds.has(entry.entityId)),
  );
  const canCollect = caps.collect && client.status === "active";

  function goToTab(id: TabId) {
    setParams(id === "resumen" ? {} : { tab: id }, { replace: true });
  }

  function collect() {
    setDialog("cobro");
  }

  function reviewDocument(attachmentId: string) {
    actions.reviewAttachment(client!.id, attachmentId);
    toast.success("Documento marcado como revisado.");
  }

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      {backLink}

      <ProfileHeader
        client={client}
        status={account.status}
        plan={plan}
        actions={
          <>
            {caps.editData && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog("datos")}
                className="rounded-xl"
              >
                <i className="ti ti-pencil text-base" aria-hidden="true" />
                Editar datos
              </Button>
            )}
            {canCollect && account.owedAmount > 0 && (
              <Button
                type="button"
                onClick={collect}
                className="rounded-xl font-bold"
              >
                <i className="ti ti-cash text-base" aria-hidden="true" />
                Cobrar
              </Button>
            )}
          </>
        }
      />

      <SegmentedTabs<TabId>
        items={TABS}
        value={tab}
        onChange={goToTab}
        label="Secciones de la ficha"
      />

      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === "resumen" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <AccountCard
              account={account}
              onCollect={canCollect ? collect : undefined}
            />
            <AccessCard
              client={client}
              plan={plan}
              access={access}
              onRestrict={
                caps.restrict ? () => setDialog("restringir") : undefined
              }
              onUnrestrict={
                caps.restrict ? () => setDialog("quitarRestriccion") : undefined
              }
            />
            <RecordChecklistCard
              items={getRecordChecklist(client, today)}
              onOpenHealth={() => goToTab("salud")}
            />
            <SectionCard title="Contacto" icon="ti-address-book">
              <DetailList
                items={[
                  { label: "Celular", value: client.phone ?? "Sin cargar" },
                  { label: "Email", value: client.email },
                  {
                    label: "Contacto de emergencia",
                    value: client.health?.emergencyContact ?? "Sin cargar",
                  },
                  ...(client.guardian
                    ? [
                        {
                          label: "Adulto responsable",
                          value: `${client.guardian.fullName} (${client.guardian.relationship.toLowerCase()}) · ${client.guardian.phone}`,
                        },
                      ]
                    : []),
                ]}
              />
            </SectionCard>
          </div>
        )}

        {tab === "datos" && (
          <PersonalDataSection
            client={client}
            plan={plan}
            onEdit={caps.editData ? () => setDialog("datos") : undefined}
          />
        )}

        {tab === "salud" && (
          <HealthSection
            client={client}
            onEditHealth={caps.editData ? () => setDialog("salud") : undefined}
            onAddDocument={
              caps.manageDocuments ? () => setDialog("documento") : undefined
            }
            onReviewDocument={caps.manageDocuments ? reviewDocument : undefined}
          />
        )}

        {tab === "pagos" && (
          <PaymentsSection clientName={client.fullName} payments={payments} />
        )}

        {tab === "historial" && (
          <HistorySection
            attendance={selectClientAttendance(state, client.id)}
            activity={activity}
          />
        )}
      </div>

      {caps.editData && (
        <>
          <StudentEditDialog
            client={client}
            open={dialog === "datos"}
            onOpenChange={(open) => setDialog(open ? "datos" : null)}
          />
          <HealthEditDialog
            client={client}
            open={dialog === "salud"}
            onOpenChange={(open) => setDialog(open ? "salud" : null)}
          />
        </>
      )}
      {canCollect && (
        <CheckoutDialog
          clientId={dialog === "cobro" ? client.id : null}
          onClose={() => setDialog(null)}
        />
      )}
      {caps.restrict && (
        <>
          <RestrictDialog
            client={client}
            open={dialog === "restringir"}
            onOpenChange={(open) => setDialog(open ? "restringir" : null)}
          />
          <ConfirmDialog
            open={dialog === "quitarRestriccion"}
            onOpenChange={(open) =>
              setDialog(open ? "quitarRestriccion" : null)
            }
            title="¿Quitar la restricción de acceso?"
            description={`${client.fullName} va a poder volver a ingresar, salvo que tenga una deuda que bloquee el acceso.`}
            confirmLabel="Quitar restricción"
            iconClassName="ti ti-lock-open"
            onConfirm={() => {
              actions.unrestrictClient(client.id);
              toast.success("Restricción quitada.");
            }}
          />
        </>
      )}
      {caps.manageDocuments && (
        <AttachmentDialog
          client={client}
          open={dialog === "documento"}
          onOpenChange={(open) => setDialog(open ? "documento" : null)}
        />
      )}
    </div>
  );
}
