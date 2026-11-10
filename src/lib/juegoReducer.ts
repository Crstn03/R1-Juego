import type { Carta } from "./memoria";

export type FaseJuego = "inicio" | "jugando" | "fin";

export type Estado = {
  cartas: Carta[];
  volteadas: number[]; // IDs de las cartas boca arriba que aún no se resolvieron (0, 1 o 2)
  movimientos: number;
  segundos: number;
  fase: FaseJuego;
};

export type Accion =
  | { tipo: "reiniciar"; cartas: Carta[] }
  | { tipo: "voltear"; id: number }
  | { tipo: "resolver" } // se despacha ~800 ms después de la segunda carta
  | { tipo: "tic" }; // un segundo más

/**
 * Genera el estado inicial del juego sin mutar las cartas recibidas.
 */
export function crearEstadoInicial(cartas: Carta[] = []): Estado {
  return {
    cartas: cartas.map((c) => ({ ...c })),
    volteadas: [],
    movimientos: 0,
    segundos: 0,
    fase: "inicio",
  };
}

/**
 * Función reductora pura que gestiona toda la lógica del juego.
 * Reglas fundamentales:
 * 1. NUNCA muta el estado recibido (devuelve objetos y arreglos nuevos).
 * 2. Ignora la acción 'voltear' si:
 *    - La partida ya finalizó (fase === "fin").
 *    - Ya hay dos cartas volteadas en espera de comparación (bloqueo de entrada).
 *    - La carta ya está descubierta.
 *    - La carta ya está entre las volteadas (previene doble clic rápido).
 *    - La carta con el id indicado no existe.
 * 3. Al voltear la primera carta, si la fase era 'inicio', pasa a 'jugando'.
 * 4. Al voltear la segunda carta, incrementa 'movimientos' en 1.
 * 5. Al despachar 'resolver', si son iguales quedan descubiertas; si todas quedan descubiertas pasa a 'fin'.
 * 6. 'tic' incrementa 'segundos' únicamente cuando la fase es 'jugando'.
 */
export function juegoReducer(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "reiniciar": {
      return {
        cartas: accion.cartas.map((c) => ({ ...c, descubierta: false })),
        volteadas: [],
        movimientos: 0,
        segundos: 0,
        fase: "inicio",
      };
    }

    case "voltear": {
      // Ignorar si la partida ya terminó
      if (estado.fase === "fin") {
        return estado;
      }

      // RF-05: Si ya hay 2 cartas volteadas comparándose, ignorar cualquier otra
      if (estado.volteadas.length >= 2) {
        return estado;
      }

      const cartaObjetivo = estado.cartas.find((c) => c.id === accion.id);

      // Si no existe, si ya está descubierta o si ya fue volteada (doble clic rápido), ignorar
      if (
        !cartaObjetivo ||
        cartaObjetivo.descubierta ||
        estado.volteadas.includes(accion.id)
      ) {
        return estado;
      }

      const nuevasVolteadas = [...estado.volteadas, accion.id];
      const esSegundaCarta = nuevasVolteadas.length === 2;

      return {
        ...estado,
        volteadas: nuevasVolteadas,
        // Al voltear la primera carta pasamos a 'jugando' si estábamos en 'inicio'
        fase: estado.fase === "inicio" ? "jugando" : estado.fase,
        // RF-06: Un movimiento equivale a dos cartas volteadas
        movimientos: esSegundaCarta ? estado.movimientos + 1 : estado.movimientos,
      };
    }

    case "resolver": {
      // Si no hay dos cartas para resolver, no hay nada que comparar
      if (estado.volteadas.length < 2) {
        return estado.volteadas.length === 0 ? estado : { ...estado, volteadas: [] };
      }

      const [id1, id2] = estado.volteadas;
      const carta1 = estado.cartas.find((c) => c.id === id1);
      const carta2 = estado.cartas.find((c) => c.id === id2);

      // Si las cartas no existen (caso límite improbable), se limpian las volteadas
      if (!carta1 || !carta2) {
        return {
          ...estado,
          volteadas: [],
        };
      }

      const sonIguales = carta1.simbolo === carta2.simbolo;

      if (sonIguales) {
        const nuevasCartas = estado.cartas.map((c) => {
          if (c.id === id1 || c.id === id2) {
            return { ...c, descubierta: true };
          }
          return c;
        });

        // Comprobamos si todas las cartas están descubiertas
        const todasDescubiertas = nuevasCartas.every((c) => c.descubierta);

        return {
          ...estado,
          cartas: nuevasCartas,
          volteadas: [],
          fase: todasDescubiertas ? "fin" : estado.fase,
        };
      }

      // Si son distintas, simplemente se limpian las volteadas (se ocultan)
      return {
        ...estado,
        volteadas: [],
      };
    }

    case "tic": {
      // El tiempo solo avanza mientras se está jugando
      if (estado.fase !== "jugando") {
        return estado;
      }

      return {
        ...estado,
        segundos: estado.segundos + 1,
      };
    }

    default:
      return estado;
  }
}
