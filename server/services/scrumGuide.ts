// server/services/scrumGuide.ts
import { load, type Cheerio } from 'cheerio'
import type { AnyNode, Element } from 'domhandler'

type TocItem = { id: string; text: string; level: 1 | 2 }
type Payload = { html: string; toc: TocItem[]; meta: { source: string; fetchedAt: string } }
type Cached  = { ts: number; payload: Payload }

// ---- Hjälpfunktioner (utan Nuxt/Nitro-composables) ----
const isHttp = (u: URL) => u.protocol === 'http:' || u.protocol === 'https:'
const parseHosts = (csv: string) =>
  new Set(csv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))
const env = (k: string, fallback: string) => (process.env[k] ?? fallback)

function slugify(text: string, used: Set<string>) {
  let base = text.toLowerCase().replace(/&amp;|&/g, 'and').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  if (!base) base = 'section'
  let uniq = base, i = 2
  while (used.has(uniq)) uniq = `${base}-${i++}`
  used.add(uniq)
  return uniq
}

const removeComments = ($: ReturnType<typeof load>, $node: Cheerio<AnyNode>) => {
  $node.contents().each((_, n) => {
    if ((n as any).type === 'comment') $(n as AnyNode).remove()
    else if ((n as any).type === 'tag') removeComments($, $(n as AnyNode))
  })
}

// Enkel in-memory-cache (per serverprocess/instans)
const memory = new Map<string, Cached>()
const VERSION = 'pure-v1' // bumpa om du ändrar parsning/sanering

export async function getScrumGuide(src?: string): Promise<Payload> {
  // Läs *endast* från process.env → inga composables
  const DEFAULT_SRC = env('NUXT_SCRUM_GUIDE_DEFAULT_SRC', 'https://scrumguides.org/scrum-guide.html')
  const ALLOWED     = parseHosts(env('NUXT_SCRUM_GUIDE_ALLOWED_HOSTS', 'scrumguides.org,www.scrumguides.org'))
  const ttlSec      = Number(env('SCRUM_CACHE_TTL', '86400')) // 24h

  const url = (src && src.trim()) ? src.trim() : DEFAULT_SRC
  const u = new URL(url)
  if (!isHttp(u)) throw new Error('Unsupported protocol')
  if (!ALLOWED.has(u.hostname.toLowerCase())) throw new Error(`Source host not allowed: ${u.hostname}`)

  // Cache
  const key = `${VERSION}:${url}`
  const now = Date.now()
  const hit = memory.get(key)
  if (hit && now - hit.ts < ttlSec * 1000) return hit.payload

  // Hämta HTML
  const res = await fetch(url, { headers: { Accept: 'text/html' } })
  if (!res.ok) throw new Error(`Upstream ${res.status} ${res.statusText}`)
  const rawHtml = await res.text()

  const $ = load(rawHtml)
  const $root =
    $('main').first().length ? $('main').first() :
    $('article').first().length ? $('article').first() :
    $('body')

  // --- SANERING ---
  $('script, noscript, style, link[rel="stylesheet"], iframe, object').remove()
  $root.find('script, noscript, style, link[rel="stylesheet"], iframe, object').remove()
  $root.find('[style]').removeAttr('style')
  $root.find('*').each((_, el) => {
    const $el = $(el as AnyNode)
    const attrs = (el as any).attribs ? Object.keys((el as any).attribs) : []
    for (const a of attrs) if (a.toLowerCase().startsWith('on')) $el.removeAttr(a) // onclick, onload, …
  })
  $root.find('a').each((_, el) => {
    const $a = $(el as AnyNode)
    const href = ($a.attr('href') || '').trim()
    if (/^javascript:/i.test(href)) $a.attr('href', '#')
    if (/^https?:\/\//i.test(href)) $a.attr({ target: '_blank', rel: 'noopener noreferrer' })
  })

  const origin = u.origin
  $root.find('a').each((_, el) => {
    const $a = $(el as AnyNode)
    const href = ($a.attr('href') || '').trim()
    if (!href || href.startsWith('#')) return
    if (!/^https?:\/\//i.test(href)) {
      try { $a.attr('href', new URL(href, origin).toString()) } catch {}
    }
  })

  // Ta bort källsidans egen blurb/header-rad
  $root.find('.page-header').remove()

// Ta bort kända "blurb"-paragrafer om de finns (riktad match)
  $root.find('p').filter((_, el) => {
    const t = $(el as AnyNode).text().trim().replace(/\s+/g, ' ')
    return /This HTML version of the Scrum Guide is a direct port/i.test(t)
        || /as a PDF here/i.test(t)
  }).remove()

  $root.find('header, nav, footer').remove()
  // ta bort källsidans egna ToC
  $root.find('.panel.panel-default.panel-scrumguides, .panel-scrumguides, #table-of-contents, #toc, .toc, nav.toc').remove()
  removeComments($, $root)

  // --- TOC & id:n ---
  const used = new Set<string>()
  const toc: TocItem[] = []
  $root.find('h1, h2').each((_, el) => {
    const tag = ((el as Element).tagName || '').toLowerCase()
    const level: 1 | 2 = tag === 'h1' ? 1 : 2
    const text = $(el as AnyNode).text().trim().replace(/\s+/g, ' ')
    if (!text) return
    let id = $(el as AnyNode).attr('id')
    if (!id) { id = slugify(text, used); $(el as AnyNode).attr('id', id) }
    toc.push({ id, text, level })
  })

  // Attribution
  $root.append(`
    <section aria-label="License" class="mt-8 text-xs">
      <p>© 2020 Ken Schwaber & Jeff Sutherland. Licensed under
      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.</p>
    </section>
  `)

  const payload: Payload = {
    html: $root.html() || '',
    toc,
    meta: { source: url, fetchedAt: new Date().toISOString() }
  }

  memory.set(key, { ts: now, payload })
  return payload
}
