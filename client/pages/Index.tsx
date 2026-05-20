import { Link } from "react-router-dom";
import { plansMock } from "@/data/plans";
import { branchesMock } from "@/data/branches";

const activePlans = plansMock.filter((p) => p.status === "active");

const planFeatures: Record<string, string[]> = {
  pl_001: ["Musculación ilimitada", "Todas las clases grupales", "Acceso multisucursal", "Vestuarios y WiFi"],
  pl_002: ["Sala de musculación", "Equipamiento completo", "Vestuarios y WiFi", "Horario extendido"],
  pl_003: ["Clases de Crossfit", "Instructores especializados", "Cupos limitados garantizados", "Vestuarios y WiFi"],
};

const featuredPlanId = "pl_001";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-squat-dark font-inter">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-squat-dark/90 backdrop-blur-md border-b border-white/[0.05]">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <span className="font-jakarta font-black text-2xl italic tracking-[-1.2px] uppercase text-squat-green">
            SQUATGYM
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {[["#features", "Características"], ["#plans", "Planes"], ["#locations", "Sedes"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="font-jakarta font-bold text-base text-white/60 hover:text-white transition-colors tracking-[-0.4px]"
              >
                {label}
              </a>
            ))}
          </nav>
          <Link
            to="/login"
            className="font-jakarta font-bold text-sm text-squat-ink px-5 py-2.5 rounded-xl bg-squat-green shadow-[0_0_20px_rgba(149,253,0,0.20)] hover:brightness-105 active:scale-[0.98] transition-all duration-150"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <main className="flex flex-col flex-1 pt-20">
        {/* ── Hero ── */}
        <section className="relative flex items-center justify-center min-h-[calc(100svh-80px)] overflow-hidden">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/7d5b8f3b4e93332508d1159b37a2fec85dbc74f1?width=2560"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-squat-dark via-squat-dark/70 to-transparent" />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 500,
              height: 500,
              background: "radial-gradient(circle, rgba(149,253,0,0.07) 0%, transparent 70%)",
              left: "20%",
              top: "20%",
            }}
          />

          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-24 flex flex-col items-start gap-8">
            <div className="max-w-[760px]">
              <p className="font-jakarta font-bold text-squat-green text-sm tracking-[3px] uppercase mb-4">
                El Laboratorio Cinético
              </p>
              <h1 className="font-jakarta font-extrabold text-5xl sm:text-7xl lg:text-[96px] leading-[1.3] tracking-[-4px] text-white mb-6">
                ENTRENA SIN{" "}
                <span className="text-squat-green">LÍMITES</span>{" "}
                EN SQUATGYM
              </h1>
              <p className="font-inter text-lg sm:text-xl text-squat-muted leading-7 max-w-[560px]">
                Gestión digital completa, acceso multisucursal y los mejores
                planes para tu transformación.
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
            <div className="w-px h-12 bg-white" />
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="bg-squat-dark-alt py-24">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-16">
            <div>
              <p className="font-jakarta font-bold text-squat-green text-xs tracking-[3px] uppercase mb-3">
                Por qué elegirnos
              </p>
              <h2 className="font-jakarta font-extrabold text-4xl sm:text-5xl tracking-[-2.4px] uppercase">
                <span className="text-white">RENDIMIENTO </span>
                <span className="text-squat-green">TÉCNICO</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "ti-device-mobile",
                  title: "Autogestión Total",
                  desc: "Control absoluto desde tu dispositivo. Pagos remotos ágiles y estado de cuenta en tiempo real, sin fricciones.",
                },
                {
                  icon: "ti-calendar-event",
                  title: "Cronograma Dinámico",
                  desc: "Visualizá tus clases sincronizadas con tu plan activo. Planificá tu semana con precisión milimétrica.",
                },
                {
                  icon: "ti-map-pin",
                  title: "Acceso Multisucursal",
                  desc: "Entrená en cualquier sede de la red SquatGym. Tu pasaporte universal a instalaciones de alto rendimiento.",
                  span: true,
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className={`relative flex flex-col gap-5 p-8 rounded-2xl bg-squat-card border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-white/[0.10] transition-all duration-200 overflow-hidden group ${f.span ? "md:col-span-2 lg:col-span-1" : ""}`}
                >
                  <div>
                    <h3 className="font-jakarta font-bold text-xl text-white leading-tight tracking-[-0.4px] mb-2">
                      {f.title}
                    </h3>
                    <p className="font-inter text-sm text-squat-muted leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-squat-green/[0.04] to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Plans ── */}
        <section id="plans" className="bg-squat-dark py-24">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-16">
            <div>
              <p className="font-jakarta font-bold text-squat-green text-xs tracking-[3px] uppercase mb-3">
                Elegí tu plan
              </p>
              <h2 className="font-jakarta font-extrabold text-4xl sm:text-5xl tracking-[-2.4px] uppercase">
                <span className="text-white">NUESTROS </span>
                <span className="text-squat-green">PLANES</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {activePlans.map((plan) => {
                const isFeatured = plan.id === featuredPlanId;
                const features = planFeatures[plan.id] ?? [];
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
                      isFeatured
                        ? "bg-squat-green border border-squat-green shadow-[0_0_40px_rgba(149,253,0,0.15)]"
                        : "bg-squat-card border border-white/[0.06] hover:border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    }`}
                  >
                    {isFeatured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-squat-ink text-squat-green text-[10px] font-black tracking-[2px] uppercase shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                        Más popular
                      </span>
                    )}

                    <h3 className={`font-jakarta font-extrabold text-2xl tracking-[-0.6px] mb-1 ${isFeatured ? "text-squat-ink" : "text-white"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-6 ${isFeatured ? "text-squat-ink/70" : "text-squat-muted"}`}>
                      {plan.description}
                    </p>

                    <div className="mb-8">
                      <span className={`font-jakarta font-black text-4xl tracking-[-1.5px] ${isFeatured ? "text-squat-ink" : "text-white"}`}>
                        ${plan.monthlyPriceArs.toLocaleString("es-AR")}
                      </span>
                      <span className={`text-sm ml-1 ${isFeatured ? "text-squat-ink/60" : "text-squat-muted"}`}>/mes</span>
                    </div>

                    <ul className="flex flex-col gap-3 mb-8 flex-1">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <i className={`ti ti-circle-check text-base shrink-0 ${isFeatured ? "text-squat-ink" : "text-squat-green"}`} />
                          <span className={`text-sm font-medium ${isFeatured ? "text-squat-ink/80" : "text-squat-muted"}`}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/login"
                      className={`w-full text-center py-3.5 rounded-xl font-jakarta font-bold text-sm transition-all duration-150 active:scale-[0.98] ${
                        isFeatured
                          ? "bg-squat-ink text-squat-green hover:bg-squat-ink/90"
                          : "bg-lime-400/10 text-squat-green border border-squat-green/30 hover:bg-lime-400/20 hover:border-squat-green/60"
                      }`}
                    >
                      Empezar ahora
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Locations ── */}
        <section id="locations" className="bg-squat-dark py-24">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-16">
            <div>
              <p className="font-jakarta font-bold text-squat-green text-xs tracking-[3px] uppercase mb-3">
                Dónde encontrarnos
              </p>
              <h2 className="font-jakarta font-extrabold text-4xl sm:text-5xl tracking-[-2.4px] uppercase">
                <span className="text-white">NUESTRAS </span>
                <span className="text-squat-green">SEDES</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branchesMock.filter((b) => b.status === "active").map((branch) => (
                  <div
                    key={branch.id}
                    className="relative flex flex-col gap-5 p-8 rounded-2xl border shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 bg-squat-card border-white/[0.06] hover:border-white/[0.12]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-lime-400/10">
                        <i className="ti ti-map-pin text-lg text-squat-green" />
                      </div>
                      <div>
                        <h3 className="font-jakarta font-extrabold text-base text-white tracking-[-0.3px]">
                          {branch.name}
                        </h3>
                        <span className="text-[10px] font-bold tracking-[1.5px] text-squat-green">
                          {branch.code}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.05]" />

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2.5">
                        <i className="ti ti-map-pin text-sm text-app-faint mt-0.5 shrink-0" />
                        <span className="text-sm text-squat-muted">
                          {branch.address.street}, {branch.address.city}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <i className="ti ti-clock text-sm text-app-faint mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-squat-muted">
                            Lun–Vie: {branch.openingHours.monToFri}
                          </span>
                          {branch.openingHours.saturday && (
                            <span className="text-sm text-squat-muted">
                              Sáb: {branch.openingHours.saturday}
                            </span>
                          )}
                          {branch.openingHours.sunday && (
                            <span className="text-sm text-squat-muted">
                              Dom: {branch.openingHours.sunday}
                            </span>
                          )}
                        </div>
                      </div>
                      {branch.contact?.phone && (
                        <div className="flex items-center gap-2.5">
                          <i className="ti ti-phone text-sm text-app-faint shrink-0" />
                          <span className="text-sm text-squat-muted">{branch.contact.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-auto pt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-squat-green shadow-[0_0_4px_rgba(149,253,0,0.6)]" />
                      <span className="text-[10px] font-bold text-squat-green tracking-wider">OPERATIVA</span>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-squat-dark border-t border-white/[0.05]">
        <div className="max-w-[1280px] mx-auto px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="font-jakarta font-black text-xl italic tracking-[-1px] uppercase text-squat-green">
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
            © 2026 SQUATGYM. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
