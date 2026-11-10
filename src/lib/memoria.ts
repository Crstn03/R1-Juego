export type Tema = "animales" | "comida" | "deportes";

export const TEMAS: Record<Tema, { nombre: string; simbolos: readonly string[] }> = {
  animales: {
    nombre: "Animales",
    simbolos: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
    ] as const,
  },
  comida: {
    nombre: "Comida",
    simbolos: [
      "🍎",
      "🍌",
      "🍇",
      "🍓",
      "🍒",
      "🍕",
      "🍔",
      "🌮",
      "🍦",
      "🍩",
      "🍉",
      "🥑",
    ] as const,
  },
  deportes: {
    nombre: "Deportes",
    simbolos: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🎾",
      "🏐",
      "🎳",
      "🎱",
      "🏓",
      "🏸",
      "🥊",
      "🛹",
    ] as const,
  },
};

export type Carta = {
  id: number;
  simbolo: string;
  descubierta: boolean;
};

/**
 * Baraja un arreglo utilizando el algoritmo uniforme de Fisher-Yates.
 * No muta el arreglo original.
 */
export function barajar<T>(arreglo: readonly T[]): T[] {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copia[i];
    copia[i] = copia[j];
    copia[j] = temp;
  }
  return copia;
}

/**
 * Crea la baraja de cartas para el juego de memoria:
 * - Selecciona la cantidad de símbolos según el número de parejas solicitadas.
 * - Duplica cada símbolo para crear las parejas.
 * - Baraja las cartas usando el algoritmo de Fisher-Yates.
 */
export function crearCartas(simbolos: readonly string[], parejas: number): Carta[] {
  if (parejas <= 0 || parejas > simbolos.length) {
    throw new Error(
      `Número de parejas inválido: ${parejas}. Debe estar entre 1 y ${simbolos.length}.`,
    );
  }

  // Tomamos los símbolos requeridos para las parejas
  const simbolosSeleccionados = simbolos.slice(0, parejas);

  // Duplicamos cada símbolo para formar las parejas
  const simbolosDuplicados = [...simbolosSeleccionados, ...simbolosSeleccionados];

  // Barajamos los símbolos usando Fisher-Yates
  const simbolosBarajados = barajar(simbolosDuplicados);

  // Asignamos id único y estado inicial
  return simbolosBarajados.map((simbolo, index) => ({
    id: index,
    simbolo,
    descubierta: false,
  }));
}
