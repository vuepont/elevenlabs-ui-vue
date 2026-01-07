// Current version of Nuxt Content has limitation to render grouped content, thus required manual mapping
// https://github.com/nuxt/content/issues/3119

import type { ContentNavigationItem } from '@nuxt/content'

export type NavigationItemType = 'page' | 'component' | 'block' | 'group'

// @see ContentNavigationItem
export interface NavigationItem {
  title: string
  path: string
  stem?: string
  children?: NavigationItem[]
  page?: false
  type?: NavigationItemType
  [key: string]: unknown
}

const EXCLUDED_PARENT_TITLE = ['Components']

// TODO: Find a better heuristic to determine item type
function navigationItemType(item: ContentNavigationItem, parent: ContentNavigationItem | null): 'component' | 'block' | 'group' | 'page' {
  if (parent) {
    if (parent.title === 'Components') {
      return 'component'
    }
    if (parent.title === 'Blocks') {
      return 'block'
    }
  }
  if (item.children && item.children.length > 0) {
    return 'group'
  }
  return 'page'
}

function mapWithType(item: ContentNavigationItem, parent: ContentNavigationItem | null): NavigationItem {
  return {
    ...item,
    type: navigationItemType(item, parent),
    children: item.children?.map(child => mapWithType(child, item)),
  }
}

export async function useNavigation() {
  const { data } = useAsyncData('navigation', () => {
    return queryCollectionNavigation('content', ['new'])
  }, {
    default: () => ([]),
    transform: (data) => {
      const doc = data.find(i => i.stem === 'docs')!
      const children = doc.children?.map(i => mapWithType(i, doc)) ?? []

      return [{ ...doc, children }]
    },
  })

  return {
    data,
  }
}

// Define the order of root-level docs pages (Getting Started section)
const DOCS_PAGE_ORDER = [
  '/docs/introduction',
  '/docs/components',
  '/docs/setup',
  '/docs/usage',
  '/docs/troubleshooting',
]

// Override titles for navigation display (path -> display title)
// This allows showing different text than the frontmatter title
const DOCS_TITLE_OVERRIDES: Record<string, string> = {
  '/docs/introduction': 'Introduction',
}

/**
 * Flatten navigation tree into a linear array of pages in the correct order.
 */
function flattenNavigation(items: NavigationItem[]): NavigationItem[] {
  const result: NavigationItem[] = []

  for (const item of items) {
    // Check if this item has its own page (has a path and is in DOCS_PAGE_ORDER or is a component page)
    const hasOwnPage = item.path && (
      DOCS_PAGE_ORDER.includes(item.path)
      || item.path.startsWith('/docs/components/')
    )

    if (hasOwnPage) {
      // Apply title override if exists
      const overrideTitle = DOCS_TITLE_OVERRIDES[item.path]
      if (overrideTitle) {
        result.push({ ...item, title: overrideTitle })
      }
      else {
        result.push(item)
      }
    }

    // If item has children, recurse into children
    if (item.children && item.children.length > 0) {
      result.push(...flattenNavigation(item.children))
    }
  }

  return result
}

/**
 * Get ordered docs pages based on sidebar structure:
 * 1. Getting Started pages in defined order
 * 2. Component pages in alphabetical order
 */
function getOrderedDocsPages(navData: NavigationItem[]): NavigationItem[] {
  const firstItem = navData[0]
  if (!navData.length || !firstItem?.children)
    return []

  const allChildren = firstItem.children
  const flatPages = flattenNavigation(allChildren)

  // Separate root docs pages and component pages
  const rootPages: NavigationItem[] = []
  const componentPages: NavigationItem[] = []

  for (const page of flatPages) {
    if (page.path.startsWith('/docs/components/')) {
      componentPages.push(page)
    }
    else if (DOCS_PAGE_ORDER.includes(page.path)) {
      rootPages.push(page)
    }
  }

  // Sort root pages by defined order
  rootPages.sort((a, b) => {
    return DOCS_PAGE_ORDER.indexOf(a.path) - DOCS_PAGE_ORDER.indexOf(b.path)
  })

  // Component pages are already in alphabetical order from the navigation
  return [...rootPages, ...componentPages]
}

/**
 * Composable to get the previous and next page neighbours for documentation navigation.
 * This provides proper linear navigation across all sections (Getting Started → Components).
 */
export async function useDocsNeighbours(currentPath: string) {
  const { data: navData } = await useNavigation()

  const neighbours = computed(() => {
    const orderedPages = getOrderedDocsPages(navData.value)
    const currentIndex = orderedPages.findIndex(page => page.path === currentPath)

    if (currentIndex === -1) {
      return [null, null]
    }

    const prev = currentIndex > 0 ? orderedPages[currentIndex - 1] : null
    const next = currentIndex < orderedPages.length - 1 ? orderedPages[currentIndex + 1] : null

    return [prev, next]
  })

  return {
    neighbours,
  }
}
