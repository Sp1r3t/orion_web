/**
 * Пересылка писем из Gmail в Telegram-бота ORION.
 *
 * Скрипт живёт в аккаунте orion.company.web@gmail.com (script.google.com) и раз
 * в минуту отправляет боту новые письма из «Входящих». Он же, развёрнутый как
 * веб-приложение, выполняет кнопки бота «Прочитано», «Непрочитано» и «В архив».
 *
 * Настройка — в bot/README.md, раздел «Почта».
 */

/**
 * Адрес бота без слэша в конце:
 *   свой сервер — https://ваш-домен/api
 *   Cloudflare — https://orion-bot.имя.workers.dev
 */
const WORKER_URL = 'https://REPLACE_ME/api'

/** Письма крупнее обрезаем: в Telegram они всё равно раскрываются по кнопке. */
const BODY_LIMIT = 6000

const props = PropertiesService.getScriptProperties()

/** Секрет хранится в свойствах скрипта, а не в коде: Настройки проекта → Свойства скрипта. */
function secret_() {
  const value = props.getProperty('MAIL_SECRET')
  if (!value) throw new Error('Задайте MAIL_SECRET в свойствах скрипта')
  return value
}

/**
 * Запустите один раз вручную: создаёт минутный триггер. Старые письма не
 * пересылаются — отсчёт идёт с момента запуска.
 */
function setup() {
  secret_()
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'forwardNewMail')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger))

  ScriptApp.newTrigger('forwardNewMail').timeBased().everyMinutes(1).create()
  props.setProperty('LAST_TS', String(Date.now()))
}

/** Отправить боту тестовым письмом самое свежее из «Входящих». */
function sendTest() {
  const [thread] = GmailApp.search('in:inbox', 0, 1)
  if (!thread) throw new Error('Во «Входящих» пусто')
  const messages = thread.getMessages()
  Logger.log(send_(messages[messages.length - 1]) ? 'Отправлено' : 'Воркер не принял письмо')
}

function forwardNewMail() {
  const lock = LockService.getScriptLock()
  if (!lock.tryLock(5000)) return

  try {
    const since = Number(props.getProperty('LAST_TS')) || Date.now() - 10 * 60 * 1000
    const me = Session.getEffectiveUser().getEmail().toLowerCase()
    const fresh = []

    GmailApp.search('in:inbox newer_than:2d', 0, 40).forEach((thread) => {
      thread.getMessages().forEach((message) => {
        const own = message.getFrom().toLowerCase().includes(me)
        if (message.getDate().getTime() > since && !own) fresh.push(message)
      })
    })

    fresh.sort((a, b) => a.getDate() - b.getDate())

    let last = since
    for (const message of fresh) {
      // Воркер не ответил — остановимся и повторим с этого письма через минуту.
      if (!send_(message)) break
      last = Math.max(last, message.getDate().getTime())
    }
    props.setProperty('LAST_TS', String(last))
  } finally {
    lock.releaseLock()
  }
}

function send_(message) {
  const payload = {
    id: message.getId(),
    threadId: message.getThread().getId(),
    from: message.getFrom(),
    subject: message.getSubject(),
    date: message.getDate().toISOString(),
    body: clean_(message.getPlainBody()).slice(0, BODY_LIMIT),
    attachments: message
      .getAttachments({ includeInlineImages: false })
      .map((file) => file.getName())
      .slice(0, 10),
  }

  const response = UrlFetchApp.fetch(`${WORKER_URL}/mail`, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Orion-Secret': secret_() },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })

  const code = response.getResponseCode()
  if (code >= 300) Logger.log(`Воркер ответил ${code}: ${response.getContentText()}`)
  return code < 300
}

/** Убираем цитату прошлой переписки и лишние пустые строки. */
function clean_(text) {
  const lines = []
  for (const line of text.split(/\r?\n/)) {
    if (
      /^(On .+wrote:|.+ писал\(а\):|.+ написал\(а\):|-----Original Message-----)$/.test(line.trim())
    )
      break
    if (!line.startsWith('>')) lines.push(line)
  }
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Кнопки бота: веб-приложение принимает { secret, action, id }. */
function doPost(event) {
  let data
  try {
    data = JSON.parse(event.postData.contents)
  } catch (error) {
    return json_({ ok: false, error: 'bad_request' })
  }

  if (data.secret !== secret_()) return json_({ ok: false, error: 'forbidden' })

  try {
    const message = GmailApp.getMessageById(data.id)
    if (data.action === 'read') message.markRead()
    else if (data.action === 'unread') message.markUnread()
    else if (data.action === 'archive') message.getThread().moveToArchive()
    else return json_({ ok: false, error: 'unknown_action' })
    return json_({ ok: true })
  } catch (error) {
    return json_({ ok: false, error: String(error) })
  }
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
