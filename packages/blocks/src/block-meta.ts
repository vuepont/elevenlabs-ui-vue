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
  'voice-chat-02': {
    description: 'Voice chat 2',
    categories: ['agents'],
  },
  'voice-chat-03': {
    description: 'Voice chat 3',
    categories: ['agents'],
  },
  'speaker-01': {
    description: 'EL-01 Speaker',
    categories: ['audio'],
  },
} as Record<string, BlockMeta>
