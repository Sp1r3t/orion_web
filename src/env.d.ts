/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Куда уходит заявка с формы: форм-сервис или свой обработчик. */
  readonly VITE_LEAD_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
