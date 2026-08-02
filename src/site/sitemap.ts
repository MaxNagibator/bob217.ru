import { SITE_ORIGIN, SITE_PAGES } from './pages'

const DEFAULT_PRIORITY = 0.5

export const buildSitemap = (): string => {
  const urls = SITE_PAGES.filter((page) => !page.noindex).map((page) => {
    const loc = page.path === '/' ? `${SITE_ORIGIN}/` : SITE_ORIGIN + page.path
    const priority = (page.priority ?? DEFAULT_PRIORITY).toFixed(1)
    return ['  <url>', `    <loc>${loc}</loc>`, `    <priority>${priority}</priority>`, '  </url>']
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.flat(),
    '</urlset>',
    '',
  ].join('\n')
}
