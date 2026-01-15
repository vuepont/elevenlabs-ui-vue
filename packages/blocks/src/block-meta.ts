interface BlockMeta {
  iframeHeight?: string
  className?: string
  description: string
  mobile?: 'component'
  categories?: string[]
}

export const blockMeta = {
  'button-01': {
    description: 'A simple button.',
    categories: ['agents'],
  },
} as Record<string, BlockMeta>
