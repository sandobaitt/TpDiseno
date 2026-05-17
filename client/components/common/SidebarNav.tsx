import * as React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { getMockSession } from "@/data/users";

export interface SidebarNavItem {
  id: string;
  label: string;
  iconClassName?: string;
  to?: string;
  href?: string;
  onClick?: () => void;
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
  closeOnItemClick?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function getRoleLabel(role: string) {
  switch (role) {
    case "admin":      return "administrador";
    case "alumno":     return "alumno";
    case "profesor":   return "profesor";
    case "secretario": return "secretario";
    case "secretaria": return "secretario";
    default:           return role;
  }
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
  isCollapsed = false,
  onToggleCollapse,
}: SidebarNavProps) {
  const effectiveSubtitle = React.useMemo(() => {
    if (brandSubtitle) return brandSubtitle;
    const session = getMockSession();
    if (!session?.role) return "PANEL";
    return `PANEL DE ${getRoleLabel(session.role).toUpperCase()}`;
  }, [brandSubtitle]);

  const handleItemClick = (item: SidebarNavItem) => {
    if (item.disabled) return;
    item.onClick?.();
    if (closeOnItemClick) onClose?.();
  };

  const itemBase =
    "relative flex items-center py-2.5 rounded-xl w-full text-left transition-colors duration-150";
  const itemHover = "hover:bg-white/[0.04] cursor-pointer";

  const renderItemInner = (item: SidebarNavItem, isActive: boolean) => {
    const iconColor = isActive ? "text-lime-400" : "text-gray-500";
    const textColor = isActive ? "text-lime-400" : "text-gray-500";
    const textWeight = isActive ? "font-bold" : "font-semibold";

    return (
      <>
        {isActive && (
          <motion.div
            layoutId="nav-active"
            className={`absolute inset-0 rounded-xl bg-white/[0.06] ${!isCollapsed ? "border-l-2 border-lime-400" : "border border-lime-400/30"}`}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />
        )}
        <span
          className={`relative z-10 flex items-center w-full ${
            isCollapsed ? "justify-center" : "gap-2.5 px-3"
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          {item.iconClassName && (
            <i className={`${item.iconClassName} text-lg ${iconColor} shrink-0`} />
          )}
          {!isCollapsed && (
            <span className={`text-xs ${textWeight} tracking-wide uppercase ${textColor} whitespace-nowrap overflow-hidden`}>
              {item.label}
            </span>
          )}
        </span>
      </>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 248 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className={`flex fixed inset-y-0 left-0 z-20 flex-col bg-neutral-900 min-h-screen overflow-hidden border-r border-white/[0.04] transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${className}`}
    >
      {/* Header */}
      <header
        className={`pt-7 pb-5 flex items-center border-b border-white/[0.05] ${
          isCollapsed ? "px-3 justify-center flex-col gap-3" : "px-6 justify-between"
        }`}
      >
        {isCollapsed ? (
          <>
            <span className="text-lime-400 text-lg font-extrabold tracking-tight leading-none">
              {brandTitle.slice(0, 2)}
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-lime-400 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
                aria-label="Expandir sidebar"
              >
                <i className="ti ti-chevron-right text-sm" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight leading-none text-lime-400 whitespace-nowrap">
                {brandTitle}
              </h1>
              {effectiveSubtitle && (
                <p className="mt-1.5 text-[10px] font-semibold tracking-widest text-gray-500 uppercase whitespace-nowrap">
                  {effectiveSubtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
                  aria-label="Contraer sidebar"
                >
                  <i className="ti ti-chevron-left text-sm" />
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="md:hidden text-gray-400 hover:text-white"
                  aria-label="Cerrar menú"
                >
                  <i className="ti ti-x text-2xl" />
                </button>
              )}
            </div>
          </>
        )}
      </header>

      {/* Nav */}
      <nav className={`flex flex-col flex-1 gap-0.5 mt-4 ${isCollapsed ? "px-2" : "px-3"}`}>
        {items.map((item) => {
          const disabledClass = item.disabled ? "opacity-50 pointer-events-none" : "";

          if (item.to) {
            return (
              <NavLink
                key={item.id}
                to={item.to}
                end
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? (isCollapsed ? "" : "pl-[10px]") : itemHover} ${disabledClass}`
                }
                onClick={() => handleItemClick(item)}
              >
                {({ isActive }) => renderItemInner(item, isActive)}
              </NavLink>
            );
          }

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                className={`${itemBase} ${itemHover} ${disabledClass}`}
                onClick={(e) => {
                  if (item.disabled) return;
                  handleItemClick(item);
                  if (item.onClick) e.preventDefault();
                }}
              >
                {renderItemInner(item, false)}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`${itemBase} ${itemHover} ${disabledClass}`}
              onClick={() => handleItemClick(item)}
            >
              {renderItemInner(item, false)}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {footerItems.length > 0 && (
        <footer className={`pb-7 border-t border-white/[0.05] pt-3 ${isCollapsed ? "px-2" : "px-3"}`}>
          <div className="flex flex-col gap-0.5">
            {footerItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${itemBase} ${itemHover} ${item.disabled ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                {renderItemInner(item, false)}
              </button>
            ))}
          </div>
        </footer>
      )}
    </motion.aside>
  );
}
