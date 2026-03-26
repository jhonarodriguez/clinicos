import type { Metadata } from 'next'
import { TenantsListClient } from './tenants-list-client'

export const metadata: Metadata = { title: 'Empresas — ClinicOS Platform' }

export default function TenantsPage() {
  return <TenantsListClient />
}
