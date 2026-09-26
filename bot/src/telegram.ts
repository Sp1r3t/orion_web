import type { Keyboard } from './types'

export class TelegramError extends Error {
  constructor(
    readonly method: string,
    readonly description: string,
  ) {
    super(`Telegram ${method}: ${description}`)
    this.name = 'TelegramError'
  }
}

type SendOptions = { silent?: boolean; forceReply?: string; replyTo?: number }

/** Тонкая обёртка над Bot API: только те методы, что нужны боту. */
export class Telegram {
  constructor(private readonly token: string) {}

  async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await response.json()) as { ok: boolean; result: T; description?: string }
    if (!data.ok) throw new TelegramError(method, data.description ?? String(response.status))
    return data.result
  }

  async send(
    chatId: string | number,
    text: string,
    keyboard?: Keyboard,
    options: SendOptions = {},
  ) {
    const markup = options.forceReply
      ? { force_reply: true, input_field_placeholder: options.forceReply }
      : keyboard
        ? { inline_keyboard: keyboard }
        : undefined

    const message = await this.call<{ message_id: number }>('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      disable_notification: options.silent ?? false,
      reply_markup: markup,
      reply_parameters: options.replyTo ? { message_id: options.replyTo } : undefined,
    })
    return message.message_id
  }

  /** Правка сообщения на месте. «Ничего не изменилось» ошибкой не считаем. */
  async edit(chatId: string | number, messageId: number, text: string, keyboard: Keyboard) {
    try {
      await this.call('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: keyboard },
      })
    } catch (error) {
      if (error instanceof TelegramError && error.description.includes('not modified')) return
      throw error
    }
  }

  /** Удаление; старше 48 часов Telegram удалять не даёт — тогда вернём false. */
  async remove(chatId: string | number, messageId: number): Promise<boolean> {
    try {
      await this.call('deleteMessage', { chat_id: chatId, message_id: messageId })
      return true
    } catch {
      return false
    }
  }

  async answer(callbackId: string, text?: string, alert = false) {
    await this.call('answerCallbackQuery', {
      callback_query_id: callbackId,
      text,
      show_alert: alert,
    }).catch(() => {})
  }
}
