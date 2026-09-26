import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { configDefaults } from 'vitest/config'
import type { Plugin } from 'vite'

/**
 * SEO-часть, которой нужен адрес сайта: canonical, og:url, абсолютный og:image,
 * микроразметка организации, sitemap.xml и robots.txt. Адрес берётся из
 * VITE_SITE_URL (например, https://orion.ru в .env.production). Пока он не задан,
 * плагин ничего не добавляет в страницу, а robots.txt разрешает индексацию
 * без ссылки на sitemap.
 */
function seo(): Plugin {
  let siteUrl = ''

  return {
    name: 'orion-seo',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, 'VITE_')
      siteUrl = (env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '')
    },
    transformIndexHtml() {
      if (!siteUrl) return []

      const organization = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'ORION',
        description: 'Веб-студия полного цикла: сайты, интернет-магазины и веб-сервисы под ключ.',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}/og-image.png`,
        email: 'orion.company.web@gmail.com',
        telephone: '+7-903-317-57-93',
        sameAs: ['https://t.me/sp1retdev'],
        areaServed: 'Worldwide',
        knowsLanguage: ['ru', 'en'],
      }

      return [
        { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: `${siteUrl}/og-image.png` },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: `${siteUrl}/og-image.png` },
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(organization),
          injectTo: 'head',
        },
      ]
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /']
      if (siteUrl) robots.push('', `Sitemap: ${siteUrl}/sitemap.xml`)

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })

      if (!siteUrl) return

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // У бота свои тесты и своё окружение — см. bot/.
    exclude: [...configDefaults.exclude, 'bot/**'],
    css: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', '**/*.d.ts'],
    },
  },
})
