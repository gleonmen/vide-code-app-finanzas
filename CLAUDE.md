# CLAUDE.md

Contexto persistente para Claude sobre este proyecto: qué es, cómo está armado, y cómo le gusta trabajar a este usuario. Léelo antes de hacer cambios.

## Qué es este proyecto

MVP de finanzas personales (uso educativo, no producción). Permite registrar ingresos y gastos categorizados, clasificarlos como esenciales/no esenciales, y ver un resumen mensualizado que distingue deudas de ahorro/inversión. Ver [README.md](README.md) para el detalle funcional y el esquema de datos completo.

Repo: [github.com/gleonmen/vide-code-app-finanzas](https://github.com/gleonmen/vide-code-app-finanzas)

## Stack

- **Frontend**: React 19 + TypeScript, Vite. Sin framework de UI ni Tailwind — CSS plano.
- **Backend/datos**: Supabase (Postgres), corriendo localmente vía Supabase CLI + Docker (`supabase start`). Portable a Supabase Cloud sin cambiar código, solo credenciales.
- **Node**: instalado vía nvm (no vía Homebrew — esta máquina no tiene Homebrew). El frontend corre directo en el host (`npm run dev`), **no** está dockerizado.

## Estructura de carpetas y qué hace cada archivo

```
proyecto-1/
├── README.md                      # Qué es, cómo correrlo, cómo desplegarlo, estado del despliegue
├── CLAUDE.md                      # Este archivo
├── .env.local                     # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (no versionado)
├── .gitignore                     # Excluye node_modules, .env.local, supabase/.branches|.temp, .claude/
├── package.json                   # Scripts: dev, build, lint, preview
├── index.html                     # Entry HTML de Vite
├── vite.config.ts                 # Config de Vite (plugin React)
├── tsconfig*.json                 # Config de TypeScript (app/node)
├── .oxlintrc.json                 # Config del linter (oxlint)
├── scripts/
│   └── dev.sh                     # Wrapper que carga nvm y hace `npm run dev`.
│                                   # Necesario porque el preview tool del entorno de
│                                   # desarrollo (.claude/launch.json) hace exec directo
│                                   # sin pasar por un shell de login, así que no ve nvm/PATH.
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.tsx                   # Entry point de React
│   ├── App.tsx                    # Componente raíz: carga datos, calcula resumen, arma layout
│   ├── App.css                    # Todos los estilos de la app (ver Decisiones de diseño)
│   ├── index.css                  # Reset/estilos globales de Vite (sin tocar)
│   ├── types.ts                   # Tipos: TransactionType, Frequency, Essentiality, CategoryTag,
│   │                               # Category, Transaction, NAME_MAX_LENGTH (159)
│   ├── lib/
│   │   └── supabaseClient.ts      # Cliente de supabase-js, lee env vars VITE_SUPABASE_*
│   ├── components/
│   │   ├── TransactionForm.tsx    # Form de alta: tipo, nombre, categoría (filtrada por tipo),
│   │   │                           # valor (vía AmountInput), frecuencia, clasificación E/NE.
│   │   │                           # Todos los campos son `required`; valida antes de enviar.
│   │   ├── AmountInput.tsx        # Input de monto con separador de miles en vivo (es-CO).
│   │   │                           # Maneja la posición del cursor manualmente — hubo un bug real
│   │   │                           # donde el input perdía dígitos al reformatear en cada tecla
│   │   │                           # porque el cursor se reseteaba; este componente lo corrige
│   │   │                           # calculando la posición correcta tras cada cambio.
│   │   └── TransactionList.tsx    # Tabla de transacciones con badge E/NE y botón eliminar
│   └── assets/                    # Assets por defecto de la plantilla Vite (sin uso funcional)
└── supabase/
    ├── config.toml                # Config del proyecto Supabase local (puertos, etc.)
    └── migrations/
        └── 20260720204630_init_schema.sql
                                    # Único archivo de esquema. Se edita directamente y se corre
                                    # `supabase db reset` para reaplicar — todavía no hay usuarios
                                    # reales ni se ha hecho `supabase db push` a un proyecto cloud,
                                    # así que no hace falta encadenar migraciones nuevas por ahora.
                                    # Define: tablas categories/transactions, categorías
                                    # precargadas, RLS + policies abiertas, y los GRANT a
                                    # anon/authenticated (sin estos GRANT explícitos, anon no
                                    # tiene SELECT/INSERT/UPDATE/DELETE por defecto — esto causó
                                    # un "permission denied" real durante el desarrollo).
```

No versionado (`.gitignore`): `node_modules/`, `.env.local`, `supabase/.branches/`, `supabase/.temp/`, `.claude/` (config local del entorno de desarrollo, con rutas absolutas específicas de esta máquina).

## Decisiones de diseño

- **Tipografía**: `system-ui, sans-serif` — sin fuente custom ni Google Fonts.
- **Colores** (definidos en `src/App.css`, sin variables CSS/tema, valores hardcodeados):
  - Ingreso: verde `#16a34a`
  - Gasto: rojo `#dc2626`
  - Gastos esenciales: cyan `#0891b2`
  - Gastos no esenciales: ámbar `#d97706`
  - Deudas: rojo oscuro `#b91c1c`
  - Ahorro/inversión: verde oscuro `#15803d`
  - Fondo de tarjetas: gris claro `#f4f4f5`
  - Bordes: `#e4e4e7` / `#d4d4d8`
- **Layout**: una sola página (`App.tsx`). Grid de tarjetas de resumen (4 columnas → 2 en mobile <900px) arriba, y debajo un grid de 2 columnas (form 320px fijo + tabla flexible → 1 columna en mobile <720px).
- **Sin dark mode**: no se implementó, no se pidió.
- **Moneda**: formateada con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })` — separador de miles con punto, sin decimales.
- **Sin librería de componentes** (no Tailwind, no Material, no shadcn) — CSS plano a propósito, por ser MVP simple.

## Preferencias del usuario / cómo colaborar

- Comunicarse en **español** (chat con el usuario).
- **Idioma en el código**: todo el código **en inglés** — tablas, columnas, nombres de variables/funciones, tipos y comentarios. El texto visible para el usuario final (labels, botones, nombres de categorías, mensajes de validación) **inicialmente en español** — "inicialmente" porque es el idioma por defecto del usuario, no porque el código deba asumir que siempre será español (evitar hardcodear de forma que bloquee soportar otros idiomas más adelante si hiciera falta).
- Antes de decisiones técnicas ambiguas o de arquitectura, **preguntar primero** (el usuario responde bien a preguntas de opción múltiple con `AskUserQuestion`, y lo pide explícitamente cuando hay dudas).
- Prefiere una arquitectura **local-first que pueda evolucionar a la nube** sin reescribir código — por eso Supabase local vía CLI/Docker en vez de, por ejemplo, SQLite (que hubiera requerido migrar de motor de BD más adelante).
- Al elegir cómo instalar herramientas de desarrollo (Node), **prefirió instalar en el sistema vía nvm** en lugar de dockerizar todo el entorno, cuando se le dio a elegir.
- Para datos financieros, valora que las cosas queden **claramente diferenciadas y categorizadas**: esencial vs. no esencial, deuda vs. ahorro/inversión — no solo un monto total.
- Prefiere **categorías fijas y explícitas** (definidas por él) antes que categorías genéricas tipo "Otros".
- Espera que los montos de dinero se vean con **separador de miles**, y que los campos de texto tengan **límites de longitud explícitos**.
- Espera que **todos los campos de un formulario sean obligatorios** salvo que se diga lo contrario.
- Antes de dar por terminado un cambio de UI, **probarlo en el navegador** (no solo compilar/tipar) — así se encontró el bug real del `AmountInput`.
- Para repos de GitHub, prefiere **SSH** sobre HTTPS+token cuando no hay credenciales configuradas en la máquina.
- Quiere que el proyecto quede siempre con un **README.md actualizado y honesto** sobre qué está desplegado y qué no (evitar que "corre en Docker" se preste a confusión entre backend y frontend).

## Convención para PRÓXIMOS proyectos (no aplica a este)

El usuario pidió dejar registrada esta convención como base para proyectos futuros — **explícitamente no se aplica a este proyecto actual**, que se queda como está (frontend con `npm run dev`, solo Supabase en Docker):

- Los proyectos nuevos deben poder **ejecutarse localmente dockerizados desde el inicio** (frontend y backend en contenedores, no solo la base de datos).
- Estructura de carpetas con **separación explícita `backend/` y `frontend/`** en la raíz del proyecto, para que la organización se vea de un vistazo.
- **Cada carpeta principal** (`backend/`, `frontend/`) debe tener **su propio README.md** explicando qué contiene y cómo correrla, además del README.md general en la raíz del proyecto.
