"use client";
import * as React from "react";
import FileUpload from "../globales/FileUpload";

function MedicalCompliance() {
  const [isAccepted, setIsAccepted] = React.useState(false);

  return (
    <section className="p-7 rounded-xl bg-stone-900">
      <header className="flex gap-2.5 items-center mb-6">
        <div className="flex justify-center items-center w-7 h-7">
          <i className="ti ti-heart-rate-monitor text-2xl text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-white">Cumplimiento Médico</h2>
      </header>

      <div className="mb-5">
        <h3 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          CERTIFICADO DE APTITUD FÍSICA
        </h3>
        <FileUpload />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          DECLARACIÓN JURADA DIGITAL
        </h3>

        <article className="p-4 mb-4 rounded-xl bg-zinc-800">
          <p className="mb-2.5 text-xs leading-relaxed text-gray-300">
            El abajo firmante declara bajo juramento que los datos personales y
            de salud consignados son verdaderos.
          </p>
          <p className="text-xs leading-relaxed text-gray-300">
            Declaro no padecer enfermedades preexistentes que impidan la
            realización de actividad física de alta intensidad, eximiendo a
            SquatGym de toda responsabilidad ante eventos adversos derivados de
            omisiones en esta declaración.
          </p>
        </article>

        <label className="flex gap-2.5 items-start cursor-pointer">
          <input
            type="checkbox"
            checked={isAccepted}
            onChange={(e) => setIsAccepted(e.target.checked)}
            className="mt-px w-4 h-4 rounded border border-solid bg-zinc-800 border-neutral-700 flex-shrink-0 appearance-none checked:bg-lime-400 checked:border-lime-400"
          />
          <span className="text-xs leading-normal text-gray-300">
            El socio acepta la Declaración Jurada y Reglamento Interno.
          </span>
        </label>
      </div>
    </section>
  );
}

export default MedicalCompliance;
