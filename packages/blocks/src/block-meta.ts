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
  'music-player-02': {
    description: 'Simple music player',
    categories: ['audio'],
  },
  'voice-chat-01': {
    description: 'Voice chat 1',
    categories: ['agents'],
  },
} as Record<string, BlockMeta>
