# ClinicOS

SaaS multi-tenant de gestión de clínicas y consultorios médicos.

## Stack

| | |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport JWT |
| Base de datos | PostgreSQL + Prisma 6 |
| Monorepo | Turborepo + pnpm workspaces |

## Requisitos previos

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL ≥ 14

## Instalación

```bash
# Clonar el repo
git clone <url>
cd clinicos

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Editar los archivos .env con tus valores

# Inicializar la base de datos
pnpm db:migrate
pnpm db:seed
```

## Desarrollo

```bash
# Levantar API + Web en paralelo (hot-reload)
pnpm dev

# Solo la API  (puerto 3001)
pnpm dev --filter=@clinicos/api

# Solo el Web (puerto 3000)
pnpm dev --filter=@clinicos/web
```

## Scripts disponibles

```bash
pnpm build          # Build de producción (ambas apps)
pnpm typecheck      # TypeScript check sin emitir archivos
pnpm format         # Formatear con Prettier
pnpm lint           # ESLint

pnpm db:generate    # Regenerar Prisma Client (tras cambios al schema)
pnpm db:migrate     # Aplicar migraciones pendientes
pnpm db:seed        # Seed de datos iniciales
```

## Estructura

```
apps/
  api/          NestJS REST API
  web/          Next.js App Router
packages/
  database/     Prisma schema y migraciones
  shared/       Tipos compartidos entre api y web
  ui/           Componentes UI reutilizables
  config/       Configuración de TypeScript compartida
```

## Arquitectura

- **Multi-tenant**: cada entidad de negocio está scoped por `tenantId`
- **JWT Auth**: el `tenantId` y `userId` viajan en el payload del token
- **API REST**: `/api/v1/...` con autenticación Bearer
- **Calendario**: grid horario con slots de disponibilidad por profesional

## Módulos principales de la API

| Módulo | Descripción |
|--------|-------------|
| `auth` | Login / refresh / logout |
| `appointments` | Citas médicas |
| `availability` | Slots disponibles |
| `patients` | Pacientes |
| `professionals` | Profesionales de salud |
| `schedules` | Horarios de atención |
| `schedule-blocks` | Bloqueos de agenda |
| `service-types` | Tipos de servicio/procedimiento |
| `resources` | Recursos físicos (salas, equipos) |
| `waitlist` | Lista de espera |

## Calidad de código

```bash
# React quality check (meta: ≥ 95/100)
npx react-doctor@latest .
```

Consultar `CLAUDE.md` para convenciones detalladas de código y arquitectura.
