import type { Metadata } from 'next'
import { TenantDetailClient } from './tenant-detail-client'

export const metadata: Metadata = { title: 'Detalle Empresa — ClinicOS Platform' }

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  return <TenantDetailClient id={params.id} />
}
