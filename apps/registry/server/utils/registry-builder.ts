import type { Dirent } from 'node:fs'
import type { Registry, RegistryItem } from 'shadcn-vue/schema'
import { promises as fs } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { registryItemSchema } from 'shadcn-vue/schema'
import { Project } from 'ts-morph'

interface ComponentAssetFile {
  type: 'registry:component'
  path: string
  content: string
  target?: string
}

interface ExampleAssetFile {
  type: 'registry:block'
  path: string
  content: string
  target?: string
}

interface BlockAssetFile {
  type: 'registry:page' | 'registry:component'
  path: string
  content: string
  target: string
}

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function toTitle(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function validateRegistryItem(item: unknown, label: string): item is RegistryItem {
  const parsed = registryItemSchema.safeParse(item)
  if (!parsed.success) {
    console.warn(`Invalid registry item schema (${label}):`, parsed.error.issues)
    return false
  }

  // Extra runtime guarantees for our generated assets.
  if (!parsed.data.files || parsed.data.files.length === 0) {
    console.warn(`Invalid registry item: files must be non-empty array (${label})`)
    return false
  }

  return true
}

function sanitizeString(input: string): string {
  return input
    .replace(/[-_]\d+/g, '')
    .replace(/\d+/g, '')
    .toLowerCase()
}

interface DependencyAnalysisResult {
  dependencies: Set<string>
  devDependencies: Set<string>
  registryDependencies: Set<string>
}

function parseImportsFromCode(code: string): string[] {
  try {
    // Use ts-morph to parse TypeScript code and extract imports
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        allowJs: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        moduleResolution: 2, // Node
        target: 5, // ESNext
        module: 5, // ESNext
        strict: false,
        skipLibCheck: true,
      },
    })

    // Create a temporary source file
    const sourceFile = project.createSourceFile('temp.ts', code)

    // Extract all import declarations
    const imports: string[] = []
    sourceFile.getImportDeclarations().forEach((declaration) => {
      const moduleSpecifier = declaration.getModuleSpecifierValue()
      if (moduleSpecifier) {
        imports.push(moduleSpecifier)
      }
    })

    return unique(imports)
  }
  catch (error) {
    console.error('Failed to parse imports with ts-morph:', error)
    return []
  }
}

function extractRegistrySlug(modulePath: string, basePath: string): string {
  if (!modulePath.startsWith(basePath))
    return ''

  const rest = modulePath.slice(basePath.length)
    .split('/')
    .filter(Boolean)

  return rest[0] || ''
}

function analyzeDependencies(
  imports: string[],
  allowedDeps: Set<string>,
  allowedDevDeps: Set<string>,
): DependencyAnalysisResult {
  const dependencies = new Set<string>()
  const devDependencies = new Set<string>()
  const registryDependencies = new Set<string>()

  for (const mod of imports) {
    // Ignore relative imports
    if (mod.startsWith('./')) {
      continue
    }

    // Handle regular dependencies
    if (allowedDeps.has(mod)) {
      dependencies.add(mod)

      const typePkg = `@types/${mod}`

      if (allowedDevDeps.has(typePkg)) {
        devDependencies.add(typePkg)
      }
    }

    // Handle dev dependencies
    if (allowedDevDeps.has(mod)) {
      devDependencies.add(mod)
    }

    // Handle shadcn-vue components
    if (mod.startsWith('@/components/ui/')) {
      const slug = extractRegistrySlug(mod, '@/components/ui/')
      if (slug)
        registryDependencies.add(slug)
    }

    // Handle ElevenLabs UI components
    if (mod.startsWith('@/components/elevenlabs-ui/')) {
      const slug = extractRegistrySlug(mod, '@/components/elevenlabs-ui/')
      if (slug)
        registryDependencies.add(slug)
    }
  }

  return { dependencies, devDependencies, registryDependencies }
}

async function walkComponentFiles(dir: string, rootDir: string): Promise<string[]> {
  const out: string[] = []
  let entries: Dirent[] = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  }
  catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      const nested = await walkComponentFiles(full, rootDir)
      out.push(...nested)
    }
    else if (entry.isFile()) {
      // Include all .vue files
      if (entry.name.endsWith('.vue')) {
        out.push(full)
      }
      // Include all .ts files except the root src/index.ts
      else if (entry.name.endsWith('.ts')) {
        const isRootIndex = full === join(rootDir, 'index.ts')
        if (!isRootIndex) {
          out.push(full)
        }
      }
    }
  }
  return out
}

