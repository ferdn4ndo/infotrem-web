import type { FeedMediaItem } from '~/types/feed-media-item.type'
import { listMedia } from '@/services/api/media.api'
import type { MediaRow } from '@/types/domain/media.type'

const items: FeedMediaItem[] = [
  {
    title: 'Alstom EC386 "Francesa" 2202 em Ourinhos-SP (ZOU)',
    mediaUrl: 'https://live.staticflickr.com/2031/1752049065_d39b64f886_h.jpg',
    mediaAlt: 'A foto contém a locomotiva Francesa Alston 2202 na estação de Ourinhos-SP (ZOU).',
    description:
      'Francesa Alstom 2202 em Ourinhos-SP (ZOU) parou pra fazer reversão no triangulo pois o velocimetro avariou em seguida seguiria pra Presidente Prudente-SP.',
    mediaDate: null,
    author: 'Cristiano Bueno',
    source: 'https://www.flickr.com/photos/cristianobueno/1752049065/',
    subtitle: 'Cristiano Bueno · data desconhecida'
  },
  {
    title: 'G22U 4397 em Irati-PR (LIT)',
    mediaUrl: 'https://live.staticflickr.com/2165/1555001914_ccd9c3271f_b.jpg',
    mediaAlt:
      'A foto contém a locomotiva G22UB 4397 tracionando um trem na estação de Irati-PR (LIT).',
    description:
      'G22UB 4397 chegando em Irati-PR (LIT) pra troca de equipe e proseguindo pra Ponta Grossa.',
    mediaDate: null,
    author: 'Cristiano Bueno',
    source: 'https://www.flickr.com/photos/cristianobueno/1555001914/',
    subtitle: 'Cristiano Bueno · data desconhecida'
  },
  {
    title: 'GE B-B "Mini-Saia" 2121 em Maristela-SP (ZMI)',
    mediaUrl: 'https://live.staticflickr.com/2092/1752048971_2fe7535c5b_c.jpg',
    mediaAlt:
      'A foto contém a locomotiva GE B-B "Mini-Saia" 2121 tracionando um trem cargueiro nas proximidades de Maristela-SP (ZMI).',
    description:
      'Triplex de GE "2100" ou Mini-saia como eram conhecidas ,em Maristela -SP na passagem de nivel da Marechal Rondon SP-300',
    mediaDate: null,
    author: 'Cristiano Bueno',
    source: 'https://www.flickr.com/photos/cristianobueno/1752048971/',
    subtitle: 'Cristiano Bueno · data desconhecida'
  },
  {
    title: 'GE 1-C+C-1 "Loba" 2013 em Mairinque-SP (ZMK)',
    mediaUrl: 'https://live.staticflickr.com/2038/2263488997_d67ac371c4_b.jpg',
    mediaAlt:
      'A foto contém duas locomotivas GE 1-C+C-1 "Loba" (somente o número da locomotiva 2013 na frente é visível) e mostra também parte da locomotiva GE U6C 3115 no lado esquerdo.',
    description:
      'Elétricas ALL em ZMK, estão preservadas mas ainda não voltaram a rodar, elas estavam trafegando entre Presidente Antino (Osasco-SP) e Amador Bueno antes desta reforma.',
    mediaDate: null,
    author: 'Cristiano Bueno',
    source: 'https://www.flickr.com/photos/cristianobueno/1752048971/',
    subtitle: 'Cristiano Bueno · data desconhecida'
  },
  {
    title: 'TCD 341819-7 em Uberlândia-MG (ZUL)',
    mediaUrl: 'https://live.staticflickr.com/5062/5627895035_0fbe54dc31_h.jpg',
    mediaAlt: 'A foto contém o vagão TCD 341819-7 no pátio de Uberlândia-MG (ZUL).',
    description: '19941201 - TCD 341819-7 curto com capacidade de 50.6m3. Uberlândia MG.',
    mediaDate: '1994-12-01',
    author: 'Johannes Smit',
    source: 'https://www.flickr.com/photos/johannes-j-smit/5627895035/in/album-72157626512656674/',
    subtitle: 'Johannes Smit · 1 de dezembro de 1994'
  },
  {
    title: 'TCD 336414-3 em Uberlândia-MG (ZUL)',
    mediaUrl: 'https://live.staticflickr.com/5189/5627867413_1452aee44e_h.jpg',
    mediaAlt: 'A foto contém o vagão TCD 336414-3 no pátio de Uberlândia-MG (ZUL).',
    description: '011 TCD 336414-3 longo com capacidade de 60.6m3. Uberlândia MG.',
    mediaDate: '1994-12-01',
    author: 'Johannes Smit',
    source: 'https://www.flickr.com/photos/johannes-j-smit/5627867413/in/album-72157626512656674/',
    subtitle: 'Johannes Smit · 1 de dezembro de 1994'
  },
  {
    title: 'HFD 314230-2 em Uberlândia-MG (ZUL)',
    mediaUrl: 'https://live.staticflickr.com/5307/5628130451_4698e8ec11_h.jpg',
    mediaAlt: 'A foto contém o vagão HFD 314230-2 no pátio de Uberlândia-MG (ZUL).',
    description: '1398 HFD 314230-2 em Uberlândia MG.',
    mediaDate: '1994-11-25',
    author: 'Johannes Smit',
    source: 'https://www.flickr.com/photos/johannes-j-smit/5628130451/in/album-72157626512656674/',
    subtitle: 'Johannes Smit · 25 de novembro de 1994'
  }
]

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
const absoluteFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short'
})
const warnedFeedPaths = new Set<string>()

