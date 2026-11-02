import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** "danger" para acciones destructivas (baja, descartar, cerrar sesión). */
  tone?: "danger" | "default";
  iconClassName?: string;
}

/**
 * Confirmación accesible (foco atrapado, Esc para cancelar) para acciones
 * importantes o destructivas.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  tone = "default",
  iconClassName,
}: ConfirmDialogProps) {
  const isDanger = tone === "danger";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-2xl border-border bg-card text-foreground">
        <AlertDialogHeader className="items-center text-center sm:items-start sm:text-left">
          {iconClassName && (
            <div
              className={cn(
                "mb-1 flex h-12 w-12 items-center justify-center rounded-xl",
                isDanger
                  ? "bg-danger/10 text-danger"
                  : "bg-primary/10 text-primary",
              )}
            >
              <i className={cn(iconClassName, "text-2xl")} aria-hidden="true" />
            </div>
          )}
          <AlertDialogTitle className="text-lg font-extrabold text-foreground">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="rounded-xl border-input bg-secondary text-foreground hover:bg-accent hover:text-foreground">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "rounded-xl font-bold",
              // Texto oscuro sobre rojo claro: contraste AA.
              isDanger
                ? "bg-danger text-danger-foreground hover:bg-danger/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
