export type CaseItem = {
  id: string
  index: string
  name: string
  field: string
  type: string
  year: string
  description: string
  result: string
  /** Цвета для превью-карточки, которая всплывает при наведении на строку. */
  gradient: string
}

/**
 * ДЕМО-ДАННЫЕ. Кейсы придуманы, чтобы показать вёрстку секции.
 * Перед публикацией замените на реальные проекты — выдуманные кейсы
 * на живом сайте вводят клиентов в заблуждение.
 */
export const cases: CaseItem[] = [
  {
    id: 'nordwood',
    index: '01',
    name: 'Nordwood',
    field: 'Мебель на заказ',
    type: 'Сайт + конфигуратор',
    year: '2026',
    description:
      'Конфигуратор кухни с расчётом стоимости по материалам и фурнитуре. Заявка уходит в CRM вместе со сметой.',
    result: 'Заявок ×2,4',
    gradient: 'from-[#ff6a00] to-[#7a2b00]',
  },
  {
    id: 'atlas',
    index: '02',
    name: 'Atlas Logistics',
    field: 'Логистика',
    type: 'Корпоративный сайт',
    year: '2026',
    description:
      'Калькулятор доставки, личный кабинет клиента и отслеживание груза по номеру заказа.',
    result: 'Звонков −35%',
    gradient: 'from-[#ffb020] to-[#5a3a00]',
  },
  {
    id: 'lumen',
    index: '03',
    name: 'Lumen Clinic',
    field: 'Медицина',
    type: 'Лендинг + запись',
    year: '2025',
    description:
      'Онлайн-запись с выбором врача и времени, напоминания в Telegram, прозрачные цены до визита.',
    result: 'Записей ×1,8',
    gradient: 'from-[#ff8524] to-[#3a1400]',
  },
  {
    id: 'grano',
    index: '04',
    name: 'Grano Coffee',
    field: 'Обжарка кофе',
    type: 'Интернет-магазин',
    year: '2025',
    description:
      'Магазин с подпиской на зерно: выбор обжарки, регулярная доставка и оплата в один экран.',
    result: 'Средний чек +28%',
    gradient: 'from-[#c24a00] to-[#1a0a00]',
  },
  {
    id: 'vector',
    index: '05',
    name: 'Vector Estate',
    field: 'Недвижимость',
    type: 'Веб-сервис',
    year: '2025',
    description:
      'Витрина объектов с фильтрами, подбором по параметрам и выгрузкой презентации в PDF.',
    result: 'Показов +64%',
    gradient: 'from-[#ff6a00] to-[#26160a]',
  },
]
