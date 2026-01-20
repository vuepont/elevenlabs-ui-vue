import { registryItemSchema } from 'shadcn-vue/schema'
import { readBlocksItemFromStorage } from '@/server/utils/blocks'

function toPosixPath(value: string) {
  return value.replaceAll('\\', '/')
}

function fixImport(content: string) {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const regex = /@\/(.+?)\/((?:.*?\/)?(?:components|ui|composables|lib))\/([\w-]+)/g

  const replacement = (
    match: string,
    path: string,
    type: string,
    component: string,
  ) => {
    if (type.endsWith('components')) {
      return `@/components/${component}`
    }
    else if (type.endsWith('ui')) {
      return `@/components/ui/${component}`
    }
    else if (type.endsWith('composables')) {
      return `@/composables/${component}`
    }
    else if (type.endsWith('lib')) {
      return `@/lib/${component}`
    }

    return match
  }

  return content.replace(regex, replacement)
}

export async function getBlockItem(name: string) {
  const item = await readBlocksItemFromStorage(name)
  const parsed = registryItemSchema.safeParse(item)
  if (!parsed.success)
    return null
  return {
    ...parsed.data,
    files: parsed.data.files?.map(file => ({
      ...file,
      content: file.content ? fixImport(file.content) : file.content,
    })),
  }
}

export interface BlockFileTree {
  name: string
  path?: string
  children?: BlockFileTree[]
}

export function createFileTreeForBlockFiles(
  files: Array<{ path: string, target?: string }>,
) {
  const root: BlockFileTree[] = []

  for (const file of files) {
    const filePath = toPosixPath(file.target ?? file.path)
    const parts = filePath.split('/')
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      const existingNode = currentLevel.find(node => node.name === part)

      if (existingNode) {
        if (isFile) {
          // Update existing file node with full path
          existingNode.path = filePath
        }
        else {
          // Move to next level in the tree
          currentLevel = existingNode.children!
        }
      }
      else {
        const newNode: BlockFileTree = isFile
          ? { name: part!, path: filePath }
          : { name: part!, children: [] }

        currentLevel.push(newNode)

        if (!isFile) {
          currentLevel = newNode.children!
        }
      }
    }
  }

  return root
}
