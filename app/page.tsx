export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Облако слов Live</h1>
      <p className="opacity-80">QR-код ведёт на страницу опроса. Админ запускает опрос и видит облако слов в реальном времени.</p>
      <div className="flex gap-3">
        <a className="px-4 py-2 rounded bg-primary hover:bg-primary-dark" href="/survey">Перейти к опросу</a>
        <a className="px-4 py-2 rounded border border-white/20" href="/admin">Панель администратора</a>
      </div>
    </div>
  )
}

