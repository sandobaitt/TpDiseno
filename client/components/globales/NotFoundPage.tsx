"use client";
import * as React from "react";
import { ErrorContent } from "./ErrorContent";

function NotFoundPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <main className="flex relative flex-col w-full h-screen bg-stone-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://placehold.co/1440x900/1a1a1a/1a1a1a"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 opacity-80 bg-stone-950" />
        <div className="flex relative z-10 flex-col flex-1 h-full">
          <ErrorContent />
        </div>
      </main>
    </>
  );
}

export default NotFoundPage;
