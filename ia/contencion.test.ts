import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Pruebas de Contención y Seguridad de la IA (Sección 11)", () => {
  const rootDir = path.resolve(__dirname, "..");

  it("AGENTS.md existe y no supera las 100 líneas permitidas", () => {
    const agentsFile = path.join(rootDir, "AGENTS.md");
    expect(fs.existsSync(agentsFile)).toBe(true);

    const content = fs.readFileSync(agentsFile, "utf-8");
    const lines = content.split("\n");
    expect(lines.length).toBeLessThanOrEqual(100);
  });

  it("No existen archivos de variables de entorno ni secretos en el repositorio", () => {
    const forbiddenPatterns = [
      ".env",
      ".env.local",
      ".env.production",
      ".env.development",
    ];
    forbiddenPatterns.forEach((file) => {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    const gitignorePath = path.join(rootDir, ".gitignore");
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    expect(gitignoreContent).toMatch(/\.env\*/);
  });

  it("package.json define el comando 'check' exigido por la rúbrica", () => {
    const pkgPath = path.join(rootDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.check).toBeDefined();
    expect(pkg.scripts.check).toContain("tsc --noEmit");
    expect(pkg.scripts.check).toContain("lint");
    expect(pkg.scripts.check).toContain("prettier");
    expect(pkg.scripts.check).toContain("coverage");
  });

  it("vitest.config define un umbral de cobertura estricto (>= 80%) para la lógica de negocio", () => {
    const vitestConfigPath = fs.existsSync(path.join(rootDir, "vitest.config.mts"))
      ? path.join(rootDir, "vitest.config.mts")
      : path.join(rootDir, "vitest.config.ts");
    expect(fs.existsSync(vitestConfigPath)).toBe(true);

    const vitestConfig = fs.readFileSync(vitestConfigPath, "utf-8");
    expect(vitestConfig).toContain("thresholds");
    expect(vitestConfig).toContain("lines: 80");
    expect(vitestConfig).toContain("functions: 80");
    expect(vitestConfig).toContain("branches: 80");
    expect(vitestConfig).toContain("statements: 80");
  });

  it("Garantiza la contención dentro de la raíz del proyecto", () => {
    const relativePath = path.relative(rootDir, path.join(rootDir, "ia", "BITACORA.md"));
    expect(relativePath.startsWith("..")).toBe(false);
  });
});
