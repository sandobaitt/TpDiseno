"use client";
import * as React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MemberRegistration from "./MemberRegistration";

function GymDashboard() {
    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
            />
            <div className="flex bg-neutral-900 min-h-screen">
                <Sidebar />
                <div className="flex flex-col flex-1 bg-neutral-900 min-h-screen">
                    <Header />
                    <MemberRegistration />
                </div>
            </div>
        </>
    );
}

export default GymDashboard;