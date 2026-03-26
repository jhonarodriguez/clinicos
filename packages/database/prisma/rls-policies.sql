-- =============================================================================
-- RLS Policies — Identity Context
-- Sprint 2 — ClinicOS
--
-- Activa Row Level Security en las tablas del contexto de identidad.
-- El interceptor RlsInterceptor setea app.current_tenant en cada request:
--   - UUID del tenant  → usuario normal (solo ve su tenant)
--   - 'SUPERADMIN'     → bypass completo (superadmin ve todo)
--   - NULL / no seteado → 0 filas visibles (request no autenticado)
-- =============================================================================

-- ── users ────────────────────────────────────────────────────────────────────
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "users";
CREATE POLICY tenant_isolation ON "users"
  FOR ALL
  USING (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  )
  WITH CHECK (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  );

-- ── roles ────────────────────────────────────────────────────────────────────
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "roles";
CREATE POLICY tenant_isolation ON "roles"
  FOR ALL
  USING (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  )
  WITH CHECK (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  );

-- ── sessions ─────────────────────────────────────────────────────────────────
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "sessions";
CREATE POLICY tenant_isolation ON "sessions"
  FOR ALL
  USING (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  )
  WITH CHECK (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  );

-- ── tenant_sites ─────────────────────────────────────────────────────────────
ALTER TABLE "tenant_sites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_sites" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "tenant_sites";
CREATE POLICY tenant_isolation ON "tenant_sites"
  FOR ALL
  USING (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  )
  WITH CHECK (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  );

-- ── tenant_features ──────────────────────────────────────────────────────────
ALTER TABLE "tenant_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_features" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "tenant_features";
CREATE POLICY tenant_isolation ON "tenant_features"
  FOR ALL
  USING (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  )
  WITH CHECK (
    current_setting('app.current_tenant', true) IN ('SUPERADMIN', tenant_id::text)
  );
