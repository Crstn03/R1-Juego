"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  leerRecords,
  borrarRecords,
  type RecordsData,
  type TamanoTablero,
} from "@/lib/records";
import styles from "./page.module.css";

const TAMANOS: TamanoTablero[] = [12, 16, 24];

const NOMBRES_TAMANO: Record<TamanoTablero, { titulo: string; subtitulo: string }> = {
  12: { titulo: "Fácil", subtitulo: "12 cartas · 6 parejas" },
  16: { titulo: "Medio", subtitulo: "16 cartas · 8 parejas" },
  24: { titulo: "Difícil", subtitulo: "24 cartas · 12 parejas" },
};

function formatTiempo(segundos: number): string {
  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function Records() {
  const [records, setRecords] = useState<RecordsData>({});
  const [cargado, setCargado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    // localStorage is read after hydration to keep the server and first client render aligned.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecords(leerRecords());
    setCargado(true);
  }, []);

  const hayRecords = cargado && TAMANOS.some((t) => records[t] !== undefined);

  const handleBorrar = () => {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    borrarRecords();
    setRecords({});
    setConfirmando(false);
  };

  const handleCancelar = () => setConfirmando(false);

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>🏆 Récords personales</h1>
        <Link href="/" className={styles.volver}>
          ← Volver al juego
        </Link>
      </header>

      <main className={styles.principal}>
        {!cargado ? (
          <p className={styles.mensaje}>Cargando récords…</p>
        ) : !hayRecords ? (
          <div className={styles.vacio} role="status">
            <span className={styles.vacioIcono}>🎮</span>
            <p>Aún no tienes récords.</p>
            <p className={styles.vacioSub}>
              Completa una partida para registrar tu mejor marca.
            </p>
            <Link href="/" className={styles.linkJugar}>
              ▶ Ir a jugar
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.lista} aria-label="Lista de récords por dificultad">
              {TAMANOS.map((tamano) => {
                const record = records[tamano];
                const info = NOMBRES_TAMANO[tamano];
                return (
                  <li key={tamano} className={styles.item}>
                    <div className={styles.itemEncabezado}>
                      <div>
                        <h2 className={styles.itemTitulo}>{info.titulo}</h2>
                        <p className={styles.itemSub}>{info.subtitulo}</p>
                      </div>
                      {record && <span className={styles.medalla}>🏅</span>}
                    </div>

                    {record ? (
                      <dl className={styles.datos}>
                        <div className={styles.dato}>
                          <dt>Movimientos</dt>
                          <dd>{record.movimientos}</dd>
                        </div>
                        <div className={styles.dato}>
                          <dt>Tiempo</dt>
                          <dd>{formatTiempo(record.segundos)}</dd>
                        </div>
                        <div className={styles.dato}>
                          <dt>Fecha</dt>
                          <dd>
                            {new Date(record.fecha).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className={styles.sinRecord}>Sin récord todavía</p>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Borrar récords con confirmación (dos clics) */}
            <div className={styles.accionBorrar}>
              {confirmando && (
                <p className={styles.avisoConfirmar} role="alert">
                  ¿Seguro? Esta acción no se puede deshacer.
                </p>
              )}
              <div className={styles.botonesBorrar}>
                <button
                  className={confirmando ? styles.botonConfirmar : styles.botonBorrar}
                  onClick={handleBorrar}
                  type="button"
                >
                  {confirmando ? "⚠ Confirmar borrado" : "🗑 Borrar récords"}
                </button>
                {confirmando && (
                  <button
                    className={styles.botonCancelar}
                    onClick={handleCancelar}
                    type="button"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
