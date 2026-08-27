import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <h1>404</h1>
      <p className="hero__text">Такой страницы не существует.</p>
      <Link to="/" className="button button--primary">
        На главную
      </Link>
    </section>
  )
}
