import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/about', label: 'О нас', end: false },
  { to: '/contact', label: 'Контакты', end: false },
]

export default function Header() {
  return (
    <header className="header">
      <NavLink to="/" className="header__logo">
        WebAgency
      </NavLink>
      <nav className="header__nav" aria-label="Основная навигация">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? 'header__link header__link--active' : 'header__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
