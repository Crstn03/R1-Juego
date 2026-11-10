import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  leerRecords,
  guardarRecord,
  borrarRecords,
  esRecordMejor,
  CLAVE_LOCAL_STORAGE,
  TamanoTablero,
} from "@/lib/records";

describe("Persistencia y lógica de récords (src/lib/records.ts)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("esRecordMejor", () => {
    it("retorna true si no existe un récord previo", () => {
      expect(esRecordMejor({ movimientos: 10, segundos: 30 })).toBe(true);
    });

    it("retorna true si se logra en menos movimientos", () => {
      const existente = { movimientos: 15, segundos: 40, fecha: "2026-01-01" };
      expect(esRecordMejor({ movimientos: 14, segundos: 50 }, existente)).toBe(true);
    });

    it("en caso de empate en movimientos, retorna true si se logra en menos tiempo", () => {
      const existente = { movimientos: 12, segundos: 30, fecha: "2026-01-01" };
      expect(esRecordMejor({ movimientos: 12, segundos: 25 }, existente)).toBe(true);
    });

    it("retorna false si tiene más movimientos", () => {
      const existente = { movimientos: 10, segundos: 20, fecha: "2026-01-01" };
      expect(esRecordMejor({ movimientos: 11, segundos: 15 }, existente)).toBe(false);
    });

    it("retorna false si empata en movimientos y tiempo, o toma más tiempo", () => {
      const existente = { movimientos: 10, segundos: 20, fecha: "2026-01-01" };
      expect(esRecordMejor({ movimientos: 10, segundos: 20 }, existente)).toBe(false);
      expect(esRecordMejor({ movimientos: 10, segundos: 25 }, existente)).toBe(false);
    });
  });

  describe("leerRecords", () => {
    it("retorna un objeto vacío cuando no hay nada almacenado", () => {
      expect(leerRecords()).toEqual({});
    });

    it("retorna los récords válidos previamente almacenados", () => {
      const datosPrueba = {
        12: { movimientos: 8, segundos: 18, fecha: "2026-11-10T12:00:00.000Z" },
        16: { movimientos: 14, segundos: 35, fecha: "2026-11-10T12:30:00.000Z" },
      };
      window.localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(datosPrueba));

      const leidos = leerRecords();
      expect(leidos[12]?.movimientos).toBe(8);
      expect(leidos[16]?.segundos).toBe(35);
    });

    it("es resiliente ante JSON corrupto y retorna un objeto vacío", () => {
      window.localStorage.setItem(CLAVE_LOCAL_STORAGE, "{json_corrupto_invalido::");
      expect(leerRecords()).toEqual({});
    });

    it("ignora propiedades corruptas o que no cumplan el esquema", () => {
      window.localStorage.setItem(
        CLAVE_LOCAL_STORAGE,
        JSON.stringify({
          12: { movimientos: -5, segundos: "treinta" }, // inválido
          16: { movimientos: 10, segundos: 20, fecha: "2026-11-10" }, // válido
          99: { movimientos: 1, segundos: 1, fecha: "2026-11-10" }, // tamaño inválido
        }),
      );

      const resultado = leerRecords();
      expect(resultado[12]).toBeUndefined();
      expect(resultado[16]?.movimientos).toBe(10);
      expect((resultado as Record<number, unknown>)[99]).toBeUndefined();
    });

    it("retorna {} si window.localStorage lanza una excepción (bloqueado/modo incógnito)", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError: The operation is insecure.");
      });

      expect(leerRecords()).toEqual({});
    });
  });

  describe("guardarRecord", () => {
    it("guarda el primer récord de un tamaño y retorna guardado: true", () => {
      const resultado = guardarRecord(12, { movimientos: 9, segundos: 22 });
      expect(resultado.guardado).toBe(true);
      expect(resultado.records[12]?.movimientos).toBe(9);
      expect(resultado.records[12]?.segundos).toBe(22);

      // Verificar persistencia en localStorage
      const leido = leerRecords();
      expect(leido[12]?.movimientos).toBe(9);
    });

    it("actualiza el récord cuando se supera la marca anterior", () => {
      guardarRecord(16, { movimientos: 15, segundos: 40 });
      const mejorado = guardarRecord(16, { movimientos: 12, segundos: 35 });

      expect(mejorado.guardado).toBe(true);
      expect(mejorado.records[16]?.movimientos).toBe(12);
      expect(mejorado.records[16]?.segundos).toBe(35);
    });

    it("no actualiza el récord si el nuevo resultado es peor", () => {
      guardarRecord(24, { movimientos: 20, segundos: 60 });
      const peor = guardarRecord(24, { movimientos: 25, segundos: 70 });

      expect(peor.guardado).toBe(false);
      expect(peor.records[24]?.movimientos).toBe(20);
    });

    it("gestiona pacíficamente errores como QuotaExceededError sin lanzar excepciones", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      });

      expect(() => guardarRecord(12, { movimientos: 8, segundos: 15 })).not.toThrow();
      const resultado = guardarRecord(12, { movimientos: 8, segundos: 15 });
      expect(resultado.guardado).toBe(false);
    });
  });

  describe("borrarRecords", () => {
    it("elimina los datos de localStorage", () => {
      guardarRecord(12, { movimientos: 10, segundos: 20 });
      expect(leerRecords()[12]).toBeDefined();

      const borrado = borrarRecords();
      expect(borrado).toBe(true);
      expect(leerRecords()).toEqual({});
    });

    it("es resiliente si removeItem lanza error", () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("Acceso denegado");
      });

      expect(borrarRecords()).toBe(false);
    });
  });
});
