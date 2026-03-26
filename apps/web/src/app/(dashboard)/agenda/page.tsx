import type { Metadata } from 'next'
import { AgendaClient } from './agenda-client'

export const metadata: Metadata = { title: 'Agenda' }

export default function AgendaPage() {
  return <AgendaClient />
}