export async function generateRegistryAssets(ctx: { rootDir: string }) {
  const rootDir = ctx.rootDir
  const elementsDir = join(rootDir, '..', '..', 'packages', 'elements')
  const srcDir = join(elementsDir, 'src')
  const examplesDir = join(rootDir, '..', '..', 'packages', 'examples', 'src')
  const blocksDir = join(rootDir, '..', '..', 'packages', 'blocks', 'src')
  const shadcnDir = join(rootDir, '..', '..', 'packages', 'shadcn-vue')
  const outBase = join(rootDir, 'server', 'assets', 'registry')

  // Clean old generated assets first so removed items don't linger.
  await fs.rm(outBase, { recursive: true, force: true })

  // read package.json for dependency sets
  let pkg: PackageJson = {}
  try {
    const raw = await fs.readFile(join(elementsDir, 'package.json'), 'utf-8')
    pkg = JSON.parse(raw) as PackageJson
  }
  catch {}

  // read examples package.json for additional dependencies
  let examplesPkg: PackageJson = {}
  try {
    const raw = await fs.readFile(join(rootDir, '..', '..', 'packages', 'examples', 'package.json'), 'utf-8')
    examplesPkg = JSON.parse(raw) as PackageJson
  }
  catch {}

  // read shadcn-vue package.json so blocks can pick up deps like lucide-vue-next, reka-ui, etc.
  let shadcnPkg: PackageJson = {}
  try {
    const raw = await fs.readFile(join(shadcnDir, 'package.json'), 'utf-8')
    shadcnPkg = JSON.parse(raw) as PackageJson
  }
  catch {}

  const internalDeps = new Set(Object.keys(pkg.dependencies || {}).filter((d: string) => d.startsWith('@repo') && d !== '@repo/shadcn-vue'))

  // Merge dependencies from both elements and examples packages
  const allDeps = { ...pkg.dependencies, ...examplesPkg.dependencies, ...shadcnPkg.dependencies }
  const allDevDeps = { ...pkg.devDependencies, ...examplesPkg.devDependencies, ...shadcnPkg.devDependencies }

  const allowedDeps = new Set(Object.keys(allDeps || {}).filter((d: string) => !['vue', '@repo/shadcn-vue', ...Array.from(internalDeps)].includes(d)))
  const allowedDevDeps = new Set(Object.keys(allDevDeps || {}).filter((d: string) => !['typescript'].includes(d)))

  const componentFiles = await walkComponentFiles(srcDir, srcDir)
  const files: ComponentAssetFile[] = []
  for (const abs of componentFiles) {
    const raw = await fs.readFile(abs, 'utf-8')
    const parsed = raw
      .replace(/@repo\/shadcn-vue\//g, '@/')
      .replace(/@repo\/elements\//g, '@/components/elevenlabs-ui/')
    const rel = relative(srcDir, abs).split('\\').join('/')
    files.push({ type: 'registry:component', path: `components/elevenlabs-ui/${rel}`, content: parsed })
  }

  const exampleFiles: ExampleAssetFile[] = []
  try {
    // Only scan root-level .vue files. Subdirectories are intentionally ignored.
    const entries = await fs.readdir?.(examplesDir, { withFileTypes: true })
    if (entries) {
      const candidates = entries
        .filter(e => e.isFile() && e.name.endsWith('.vue'))
        .map(e => join(examplesDir, e.name))
      for (const abs of candidates) {
        const raw = await fs.readFile(abs, 'utf-8')
        const parsed = raw
          .replace(/@repo\/shadcn-vue\//g, '@/')
          .replace(/@repo\/elements\//g, '@/components/elevenlabs-ui/')
        const name = basename(abs)
        exampleFiles.push({ type: 'registry:block', path: `components/elevenlabs-ui/examples/${name}`, content: parsed })
      }
    }
  }
  catch {}

  // Blocks (from packages/blocks)
  let blockMeta: Record<string, any> = {}
  try {
    const metaMod = await import(pathToFileURL(join(blocksDir, 'block-meta.ts')).href)
    blockMeta = (metaMod as any).blockMeta || {}
  }
  catch {}

  const blockFilesMap = new Map<string, BlockAssetFile[]>()
  try {
    const entries = await fs.readdir(blocksDir, { withFileTypes: true })
    const blockDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort()
    for (const blockName of blockDirs) {
      const absBlockDir = join(blocksDir, blockName)
      const absFiles = await walkComponentFiles(absBlockDir, absBlockDir)
      const out: BlockAssetFile[] = []
      for (const abs of absFiles) {
        const raw = await fs.readFile(abs, 'utf-8')
        const parsed = raw
          .replace(/@repo\/shadcn-vue\//g, '@/')
          .replace(/@repo\/elements\//g, '@/components/elevenlabs-ui/')
        const rel = relative(blocksDir, abs).split('\\').join('/') // <blockName>/...
        const isPage = basename(abs) === 'page.vue'
        const relWithinBlock = relative(absBlockDir, abs).split('\\').join('/') // e.g. components/Foo.vue
        const target = isPage
          ? `pages/${sanitizeString(blockName)}/index.vue`
          : `components/${relWithinBlock.startsWith('components/') ? relWithinBlock.slice('components/'.length) : basename(abs)}`
        out.push({
          type: isPage ? 'registry:page' : 'registry:component',
          path: `blocks/${rel}`,
          content: parsed,
          target,
        })
      }
      if (out.length) {
        blockFilesMap.set(blockName, out)
      }
    }
  }
  catch {}

  const groupMap = new Map<string, ComponentAssetFile[]>()
  for (const f of files) {
    const rel = f.path.replace('components/elevenlabs-ui/', '')
    const group = rel.split('/')[0]
    if (!groupMap.has(group))
      groupMap.set(group, [])
    groupMap.get(group)!.push(f)
  }

  const componentItems: RegistryItem[] = Array.from(groupMap.keys()).map(group => ({
    name: group,
    type: 'registry:component',
    title: toTitle(group),
    description: `ElevenLabs UI ${group.replace('-', ' ')} components.`,
    files: groupMap.get(group)!.map((f) => {
      return {
        path: f.path,
        type: f.type,
        ...(f.target ? { target: f.target } : {}),
      }
    }),
  }))

  const exampleItems: RegistryItem[] = exampleFiles.map((ef) => {
    const fileName = basename(ef.path)
    const name = fileName.replace('.vue', '')
    return {
      name: `example-${name}`,
      type: 'registry:block',
      title: `${toTitle(name)} Example`,
      description: `Example implementation of ${name.replace('-', ' ')}.`,
      files: [{ path: ef.path, type: ef.type }],
    }
  })

  const blockItems: RegistryItem[] = Array.from(blockFilesMap.keys()).map((name) => {
    const meta = blockMeta[name] || {}
    const { description, categories, ...restMeta } = meta
    return {
      name,
      type: 'registry:block',
      title: toTitle(name),
      description: description || '',
      categories,
      meta: restMeta,
      // Always include target so file-tree + code view can rely on it (page requires it by schema).
      files: blockFilesMap.get(name)!.map(f => ({
        path: f.path,
        type: f.type,
        target: f.target,
      })),
    }
  })

  const indexJson: Registry = {
    name: 'elevenlabs-ui-vue',
    homepage: 'https://www.elevenlabs-ui-vue.com',
    items: [...componentItems, ...exampleItems, ...blockItems],
  }

  await fs.mkdir(join(outBase, 'components'), { recursive: true })
  await fs.mkdir(join(outBase, 'examples'), { recursive: true })
  await fs.mkdir(join(outBase, 'blocks'), { recursive: true })
  await fs.writeFile(join(outBase, 'index.json'), JSON.stringify(indexJson, null, 2), 'utf-8')

  for (const [group, groupFiles] of groupMap) {
    const groupDeps = new Set<string>()
    const groupDevDeps = new Set<string>()
    const groupRegistryDeps = new Set<string>()

    for (const f of groupFiles) {
      let code = ''
      // Handle Vue SFC files
      if (f.path.endsWith('.vue')) {
        const { descriptor } = parseSFC(f.content)
        code = [descriptor.script?.content || '', descriptor.scriptSetup?.content || ''].join('\n')
      }
      // Handle TypeScript files
      else if (f.path.endsWith('.ts')) {
        code = f.content
      }

      if (code) {
        const imports = parseImportsFromCode(code)
        const analysis = analyzeDependencies(imports, allowedDeps, allowedDevDeps)

        // Merge results
        analysis.dependencies.forEach(dep => groupDeps.add(dep))
        analysis.devDependencies.forEach(dep => groupDevDeps.add(dep))
        analysis.registryDependencies.forEach(dep => groupRegistryDeps.add(dep))
      }
    }

    const itemJson = {
      $schema: 'https://shadcn-vue.com/schema/registry-item.json',
      name: group,
      type: 'registry:component',
      title: toTitle(group),
      description: `ElevenLabs UI ${group.replace('-', ' ')} components.`,
      files: groupFiles,
      dependencies: Array.from(groupDeps),
      devDependencies: Array.from(groupDevDeps),
      registryDependencies: Array.from(groupRegistryDeps),
    }

    // Validate before writing
    if (validateRegistryItem(itemJson, `component-${group}`)) {
      await fs.writeFile(join(outBase, 'components', `${group}.json`), JSON.stringify(itemJson, null, 2), 'utf-8')
    }
    else {
      console.error(`Skipping invalid component: ${group}`)
    }
  }

  for (const ef of exampleFiles) {
    const fileName = basename(ef.path)
    const name = fileName.replace('.vue', '')

    // Analyze dependencies for example files
    const { descriptor } = parseSFC(ef.content)
    const code = [descriptor.script?.content || '', descriptor.scriptSetup?.content || ''].join('\n')
    const imports = parseImportsFromCode(code)
    const analysis = analyzeDependencies(imports, allowedDeps, allowedDevDeps)

    const itemJson = {
      $schema: 'https://shadcn-vue.com/schema/registry-item.json',
      name: `example-${name}`,
      type: 'registry:block',
      title: `${toTitle(name)} Example`,
      description: `Example implementation of ${name.replace('-', ' ')}.`,
      files: [ef],
      dependencies: Array.from(analysis.dependencies),
      devDependencies: Array.from(analysis.devDependencies),
      registryDependencies: Array.from(analysis.registryDependencies),
    }

    // Validate before writing
    if (validateRegistryItem(itemJson, `example-${name}`)) {
      await fs.writeFile(join(outBase, 'examples', `${name}.json`), JSON.stringify(itemJson, null, 2), 'utf-8')
    }
    else {
      console.error(`Skipping invalid example: ${name}`)
    }
  }

  for (const [blockName, blockFiles] of blockFilesMap) {
    const blockDeps = new Set<string>()
    const blockDevDeps = new Set<string>()
    const blockRegistryDeps = new Set<string>()

    for (const f of blockFiles) {
      let code = ''
      if (f.path.endsWith('.vue')) {
        const { descriptor } = parseSFC(f.content)
        code = [descriptor.script?.content || '', descriptor.scriptSetup?.content || ''].join('\n')
      }
      else if (f.path.endsWith('.ts')) {
        code = f.content
      }

      if (code) {
        const imports = parseImportsFromCode(code)
        const analysis = analyzeDependencies(imports, allowedDeps, allowedDevDeps)
        analysis.dependencies.forEach(dep => blockDeps.add(dep))
        analysis.devDependencies.forEach(dep => blockDevDeps.add(dep))
        analysis.registryDependencies.forEach(dep => blockRegistryDeps.add(dep))
      }
    }

    const meta = blockMeta[blockName] || {}
    const { description, categories, ...restMeta } = meta as Record<string, unknown>
    const itemJson = {
      $schema: 'https://shadcn-vue.com/schema/registry-item.json',
      name: blockName,
      type: 'registry:block',
      title: toTitle(blockName),
      description: (description as string) || '',
      categories: categories as string[] | undefined,
      meta: Object.keys(restMeta).length > 0 ? restMeta : undefined,
      files: blockFiles,
      dependencies: Array.from(blockDeps),
      devDependencies: Array.from(blockDevDeps),
      registryDependencies: Array.from(blockRegistryDeps),
    }

    if (validateRegistryItem(itemJson, `block-${blockName}`)) {
      await fs.writeFile(join(outBase, 'blocks', `${blockName}.json`), JSON.stringify(itemJson, null, 2), 'utf-8')
    }
    else {
      console.error(`Skipping invalid block: ${blockName}`)
    }
  }

  // eslint-disable-next-line no-console
  console.info('[nitro] registry server assets generated at', outBase)
}
