export type ProjectType = {
  id: string
  title: string
  hint: string
  /** Нижняя граница вилки, ₽. Верхняя считается с коэффициентом. */
  base: number
  spread: number
  weeks: [number, number]
}

export type PricingOption = {
  id: string
  title: string
  hint: string
  price: number
  weeks: number
}

/**
 * Цифры для калькулятора — ориентир, а не оферта.
 * Пересчитайте под свою экономику перед публикацией.
 */
export const projectTypes: ProjectType[] = [
  {
    id: 'landing',
    title: 'Лендинг',
    hint: 'Одна страница под одно целевое действие',
    base: 30_000,
    spread: 1.6,
    weeks: [1, 2],
  },
  {
    id: 'corporate',
    title: 'Корпоративный сайт',
    hint: 'До 15 страниц, админка, структура под SEO',
    base: 50_000,
    spread: 1.8,
    weeks: [2, 3],
  },
  {
    id: 'ecommerce',
    title: 'Интернет-магазин',
    hint: 'Каталог, корзина, оплата и доставка',
    base: 90_000,
    spread: 2,
    weeks: [3, 5],
  },
  {
    id: 'product',
    title: 'Веб-сервис',
    hint: 'Кабинеты, расчёты, интеграции по API',
    base: 150_000,
    spread: 2.2,
    weeks: [6, 10],
  },
]

export const pricingOptions: PricingOption[] = [
  {
    id: 'copy',
    title: 'Копирайтинг',
    hint: 'Тексты пишем мы, а не вы',
    price: 15_000,
    weeks: 0.5,
  },
  {
    id: 'motion',
    title: 'Анимации и интерактив',
    hint: 'Сложные сцены, 3D-акценты, микровзаимодействия',
    price: 20_000,
    weeks: 1,
  },
  {
    id: 'crm',
    title: 'Интеграция с CRM',
    hint: 'amoCRM, Битрикс24 или Telegram-бот',
    price: 18_000,
    weeks: 0.5,
  },
  {
    id: 'seo',
    title: 'SEO-пакет',
    hint: 'Семантика, мета-теги, микроразметка, скорость',
    price: 25_000,
    weeks: 1,
  },
  {
    id: 'multilang',
    title: 'Вторая языковая версия',
    hint: 'Переключатель языка и перевод интерфейса',
    price: 22_000,
    weeks: 1,
  },
  {
    id: 'support',
    title: 'Поддержка 3 месяца',
    hint: 'Правки по задачам и мониторинг после запуска',
    price: 45_000,
    weeks: 0,
  },
]
