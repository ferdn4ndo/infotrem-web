import type { FeedMediaItem } from '~/types/feed-media-item.type'

const items: FeedMediaItem[] = [
  {
    title: 'Alstom EC386 "Francesa" 2202 em Ourinhos-SP (ZOU)',
    mediaUrl: 'https://live.staticflickr.com/2031/1752049065_d39b64f886_h.jpg',
    mediaAlt: 'A foto contém a locomotiva Francesa Alston 2202 na estação de Ourinhos-SP (ZOU).',
    description:
      'Francesa Alstom 2202 em Ourinhos-SP (ZOU) parou pra fazer reversão no triangulo pois o velocimetro avariou em seguida seguiria pra Presidente Prudente-SP.',
    mediaDate: null,
    author: 'Cristiano Bueno',
    source: 'https://www.flickr.com/photos/cristianobueno/1752049065/'
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
    source: 'https://www.flickr.com/photos/cristianobueno/1555001914/'
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
    source: 'https://www.flickr.com/photos/cristianobueno/1752048971/'
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
    source: 'https://www.flickr.com/photos/cristianobueno/1752048971/'
  },
  {
    title: 'TCD 341819-7 em Uberlândia-MG (ZUL)',
    mediaUrl: 'https://live.staticflickr.com/5062/5627895035_0fbe54dc31_h.jpg',
    mediaAlt: 'A foto contém o vagão TCD 341819-7 no pátio de Uberlândia-MG (ZUL).',
    description: '19941201 - TCD 341819-7 curto com capacidade de 50.6m3. Uberlândia MG.',
    mediaDate: '1994-12-01',
    author: 'Johannes Smit',
    source: 'https://www.flickr.com/photos/johannes-j-smit/5627895035/in/album-72157626512656674/'
  },
  {
    title: 'TCD 336414-3 em Uberlândia-MG (ZUL)',
    mediaUrl: 'https://live.staticflickr.com/5189/5627867413_1452aee44e_h.jpg',
    mediaAlt: 'A foto contém o vagão TCD 336414-3 no pátio de Uberlândia-MG (ZUL).',
    description: '011 TCD 336414-3 longo com capacidade de 60.6m3. Uberlândia MG.',
    mediaDate: '1994-12-01',
    author: 'Johannes Smit',
    source: 'https://www.flickr.com/photos/johannes-j-smit/5627867413/in/album-72157626512656674/'
  },
  {
    title: 'HFD 314230-2 em Uberlândia-MG (ZUL)',
    mediaUrl: 'https://live.staticflickr.com/5307/5628130451_4698e8ec11_h.jpg',
    mediaAlt: 'A foto contém o vagão HFD 314230-2 no pátio de Uberlândia-MG (ZUL).',
    description: '1398 HFD 314230-2 em Uberlândia MG.',
    mediaDate: '1994-11-25',
    author: 'Johannes Smit',
    source: 'https://www.flickr.com/photos/johannes-j-smit/5628130451/in/album-72157626512656674/'
  }
]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getAll = async (): Promise<FeedMediaItem[]> => {
  await sleep(10)

  return Object.values(items)
}
