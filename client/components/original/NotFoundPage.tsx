"use client";
import * as React from "react";
import { ErrorContent } from "./ErrorContent";
import { SystemFooter } from "./SystemFooter";

function NotFoundPage() {
    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
            />
            <main className="flex overflow-hidden relative flex-col w-full bg-stone-950 min-h-[screen]">
                <div className="absolute inset-0 size-full">
                    <img
                        src="https://placehold.co/1440x900/1a1a1a/1a1a1a"
                        alt=""
                        className="w-full h-full object-cover opacity-30"
                    />
                </div>
                <div className="absolute inset-0 opacity-80 bg-stone-950 size-full" />
                <div className="flex relative z-10 flex-col min-h-[screen]">
                    <ErrorContent />
                    <SystemFooter />
                </div>
            </main>
        </>
    );
}

export default NotFoundPage;