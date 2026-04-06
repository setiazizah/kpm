import Header from '../components/Header'
import Button from '../components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-surface rounded-lg p-6 shadow">
          <h1 className="text-2xl font-semibold mb-4">TIM4 MVP Prototype</h1>
          <p className="mb-6">Contoh layout berbasis permintaan. Warna primer: <span className="font-mono">#196ECD</span></p>
          <Button>Primary action</Button>
        </div>
      </main>
    </div>
  )
}
