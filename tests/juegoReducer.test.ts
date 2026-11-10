import { describe, it, expect } from "vitest";
import { juegoReducer, crearEstadoInicial, Estado } from "@/lib/juegoReducer";
import type { Carta } from "@/lib/memoria";

describe("Reductor puro del juego (src/lib/juegoReducer.ts)", () => {
  const cartasPrueba: Carta[] = [
    { id: 0, simbolo: "🐶", descubierta: false },
    { id: 1, simbolo: "🐶", descubierta: false },
    { id: 2, simbolo: "🐱", descubierta: false },
    { id: 3, simbolo: "🐱", descubierta: false },
  ];

  it("crearEstadoInicial inicializa correctamente el estado sin mutar las cartas", () => {
    const estado = crearEstadoInicial(cartasPrueba);

    expect(estado.cartas).toHaveLength(4);
    expect(estado.volteadas).toEqual([]);
    expect(estado.movimientos).toBe(0);
    expect(estado.segundos).toBe(0);
    expect(estado.fase).toBe("inicio");
  });

  it("inmutabilidad estricta: ninguna acción muta el estado anterior (structuredClone)", () => {
    const estadoInicial = crearEstadoInicial(cartasPrueba);
    const copiaEstado = structuredClone(estadoInicial);

    // Acción 1: Voltear primera carta
    const estado1 = juegoReducer(estadoInicial, { tipo: "voltear", id: 0 });
    expect(estadoInicial).toEqual(copiaEstado);

    // Acción 2: Voltear segunda carta
    const copiaEstado1 = structuredClone(estado1);
    const estado2 = juegoReducer(estado1, { tipo: "voltear", id: 1 });
    expect(estado1).toEqual(copiaEstado1);

    // Acción 3: Resolver
    const copiaEstado2 = structuredClone(estado2);
    const estado3 = juegoReducer(estado2, { tipo: "resolver" });
    expect(estado2).toEqual(copiaEstado2);

    // Acción 4: Tic
    const copiaEstado3 = structuredClone(estado3);
    const estado4 = juegoReducer(estado3, { tipo: "tic" });
    expect(estado3).toEqual(copiaEstado3);
  });

  it("al voltear la primera carta la fase pasa de 'inicio' a 'jugando' y no incrementa movimientos", () => {
    const estadoInicial = crearEstadoInicial(cartasPrueba);
    const siguiente = juegoReducer(estadoInicial, { tipo: "voltear", id: 0 });

    expect(siguiente.volteadas).toEqual([0]);
    expect(siguiente.fase).toBe("jugando");
    expect(siguiente.movimientos).toBe(0);
  });

  it("al voltear la segunda carta se incrementa el contador de movimientos (RF-06)", () => {
    const estado = juegoReducer(
      { ...crearEstadoInicial(cartasPrueba), fase: "jugando", volteadas: [0] },
      { tipo: "voltear", id: 1 },
    );

    expect(estado.volteadas).toEqual([0, 1]);
    expect(estado.movimientos).toBe(1);
  });

  it("ignora un doble clic rápido sobre la misma carta (no cuenta como segunda carta)", () => {
    const estadoInicial = crearEstadoInicial(cartasPrueba);
    const estado1 = juegoReducer(estadoInicial, { tipo: "voltear", id: 0 });
    const estado2 = juegoReducer(estado1, { tipo: "voltear", id: 0 });

    expect(estado2.volteadas).toEqual([0]);
    expect(estado2.movimientos).toBe(0);
  });

  it("ignora el intento de voltear una tercera carta mientras se comparan dos (RF-05)", () => {
    const estadoConDos = {
      ...crearEstadoInicial(cartasPrueba),
      fase: "jugando" as const,
      volteadas: [0, 1],
      movimientos: 1,
    };

    const siguiente = juegoReducer(estadoConDos, { tipo: "voltear", id: 2 });
    expect(siguiente).toBe(estadoConDos);
    expect(siguiente.volteadas).toEqual([0, 1]);
  });

  it("ignora el intento de voltear una carta ya descubierta", () => {
    const cartasConDescubierta: Carta[] = [
      { id: 0, simbolo: "🐶", descubierta: true },
      { id: 1, simbolo: "🐶", descubierta: true },
    ];
    const estado = {
      ...crearEstadoInicial(cartasConDescubierta),
      fase: "jugando" as const,
    };

    const siguiente = juegoReducer(estado, { tipo: "voltear", id: 0 });
    expect(siguiente).toBe(estado);
    expect(siguiente.volteadas).toEqual([]);
  });

  it("ignora acciones de voltear si la carta con ese ID no existe", () => {
    const estado = crearEstadoInicial(cartasPrueba);
    const siguiente = juegoReducer(estado, { tipo: "voltear", id: 999 });

    expect(siguiente).toBe(estado);
  });

  it("voltear dos cartas iguales y despachar 'resolver' las deja descubiertas para siempre", () => {
    let estado = crearEstadoInicial(cartasPrueba);
    estado = juegoReducer(estado, { tipo: "voltear", id: 0 }); // 🐶
    estado = juegoReducer(estado, { tipo: "voltear", id: 1 }); // 🐶
    estado = juegoReducer(estado, { tipo: "resolver" });

    expect(estado.volteadas).toEqual([]);
    expect(estado.cartas.find((c) => c.id === 0)?.descubierta).toBe(true);
    expect(estado.cartas.find((c) => c.id === 1)?.descubierta).toBe(true);
    expect(estado.fase).toBe("jugando"); // Aún faltan las cartas 2 y 3
  });

  it("voltear dos cartas distintas y despachar 'resolver' las vuelve a ocultar", () => {
    let estado = crearEstadoInicial(cartasPrueba);
    estado = juegoReducer(estado, { tipo: "voltear", id: 0 }); // 🐶
    estado = juegoReducer(estado, { tipo: "voltear", id: 2 }); // 🐱
    estado = juegoReducer(estado, { tipo: "resolver" });

    expect(estado.volteadas).toEqual([]);
    expect(estado.cartas.find((c) => c.id === 0)?.descubierta).toBe(false);
    expect(estado.cartas.find((c) => c.id === 2)?.descubierta).toBe(false);
  });

  it("al descubrir la última pareja la fase pasa a 'fin' (victoria)", () => {
    const cartasCasiListas: Carta[] = [
      { id: 0, simbolo: "🐶", descubierta: true },
      { id: 1, simbolo: "🐶", descubierta: true },
      { id: 2, simbolo: "🐱", descubierta: false },
      { id: 3, simbolo: "🐱", descubierta: false },
    ];

    let estado: Estado = {
      cartas: cartasCasiListas,
      volteadas: [],
      movimientos: 1,
      segundos: 10,
      fase: "jugando",
    };

    estado = juegoReducer(estado, { tipo: "voltear", id: 2 });
    estado = juegoReducer(estado, { tipo: "voltear", id: 3 });
    estado = juegoReducer(estado, { tipo: "resolver" });

    expect(estado.fase).toBe("fin");
    expect(estado.cartas.every((c) => c.descubierta)).toBe(true);
  });

  it("no permite voltear cartas si la fase es 'fin'", () => {
    const estadoFin: Estado = {
      cartas: cartasPrueba.map((c) => ({ ...c, descubierta: true })),
      volteadas: [],
      movimientos: 2,
      segundos: 15,
      fase: "fin",
    };

    const siguiente = juegoReducer(estadoFin, { tipo: "voltear", id: 0 });
    expect(siguiente).toBe(estadoFin);
  });

  it("'tic' solo incrementa segundos si la fase es 'jugando'", () => {
    const estadoInicio = crearEstadoInicial(cartasPrueba);
    expect(juegoReducer(estadoInicio, { tipo: "tic" }).segundos).toBe(0);

    const estadoJugando: Estado = { ...estadoInicio, fase: "jugando", segundos: 5 };
    expect(juegoReducer(estadoJugando, { tipo: "tic" }).segundos).toBe(6);

    const estadoFin: Estado = { ...estadoInicio, fase: "fin", segundos: 12 };
    expect(juegoReducer(estadoFin, { tipo: "tic" }).segundos).toBe(12);
  });

  it("'reiniciar' restaura el tablero con cartas boca abajo y restablece contadores", () => {
    const estadoEnProgreso: Estado = {
      cartas: [
        { id: 0, simbolo: "🐶", descubierta: true },
        { id: 1, simbolo: "🐶", descubierta: true },
      ],
      volteadas: [0],
      movimientos: 4,
      segundos: 25,
      fase: "jugando",
    };

    const nuevasCartas: Carta[] = [
      { id: 0, simbolo: "🍎", descubierta: false },
      { id: 1, simbolo: "🍎", descubierta: false },
    ];

    const reiniciado = juegoReducer(estadoEnProgreso, {
      tipo: "reiniciar",
      cartas: nuevasCartas,
    });

    expect(reiniciado.fase).toBe("inicio");
    expect(reiniciado.movimientos).toBe(0);
    expect(reiniciado.segundos).toBe(0);
    expect(reiniciado.volteadas).toEqual([]);
    expect(reiniciado.cartas).toEqual(nuevasCartas);
  });

  it("despachar 'resolver' con menos de 2 cartas volteadas es seguro e inocuo", () => {
    const estadoInicial = crearEstadoInicial(cartasPrueba);
    expect(juegoReducer(estadoInicial, { tipo: "resolver" })).toEqual(estadoInicial);

    const estadoConUna = { ...estadoInicial, volteadas: [0] };
    const resuelto = juegoReducer(estadoConUna, { tipo: "resolver" });
    expect(resuelto.volteadas).toEqual([]);
  });
});
