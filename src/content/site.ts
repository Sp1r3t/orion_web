export const site = {
  name: 'ORION',
  tagline: 'Веб-студия полного цикла',
  description:
    'Проектируем и разрабатываем сайты, которые приводят клиентов. Дизайн, разработка, запуск и поддержка — под ключ.',
  telegram: 'https://t.me/orion',
  email: 'hello@orion.ru',
  phone: '+7 000 000-00-00',
} as const

export type NavItem = {
  id: string
  label: string
}

/** Пункты хедера. Каждый — якорь к секции с таким же id на странице. */
export const navItems: NavItem[] = [
  { id: 'solutions', label: 'Решения' },
  { id: 'portfolio', label: 'Портфолио' },
  { id: 'process', label: 'Процесс' },
  { id: 'pricing', label: 'Тарифы' },
]

/** Секции, которые отслеживает scroll-spy: пункты меню плюс цель кнопки CTA. */
export const spySectionIds = [...navItems.map((item) => item.id), 'contact']
