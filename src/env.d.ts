/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Куда уходит заявка с формы: форм-сервис или свой обработчик. */
  readonly VITE_LEAD_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** View Transitions ещё нет в стандартных типах DOM этой версии TypeScript. */
interface ViewTransition {
  readonly ready: Promise<void>
  readonly finished: Promise<void>
  skipTransition(): void
}

interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition
}
