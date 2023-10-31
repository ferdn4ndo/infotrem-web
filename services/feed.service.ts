import { FeedMediaItem } from '~/types/feed-media-item.type'

const items: FeedMediaItem[] = [
  {
    title: 'Francesa Alstom 2202 em Ourinhos-SP (ZOU)',
    mediaUrl: 'https://live.staticflickr.com/2031/1752049065_d39b64f886_h.jpg',
    mediaAlt: 'A foto contém a locomotiva Francesa Alston 2202 na estação de Ourinhos-SP (ZOU).',
    description: 'Francesa Alstom 2202 em Ourinhos-SP (ZOU) parou pra fazer reversão no triangulo pois o velocimetro avariou em seguida seguiria pra Presidente Prudente-SP.',
  },
  {
    title: 'G22U 4397 em Irati-PR (LIT)',
    mediaUrl: 'https://live.staticflickr.com/2165/1555001914_ccd9c3271f_b.jpg',
    mediaAlt: 'A foto contém a locomotiva G22UB 4397 tracionando um trem na estação de Irati-PR (LIT).',
    description: 'G22UB 4397 chegando em Irati-PR (LIT) pra troca de equipe e proseguindo pra Ponta Grossa.',
  },
]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAll = async (): Promise<FeedMediaItem[]> => {
  await sleep(10);

  return Object.values(items)
}
