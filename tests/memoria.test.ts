import { describe, it, expect } from "vitest";
import { barajar, crearCartas, TEMAS } from "@/lib/memoria";

describe("Lógica pura de memoria (src/lib/memoria.ts)", () => {
  describe("Algoritmo de Fisher-Yates (barajar)", () => {
    it("no modifica el arreglo original (inmutabilidad)", () => {
      const original = Object.freeze([1, 2, 3, 4, 5, 6]);
      const copiaReferencia = [...original];

      const resultado = barajar(original);

      expect(original).toEqual(copiaReferencia);
      expect(resultado).not.toBe(original);
    });

    it("conserva todos los elementos y su longitud sin perder ninguno", () => {
      const original = ["A", "B", "C", "D", "E", "F"];
      const resultado = barajar(original);

      expect(resultado).toHaveLength(original.length);
      expect([...resultado].sort()).toEqual([...original].sort());
    });

    it("produce una permutación válida sobre arreglos vacíos o con un único elemento", () => {
      expect(barajar([])).toEqual([]);
      expect(barajar(["único"])).toEqual(["único"]);
    });
  });

  describe("Temas y símbolos predefinidos (RF-02)", () => {
    it("cada uno de los 3 temas tiene al menos 12 símbolos y ninguno se repite", () => {
      const temasClaves = Object.keys(TEMAS) as (keyof typeof TEMAS)[];
      expect(temasClaves).toEqual(["animales", "comida", "deportes"]);

      temasClaves.forEach((temaKey) => {
        const tema = TEMAS[temaKey];
        expect(tema.simbolos.length).toBeGreaterThanOrEqual(12);

        // Validar que no haya duplicados
        const conjuntoUnico = new Set(tema.simbolos);
        expect(conjuntoUnico.size).toBe(tema.simbolos.length);
      });
    });
  });

  describe("Generación de cartas (crearCartas)", () => {
    const simbolos = TEMAS.animales.simbolos;

    it("con 6 parejas devuelve 12 cartas y cada símbolo aparece exactamente 2 veces (RF-01)", () => {
      const cartas = crearCartas(simbolos, 6);

      expect(cartas).toHaveLength(12);

      const conteo: Record<string, number> = {};
      cartas.forEach((carta, index) => {
        expect(carta.id).toBe(index);
        expect(carta.descubierta).toBe(false);
        conteo[carta.simbolo] = (conteo[carta.simbolo] || 0) + 1;
      });

      const simbolosUsados = Object.keys(conteo);
      expect(simbolosUsados).toHaveLength(6);
      simbolosUsados.forEach((simbolo) => {
        expect(conteo[simbolo]).toBe(2);
      });
    });

    it("con 8 parejas devuelve 16 cartas con cada símbolo exactamente dos veces", () => {
      const cartas = crearCartas(simbolos, 8);
      expect(cartas).toHaveLength(16);

      const conteo: Record<string, number> = {};
      cartas.forEach((carta) => {
        conteo[carta.simbolo] = (conteo[carta.simbolo] || 0) + 1;
      });

      expect(Object.keys(conteo)).toHaveLength(8);
      Object.values(conteo).forEach((repeticiones) => {
        expect(repeticiones).toBe(2);
      });
    });

    it("con 12 parejas devuelve 24 cartas con cada símbolo exactamente dos veces", () => {
      const cartas = crearCartas(simbolos, 12);
      expect(cartas).toHaveLength(24);

      const conteo: Record<string, number> = {};
      cartas.forEach((carta) => {
        conteo[carta.simbolo] = (conteo[carta.simbolo] || 0) + 1;
      });

      expect(Object.keys(conteo)).toHaveLength(12);
      Object.values(conteo).forEach((repeticiones) => {
        expect(repeticiones).toBe(2);
      });
    });

    it("lanza un error si el número de parejas es menor o igual a cero o excede la lista", () => {
      expect(() => crearCartas(simbolos, 0)).toThrowError(/Número de parejas inválido/);
      expect(() => crearCartas(simbolos, -1)).toThrowError(/Número de parejas inválido/);
      expect(() => crearCartas(simbolos, simbolos.length + 1)).toThrowError(
        /Número de parejas inválido/,
      );
    });
  });
});
