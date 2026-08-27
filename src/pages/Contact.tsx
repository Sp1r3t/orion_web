import { useState } from 'react'
import type { FormEvent } from 'react'

import Button from '@/components/Button'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: подключить реальную отправку формы (API / почтовый сервис).
    setSent(true)
  }

  return (
    <section className="section">
      <h1>Контакты</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          Имя
          <input name="name" type="text" required />
        </label>
        <label className="form__field">
          Email
          <input name="email" type="email" required />
        </label>
        <label className="form__field">
          Сообщение
          <textarea name="message" rows={5} required />
        </label>
        <Button type="submit">Отправить</Button>
      </form>
      {sent && <p role="status">Спасибо! Мы свяжемся с вами.</p>}
    </section>
  )
}
