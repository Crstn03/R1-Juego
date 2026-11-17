"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { juegoReducer, crearEstadoInicial } from "@/lib/juegoReducer";
import { crearCartas, TEMAS, type Tema } from "@/lib/memoria";
import { guardarRecord, type TamanoTablero } from "@/lib/records";

export type Dificultad = 6 | 8 | 12;

export const DIFICULTADES: Record<Dificultad, { nombre: string; tamano: TamanoTablero }> =
  {
    6: { nombre: "Fácil · 12 cartas", tamano: 12 },
    8: { nombre: "Medio · 16 cartas", tamano: 16 },
    12: { nombre: "Difícil · 24 cartas", tamano: 24 },
  };

export function useJuego(temaInicial: Tema = "animales", parejasInicial: Dificultad = 6) {
  const [tema, setTema] = useState<Tema>(temaInicial);
  const [parejas, setParejas] = useState<Dificultad>(parejasInicial);
  const [anuncio, setAnuncio] = useState<string>("");
  const [esNuevoRecord, setEsNuevoRecord] = useState(false);

  const [estado, dispatch] = useReducer(juegoReducer, undefined, () =>
    crearEstadoInicial(crearCartas(TEMAS[temaInicial].simbolos, parejasInicial)),
  );

  const resolverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordGuardadoRef = useRef(false);
  const prevVolteadasRef = useRef<number[]>([]);

  // ── Cronómetro: un tic por segundo mientras la fase es "jugando" ──────────
  useEffect(() => {
    if (estado.fase !== "jugando") return;

    const intervalo = setInterval(() => {
      dispatch({ tipo: "tic" });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [estado.fase]);

  // ── Resolver 800 ms después de voltear la segunda carta ───────────────────
  useEffect(() => {
    // Limpiar cualquier timer anterior antes de crear uno nuevo
    if (resolverTimerRef.current !== null) {
      clearTimeout(resolverTimerRef.current);
      resolverTimerRef.current = null;
    }

    if (estado.volteadas.length === 2) {
      resolverTimerRef.current = setTimeout(() => {
        dispatch({ tipo: "resolver" });
        resolverTimerRef.current = null;
      }, 800);
    }

    return () => {
      if (resolverTimerRef.current !== null) {
        clearTimeout(resolverTimerRef.current);
        resolverTimerRef.current = null;
      }
    };
  }, [estado.volteadas]);

  // ── Anunciar resultado de cada par (solo eventos discretos) ───────────────
  useEffect(() => {
    const prevVolt = prevVolteadasRef.current;
    prevVolteadasRef.current = estado.volteadas;

    // Detectar la transición [id1, id2] → [] durante la fase jugando
    if (
      prevVolt.length === 2 &&
      estado.volteadas.length === 0 &&
      estado.fase === "jugando"
    ) {
      const [id1] = prevVolt;
      const carta = estado.cartas.find((c) => c.id === id1);
      if (carta?.descubierta) {
        setAnuncio(`¡Pareja encontrada! ${carta.simbolo}`);
      } else {
        setAnuncio("Las cartas no coinciden.");
      }
    }
  }, [estado.volteadas, estado.cartas, estado.fase]);

  // ── Victoria: guardar récord y anunciar ───────────────────────────────────
  useEffect(() => {
    if (estado.fase === "fin" && !recordGuardadoRef.current) {
      recordGuardadoRef.current = true;
      const tamano = (parejas * 2) as TamanoTablero;
      const { guardado } = guardarRecord(tamano, {
        movimientos: estado.movimientos,
        segundos: estado.segundos,
      });
      setEsNuevoRecord(guardado);

      const msg = guardado
        ? `¡Nuevo récord! Completaste en ${estado.movimientos} movimientos y ${estado.segundos} segundos.`
        : `¡Victoria! Completaste en ${estado.movimientos} movimientos y ${estado.segundos} segundos.`;
      setAnuncio(msg);
    }
  }, [estado.fase, estado.movimientos, estado.segundos, parejas]);

  // ── Acciones públicas ─────────────────────────────────────────────────────
  const voltear = useCallback((id: number) => {
    dispatch({ tipo: "voltear", id });
  }, []);

  const reiniciar = useCallback(
    (nuevoTema?: Tema, nuevasParejas?: Dificultad) => {
      const t = nuevoTema ?? tema;
      const p = nuevasParejas ?? parejas;

      if (nuevoTema !== undefined) setTema(nuevoTema);
      if (nuevasParejas !== undefined) setParejas(nuevasParejas);

      recordGuardadoRef.current = false;
      setAnuncio("");
      setEsNuevoRecord(false);

      const nuevasCartas = crearCartas(TEMAS[t].simbolos, p);
      dispatch({ tipo: "reiniciar", cartas: nuevasCartas });
    },
    [tema, parejas],
  );

  return { estado, tema, parejas, anuncio, esNuevoRecord, voltear, reiniciar };
}
