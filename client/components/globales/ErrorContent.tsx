import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getMockSession, getPostLoginPath } from "@/data/users";
import { ErrorBadge } from "./ErrorBadge";
import { ActionButton } from "./ActionButton";

export function ErrorContent() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    const session = getMockSession();
    navigate(session ? getPostLoginPath(session.role) : "/");
  };

  const handleRetryClick = () => {
    window.location.reload();
  };

  return (
    <section className="flex flex-col flex-1 justify-center items-center px-6">
      <div className="flex flex-col items-center">
        <h1 className="italic font-black tracking-normal leading-none text-white text-[220px] max-md:text-9xl max-sm:text-8xl">
          404
        </h1>

        <div className="mt-6 mb-8">
          <ErrorBadge>ERROR DE SISTEMA</ErrorBadge>
        </div>

        <header className="mb-5 text-5xl font-black tracking-normal leading-none text-center text-white uppercase max-md:text-4xl max-sm:text-3xl">
          <h2 className="italic font-black text-white">RUTA FUERA DE</h2>
          <h2 className="italic font-black text-lime-400">LÍMITES</h2>
        </header>

        <p className="mb-12 text-base leading-relaxed text-center max-w-[480px] text-neutral-400 max-sm:text-sm">
          La página que buscás no existe o cambió de lugar. Volvé al inicio
          para seguir.
        </p>

        <div className="flex flex-row gap-4 items-center max-sm:flex-col max-sm:w-full">
          <ActionButton
            variant="primary"
            icon="ti-home"
            onClick={handleHomeClick}
          >
            VOLVER AL INICIO
          </ActionButton>
          <ActionButton
            variant="secondary"
            icon="ti-refresh"
            onClick={handleRetryClick}
          >
            REINTENTAR CARGA
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
