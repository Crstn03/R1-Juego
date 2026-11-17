import styles from "./Tablero.module.css";
import type { Carta as CartaType } from "@/lib/memoria";
import Carta from "./Carta";

type Props = {
  cartas: CartaType[];
  volteadas: number[];
  onVoltear: (id: number) => void;
};

export default function Tablero({ cartas, volteadas, onVoltear }: Props) {
  return (
    <section
      className={styles.tablero}
      aria-label={`Tablero de juego con ${cartas.length} cartas`}
      data-total={cartas.length}
    >
      {cartas.map((carta, indice) => (
        <Carta
          key={carta.id}
          carta={carta}
          indice={indice}
          estaVolteada={volteadas.includes(carta.id)}
          onVoltear={onVoltear}
        />
      ))}
    </section>
  );
}
