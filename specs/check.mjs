// Controla que lo que citan las specs exista en el código: archivos, carpetas,
// rutas de App.tsx, funciones o constantes, usuarios de prueba y nombres de tests.
// Uso (desde la raíz del repo): node specs/check.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

function walk(dir, filter) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(ROOT, dir), {
    withFileTypes: true,
  })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel, filter));
    else if (filter(rel)) out.push(rel);
  }
  return out;
}

const specs = walk("specs", (f) => f.endsWith(".md"));
const sources = walk("client", (f) => /\.(ts|tsx)$/.test(f));
const sourceText = sources.map((f) => read(f)).join("\n");
const sourceNames = new Set(sources.map((f) => path.basename(f)));
const scripts = Object.keys(JSON.parse(read("package.json")).scripts);
const appRoutes = new Set(
  [...read("client/App.tsx").matchAll(/path="([^"]+)"/g)].map((m) => m[1]),
);

// Nombres que se citan a propósito aunque ya no estén en el código (se quitaron).
const REMOVED = new Set(["three", "horasMock", "any"]);

const problems = [];
const report = (spec, msg) => problems.push(`${spec}: ${msg}`);

for (const spec of specs) {
  const text = read(spec);

  for (const [, raw] of text.matchAll(/`([^`\n]+)`/g)) {
    const token = raw.replace(/\(\)$/, "");
    if (/\s/.test(token) || token.startsWith("@") || /^[\d."-]+$/.test(token))
      continue;

    if (token.startsWith("/")) {
      if (!appRoutes.has(token))
        report(spec, `ruta inexistente en App.tsx: ${token}`);
    } else if (token.includes("@")) {
      if (!read("client/data/users.ts").includes(`"${token}"`))
        report(spec, `usuario inexistente: ${token}`);
    } else if (token.includes("*")) {
      const dir = path.dirname(token);
      if (!fs.existsSync(path.join(ROOT, dir)))
        report(spec, `no existe la carpeta: ${dir}`);
    } else if (
      /^(client|public|specs|docs)\//.test(token) ||
      /^[\w.-]+\.(js|mjs|json|html)$/.test(token)
    ) {
      if (!fs.existsSync(path.join(ROOT, token)))
        report(spec, `no existe: ${token}`);
    } else if (/^[\w-]+\.tsx?$/.test(token)) {
      if (!sourceNames.has(token))
        report(spec, `no hay ningún archivo ${token} en client/`);
    } else if (/^[A-Za-z_][\w]*$/.test(token)) {
      if (
        !REMOVED.has(token) &&
        !scripts.includes(token) &&
        !new RegExp(`\\b${token}\\b`).test(sourceText)
      ) {
        report(spec, `no aparece en el código: ${token}`);
      }
    }
  }

  // Nombres de tests: `client/x.spec.ts` ("grupo", "otro grupo")
  for (const line of text.split("\n").filter((l) => l.includes(".spec.ts"))) {
    for (const part of line.split("`").reduce((acc, chunk, i, all) => {
      if (chunk.endsWith(".spec.ts")) acc.push([chunk, all[i + 1] ?? ""]);
      return acc;
    }, [])) {
      const [file, after] = part;
      if (!fs.existsSync(path.join(ROOT, file))) continue;
      const content = read(file);
      for (const [, name] of after.matchAll(/"([^"]+)"/g)) {
        if (!content.includes(name))
          report(spec, `${file} no tiene un grupo de tests "${name}"`);
      }
    }
  }
}

if (problems.length) {
  console.log(problems.join("\n"));
  console.log(`\n${problems.length} problema(s) en ${specs.length} specs.`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${specs.length} specs, todo lo citado existe en el código.`);
}
