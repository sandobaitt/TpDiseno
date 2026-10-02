import * as React from "react";

const PREFIX = "squatgym_borrador_";

function read<T extends object>(storageKey: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

/**
 * Estado de formulario que se guarda solo en el navegador mientras tiene cambios.
 * Si se corta el Wi-Fi o se recarga la página, lo cargado no se pierde.
 */
export function useDraft<T extends object>(key: string, initial: T) {
  const storageKey = PREFIX + key;
  const [initialValue] = React.useState(initial);
  const [restored, setRestored] = React.useState(
    () => read<T>(storageKey) !== null,
  );
  const [value, setValue] = React.useState<T>(() => {
    const saved = read<T>(storageKey);
    return saved ? { ...initialValue, ...saved } : initialValue;
  });

  const isDirty = React.useMemo(
    () => JSON.stringify(value) !== JSON.stringify(initialValue),
    [value, initialValue],
  );

  React.useEffect(() => {
    try {
      if (isDirty) localStorage.setItem(storageKey, JSON.stringify(value));
      else localStorage.removeItem(storageKey);
    } catch {
      // Sin acceso a localStorage (modo privado, etc.): el formulario sigue funcionando.
    }
  }, [storageKey, value, isDirty]);

  /** Descarta el borrador y vuelve al estado inicial. */
  const clear = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignorado a propósito
    }
    setValue(initialValue);
    setRestored(false);
  }, [storageKey, initialValue]);

  return { value, setValue, isDirty, restored, clear };
}

/** Borradores de diálogos (se abren y cierran): leer, guardar y descartar a mano. */
export const dialogDraft = {
  load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Sin acceso a localStorage: el formulario sigue funcionando.
    }
  },
  clear(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignorado a propósito
    }
  },
};
