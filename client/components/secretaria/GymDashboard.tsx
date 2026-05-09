"use client";
import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import HeaderPage from "../common/HeaderPage";
import type { SidebarNavItem } from "../common/SidebarNav";
import { useNavigate } from "react-router-dom";
import { clearMockSession } from "@/data/users";

export function GymDashboard() {
	const [sidebarOpen, setSidebarOpen] = React.useState(false);
	const navigate = useNavigate();
	const userRole: "secretaria" = "secretaria";

	const sidebarItems: SidebarNavItem[] = userRole === "secretaria" ? [
		{
			id: "members",
			label: "Gestión de socios",
			iconClassName: "ti ti-users",
			to: "/secretaria",
		},
		{
			id: "checkins",
			label: "Control de asistencia",
			iconClassName: "ti ti-user-check",
			disabled: true,
		},
		{
			id: "billing",
			label: "Cobros y facturación",
			iconClassName: "ti ti-credit-card",
			disabled: true,
		},
		{
			id: "kiosk",
			label: "Kiosco",
			iconClassName: "ti ti-shopping-cart",
			disabled: true,
		},
		{
			id: "comms",
			label: "Comunicaciones",
			iconClassName: "ti ti-message",
			disabled: true,
		},
		{
			id: "schedule",
			label: "Cronogramas",
			iconClassName: "ti ti-calendar",
			disabled: true,
		},
		{
			id: "news",
			label: "Novedades",
			iconClassName: "ti ti-speakerphone",
			disabled: true,
		},
	] : [];

	const footerItems: SidebarNavItem[] = [
		{
			id: "logout",
			label: "Cerrar sesión",
			iconClassName: "ti ti-logout",
			onClick: () => {
				clearMockSession();
				navigate("/login", { replace: true });
			},
		},
	];

	return (
		<>
			<link
				rel="stylesheet"
				href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
			/>
			<div className="flex bg-neutral-900 min-h-screen relative overflow-hidden">
				<Sidebar
					isOpen={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
					items={sidebarItems}
					footerItems={footerItems}
				/>
				
				{/* Overlay for mobile */}
				{sidebarOpen && (
					<div 
						className="fixed inset-0 bg-black/50 z-10 md:hidden" 
						onClick={() => setSidebarOpen(false)}
					/>
				)}

				<main className="flex flex-col flex-1 md:ml-[248px] w-full min-w-0">
					<Header onMenuClick={() => setSidebarOpen(true)} />

					<HeaderPage title="GESTIÓN DE SOCIOS" subtitle="Administración de membresías y estado de cuentas." />

					<StatsCards />
					<MembersTable />
				</main>
			</div>
		</>
	);
}

export default GymDashboard;