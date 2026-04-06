
export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <div className="text-xl font-semibold">TIM4</div>
        <nav>
          <a className="mr-4 text-sm text-black" href="#">Home</a>
          <a className="text-sm text-black" href="#">About</a>
        </nav>
      </div>
    </header>
  )
}
