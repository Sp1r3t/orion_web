export const site = {
  name: 'ORION',
  tagline: 'Веб-студия полного цикла',
  description:
    'Стратегия, дизайн, разработка и поддержка. Собираем сайты и сервисы, которые приносят заявки, а не просто красиво выглядят.',
  telegram: 'https://t.me/orion',
  email: 'hello@orion.ru',
  phone: '+7 000 000-00-00',
  city: 'Работаем удалённо по всей России',
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

export const stats = [
  { value: '2–6', unit: 'недель', caption: 'от брифа до запуска' },
  { value: '40+', unit: 'проектов', caption: 'сайтов и сервисов в работе' },
  { value: '12', unit: 'месяцев', caption: 'гарантия на код' },
  { value: '1', unit: 'час', caption: 'среднее время ответа' },
]

export const stack = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'PostgreSQL',
  'Figma',
  'Motion',
  'Vite',
  'Docker',
  'Яндекс.Метрика',
  'Telegram Bot API',
]
