# CLAUDE.md — ClinicOS

Instrucciones para Claude Code al trabajar en este repositorio.

---

## Proyecto

**ClinicOS** es un SaaS multi-tenant de gestión de clínicas y consultorios médicos.
Monorepo gestionado con **pnpm workspaces + Turborepo**.

---

## Estructura del repositorio

```
clinicos/
├── apps/
│   ├── api/          # NestJS REST API (puerto 3001 en dev)
│   └── web/          # Next.js 14 App Router (puerto 3000 en dev)
├── packages/
│   ├── database/     # Prisma schema + migraciones + seed
│   ├── shared/       # Tipos y utilidades compartidas entre api y web
│   ├── ui/           # Componentes de UI reutilizables (Tailwind)
│   └── config/       # tsconfig base compartida
├── CLAUDE.md         # Este archivo
├── README.md
├── package.json      # Scripts raíz (turbo run ...)
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Comandos esenciales

```bash
# Desarrollo (ambas apps en paralelo)
pnpm dev

# Build
pnpm build

# Typecheck (ambas apps)
pnpm typecheck

# Formato
pnpm format

# Base de datos
pnpm db:generate    # Genera Prisma Client después de cambiar schema
pnpm db:migrate     # Aplica migraciones pendientes
pnpm db:seed        # Pobla la BD con datos iniciales

# Calidad de código React
npx react-doctor@latest .   # Ejecutar desde la raíz del monorepo
```

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport JWT |
| ORM | Prisma 6 (PostgreSQL) |
| Data fetching | @tanstack/react-query (cliente), fetch nativo (server components) |
| Estado UI | Zustand (global), useState/useReducer (local) |
| Monorepo | Turborepo + pnpm workspaces |
| Validación | class-validator (API), Zod/Valibot (frontend) |

---

## Convenciones de código

### TypeScript / General
- Siempre TypeScript estricto — nunca `any` sin justificación
- Preferir tipos explícitos en interfaces públicas; inferencia está bien en internos
- Sin `// @ts-ignore` ni `as unknown as X` sin comentario explicativo

### React / Next.js (Frontend)
- **Nunca** `fetch()` dentro de `useEffect` — usar `useQuery()` de `@tanstack/react-query`
- **Nunca** `<a href="...">` para rutas internas — usar `<Link href="...">` de `next/link`
- **Nunca** `<a href="#">` para acciones — usar `<button type="button">`
- **Nunca** `key={index}` en listas que puedan reordenarse — usar ID estable o el valor mismo
- Todos los `<label>` deben envolver su control o tener `htmlFor` con el `id` del control:
  ```tsx
  // Patrón preferido (wrapper component)
  <label className="block space-y-1">
    <span className="text-xs font-medium">Campo *</span>
    {children}
  </label>

  // Alternativa (inline)
  <label className="block">
    <span className={labelCls}>Campo *</span>
    <input ... />
  </label>
  ```
- Elementos no interactivos con `onClick` deben tener `role`, `tabIndex={0}`, y `onKeyDown`:
  ```tsx
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handler() }}
  role="button"
  tabIndex={0}
  ```
- `useState` está bien para ≤5 estados relacionados de UI. Usar `useReducer` solo cuando las transiciones son complejas.
- Ejecutar `/react-quality-guard` al final de cada sprint.

### NestJS (API)
- Un módulo por dominio: controller + service + DTOs + módulo
- Toda validación de entrada via `class-validator` decorators en DTOs
- Guards de autenticación en el controller, nunca en el service
- El service nunca lanza excepciones HTTP — solo lanza desde el controller o usa excepciones de NestJS (`NotFoundException`, `ConflictException`, etc.)
- Prisma queries siempre filtran por `tenantId` — nunca queries sin scope de tenant

### Base de datos
- Siempre generar migración con nombre descriptivo: `pnpm db:migrate -- --name descripcion_del_cambio`
- Después de cualquier cambio al schema, ejecutar `pnpm db:generate`
- No borrar migraciones aplicadas en producción

---

## Arquitectura multi-tenant

Todos los modelos de negocio tienen campo `tenantId: String`.
El `tenantId` viene del JWT y se extrae en el guard de auth — **nunca** se toma del body del request.
El servicio recibe `tenantId` como parámetro explícito y filtra todas las queries con él.

---

## Flujo de autenticación

```
POST /auth/login → JwtAuthGuard → retorna { accessToken, refreshToken }
Headers: Authorization: Bearer <token>
JWT payload: { sub: userId, tenantId, email, role }
```

---

## Calidad y control de errores

- Correr `pnpm typecheck` antes de cualquier commit en la API
- Correr `/react-quality-guard` (react-doctor) al finalizar cada sprint de frontend
- Meta mínima: **95/100** en react-doctor
- No saltarse hooks de git con `--no-verify`

---

## Módulos de la API

| Módulo | Ruta base | Descripción |
|--------|-----------|-------------|
| auth | `/auth` | Login, refresh, logout |
| appointments | `/appointments` | CRUD de citas |
| availability | `/availability` | Slots disponibles por profesional/día |
| patients | `/patients` | CRUD de pacientes |
| professionals | `/professionals` | CRUD de profesionales |
| schedules | `/schedules` | Horarios de profesionales |
| schedule-blocks | `/schedule-blocks` | Bloqueos de agenda |
| service-types | `/service-types` | Tipos de servicio/procedimiento |
| resources | `/resources` | Recursos físicos (salas, equipos) |
| waitlist | `/waitlist` | Lista de espera |
| identity | `/identity` | Usuarios y tenants |

---

## Páginas del frontend

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | KPIs y resumen del día |
| `/agenda` | Calendario de citas (día/semana/mes) |
| `/pacientes` | Listado y gestión de pacientes |
| `/profesionales` | Listado de profesionales |
| `/configuracion/servicios` | Tipos de servicio |
| `/configuracion/recursos` | Recursos físicos |
| `/configuracion/horarios` | Horarios y bloqueos de agenda |
| `/settings/users` | Usuarios del tenant |
| `/settings/roles` | Roles y permisos |

---

## Variables de entorno

Cada app tiene su propio `.env`. Ver `.env.example` si existe, o revisar `main.ts` de la API y `next.config.js` del web para las variables requeridas.

Variables clave de la API:
- `DATABASE_URL` — connection string PostgreSQL
- `JWT_SECRET` — clave para firmar tokens
- `JWT_REFRESH_SECRET`
- `PORT` (default 3001)
