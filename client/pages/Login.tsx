import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-squat-dark overflow-hidden">
      {/* Background gym image */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/519575f6c6683379114a1a76e5d989bd581451a6?width=2560"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
      />
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80.04% 64.03% at 50% 50%, rgba(19,19,19,0.40) 0%, #131313 80%)",
        }}
      />

      {/* Floating panel */}
      <div className="relative z-10 w-full max-w-[448px] mx-4 flex flex-col items-center rounded-[8px] border border-[rgba(64,74,52,0.10)] bg-[rgba(42,42,42,0.80)] shadow-[0_20px_40px_0_rgba(0,0,0,0.60)] backdrop-blur-xl p-12">
        {/* Logo */}
        <div className="pb-8 self-start">
          <Link
            to="/"
            className="font-jakarta font-extrabold text-[30px] leading-9 tracking-[-1.5px] text-squat-green hover:opacity-90 transition-opacity"
          >
            SquatGym
          </Link>
        </div>

        {/* Header */}
        <div className="pb-8 flex flex-col items-center gap-2 w-full">
          <h1 className="font-jakarta font-bold text-2xl text-white text-center leading-8 tracking-[-0.6px]">
            Bienvenido a SquatGym
          </h1>
          <p className="font-inter text-sm text-squat-muted text-center leading-5">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-6 pb-4">
          {/* Email / DNI field */}
          <div className="flex flex-col gap-2">
            <label className="font-inter font-medium text-sm text-[#E5E2E1] leading-5">
              Correo Electrónico o DNI
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#BFCBAE"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="ejemplo@correo.com"
                className="w-full pl-12 pr-4 py-4 rounded-[6px] bg-squat-card-dark text-white placeholder-squat-muted/40 font-inter text-base outline-none focus:ring-1 focus:ring-squat-green/40 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-inter font-medium text-sm text-[#E5E2E1] leading-5">
                Contraseña
              </label>
              <a href="#" className="font-inter text-xs text-squat-green hover:opacity-80 transition-opacity leading-4">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 pointer-events-none">
                <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 21C1.45 21 0.979167 20.8042 0.5875 20.4125C0.195833 20.0208 0 19.55 0 19V9C0 8.45 0.195833 7.97917 0.5875 7.5875C0.979167 7.19583 1.45 7 2 7H3V5C3 3.61667 3.4875 2.4375 4.4625 1.4625C5.4375 0.4875 6.61667 0 8 0C9.38333 0 10.5625 0.4875 11.5375 1.4625C12.5125 2.4375 13 3.61667 13 5V7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V19C16 19.55 15.8042 20.0208 15.4125 20.4125C15.0208 20.8042 14.55 21 14 21H2ZM2 19H14V9H2V19ZM8 16C8.55 16 9.02083 15.8042 9.4125 15.4125C9.80417 15.0208 10 14.55 10 14C10 13.45 9.80417 12.9792 9.4125 12.5875C9.02083 12.1958 8.55 12 8 12C7.45 12 6.97917 12.1958 6.5875 12.5875C6.19583 12.9792 6 13.45 6 14C6 14.55 6.19583 15.0208 6.5875 15.4125C6.97917 15.8042 7.45 16 8 16ZM5 7H11V5C11 4.16667 10.7083 3.45833 10.125 2.875C9.54167 2.29167 8.83333 2 8 2C7.16667 2 6.45833 2.29167 5.875 2.875C5.29167 3.45833 5 4.16667 5 5V7ZM2 19V9V19Z" fill="#BFCBAE"/>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 rounded-[6px] bg-squat-card-dark text-white placeholder-squat-muted/40 font-inter text-base outline-none focus:ring-1 focus:ring-squat-green/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-squat-muted hover:text-white transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 12C12.25 12 13.3125 11.5625 14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12ZM11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2ZM11 15C8.56667 15 6.35 14.3208 4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15ZM11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-[6px] bg-squat-green shadow-[0_10px_30px_0_rgba(149,253,0,0.10)] font-jakarta font-bold text-lg text-squat-ink text-center hover:brightness-105 transition-all"
            >
              Ingresar
            </button>
          </div>
        </form>

        {/* Footer note */}
        <div className="pt-8">
          <p className="font-inter text-sm text-center">
            <span className="text-squat-muted">¿Eres nuevo? </span>
            <a href="#" className="font-medium text-squat-green hover:opacity-80 transition-opacity">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
