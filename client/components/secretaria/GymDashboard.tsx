"use client";
import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import HeaderPage from "../common/HeaderPage";

export function GymDashboard() {
	const [sidebarOpen, setSidebarOpen] = React.useState(false);

	return (
		<>
			<link
				rel="stylesheet"
				href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
			/>
			<div className="flex bg-neutral-900 min-h-screen relative overflow-hidden">
				<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
				
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