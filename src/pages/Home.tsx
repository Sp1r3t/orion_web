import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Быстрый старт',
    text: 'Vite + React 19 + TypeScript, горячая перезагрузка из коробки.',
  },
  { title: 'Маршрутизация', text: 'React Router с общим layout и страницей 404.' },
  {
    title: 'Тесты и качество',
    text: 'Vitest, Testing Library, Prettier, oxlint и CI на GitHub Actions.',
  },
]

export default function Home() {
  return (
    <section className="section">
      <h1 className="hero__title">Создаём сайты, которые работают</h1>
      <p className="hero__text">
        Это стартовый шаблон вашего проекта. Отредактируйте <code>src/pages/Home.tsx</code>, чтобы
        начать.
      </p>
      <Link to="/contact" className="button button--primary">
        Обсудить проект
      </Link>

      <div className="grid">
        {features.map((feature) => (
          <article key={feature.title} className="card">
            <h2 className="card__title">{feature.title}</h2>
            <p className="card__text">{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
