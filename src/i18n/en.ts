import type { Bundle } from './types'

/**
 * Английская версия сайта. Тексты — перевод русского контента, а не
 * подстрочник: цифры и смысл те же, формулировки живые.
 */
export const en: Bundle = {
  site: {
    name: 'ORION',
    tagline: 'Full-cycle web studio',
    description: [
      'Strategy, design, development, launch.',
      'We build sites that win customers and stay in mind.',
    ],
    telegram: 'https://t.me/sp1retdev',
    email: 'orion.company.web@gmail.com',
    phone: '+7-903-317-57-93',
    city: 'Working remotely, worldwide',
  },

  navItems: [
    { id: 'solutions', label: 'Solutions' },
    { id: 'portfolio', label: 'Work' },
    { id: 'process', label: 'Process' },
    { id: 'pricing', label: 'Pricing' },
  ],

  stats: [
    { value: '2–6', unit: 'weeks', caption: 'from brief to launch' },
    { value: '40+', unit: 'projects', caption: 'sites and services shipped' },
    { value: '12', unit: 'months', caption: 'warranty on the code' },
    { value: '1', unit: 'hour', caption: 'average reply time' },
  ],

  stack: [
    'React',
    'TypeScript',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Figma',
    'Motion',
    'Vite',
    'Docker',
    'Yandex.Metrica',
    'Telegram Bot API',
  ],

  services: [
    {
      id: 'landing',
      index: '01',
      title: 'Landing page',
      summary: 'One page that carries the visitor to a request',
      details:
        'We unpack the offer and the objections, then build the structure around a single action. Every screen answers the question a visitor has at that exact moment.',
      deliverables: ['Wireframe and copy', 'Original design', 'Motion', 'Form and analytics'],
      priceFrom: 30_000,
      term: '5–7 days',
    },
    {
      id: 'corporate',
      index: '02',
      title: 'Corporate site',
      summary: 'When one page can no longer hold all your services',
      details:
        'We design the structure so anyone finds what they need in two clicks, and wire up an admin panel so you can edit the content without us.',
      deliverables: ['Up to 7 pages', 'Admin panel', 'SEO structure', 'CRM integrations'],
      priceFrom: 50_000,
      term: '2–4 weeks',
    },
    {
      id: 'ecommerce',
      index: '03',
      title: 'Online store',
      summary: 'Catalogue, cart, payments and delivery',
      details:
        'We build the store around the way people actually buy: filters, product page, cart on one screen. Payments, delivery services and stock sync included.',
      deliverables: ['Catalogue and filters', 'Cart and checkout', 'Delivery', 'Stock sync'],
      priceFrom: 120_000,
      term: '3–8 weeks',
    },
    {
      id: 'product',
      index: '04',
      title: 'Web service',
      summary: 'Client dashboards, configurators, calculators',
      details:
        'For work an ordinary site cannot close: calculations, roles, API integrations. We start with an MVP and grow it on data rather than guesses.',
      deliverables: ['Architecture', 'Client dashboards', 'API integrations', 'Roles and access'],
      priceFrom: 180_000,
      term: '6–12 weeks',
    },
    {
      id: 'redesign',
      index: '05',
      title: 'Redesign',
      summary: 'You have a site, and it gets in the way of selling',
      details:
        'We read the analytics and session recordings to find where people drop off, then rebuild the interface while keeping your search rankings and content.',
      deliverables: ['Audit and metrics', 'New interface', 'Content migration', 'SEO preserved'],
      priceFrom: 40_000,
      term: '2–4 weeks',
    },
  ],

  cases: [
    {
      id: 'loveconcert',
      index: '01',
      name: 'LOVECONCERT',
      field: 'Concert agency',
      type: 'Event listings site',
      improved: 'Concert listings with dates and venues, artist pages and group bookings',
      url: 'https://loveconcert.ru/',
      image: '/portfolio/loveconcert.webp',
    },
    {
      id: 'boggart',
      index: '02',
      name: 'BOGGART',
      field: 'Game development',
      type: 'Studio website',
      improved: 'Site for a game outsourcing and development studio: services, careers and blog',
      url: 'https://bogg.art/',
      image: '/portfolio/boggart.webp',
    },
    {
      id: 'uct',
      index: '03',
      name: 'UCT',
      field: 'Car service',
      type: 'Corporate site',
      improved:
        'Services, tuning and special offers of a premium car service with consultation booking',
      url: 'https://uct.ru/',
      image: '/portfolio/uct.webp',
    },
    {
      id: 'ruff',
      index: '04',
      name: 'RUFF',
      field: 'Clothing brand',
      type: 'Online store',
      improved: 'Collections store with cart, wishlist and a subscription discount',
      url: 'https://ruff.global/',
      image: '/portfolio/ruff.webp',
    },
    {
      id: 'civil',
      index: '05',
      name: 'CIVIL',
      field: 'Streetwear',
      type: 'Online store',
      improved: 'Store for the capsule collections of an independent Russian brand',
      url: 'https://civilstreet.ru/',
      image: '/portfolio/civil.webp',
    },
    {
      id: 'tutorplace',
      index: '06',
      name: 'TutorPlace',
      field: 'Online education',
      type: 'Learning platform',
      improved: 'Course catalogue, authors and plans with a 1 ₽ trial',
      url: 'https://tutorplace.ru/',
      image: '/portfolio/tutorplace.webp',
    },
    {
      id: 'rokucyber',
      index: '07',
      name: 'RokuCyber',
      field: 'Gaming club',
      type: 'Club website',
      improved: 'Gaming zones, prices and promos of a cyber lounge with online seat booking',
      url: 'https://rokucyber.club/',
      image: '/portfolio/rokucyber.webp',
    },
    {
      id: 'bonsai',
      index: '08',
      name: 'BONSAI',
      field: 'Engineering',
      type: 'Corporate site',
      improved: 'Embedded systems and industrial IoT: solutions, expertise and case studies',
      url: 'https://bonsai-agency.com/',
      image: '/portfolio/bonsai.webp',
    },
  ],

  processSteps: [
    {
      index: '01',
      title: 'Brief and discovery',
      icon: 'brief',
      duration: '2–3 days',
      text: 'We find out who you sell to, what a person weighs when choosing a contractor and what stops them just short of a request. We look at competitors and at your current analytics if a site already exists.',
      points: ['Interview with you', 'Competitor analysis', 'Goals and metrics'],
    },
    {
      index: '02',
      title: 'Structure and wireframe',
      icon: 'structure',
      duration: '3–5 days',
      text: 'We assemble the page skeleton and the copy before any design. This is the cheapest moment to argue and rebuild, so we iterate until it clicks.',
      points: ['Screen map', 'Wireframe', 'Copywriting'],
    },
    {
      index: '03',
      title: 'Design and development',
      icon: 'build',
      duration: '1–4 weeks',
      text: 'We design, agree and build in parallel. You get a working link from the first days instead of a finished result at the very end.',
      points: ['Figma mockups', 'Phone, tablet, desktop', 'Motion and interaction'],
    },
    {
      index: '04',
      title: 'Launch and aftercare',
      icon: 'launch',
      duration: '1–2 days',
      text: 'We move everything to your domain, connect analytics and forms, hand over the sources and the accounts. After that: warranty and support.',
      points: ['Domain and hosting', 'Analytics and goals', 'Sources and access'],
    },
  ],

  promises: [
    {
      title: 'A contract with a spec before we start',
      text: 'Scope, deadlines and price are fixed on paper. We work with individuals, sole traders and companies.',
      span: 'wide',
      glyph: 'contract',
    },
    {
      title: '12-month warranty',
      text: 'Bugs in our code are fixed free of charge for a full year after launch.',
      span: 'small',
      glyph: 'shield',
    },
    {
      title: 'The sources stay with you',
      text: 'On delivery you get the files, the accounts and the repository. The site is yours, not rented from a studio.',
      span: 'small',
      glyph: 'code',
    },
    {
      title: 'One team for the whole cycle',
      text: 'Design, front-end, back-end and launch all happen in-house — nothing gets handed between contractors.',
      span: 'wide',
      glyph: 'team',
    },
    {
      title: 'You can see the work happening',
      text: 'A live link and a task board from day one. Check the progress whenever you like, no calls required.',
      span: 'full',
      glyph: 'chart',
    },
  ],

  projectTypes: [
    {
      id: 'landing',
      title: 'Landing page',
      hint: 'One page built around one action',
      icon: 'landing',
      base: 30_000,
      spread: 1.6,
      weeks: [1, 2],
      includes: ['Original design', 'Phone, tablet, desktop', 'Lead form'],
    },
    {
      id: 'corporate',
      title: 'Corporate site',
      hint: 'Up to 7 pages structured for search',
      icon: 'corporate',
      base: 50_000,
      spread: 1.8,
      weeks: [2, 4],
      includes: ['Up to 7 pages', 'Original design', 'Basic SEO'],
    },
    {
      id: 'ecommerce',
      title: 'Online store',
      hint: 'Catalogue, cart, payments and delivery',
      icon: 'shop',
      base: 120_000,
      weeks: [3, 8],
      includes: ['Catalogue and filters', 'Cart', 'Delivery', 'Stock sync'],
      includedOptions: ['account', 'payments', 'seo'],
    },
    {
      id: 'product',
      title: 'Web service',
      hint: 'Dashboards, calculations, API integrations',
      icon: 'product',
      base: 180_000,
      weeks: [6, 12],
      includes: ['Architecture', 'Roles and access', 'API integrations', 'Documentation'],
      includedOptions: ['account', 'payments', 'seo', 'admin'],
    },
  ],

  optionGroups: ['Analytics and data', 'Managing the site', 'Functionality', 'Growth'],

  pricingOptions: [
    {
      id: 'metrika',
      group: 'Analytics and data',
      title: 'Yandex.Metrica and goals',
      hint: 'See where your leads come from',
      explain:
        'Metrica is a free analytics counter by Yandex. We install it and set up goals: form submissions, phone clicks, messenger taps. Session recording included. After that you can see which ads bring requests and which only burn budget.',
      price: 8_000,
      weeks: 0.5,
    },
    {
      id: 'admin',
      group: 'Managing the site',
      title: 'Admin panel',
      hint: 'Edit the content yourself, without us',
      explain:
        'A CMS is a content management system: a private area behind a login where you edit texts, images, prices, products and news through ordinary fields, no code. We tailor it to your blocks and show you how to use it.',
      price: 25_000,
      weeks: 1.5,
    },
    {
      id: 'multilang',
      group: 'Managing the site',
      title: 'A second language version',
      hint: 'A language switch on the site',
      explain:
        'A full copy of the interface in a second language with a switch in the header. You supply the texts, or we translate them for an extra fee. Search engines get the correct language tags, so the versions do not compete with each other.',
      price: 15_000,
      weeks: 1,
    },
    {
      id: 'widgets',
      group: 'Functionality',
      title: 'Complex widgets',
      hint: 'Calculator, configurator, finder, map',
      explain:
        'A widget is an interactive block that does real work on the page: a price calculator, a product configurator, a search by parameters, a map with filters, a booking slot picker. Each one is designed and coded separately, so we count them by the piece.',
      price: 8_000,
      weeks: 0.5,
      quantity: { max: 6, unit: 'pcs' },
    },
    {
      id: 'account',
      group: 'Functionality',
      title: 'Client dashboard',
      hint: 'Sign-in, history, documents',
      explain:
        'A section customers log into: order history, statuses, invoices and documents, saved details. It takes "where is my order" and "please resend the invoice" off your managers.',
      price: 30_000,
      weeks: 2,
    },
    {
      id: 'payments',
      group: 'Functionality',
      title: 'Online payments',
      hint: 'Card processing and receipts',
      explain:
        'Card payments taken right on the site through a payment provider. We connect the service, set up refunds and automatic receipts for the customer. You sign the contract with the bank, we do the technical part.',
      price: 20_000,
      weeks: 1,
    },
    {
      id: 'chatbot',
      group: 'Functionality',
      title: 'Telegram bot for leads',
      hint: 'The request hits your chat in a second',
      explain:
        'The bot posts every new request into your chat or your team channel the moment the form is sent — all fields plus a "taking it" button. Handy when a CRM is overkill but you need to react fast.',
      price: 15_000,
      weeks: 0.5,
    },
    {
      id: 'seo',
      group: 'Growth',
      title: 'SEO package',
      hint: 'So the site can be found in search',
      explain:
        'SEO is preparing the site for search. We collect the queries people look for you with, write page titles and descriptions, add Schema.org markup (which produces rich snippets), and set up robots.txt and the sitemap.',
      price: 8_000,
      weeks: 1,
    },
    {
      id: 'copy',
      group: 'Growth',
      title: 'Copywriting',
      hint: 'We write the texts, not you',
      explain:
        'We take on the copy for every screen: the offer, service descriptions, answers to objections, button labels. Written after an interview with you, so it sounds like you and not like filler.',
      price: 10_000,
      weeks: 0.5,
    },
    {
      id: 'motion',
      group: 'Growth',
      title: 'Motion and interaction',
      hint: 'Scroll-driven scenes, micro-interactions',
      explain:
        'Complex scenes that come alive as you scroll, parallax, interactive hints and transitions between screens. This is what separates an expensive site from a template, and it needs its own time to get right.',
      price: 20_000,
      weeks: 1,
    },
  ],

  urgencyModes: [
    {
      id: 'normal',
      title: 'Normal pace',
      hint: 'You go into the regular queue',
      priceFactor: 1,
      timeFactor: 1,
    },
    {
      id: 'fast',
      title: 'Rush launch',
      hint: 'Top priority, work runs in parallel',
      priceFactor: 1.2,
      timeFactor: 0.65,
    },
  ],

  reviews: [
    {
      id: 'r1',
      quote:
        'I came in saying "I need a site" and got a breakdown of how our bookings actually work. Half the blocks I wanted were cut at the wireframe stage — and rightly so. We launched in a week and bookings started on day three.',
      author: 'Anastasia K.',
      role: 'Founder, cosmetology studio',
      result: 'Live in 6 days',
    },
    {
      id: 'r2',
      quote:
        'I asked for an ordinary site and got something incredible. Thanks to the ORION team the sales managers stopped quoting in spreadsheets — a request now arrives with the price and the materials already in it.',
      author: 'Dmitry V.',
      role: 'Commercial director, furniture manufacturing',
      result: 'Leads ×2.4',
    },
    {
      id: 'r3',
      quote:
        'What I liked most is that the work is visible every day: a link, a task board. I never once had to write "so how is it going". The one thing — collecting the texts on our side took two weeks, and that is what held us up.',
      author: 'Ilya M.',
      role: 'Marketing lead, transport company',
      result: 'Leads ×1.8',
    },
    {
      id: 'r4',
      quote:
        'We are a small coffee shop and the budget was modest. Nobody tried to sell us extras: they built a store with sharp-looking promotion, and that was it. The site brought us 28% more customers',
      author: 'Olga T.',
      role: 'Co-owner, coffee shop',
      result: 'Customers +28%',
    },
    {
      id: 'r5',
      quote:
        'I know nothing about websites and was afraid of being buried in jargon. Every decision was explained in plain words — what it is for and what it costs. Now I change the prices in the admin panel myself, without calling anyone.',
      author: 'Sergey P.',
      role: 'Owner, car service',
      result: 'Leads ×3',
    },
    {
      id: 'r6',
      quote:
        'The old site took eight seconds to load and was unusable on a phone. They rebuilt it while keeping our search positions — that was what worried me most. Traffic held and the requests went noticeably up.',
      author: 'Marina L.',
      role: 'Clinic director',
      result: 'Load 8s → 1.4s',
    },
    {
      id: 'r7',
      quote:
        'A four-thousand-item catalogue synced with Excel is not a pleasant job; two studios had already turned us down. This team took it, broke it into stages and finished it. Deadlines moved a couple of times, but we always knew in advance.',
      author: 'Artem Zh.',
      role: 'Development director, wholesale supply',
      result: '4,000 items in the catalogue',
    },
  ],

  faq: [
    {
      question: 'How much does a site cost?',
      answer:
        'A landing page starts at $350, a corporate site at $580, a store at $1,390. We name the exact figure after the brief: it depends on the scope, the integrations and who writes the copy. Use the calculator above for a range.',
    },
    {
      question: 'How long does development take?',
      answer:
        'A landing page takes 5–7 days, a corporate site 2–4 weeks, a store 3–8 weeks. Deadlines go into the contract. The longest part is usually not development but approving texts and materials on your side.',
    },
    {
      question: 'What if I do not like the design?',
      answer:
        'We agree the wireframe and the copy before any mockups, so the design is rarely a surprise. Two rounds of revisions are included; if the whole concept misses, we draw an alternative.',
    },
    {
      question: 'Who writes the copy and where do photos come from?',
      answer:
        'We can write it — that is a separate option in the estimate. Photos come from stock libraries, or we arrange a shoot. If you already have materials, just hand them over at the brief stage.',
    },
    {
      question: 'What happens after launch?',
      answer:
        'You get the sources, the repository and every account, plus a walkthrough of the content tools. Bugs in our code are fixed free for 12 months. After that, support on request if you want it.',
    },
    {
      question: 'Do you work under a contract and with companies?',
      answer:
        'Yes. A contract with a technical spec, deadlines and price, and closing documents. We work with individuals, sole traders and companies, with payment by stages.',
    },
  ],

  ui: {
    locale: 'en-US',
    meta: {
      title: 'ORION — website and web app development',
      description:
        'ORION is a full-cycle web studio: websites, online stores and web services end to end. Design, development, launch in 2–6 weeks and a 12-month code warranty.',
    },
    header: {
      nav: 'Site sections',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      menu: 'Menu',
      cta: 'Start a project',
      toLight: 'Switch to the light theme',
      toDark: 'Switch to the dark theme',
      language: 'Switch language',
    },
    hero: {
      lineOne: 'Holding',
      lineTwo: 'course for',
      words: ['creation', 'quality', 'craft'],
      cta: 'Start a project',
      portfolio: 'See our work',
    },
    services: {
      eyebrow: 'Solutions',
      title: 'What we do and what it costs',
      lead: 'Five formats, from a one-page site to a service with dashboards and integrations. Prices are a starting point — the exact figure comes after the brief.',
      term: 'Timeline',
    },
    cases: {
      eyebrow: 'Work',
      title: ['Projects', 'already live'],
      lead: 'Live sites of our clients — open any card to see the project in action.',
      note: 'Showing 8 of 40+ projects',
    },
    process: {
      eyebrow: 'Process',
      title: ['Four stages', 'to launch'],
      lead: 'No stage starts before the previous one is agreed. You always know where the project is and what happens next.',
      hint: 'Scroll — the dot walks the path',
      stage: 'Stage',
    },
    stack: { title: 'Built with' },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Build your estimate in a minute',
      lead: 'Pick a project type and whatever you want to add. If a term is unclear, tap the icon next to it and we explain it in plain words.',
      stepType: 'Step 1 — project type',
      stepPace: 'Step 2 — pace of work',
      stepOptions: 'Step 3 — what to add',
      includes: 'Already included:',
      showMore: 'Show more',
      estimate: 'Your estimate',
      rush: 'rush',
      upTo: 'up to',
      projectType: 'Project type',
      term: 'Timeline',
      weeks: 'weeks',
      chosen: 'Options chosen',
      none: 'none',
      discuss: 'Discuss the estimate',
      reset: 'Clear options',
      disclaimer:
        'The figure is a guide, not an offer. We confirm the final price after the brief and fix it in the contract.',
      surcharge: 'Rush +30%',
      from: 'from',
      what: 'What is',
      add: 'Add',
      remove: 'Remove',
      rushNote: 'Priority slot, work runs in parallel',
      currency: 'Estimate currency',
      rateAt: 'Rate as of',
      currencies: {
        rub: 'Russian ruble',
        usd: 'US dollar',
        eur: 'Euro',
        cny: 'Chinese yuan',
        btc: 'Bitcoin',
      },
    },
    promises: {
      eyebrow: 'Guarantees',
      title: 'Terms, not promises',
    },
    reviews: {
      eyebrow: 'Reviews',
      title: 'What clients say',
      lead: 'Project stories and how the numbers moved after launch.',
      list: 'Reviews',
      item: 'Review',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'Answered in advance',
      lead: 'If your question is not here, message us on Telegram — we reply within the hour.',
      more: 'Still have questions?',
      moreText:
        'Write to us and describe the task in your own words. We will suggest an approach and give a range for price and time.',
      write: 'Message on Telegram →',
    },
    contact: {
      eyebrow: 'Contact',
      title: ['Tell us', 'about the project'],
      lead: 'We reply within an hour during working hours, propose a solution and name a range for price and time.',
      attached: 'Your estimate — we send it with the request',
      edit: 'Edit',
      projectType: 'Project type',
      pace: 'Pace',
      term: 'Timeline',
      weeks: 'weeks',
      options: 'Options',
      noOptions: 'no extras',
      name: 'Your name',
      namePlaceholder: 'Name',
      contact: 'How to reach you',
      contactPlaceholder: 'Telegram, email or phone',
      need: 'What you need',
      budget: 'Budget',
      about: 'About the task',
      aboutPlaceholder: 'A couple of sentences about the project is enough',
      consent: 'By sending the form you agree to the processing of your data.',
      submit: 'Send the request',
      sending: 'Sending…',
      sentTitle: 'Request sent',
      sentText: 'We have it. We will reply within an hour during working hours — usually sooner.',
      again: 'Send another',
      notConfigured: 'Sending is not connected yet',
      failed: 'Could not send',
      notConfiguredText:
        'The form is not wired to a lead receiver yet. Copy the request and send it on Telegram — nothing will be lost.',
      failedText:
        'The lead service did not answer. Copy the request and send it on Telegram, we will reply just as fast.',
      copy: 'Copy the request',
      copied: 'Copied',
      openTelegram: 'Open Telegram',
      back: 'Back to the form',
      taskChips: [
        'Landing page',
        'Corporate site',
        'Store',
        'Web service',
        'Redesign',
        'Not sure yet',
      ],
      budgetChips: ['under $600', '$600–1,200', '$1,200–3,500', 'over $3,500', 'not sure'],
    },
    footer: {
      line: 'A site that works — from the brief to the first requests.',
      cta: 'Start a project →',
      sections: 'Sections',
      contacts: 'Contacts',
      rights: 'All rights reserved',
      top: 'Back to top',
    },
    leadMail: {
      name: 'Name',
      contact: 'Contact',
      task: 'Task',
      budget: 'Budget',
      comment: 'Comment',
      estimate: 'Estimate from the calculator',
      projectType: 'Project type',
      pace: 'Pace',
      options: 'Options',
      noOptions: 'no extras',
      range: 'Range',
      from: 'from',
      term: 'Timeline',
      weeks: 'weeks',
    },
  },
}
