"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useJuego } from "@/hooks/useJuego";
import Tablero from "@/components/Tablero";
import Controles from "@/components/Controles";

function formatTiempo(segundos: number): string {
  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function Home() {
  const { estado, tema, parejas, anuncio, esNuevoRecord, voltear, reiniciar } =
    useJuego();

  const victoria = estado.fase === "fin";

  return (
    <div className={styles.pagina}>
      {/* ── Encabezado ──────────────────────────────────────────────── */}
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>🃏 Juego de Memoria</h1>
        <Link href="/records" className={styles.linkRecords}>
          🏆 Récords
        </Link>
      </header>

      <main className={styles.principal}>
        {/* Región aria-live: solo anuncia eventos discretos del juego
            (acierto, fallo, victoria). No el cronómetro. */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.anuncioOculto}
        >
          {anuncio}
        </div>

        {/* ── Controles ───────────────────────────────────────────────── */}
        <Controles
          tema={tema}
          parejas={parejas}
          fase={estado.fase}
          onReiniciar={reiniciar}
        />

        {/* ── Estadísticas ────────────────────────────────────────────── */}
        <section className={styles.estadisticas} aria-label="Estadísticas de la partida">
          <div className={styles.stat}>
            <span className={styles.statLabel}>Movimientos</span>
            <span className={styles.statValor}>{estado.movimientos}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Tiempo</span>
            <span className={styles.statValor}>{formatTiempo(estado.segundos)}</span>
          </div>
        </section>

        {/* ── Pantalla de victoria ────────────────────────────────────── */}
        {victoria && (
          <div className={styles.victoria} role="alert" aria-live="assertive">
            <p className={styles.victoriaEmoji}>{esNuevoRecord ? "🏆" : "🎉"}</p>
            <p className={styles.victoriaTitulo}>
              {esNuevoRecord ? "¡Nuevo récord!" : "¡Victoria!"}
            </p>
            <p className={styles.victoriaDetalle}>
              {estado.movimientos} movimientos · {formatTiempo(estado.segundos)}
            </p>
            <div className={styles.victoriaAcciones}>
              <button
                className={styles.botonNueva}
                onClick={() => reiniciar()}
                type="button"
              >
                ↺ Jugar de nuevo
              </button>
              <Link href="/records" className={styles.linkVerRecords}>
                Ver récords →
              </Link>
            </div>
          </div>
        )}

        {/* ── Tablero de juego ────────────────────────────────────────── */}
        <Tablero
          cartas={estado.cartas}
          volteadas={estado.volteadas}
          onVoltear={voltear}
        />
      </main>
    </div>
  );
}
