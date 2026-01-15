import type { Registry, RegistryItem } from 'shadcn-vue/schema'
import { useStorage } from 'nitropack/runtime'

/**
 * Read the registry index from Nitro storage assets.
 * Reads from the pre-generated index.json in assets:blocks.
 */
export async function readBlocksIndexFromStorage(): Promise<Registry | null> {
  const storage = useStorage('assets:blocks')
  return await storage.getItem('index.json') as Registry | null
}

/**
 * Read a single block item from Nitro storage assets.
 * Reads from blocks/ directory in assets:blocks.
 */
export async function readBlocksItemFromStorage(name: string): Promise<RegistryItem | null> {
  const storage = useStorage('assets:blocks')
  return await storage.getItem(`blocks/${name}.json`) as RegistryItem | null
}
