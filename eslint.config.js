// ESLint: revisa el código en busca de errores comunes (variables sin usar,
// hooks mal usados, `any`, console.log sueltos). Solo corre con `npm run lint`:
// no se incluye en la app ni la hace más lenta.
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      // Servidor y deploy de la plantilla: no se tocan.
      "server/**",
      "api/**",
      // Módulos de otros grupos.
      "client/pages/Index.tsx",
      "client/pages/AdminPanel.tsx",
    ],
  },
  {
    files: ["client/**/*.{ts,tsx}", "shared/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
);
