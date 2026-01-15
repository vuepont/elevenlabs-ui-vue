import type { H3Event } from 'h3'
import type { Registry } from 'shadcn-vue/schema'
import { readBlocksIndexFromStorage } from '@/server/utils/blocks'

export default cachedEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Block name is required',
    })
  }

  const index: Registry | null = await readBlocksIndexFromStorage()

  const categories = name.split('/').filter(Boolean)
  const blocks: string[] = (index?.items ?? [])
    .filter(i => i?.type === 'registry:block')
    .filter(i => categories.length === 0 || categories.every((c: string) => (i?.categories ?? []).includes(c)))
    .map(i => i.name)

  return { blocks }
}, {
  shouldBypassCache: () => !!import.meta.dev,
  maxAge: 0, // 60 * 60, // 1 hour
  getKey: (event: H3Event) => event.path,
})
