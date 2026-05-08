import * as React from "react";
import { NavLink } from "react-router-dom";

export interface SidebarNavItem {
  id: string;
  label: string;
  iconClassName?: string; // ej: "ti ti-users"
  to?: string; // react-router
  href?: string; // link externo
  onClick?: () => void; // acción custom
  disabled?: boolean;
}

interface SidebarNavProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  brandTitle: string;
  brandSubtitle?: string;
  items: SidebarNavItem[];
  footerItems?: SidebarNavItem[];
  /** Cierra el sidebar al clickear un item (útil en mobile) */
  closeOnItemClick?: boolean;
}

function ItemContent({
  item,
  active,
}: {
  item: SidebarNavItem;
  active: boolean;
}) {
  const iconColor = active ? "text-lime-400" : "text-gray-500";
  const textColor = active ? "text-lime-400" : "text-gray-500";
  const textWeight = active ? "font-bold" : "font-semibold";

  return (
    <>
      {item.iconClassName && (
        <i className={`${item.iconClassName} text-lg ${iconColor}`} />
      )}
      <span
        className={`text-xs ${textWeight} tracking-wide uppercase ${textColor}`}
      >
        {item.label}
      </span>
    </>
  );
}

export function SidebarNav({
  className = "",
  isOpen = false,
  onClose,
  brandTitle,
  brandSubtitle,
  items,
  footerItems = [],
  closeOnItemClick = true,
}: SidebarNavProps) {
  const baseAside = `flex fixed inset-y-0 left-0 z-20 flex-col bg-neutral-900 min-h-screen w-[248px] transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${className}`;

  const itemBase =
    "flex gap-2.5 items-center px-3 py-2.5 rounded-lg w-full text-left";
  const itemHover = "hover:bg-stone-900";
  const itemActive = "bg-stone-900";

  const handleItemClick = (item: SidebarNavItem) => {
    if (item.disabled) return;
    item.onClick?.();
    if (closeOnItemClick) onClose?.();
  };

  return (
    <aside className={baseAside}>
      <header className="px-6 pt-7 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-normal leading-none text-lime-400">
            {brandTitle}
          </h1>
          {brandSubtitle && (
            <p className="mt-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              {brandSubtitle}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <i className="ti ti-x text-2xl" />
          </button>
        )}
      </header>

      <nav className="flex flex-col flex-1 gap-1 px-3 mt-2">
        {items.map((item) => {
          const commonProps = {
            className: ({ isActive }: { isActive: boolean }) =>
              `${itemBase} ${isActive ? itemActive : itemHover} ${item.disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`,
            onClick: () => handleItemClick(item),
          };

          if (item.to) {
            return (
              <NavLink key={item.id} to={item.to} end {...commonProps}>
                {({ isActive }) => (
                  <ItemContent item={item} active={isActive} />
                )}
              </NavLink>
            );
          }

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                className={`${itemBase} ${itemHover} ${item.disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
                onClick={(e) => {
                  if (item.disabled) return;
                  // Si además hay onClick, lo ejecutamos sin impedir navegación.
                  handleItemClick(item);
                  if (item.onClick) e.preventDefault();
                }}
              >
                <ItemContent item={item} active={false} />
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`${itemBase} ${itemHover} ${item.disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
              onClick={() => handleItemClick(item)}
            >
              <ItemContent item={item} active={false} />
            </button>
          );
        })}
      </nav>

      {footerItems.length > 0 && (
        <footer className="px-3 pb-7">
          <div className="flex flex-col gap-1">
            {footerItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${itemBase} ${itemHover} ${item.disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
                onClick={() => handleItemClick(item)}
              >
                <ItemContent item={item} active={false} />
              </button>
            ))}
          </div>
        </footer>
      )}
    </aside>
  );
}

