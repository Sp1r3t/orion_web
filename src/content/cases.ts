export type CaseItem = {
  id: string
  index: string
  name: string
  /** Сфера бизнеса — показывается на карточке при наведении. */
  field: string
  type: string
  year: string
  /** Что именно изменилось после запуска. */
  improved: string
  /** Короткая метрика для чипа. */
  result: string
  image: string
}

/**
 * ДЕМО-ДАННЫЕ. Кейсы придуманы, а снимки — случайные стоковые фотографии
 * с Unsplash, поставленные заглушками под размер карточки.
 * Перед публикацией замените и то, и другое на свои проекты.
 */
const photo = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`

export const cases: CaseItem[] = [
  {
    id: 'nordwood',
    index: '01',
    name: 'Nordwood',
    field: 'Мебель на заказ',
    type: 'Сайт + конфигуратор',
    year: '2026',
    improved: 'Конфигуратор считает смету сам, заявка уходит в CRM вместе с расчётом',
    result: 'Заявок ×2,4',
    image: photo('photo-1524758631624-e2822e304c36'),
  },
  {
    id: 'atlas',
    index: '02',
    name: 'Atlas Logistics',
    field: 'Логистика',
    type: 'Корпоративный сайт',
    year: '2026',
    improved: 'Расчёт доставки и отслеживание груза перешли на сайт с телефонных звонков',
    result: 'Звонков −35%',
    image: photo('photo-1454165804606-c3d57bc86b40'),
  },
  {
    id: 'lumen',
    index: '03',
    name: 'Lumen Clinic',
    field: 'Медицина',
    type: 'Лендинг + онлайн-запись',
    year: '2025',
    improved: 'Запись без администратора: выбор врача, времени и напоминание в Telegram',
    result: 'Записей ×1,8',
    image: photo('photo-1519494026892-80bbd2d6fd0d'),
  },
  {
    id: 'grano',
    index: '04',
    name: 'Grano Coffee',
    field: 'Обжарка кофе',
    type: 'Интернет-магазин',
    year: '2025',
    improved: 'Подписка на зерно с регулярной доставкой даёт треть выручки',
    result: 'Средний чек +28%',
    image: photo('photo-1521737604893-d14cc237f11d'),
  },
  {
    id: 'vector',
    index: '05',
    name: 'Vector Estate',
    field: 'Недвижимость',
    type: 'Веб-сервис',
    year: '2025',
    improved: 'Подбор по параметрам и выгрузка презентации объекта в PDF за один клик',
    result: 'Показов +64%',
    image: photo('photo-1560518883-ce09059eeffa'),
  },
  {
    id: 'forge',
    index: '06',
    name: 'Forge Supply',
    field: 'Оптовые поставки',
    type: 'Каталог с выгрузкой из 1С',
    year: '2025',
    improved: 'Четыре тысячи позиций с остатками обновляются автоматически',
    result: '4 000 SKU',
    image: photo('photo-1553413077-190dd305871c'),
  },
  {
    id: 'pulse',
    index: '07',
    name: 'Pulse Auto',
    field: 'Автосервис',
    type: 'Лендинг',
    year: '2024',
    improved: 'Цены и запись видны с телефона, владелец правит их сам через админку',
    result: 'Заявки с мобильных ×3',
    image: photo('photo-1486262715619-67b85e0b08d3'),
  },
  {
    id: 'linea',
    index: '08',
    name: 'Linea Studio',
    field: 'Косметология',
    type: 'Лендинг',
    year: '2024',
    improved: 'Полная стоимость курса видна до записи, поэтому меньше пустых звонков',
    result: 'Запуск за 6 дней',
    image: photo('photo-1560750588-73207b1ef5b8'),
  },
]