function warnOnce(path: string, message: string, context?: unknown) {
  if (warnedFeedPaths.has(path)) {
    return
  }
  warnedFeedPaths.add(path)
  console.warn(message, context)
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function resolveAuthor(row: MediaRow) {
  const author = normalizeText(
    row.author_name ??
      row.known_author_name ??
      row.created_by_name ??
      row.uploaded_by_name ??
      row.author_id ??
      row.created_by_id
  )

  if (!author || uuidPattern.test(author)) {
    warnOnce(
      'author-shape',
      '[feed.service] Media row author fields were missing/UUID-like; using fallback author label.'
    )
    return 'Autor não identificado'
  }

  return author
}

function formatDateLabel(value: unknown) {
  const dateText = normalizeText(value)
  if (!dateText) {
    return 'data desconhecida'
  }

  const parsed = new Date(dateText)
  if (Number.isNaN(parsed.getTime())) {
    return 'data desconhecida'
  }

  const diffMs = parsed.getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (absMs < minute) {
    return relativeFormatter.format(Math.round(diffMs / 1_000), 'second')
  }
  if (absMs < hour) {
    return relativeFormatter.format(Math.round(diffMs / minute), 'minute')
  }
  if (absMs < day) {
    return relativeFormatter.format(Math.round(diffMs / hour), 'hour')
  }
  if (absMs <= day * 7) {
    return relativeFormatter.format(Math.round(diffMs / day), 'day')
  }

  return absoluteFormatter.format(parsed)
}

function mediaRowToFeedItem(row: MediaRow): FeedMediaItem {
  const author = resolveAuthor(row)
  const mediaDate = normalizeText(row.datetime_taken ?? row.created_at)

  return {
    title: String(row.title ?? row.name ?? row.id),
    mediaUrl: String(
      row.thumbnail_url ?? row.media_url ?? row.original_url ?? '/logo-light-bg.svg'
    ),
    mediaAlt: String(row.description ?? row.title ?? 'Mídia InfoTrem'),
    description: String(row.description ?? '-'),
    mediaDate,
    author,
    source: String(row.original_url ?? '#'),
    subtitle: `${author} · ${formatDateLabel(row.created_at ?? row.datetime_taken)}`
  }
}

export const getAll = async (): Promise<FeedMediaItem[]> => {
  try {
    const response = await listMedia({ limit: 50 })

    return response.items.map(mediaRowToFeedItem)
  } catch (error) {
    if (import.meta.env.DEV && import.meta.env.VITE_INFOTREM_USE_MOCK_FEED === 'true') {
      warnOnce(
        'mock-feed-fallback',
        '[feed.service] Falling back to mock feed due media endpoint failure.',
        error
      )
      return Object.values(items)
    }

    throw error
  }
}
