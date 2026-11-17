"use client";

import styles from "./Carta.module.css";
import type { Carta as CartaType } from "@/lib/memoria";

type Props = {
  carta: CartaType;
  estaVolteada: boolean;
  onVoltear: (id: number) => void;
  indice: number;
};

export default function Carta({ carta, estaVolteada, onVoltear, indice }: Props) {
  const estaVisible = estaVolteada || carta.descubierta;

  // Etiqueta descriptiva para lectores de pantalla (WCAG 2.2 AA)
  let ariaLabel: string;
  if (carta.descubierta) {
    ariaLabel = `Carta ${indice + 1}, descubierta: ${carta.simbolo}`;
  } else if (estaVolteada) {
    ariaLabel = `Carta ${indice + 1}, volteada: ${carta.simbolo}`;
  } else {
    ariaLabel = `Carta ${indice + 1}, oculta`;
  }

  return (
    <button
      className={[
        styles.carta,
        estaVisible ? styles.visible : "",
        carta.descubierta ? styles.descubierta : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onVoltear(carta.id)}
      aria-label={ariaLabel}
      aria-pressed={estaVisible}
      disabled={carta.descubierta}
      type="button"
    >
      {/* Contenedor de la animación 3D */}
      <span className={styles.inner}>
        {/* Reverso de la carta (cara visible cuando está oculta) */}
        <span className={styles.reverso} aria-hidden="true">
          🃏
        </span>
        {/* Frente de la carta (visible al voltear o descubrir) */}
        <span className={styles.frente} aria-hidden="true">
          {carta.simbolo}
        </span>
      </span>
    </button>
  );
}
