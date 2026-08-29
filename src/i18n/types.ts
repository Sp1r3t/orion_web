import type { CaseItem } from '@/content/cases'
import type { PricingOption, ProjectType, UrgencyMode } from '@/content/pricing'
import type { ProcessStep, PromiseItem } from '@/content/process'
import type { FaqItem, Review } from '@/content/reviews'
import type { Service } from '@/content/services'
import type { NavItem } from '@/content/site'
import type { CurrencyId } from '@/lib/currency'

export type Lang = 'ru' | 'en'

/** Строки интерфейса: всё, что не относится к контенту разделов. */
export type Ui = {
  locale: string
  meta: { title: string; description: string }
  header: {
    nav: string
    openMenu: string
    closeMenu: string
    menu: string
    cta: string
    toLight: string
    toDark: string
    language: string
  }
  hero: { lineOne: string; lineTwo: string; words: string[]; cta: string; portfolio: string }
  services: { eyebrow: string; title: string; lead: string; term: string }
  cases: { eyebrow: string; title: string[]; lead: string; note: string }
  process: { eyebrow: string; title: string[]; lead: string; hint: string; stage: string }
  stack: { title: string }
  pricing: {
    eyebrow: string
    title: string
    lead: string
    stepType: string
    stepPace: string
    stepOptions: string
    includes: string
    showMore: string
    estimate: string
    rush: string
    upTo: string
    projectType: string
    term: string
    weeks: string
    chosen: string
    none: string
    discuss: string
    reset: string
    disclaimer: string
    surcharge: string
    from: string
    what: string
    add: string
    remove: string
    rushNote: string
    currency: string
    rateAt: string
    currencies: Record<CurrencyId, string>
  }
  promises: { eyebrow: string; title: string; lead: string }
  reviews: { eyebrow: string; title: string; lead: string; list: string; item: string }
  faq: {
    eyebrow: string
    title: string
    lead: string
    more: string
    moreText: string
    write: string
  }
  contact: {
    eyebrow: string
    title: string[]
    lead: string
    attached: string
    edit: string
    projectType: string
    pace: string
    term: string
    weeks: string
    options: string
    noOptions: string
    name: string
    namePlaceholder: string
    contact: string
    contactPlaceholder: string
    need: string
    budget: string
    about: string
    aboutPlaceholder: string
    consent: string
    submit: string
    sending: string
    sentTitle: string
    sentText: string
    again: string
    notConfigured: string
    failed: string
    notConfiguredText: string
    failedText: string
    copy: string
    copied: string
    openTelegram: string
    back: string
    taskChips: string[]
    budgetChips: string[]
  }
  footer: {
    line: string
    cta: string
    sections: string
    contacts: string
    rights: string
    top: string
  }
  leadMail: {
    name: string
    contact: string
    task: string
    budget: string
    comment: string
    estimate: string
    projectType: string
    pace: string
    options: string
    noOptions: string
    range: string
    term: string
    weeks: string
  }
}

export type Bundle = {
  site: {
    name: string
    tagline: string
    description: string
    telegram: string
    email: string
    phone: string
    city: string
  }
  navItems: NavItem[]
  stats: Array<{ value: string; unit: string; caption: string }>
  stack: string[]
  services: Service[]
  cases: CaseItem[]
  processSteps: ProcessStep[]
  promises: PromiseItem[]
  projectTypes: ProjectType[]
  pricingOptions: PricingOption[]
  optionGroups: readonly string[]
  urgencyModes: UrgencyMode[]
  reviews: Review[]
  faq: FaqItem[]
  ui: Ui
}
