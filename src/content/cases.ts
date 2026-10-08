export type CaseItem = {
  id: string
  index: string
  name: string
  /** Сфера бизнеса — показывается на карточке при наведении. */
  field: string
  type: string
  /** Что сделано на сайте — одна фраза под названием. */
  improved: string
  /** Живой сайт: карточка открывает его в новой вкладке. */
  url: string
  image: string
}

/** Снимки лежат в public/portfolio — квадрат 800×800, как карточка. */
const shot = (id: string) => `/portfolio/${id}.webp?v=20261008-2`

export const cases: CaseItem[] = [
  {
    id: 'loveconcert',
    index: '01',
    name: 'LOVECONCERT',
    field: 'Концертное агентство',
    type: 'Сайт-афиша',
    improved: 'Афиша концертов с датами и площадками, артисты и групповые заказы',
    url: 'https://loveconcert.ru/',
    image: shot('loveconcert'),
  },
  {
    id: 'boggart',
    index: '02',
    name: 'БОГГАРТ',
    field: 'Разработка игр',
    type: 'Сайт студии',
    improved: 'Сайт студии аутсорсинга и разработки игр: услуги, карьера и блог',
    url: 'https://bogg.art/',
    image: shot('boggart'),
  },
  {
    id: 'uct',
    index: '03',
    name: 'UCT',
    field: 'Автосервис',
    type: 'Корпоративный сайт',
    improved: 'Услуги, тюнинг и спецпредложения премиального автосервиса с записью на консультацию',
    url: 'https://uct.ru/',
    image: shot('uct'),
  },
  {
    id: 'ruff',
    index: '04',
    name: 'RUFF',
    field: 'Бренд одежды',
    type: 'Интернет-магазин',
    improved: 'Магазин коллекций с корзиной, избранным и скидкой за подписку',
    url: 'https://ruff.global/',
    image: shot('ruff'),
  },
  {
    id: 'civil',
    index: '05',
    name: 'CIVIL',
    field: 'Уличная одежда',
    type: 'Интернет-магазин',
    improved: 'Магазин капсульных коллекций независимого российского бренда',
    url: 'https://frht.ru/',
    image: shot('civil'),
  },
  {
    id: 'tutorplace',
    index: '06',
    name: 'TutorPlace',
    field: 'Онлайн-образование',
    type: 'Образовательная платформа',
    improved: 'Каталог курсов, авторы и тарифы с пробным доступом за 1 ₽',
    url: 'https://tutorplace.ru/',
    image: shot('tutorplace'),
  },
  {
    id: 'rokucyber',
    index: '07',
    name: 'RokuCyber',
    field: 'Компьютерный клуб',
    type: 'Сайт клуба',
    improved: 'Игровые зоны, цены и акции кибер-лаунжа с онлайн-бронью места',
    url: 'https://rokucyber.club/',
    image: shot('rokucyber'),
  },
  {
    id: 'bonsai',
    index: '08',
    name: 'BONSAI',
    field: 'Инженерная разработка',
    type: 'Корпоративный сайт',
    improved: 'Embedded-системы и промышленный IoT: решения, экспертиза и кейсы',
    url: 'https://bonsai-agency.com/',
    image: shot('bonsai'),
  },
]

/** Домен без www и слэша — подпись на чипе карточки. */
export function caseHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}
