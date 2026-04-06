import { useState } from 'react'
import Card from '../components/ui/Card'
import KontenFilterBar from '../components/konten/KontenFilterBar'
import KontenTable from '../components/konten/KontenTable'
import { KONTEN_ROWS } from '../data/browserKonten'

export default function BrowserKontenPage() {
  const [search, setSearch] = useState('')

  const filtered = KONTEN_ROWS.filter(r =>
    r.content.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-7 overflow-y-auto h-full">
      <Card>
        <KontenFilterBar search={search} onSearchChange={setSearch} />
        <KontenTable rows={filtered} />
      </Card>
    </div>
  )
}
