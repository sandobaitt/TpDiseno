import * as React from "react";

/**
 * Estado que se guarda en el navegador (preferencias de cada usuario).
 * Si el navegador no deja guardar, la pantalla sigue funcionando igual.
 */
export function useStoredState<T>(key: string, initial: T) {
  const storageKey = `squatgym_${key}`;
  const [value, setValue] = React.useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...initial, ...(JSON.parse(raw) as T) } : initial;
    } catch {
      return initial;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Sin acceso a localStorage: se usa solo en memoria.
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
