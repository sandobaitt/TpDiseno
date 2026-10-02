import { PageHeader } from "@/components/common/PageHeader";
import { ComposeMessage } from "./ComposeMessage";
import { MessageHistory } from "./MessageHistory";

/** Comunicaciones de secretaría a los alumnos (CU 14): masivas o personalizadas. */
export function CommunicationsCenter() {
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Comunicaciones"
        subtitle="Mandá avisos a todos los alumnos, a una sede, a un plan, a los que deben o a uno en particular. Les llega a la app."
      />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <ComposeMessage />
        <MessageHistory />
      </div>
    </div>
  );
}
