# Finanzas Personales (MVP)

> **Uso meramente educativo.** Este proyecto es un ejercicio de aprendizaje / prototipo personal, no un producto financiero, no está auditado y no debe usarse para tomar decisiones financieras reales sin la debida diligencia.

Aplicación web simple para registrar y clasificar ingresos y gastos personales: cuánto entra, cuánto sale, qué tan esencial es cada gasto, y cuánto de eso es deuda vs. ahorro/inversión.

## Para qué sirve

- Registrar **ingresos** y **gastos**, cada uno con nombre, categoría, valor aproximado y frecuencia (mensual, semestral o anual).
- Clasificar cada movimiento como **Esencial (E)** o **No esencial (NE)**.
- Ver un resumen mensualizado: ingresos, gastos, balance, gastos esenciales vs. no esenciales, y cuánto corresponde a deudas vs. ahorro/inversión.
- Eliminar movimientos existentes.

## Stack utilizado

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript, Vite |
| Cliente de datos | `@supabase/supabase-js` |
| Backend / base de datos | Supabase (Postgres) — corre localmente con Supabase CLI + Docker, portable a Supabase Cloud |
| Estilos | CSS plano (`src/App.css`), sin framework de UI |

## Estado actual del despliegue

**Nada está desplegado en producción todavía.** Todo corre en local, en la máquina de desarrollo:

- **Backend (Supabase / Postgres)**: sí corre **en contenedores Docker**, pero locales — `supabase start` levanta ~13 contenedores (Postgres, API/Kong, Studio, Auth, Storage, etc.) vía Docker Compose. Se ven con `docker ps`.
- **Frontend (React / Vite)**: **no** corre en contenedor. Se ejecuta directamente como proceso de Node en el host (`npm run dev`), sin Docker de por medio.

En otras palabras: hay contenedores involucrados, pero solo para la base de datos local de desarrollo, no como método de despliegue del proyecto. Ver [Cómo se desplegaría en la nube](#cómo-se-desplegaría-en-la-nube) para lo que falta para que la app sea accesible fuera de esta máquina.

## Estructura de las tablas

Definidas en [`supabase/migrations/20260720204630_init_schema.sql`](supabase/migrations/20260720204630_init_schema.sql).

### `categories`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, autogenerado |
| `name` | `text` | Nombre de la categoría |
| `type` | `text` | `'income'` \| `'expense'` |
| `tag` | `text` (nullable) | `'debt'` o `'savings_investment'`, para las categorías que alimentan las tarjetas de resumen de deudas y ahorro/inversión |
| `created_at` | `timestamptz` | Autogenerado |

Categorías precargadas:

- **Ingreso**: Salario, Arriendos, Inversiones
- **Gasto**: Hogar, Comida, Transporte, Créditos o deudas (`tag=debt`), Entretenimiento, Impuestos o pagos programados, Auto, Ahorros e inversiones (`tag=savings_investment`), Familia

### `transactions`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, autogenerado |
| `type` | `text` | `'income'` \| `'expense'` |
| `name` | `text` | Nombre / descripción, máx. 159 caracteres |
| `category_id` | `uuid` | FK a `categories.id` |
| `amount` | `numeric(12,2)` | Valor aproximado, debe ser > 0 |
| `frequency` | `text` | `'monthly'` \| `'semiannual'` \| `'annual'` |
| `essentiality` | `text` | `'essential'` \| `'non_essential'` |
| `created_at` | `timestamptz` | Autogenerado |

Todos los campos de `transactions` son obligatorios. Row Level Security está habilitado con políticas abiertas (`using (true)`) porque el MVP es de un solo usuario sin autenticación.

## Cómo se ejecuta localmente

Requisitos: Node.js (via [nvm](https://github.com/nvm-sh/nvm)), Docker (para la base de datos local de Supabase), y el [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`).

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Levantar Postgres local + API tipo Supabase (usa Docker)
supabase start

# 3. Copiar las credenciales que imprime `supabase start` (o `supabase status`)
#    a un archivo .env.local en la raíz:
#    VITE_SUPABASE_URL=http://127.0.0.1:54321
#    VITE_SUPABASE_ANON_KEY=<anon key que imprime supabase start>

# 4. Levantar el frontend
npm run dev
```

La app queda disponible en `http://localhost:5173`.

Para reaplicar el esquema desde cero (borra los datos locales):

```bash
supabase db reset
```

Para detener el stack local de Supabase:

```bash
supabase stop
```

## Cómo se desplegaría en la nube

1. **Crear un proyecto en [supabase.com](https://supabase.com)** (plan gratuito es suficiente para uso personal).
2. **Vincular el proyecto local al proyecto en la nube**:
   ```bash
   supabase link --project-ref <tu-project-ref>
   ```
3. **Subir las migraciones** (crea las tablas, categorías y permisos en la base de datos en la nube):
   ```bash
   supabase db push
   ```
4. **Actualizar las variables de entorno del frontend** con la URL y `anon key` del proyecto en la nube (Project Settings → API en el dashboard de Supabase), en lugar de las locales:
   ```bash
   VITE_SUPABASE_URL=https://<tu-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key del proyecto en la nube>
   ```
5. **Desplegar el frontend** en un hosting de sitios estáticos (Vercel, Netlify, Cloudflare Pages, etc.):
   - Build command: `npm run build`
   - Output directory: `dist`
   - Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como variables de entorno del hosting.

El esquema, el cliente y el código de la app no cambian entre local y nube — solo cambian las credenciales de conexión.

## Próximos pasos posibles

- Editar transacciones existentes (hoy solo se pueden crear y eliminar).
- Autenticación (si la app deja de ser de un solo usuario).
- Gráficas de evolución mensual.
# vide-code-app-finanzas
# vide-code-app-finanzas
