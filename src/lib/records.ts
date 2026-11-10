export type TamanoTablero = 12 | 16 | 24;

export type RecordResultado = {
  movimientos: number;
  segundos: number;
  fecha: string; // ISO 8601 string
};

export type RecordsData = Partial<Record<TamanoTablero, RecordResultado>>;

export const CLAVE_LOCAL_STORAGE = "r1_memoria_records_v1";

/**
 * Determina si un nuevo resultado mejora un récord existente.
 * Criterio:
 * - Si no hay récord previo, es mejor.
 * - Menos movimientos.
 * - Si empatan en movimientos, menor tiempo (segundos).
 */
export function esRecordMejor(
  nuevo: { movimientos: number; segundos: number },
  existente?: RecordResultado,
): boolean {
  if (!existente) return true;
  if (nuevo.movimientos < existente.movimientos) return true;
  if (
    nuevo.movimientos === existente.movimientos &&
    nuevo.segundos < existente.segundos
  ) {
    return true;
  }
  return false;
}

/**
 * Lee los récords desde localStorage de manera segura.
 * Retorna un objeto vacío si localStorage está bloqueado, en modo incógnito,
 * si no existe en el entorno o si el JSON está dañado/inválido.
 */
export function leerRecords(): RecordsData {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CLAVE_LOCAL_STORAGE);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    const validos: RecordsData = {};
    const tamanosPermitidos: TamanoTablero[] = [12, 16, 24];

    for (const tamano of tamanosPermitidos) {
      const item = parsed[tamano];
      if (
        item &&
        typeof item === "object" &&
        typeof item.movimientos === "number" &&
        item.movimientos > 0 &&
        typeof item.segundos === "number" &&
        item.segundos >= 0 &&
        typeof item.fecha === "string"
      ) {
        validos[tamano] = {
          movimientos: Math.floor(item.movimientos),
          segundos: Math.floor(item.segundos),
          fecha: item.fecha,
        };
      }
    }

    return validos;
  } catch {
    // Manejo resiliente ante errores de acceso o JSON corrupto
    return {};
  }
}

/**
 * Guarda un récord si mejora el anterior para el tamaño especificado.
 * Encapsulado en try/catch para soportar cuotas excedidas o almacenamiento deshabilitado.
 */
export function guardarRecord(
  tamano: TamanoTablero,
  resultado: { movimientos: number; segundos: number },
): { guardado: boolean; records: RecordsData } {
  if (typeof window === "undefined") {
    return { guardado: false, records: {} };
  }

  try {
    const recordsActuales = leerRecords();
    const actual = recordsActuales[tamano];

    if (!esRecordMejor(resultado, actual)) {
      return { guardado: false, records: recordsActuales };
    }

    const nuevoRecord: RecordResultado = {
      movimientos: resultado.movimientos,
      segundos: resultado.segundos,
      fecha: new Date().toISOString(),
    };

    const actualizados: RecordsData = {
      ...recordsActuales,
      [tamano]: nuevoRecord,
    };

    window.localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(actualizados));
    return { guardado: true, records: actualizados };
  } catch {
    return { guardado: false, records: leerRecords() };
  }
}

/**
 * Borra todos los récords de forma segura.
 */
export function borrarRecords(): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(CLAVE_LOCAL_STORAGE);
    return true;
  } catch {
    return false;
  }
}
