interface BlockMeta {
  iframeHeight?: string
  container?: string
  class?: string
  description: string
  mobile?: 'component'
  categories?: string[]
}

const sharedContainer
  = 'w-full bg-surface min-h-svh flex px-4 py-12 items-center md:py-20 justify-center min-w-0'

export const blockMeta = {
  'speaker-01': {
    description: 'EL-01 Speaker',
    iframeHeight: '900px',
    container: sharedContainer,
    mobile: 'component',
    categories: ['audio'],
  },
  'music-player-01': {
    description: 'Music player with playlist',
    iframeHeight: '600px',
    container: sharedContainer,
    mobile: 'component',
    categories: ['audio'],
  },
  'music-player-02': {
    description: 'Simple music player',
    iframeHeight: '400px',
    container: sharedContainer,
    mobile: 'component',
    categories: ['audio'],
  },
  'voice-chat-01': {
    description: 'Voice chat 1',
    iframeHeight: '800px',
    container: sharedContainer,
    mobile: 'component',
    categories: ['agents'],
  },
  'voice-chat-02': {
    description: 'Voice chat 2',
    iframeHeight: '600px',
    container: sharedContainer,
    mobile: 'component',
    categories: ['agents'],
  },
  'voice-chat-03': {
    description: 'Voice chat 3',
    iframeHeight: '800px',
    container: sharedContainer,
    mobile: 'component',
    categories: ['agents'],
  },
} as Record<string, BlockMeta>
