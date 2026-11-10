# Bitácora de Uso y Supervisión de la Inteligencia Artificial (ia/BITACORA.md)

**Estudiante:** Manuel  
**Proyecto:** Taller de Recuperación R1 · Juego de Memoria (Parejas)  
**Asistente IA:** Antigravity / Gemini Coding Assistant  
**Fecha:** Noviembre 2026

---

## 1. Declaración de Política y Gobernanza de IA

El desarrollo de este taller se realizó bajo la premisa de **control técnico humano total**. Ningún bloque de código generado por el asistente fue integrado sin previa inspección, refactorización, justificación contra la especificación oficial y validación mediante pruebas automatizadas.

Las restricciones de contención establecidas en `AGENTS.md` prohibieron estrictamente:

- El acceso o lectura de variables de entorno o archivos externos al repositorio.
- La ejecución de operaciones con efectos colaterales fuera del entorno local (`git push`, instalación no autorizada, despliegue a la nube).
- La inclusión de atajos técnicos anti-patrón (como `sort(() => Math.random() - 0.5)` o componentes sin accesibilidad).

---

## 2. Registro Cronológico de Interacciones

| #   | Propósito de la Consulta                             | Prompt Resumido                                                                               | Evidencia / Propuesta IA                                                                        | Validación Técnica Humana                                                              | Decisión Tomada                                                                                                                            |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Estructuración inicial y configuración de contención | "¿Cómo estructurar el primer commit con las reglas de seguridad y contención en `AGENTS.md`?" | Sugirió crear `AGENTS.md` y un set de pruebas de contención para verificar límites de permisos. | Se auditó que `AGENTS.md` tuviera <100 líneas y se implementó `ia/contencion.test.ts`. | **Aprobado con ajustes.** Se fijó el umbral del 80% en cobertura.                                                                          |
| 2   | Generación de barajado de cartas                     | "Proponer función para barajar parejas de emojis"                                             | La IA inicialmente propuso una mezcla rápida con `sort()` y `Math.random()`.                    | **Rechazado.** No es uniforme ni determinista; viola RF-03.                            | **Rechazado y corregido:** Se exigió el algoritmo puro de Fisher-Yates.                                                                    |
| 3   | Reductor de estado `juegoReducer`                    | "Diseñar el reductor puro para el juego de memoria con 4 acciones"                            | Sugirió mutar propiedades de `cartas` directamente en el array recibido en el estado.           | **Rechazado.** Rompe la inmutabilidad de React y falla el test con `structuredClone`.  | **Corregido:** Se aplicó inmutabilidad profunda con mapeo de objetos nuevos.                                                               |
| 4   | Temporizadores y anuncios en hook `useJuego`         | "Implementar hook de temporizador y anuncios `aria-live`"                                     | Sugirió despachar actualizaciones de tiempo a la región `aria-live` en cada segundo.            | **Rechazado.** Saturaría por completo a un usuario con lector de pantalla (NVDA/JAWS). | **Corregido:** Se limitó `aria-live` exclusivamente a eventos clave (aciertos, fallos, victoria) y limpieza obligatoria del `setInterval`. |
| 5   | Persistencia de récords en LocalStorage              | "Implementar lectura y guardado de récords"                                                   | Propuso usar `localStorage.setItem` sin `try/catch` ni validación de esquema en `getItem`.      | **Rechazado.** Falla en navegación privada, con cuota excedida o con JSON dañado.      | **Corregido:** Se implementó `src/lib/records.ts` con manejo robusto de errores y fallback seguro.                                         |
| 6   | Verificación de accesibilidad y contraste            | "Validar botones de carta para WCAG 2.2 AA"                                                   | Sugirió botones genéricos usando cambios de color como único indicador de acierto.              | **Rechazado.** Viola la regla de no depender únicamente del color (WCAG 1.4.1).        | **Corregido:** Se añadieron iconos/símbolos semánticos y `aria-label` descriptivos («Carta X, descubierta»).                               |

---

## 3. Casos Detallados de Rechazo y Corrección a la IA (Mínimo 3 Exigidos)

### Caso 1: Rechazo de `sort(() => Math.random() - 0.5)` por Inadecuada Distribución

- **Propuesta de la IA:**  
  La IA propuso generar el tablero duplicando los símbolos y barajándolos con:  
  `cartas.sort(() => Math.random() - 0.5)`.
- **Motivo del Rechazo:**  
  El método con `sort()` no produce una permutación equiprobable (sesgo estadístico documentado por Fisher–Yates y especificado explícitamente en el **RF-03** del taller).
- **Corrección Humana Implementada:**  
  Se rechazó la propuesta y se implementó un algoritmo estricto de Fisher-Yates iterando de atrás hacia adelante con índices uniformes y garantizando la inmutabilidad al clonar el array original. Se validó con pruebas unitarias que confirman que no se pierden cartas ni se muta el arreglo base.

### Caso 2: Rechazo de Polución en `aria-live` y Fuga de Memoria en Temporizador

- **Propuesta de la IA:**  
  La IA sugirió que el hook `useJuego` vinculara el cronómetro de segundos al estado anunciado por `aria-live="polite"` para "mantener informado al usuario", omitiendo además la función de limpieza del efecto ante desmontajes tempranos.
- **Motivo del Rechazo:**
  1. Anunciar cada segundo en una región en vivo interrumpe cualquier lectura y genera una experiencia caótica e inusable para personas ciegas o con baja visión.
  2. Omitir la limpieza del intervalo provoca fugas de memoria (`memory leaks`) y temporizadores zombis al cambiar de página a `/records`.
- **Corrección Humana Implementada:**  
  Se separó radicalmente el cronómetro visual del sintetizador `aria-live`. Solo se emiten anuncios en `aria-live` cuando ocurre un evento discreto de juego («Pareja encontrada», «Las cartas no coinciden», «¡Victoria! Has completado el juego en X movimientos y Y segundos»). Se garantizó que cada `useEffect` retorne su respectivo `clearInterval` o `clearTimeout`.

### Caso 3: Rechazo de Persistencia Vulnerable en `localStorage`

- **Propuesta de la IA:**  
  La IA propuso escribir los récords directamente:  
  `localStorage.setItem("records", JSON.stringify(data))` y consumirlos con `JSON.parse(localStorage.getItem("records"))`.
- **Motivo del Rechazo:**  
  Si el almacenamiento local está deshabilitado por políticas del navegador (modo incógnito estricto), si se agota la cuota (`QuotaExceededError`), o si un usuario o extensión externa manipula o corrompe el JSON guardado, la aplicación lanzaría una excepción no capturada provocando una pantalla en blanco (`White Screen of Death`).
- **Corrección Humana Implementada:**  
  Se encapsuló todo acceso a `localStorage` dentro de bloques `try/catch` con validación rigurosa de tipos. En caso de error o datos inválidos, la aplicación ignora la excepción silenciosamente, mantiene la experiencia del usuario fluida y entrega un estado vacío por defecto («Aún no hay récords»). Se añadieron pruebas unitarias simulando excepciones y datos corruptos.

---

## 4. Conclusiones y Aprendizaje

El uso de la IA aceleró la formulación de estructuras iniciales, pero la solidez, robustez ante fallos, accesibilidad universal y cumplimiento riguroso de la rúbrica provinieron de la supervisión crítica y del diseño arquitectural consciente.
