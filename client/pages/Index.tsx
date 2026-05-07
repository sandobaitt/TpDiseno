export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-squat-dark font-inter">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-squat-dark/90 backdrop-blur-md shadow-[0_20px_40px_0_rgba(0,0,0,0.40)]">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <span className="font-jakarta font-black text-2xl italic tracking-[-1.2px] uppercase text-squat-green">
            SQUATGYM
          </span>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-jakarta font-bold text-base text-white/70 hover:text-white transition-colors tracking-[-0.4px]">
              Características
            </a>
            <a href="#plans" className="font-jakarta font-bold text-base text-white/70 hover:text-white transition-colors tracking-[-0.4px]">
              Planes
            </a>
            <a href="#locations" className="font-jakarta font-bold text-base text-white/70 hover:text-white transition-colors tracking-[-0.4px]">
              Sedes
            </a>
          </nav>
          <button className="font-jakarta font-bold text-base text-squat-ink px-6 py-2 rounded-[6px] bg-squat-green shadow-[0_10px_20px_0_rgba(149,253,0,0.20)] hover:brightness-105 transition-all">
            Login
          </button>
        </div>
      </header>

      <main className="flex flex-col flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center min-h-[calc(100svh-80px)] overflow-hidden">
          {/* Background image */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/7d5b8f3b4e93332508d1159b37a2fec85dbc74f1?width=2560"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-squat-dark via-squat-dark/80 to-transparent" />
          {/* Neon aura */}
          <div
            className="absolute rounded-xl mix-blend-screen pointer-events-none"
            style={{
              width: 384,
              height: 384,
              background: "rgba(149,253,0,0.05)",
              filter: "blur(60px)",
              left: "25%",
              top: "25%",
            }}
          />

          {/* Hero content */}
          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-24 flex flex-col items-start gap-6">
            <div className="max-w-[768px]">
              <h1 className="font-jakarta font-extrabold text-5xl sm:text-7xl lg:text-[96px] leading-none tracking-[-4.8px] text-white mb-6">
                ENTRENA SIN{" "}
                <span className="text-squat-green">LÍMITES</span>{" "}
                EN SQUATGYM
              </h1>
              <p className="font-inter font-medium text-lg sm:text-xl text-squat-muted leading-7 max-w-[576px] pb-4">
                Gestión digital completa, acceso multisucursal y los mejores planes para tu transformación.
              </p>
              <button className="mt-2 font-jakarta font-extrabold text-xl text-squat-ink px-10 py-4 rounded-[6px] bg-squat-green shadow-[0_20px_40px_0_rgba(0,0,0,0.40)] hover:brightness-105 transition-all">
                Inscribirme Ahora
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-squat-dark-alt py-24">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-16">
            <h2 className="font-jakarta font-extrabold text-4xl sm:text-5xl tracking-[-2.4px] uppercase">
              <span className="text-white">RENDIMIENTO </span>
              <span className="text-squat-green">TÉCNICO</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="relative flex flex-col gap-4 p-8 rounded-[8px] bg-squat-card overflow-hidden">
                <div className="flex items-center justify-center w-14 h-14 rounded-[6px] bg-squat-card-dark shadow-[0_10px_20px_0_rgba(0,0,0,0.30)] shrink-0">
                  <svg width="19" height="28" viewBox="0 0 19 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 27.5C1.8125 27.5 1.22396 27.2552 0.734375 26.7656C0.244792 26.276 0 25.6875 0 25V2.5C0 1.8125 0.244792 1.22396 0.734375 0.734375C1.22396 0.244792 1.8125 0 2.5 0H15C15.6875 0 16.276 0.244792 16.7656 0.734375C17.2552 1.22396 17.5 1.8125 17.5 2.5V6.375C17.875 6.52083 18.1771 6.75 18.4062 7.0625C18.6354 7.375 18.75 7.72917 18.75 8.125V10.625C18.75 11.0208 18.6354 11.375 18.4062 11.6875C18.1771 12 17.875 12.2292 17.5 12.375V25C17.5 25.6875 17.2552 26.276 16.7656 26.7656C16.276 27.2552 15.6875 27.5 15 27.5H2.5ZM2.5 25H15V2.5H2.5V25ZM2.5 25V2.5V25ZM8.75 6.25C9.10417 6.25 9.40104 6.13021 9.64062 5.89062C9.88021 5.65104 10 5.35417 10 5C10 4.64583 9.88021 4.34896 9.64062 4.10938C9.40104 3.86979 9.10417 3.75 8.75 3.75C8.39583 3.75 8.09896 3.86979 7.85938 4.10938C7.61979 4.34896 7.5 4.64583 7.5 5C7.5 5.35417 7.61979 5.65104 7.85938 5.89062C8.09896 6.13021 8.39583 6.25 8.75 6.25Z" fill="#95FD00"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <h3 className="font-jakarta font-bold text-2xl text-white leading-8 tracking-[-0.6px]">
                    Autogestión Total
                  </h3>
                </div>
                <p className="font-inter text-sm text-squat-muted leading-[22.75px]">
                  Control absoluto desde tu dispositivo. Pagos remotos ágiles y estado de cuenta en tiempo real, sin fricciones.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-squat-green/5 to-transparent pointer-events-none" />
              </div>

              {/* Card 2 */}
              <div className="relative flex flex-col gap-4 p-8 rounded-[8px] bg-squat-card overflow-hidden">
                <div className="flex items-center justify-center w-14 h-14 rounded-[6px] bg-squat-card-dark shadow-[0_10px_20px_0_rgba(0,0,0,0.30)] shrink-0">
                  <svg width="23" height="25" viewBox="0 0 23 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 25C1.8125 25 1.22396 24.7552 0.734375 24.2656C0.244792 23.776 0 23.1875 0 22.5V5C0 4.3125 0.244792 3.72396 0.734375 3.23438C1.22396 2.74479 1.8125 2.5 2.5 2.5H3.75V0H6.25V2.5H16.25V0H18.75V2.5H20C20.6875 2.5 21.276 2.74479 21.7656 3.23438C22.2552 3.72396 22.5 4.3125 22.5 5V22.5C22.5 23.1875 22.2552 23.776 21.7656 24.2656C21.276 24.7552 20.6875 25 20 25H2.5ZM2.5 22.5H20V10H2.5V22.5ZM2.5 7.5H20V5H2.5V7.5ZM2.5 7.5V5V7.5ZM11.25 15C10.8958 15 10.599 14.8802 10.3594 14.6406C10.1198 14.401 10 14.1042 10 13.75C10 13.3958 10.1198 13.099 10.3594 12.8594C10.599 12.6198 10.8958 12.5 11.25 12.5C11.6042 12.5 11.901 12.6198 12.1406 12.8594C12.3802 13.099 12.5 13.3958 12.5 13.75C12.5 14.1042 12.3802 14.401 12.1406 14.6406C11.901 14.8802 11.6042 15 11.25 15ZM6.25 15C5.89583 15 5.59896 14.8802 5.35938 14.6406C5.11979 14.401 5 14.1042 5 13.75C5 13.3958 5.11979 13.099 5.35938 12.8594C5.59896 12.6198 5.89583 12.5 6.25 12.5C6.60417 12.5 6.90104 12.6198 7.14062 12.8594C7.38021 13.099 7.5 13.3958 7.5 13.75C7.5 14.1042 7.38021 14.401 7.14062 14.6406C6.90104 14.8802 6.60417 15 6.25 15ZM16.25 15C15.8958 15 15.599 14.8802 15.3594 14.6406C15.1198 14.401 15 14.1042 15 13.75C15 13.3958 15.1198 13.099 15.3594 12.8594C15.599 12.6198 15.8958 12.5 16.25 12.5C16.6042 12.5 16.901 12.6198 17.1406 12.8594C17.3802 13.099 17.5 13.3958 17.5 13.75C17.5 14.1042 17.3802 14.401 17.1406 14.6406C16.901 14.8802 16.6042 15 16.25 15ZM11.25 20C10.8958 20 10.599 19.8802 10.3594 19.6406C10.1198 19.401 10 19.1042 10 18.75C10 18.3958 10.1198 18.099 10.3594 17.8594C10.599 17.6198 10.8958 17.5 11.25 17.5C11.6042 17.5 11.901 17.6198 12.1406 17.8594C12.3802 18.099 12.5 18.3958 12.5 18.75C12.5 19.1042 12.3802 19.401 12.1406 19.6406C11.901 19.8802 11.6042 20 11.25 20ZM6.25 20C5.89583 20 5.59896 19.8802 5.35938 19.6406C5.11979 19.401 5 19.1042 5 18.75C5 18.3958 5.11979 18.099 5.35938 17.8594C5.59896 17.6198 5.89583 17.5 6.25 17.5C6.60417 17.5 6.90104 17.6198 7.14062 17.8594C7.38021 18.099 7.5 18.3958 7.5 18.75C7.5 19.1042 7.38021 19.401 7.14062 19.6406C6.90104 19.8802 6.60417 20 6.25 20ZM16.25 20C15.8958 20 15.599 19.8802 15.3594 19.6406C15.1198 19.401 15 19.1042 15 18.75C15 18.3958 15.1198 18.099 15.3594 17.8594C15.599 17.6198 15.8958 17.5 16.25 17.5C16.6042 17.5 16.901 17.6198 17.1406 17.8594C17.3802 18.099 17.5 18.3958 17.5 18.75C17.5 19.1042 17.3802 19.401 17.1406 19.6406C16.901 19.8802 16.6042 20 16.25 20Z" fill="#95FD00"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <h3 className="font-jakarta font-bold text-2xl text-white leading-8 tracking-[-0.6px]">
                    Cronograma Dinámico
                  </h3>
                </div>
                <p className="font-inter text-sm text-squat-muted leading-[22.75px]">
                  Visualiza tus clases sincronizadas con tu plan activo. Planifica tu semana con precisión milimétrica.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-squat-green/5 to-transparent pointer-events-none" />
              </div>

              {/* Card 3 */}
              <div className="relative flex flex-col gap-4 p-8 rounded-[8px] bg-squat-card overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center w-14 h-14 rounded-[6px] bg-squat-card-dark shadow-[0_10px_20px_0_rgba(0,0,0,0.30)] shrink-0">
                  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 22.5L7.5 19.875L1.6875 22.125C1.27083 22.2917 0.885417 22.2448 0.53125 21.9844C0.177083 21.724 0 21.375 0 20.9375V3.4375C0 3.16667 0.078125 2.92708 0.234375 2.71875C0.390625 2.51042 0.604167 2.35417 0.875 2.25L7.5 0L15 2.625L20.8125 0.375C21.2292 0.208333 21.6146 0.255208 21.9688 0.515625C22.3229 0.776042 22.5 1.125 22.5 1.5625V19.0625C22.5 19.3333 22.4219 19.5729 22.2656 19.7812C22.1094 19.9896 21.8958 20.1458 21.625 20.25L15 22.5ZM13.75 19.4375V4.8125L8.75 3.0625V17.6875L13.75 19.4375ZM16.25 19.4375L20 18.1875V3.375L16.25 4.8125V19.4375ZM2.5 19.125L6.25 17.6875V3.0625L2.5 4.3125V19.125ZM16.25 4.8125V19.4375V4.8125ZM6.25 3.0625V17.6875V3.0625Z" fill="#95FD00"/>
                  </svg>
                </div>
                <div className="pt-4">
                  <h3 className="font-jakarta font-bold text-2xl text-white leading-8 tracking-[-0.6px]">
                    Acceso Multisucursal
                  </h3>
                </div>
                <p className="font-inter text-sm text-squat-muted leading-[22.75px]">
                  Entrena en cualquier sede de la red SquatGym. Tu pasaporte universal a instalaciones de alto rendimiento.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-squat-green/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-squat-dark py-24">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-16">
            <div className="flex flex-col items-end">
              <span className="font-jakarta font-extrabold text-4xl text-white text-right tracking-[-1.8px] uppercase leading-10">
                EVIDENCIA
              </span>
              <span className="font-jakarta font-extrabold text-5xl text-squat-green text-right tracking-[-1.8px] uppercase leading-[48px]">
                CINÉTICA
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Testimonial 1 */}
              <div className="flex flex-col gap-8 p-10 rounded-[8px] bg-squat-testimonial">
                <p className="font-jakarta font-bold text-2xl text-white leading-8 tracking-[-0.6px]">
                  "La app de autogestión es un cambio de juego. Reservo mis clases y pago mi mensualidad en segundos. Más tiempo para levantar peso, menos tiempo en recepción."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-[rgba(64,74,52,0.15)] bg-squat-card-dark overflow-hidden shrink-0">
                    <img
                      src="https://api.builder.io/api/v1/image/assets/TEMP/b095bfb80e6a834bfba7d4e0f0efabdea8357424?width=88"
                      alt="Marcos V."
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-sm text-white uppercase tracking-[0.35px] leading-5">
                      MARCOS V.
                    </p>
                    <p className="font-inter text-xs text-squat-muted leading-4">
                      Atleta Híbrido
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex flex-col gap-8 p-10 rounded-[8px] bg-squat-dark-alt shadow-[0_20px_40px_0_rgba(0,0,0,0.40)]">
                <p className="font-jakarta font-bold text-2xl text-white leading-8 tracking-[-0.6px]">
                  "Poder entrenar en la sede del centro los días de semana y en la de mi barrio los sábados es el nivel de flexibilidad que necesitaba. El sistema multisucursal funciona impecable."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-[rgba(64,74,52,0.15)] bg-squat-card-dark overflow-hidden shrink-0">
                    <img
                      src="https://api.builder.io/api/v1/image/assets/TEMP/d175c214b2a995ed4727c953305edca8b43fda7b?width=88"
                      alt="Sofía L."
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-jakarta font-bold text-sm text-white uppercase tracking-[0.35px] leading-5">
                      SOFÍA L.
                    </p>
                    <p className="font-inter text-xs text-squat-muted leading-4">
                      Powerlifter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-squat-dark border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="font-jakarta font-black text-xl italic tracking-[-1px] uppercase text-white">
            SQUATGYM
          </span>
          <nav className="flex flex-wrap justify-center items-center gap-6">
            {["PRIVACIDAD", "TÉRMINOS", "CONTACTO", "CARRERAS"].map((link) => (
              <a
                key={link}
                href="#"
                className="font-inter text-xs text-white/40 hover:text-white/70 transition-colors tracking-[1.2px] uppercase"
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="font-inter text-xs text-white/40 tracking-[1.2px] uppercase text-center sm:text-right">
            © 2024 SQUATGYM EL LABORATORIO CINÉTICO. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
