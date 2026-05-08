"use client";
import * as React from "react";
import { SidebarNav, type SidebarNavItem } from "../common/SidebarNav";

interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
    items: SidebarNavItem[];
    footerItems?: SidebarNavItem[];
}

export function Sidebar({
    className = "",
    isOpen = false,
    onClose,
    items,
    footerItems = [],
}: SidebarProps) {
    return (
        <SidebarNav
            className={className}
            isOpen={isOpen}
            onClose={onClose}
            brandTitle="SQUATGYM"
            brandSubtitle="PANEL DE SECRETARÍA"
            items={items}
            footerItems={footerItems}
        />
    );
}