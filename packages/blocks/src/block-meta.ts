interface BlockMeta {
  iframeHeight?: string
  class?: string
  description: string
  mobile?: 'component'
  categories?: string[]
}

export const blockMeta = {
  'button-01': {
    description: 'A simple button.',
    categories: ['agents'],
  },
  'music-player-01': {
    description: 'Music player with playlist',
    categories: ['audio'],
  },
} as Record<string, BlockMeta>
