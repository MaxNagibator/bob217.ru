import type { RouteLocationNormalized } from 'vue-router'

export const SITE_ORIGIN = 'https://bob217.ru'
export const SITE_TITLE = 'bob217 — Дот нет помойка и другие проекты'
export const SITE_DESCRIPTION =
  'Стримы про программирование, пет-проекты на C# и .NET, игры и всякая дрисня от bobito217'

const upsertMeta = (attr: 'name' | 'property', key: string, content: string): void => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const upsertCanonical = (href: string): void => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

export const applyRouteMeta = (to: RouteLocationNormalized): void => {
  const title = to.meta.title ?? SITE_TITLE
  const description = to.meta.description ?? SITE_DESCRIPTION
  const url = SITE_ORIGIN + to.path

  document.title = title
  upsertMeta('name', 'title', title)
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'robots', to.meta.noindex ? 'noindex, follow' : 'index, follow')
  upsertCanonical(url)
}
