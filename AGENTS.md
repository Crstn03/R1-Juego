# Reglas de Agente de IA · Taller R1 Juego de Memoria

## 1. Stack Tecnológico

- Next.js 16 (App Router), React 19, TypeScript 5.
- Estilos: CSS Modules nativos (sin Tailwind ni frameworks externos de UI).
- Pruebas: Vitest, React Testing Library, @testing-library/jest-dom, v8 coverage.

## 2. Estructura del Proyecto

- `src/app/`: Rutas (`/`, `/records`), layout global y estilos modulares.
- `src/components/`: Componentes accesibles (`Carta`, `Tablero`, `Controles`, etc.).
- `src/hooks/`: Custom hook `useJuego` con temporizadores y limpieza estricta.
- `src/lib/`: Lógica de negocio pura (`memoria.ts`, `juegoReducer.ts`, `records.ts`).
- `tests/`: Pruebas unitarias, de interfaz y accesibilidad.
- `ia/`: Evidencias de contención y bitácora (`BITACORA.md`).
- `calidad/`: Informes, auditorías de accesibilidad y métricas Core Web Vitals.

## 3. Comandos Permitidos

- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Genera la compilación para producción.
- `npm test`: Ejecuta la suite de pruebas unitarias con Vitest.
- `npm run check`: Verificación obligatoria (TypeScript + ESLint + Prettier + Coverage >= 80%).
- `npm run format`: Formatea el código con Prettier.

## 4. Restricciones de Seguridad y Contención

- **Aislamiento de Entorno**: La IA NUNCA debe acceder, leer ni modificar rutas fuera del directorio raíz del proyecto.
- **Secretos y Credenciales**: Prohibido leer, generar o solicitar archivos `.env`, `.env.*`, credenciales, tokens de API o contraseñas.
- **Acciones Externas Protegidas**: Toda operación que interactúe con el exterior (`git push`, instalación de paquetes npm, despliegues en Vercel) requiere autorización manual del usuario.

## 5. Directrices de Calidad de Código

- **Lo que SÍ**:
  - Funciones puras e inmutabilidad (`structuredClone`, spread operator).
  - Algoritmo de Fisher-Yates para barajado uniforme de cartas.
  - Gestión de estado obligatoria con `juegoReducer` puro (sin React importado en el reductor).
  - Limpieza rigurosa de temporizadores (`clearTimeout`, `clearInterval`) en `useEffect`.
  - Accesibilidad WCAG 2.2 AA: contrastes >= 4.5:1, `aria-live="polite"` para anuncios clave, teclado 100% operativo, objetivos táctiles >= 44x44px.
  - Diseño responsivo mobile-first probado en 360px, 768px y 1024px sin desbordamiento horizontal.
- **Lo que NO**:
  - NO usar `sort(() => Math.random() - 0.5)` bajo ninguna circunstancia.
  - CERO elementos interactivos no semánticos (prohibido `<div onClick>`, usar siempre `<button>`).
  - NO mutar variables de estado directamente.
  - NO omitir el bloque `try/catch` ni validación al manipular `localStorage`.
  - NO omitir las pruebas requeridas ni romper el umbral de 80% de cobertura en `src/lib/`.
