"use client";

import styles from "./Controles.module.css";
import { TEMAS, type Tema } from "@/lib/memoria";
import { DIFICULTADES, type Dificultad } from "@/hooks/useJuego";
import type { FaseJuego } from "@/lib/juegoReducer";

const TEMAS_CLAVES = Object.keys(TEMAS) as Tema[];
const DIFICULTADES_CLAVES = [6, 8, 12] as const;

type Props = {
  tema: Tema;
  parejas: Dificultad;
  fase: FaseJuego;
  onReiniciar: (tema?: Tema, parejas?: Dificultad) => void;
};

export default function Controles({ tema, parejas, fase, onReiniciar }: Props) {
  const handleTema = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onReiniciar(e.target.value as Tema, undefined);
  };

  const handleParejas = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onReiniciar(undefined, Number(e.target.value) as Dificultad);
  };

  return (
    <section className={styles.controles} aria-label="Controles del juego">
      <div className={styles.grupo}>
        <label htmlFor="selector-tema" className={styles.etiqueta}>
          Tema
        </label>
        <select
          id="selector-tema"
          value={tema}
          onChange={handleTema}
          className={styles.selector}
        >
          {TEMAS_CLAVES.map((t) => (
            <option key={t} value={t}>
              {TEMAS[t].nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grupo}>
        <label htmlFor="selector-dificultad" className={styles.etiqueta}>
          Dificultad
        </label>
        <select
          id="selector-dificultad"
          value={parejas}
          onChange={handleParejas}
          className={styles.selector}
        >
          {DIFICULTADES_CLAVES.map((d) => (
            <option key={d} value={d}>
              {DIFICULTADES[d].nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        className={styles.boton}
        onClick={() => onReiniciar()}
        type="button"
        aria-label={fase === "inicio" ? "Iniciar nueva partida" : "Reiniciar partida"}
      >
        {fase === "inicio" ? "▶ Nueva partida" : "↺ Reiniciar"}
      </button>
    </section>
  );
}
