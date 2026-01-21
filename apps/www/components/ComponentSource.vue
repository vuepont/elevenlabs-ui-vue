<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { getIconForLanguageExtension } from './Icons'

const props = withDefaults(defineProps<{
  name?: string
  // src?: string
  title?: string
  language?: string
  collapsible?: boolean
  class?: HTMLAttributes['class']
  chromeLessOnMobile?: boolean
}>(), {
  language: 'vue',
  collapsible: true,
})

function fixImport(content: string) {
  content = content.replace(/@repo\/elements\/(?:.*\/)?([\w-]+)/g, '@/components/elevenlabs-ui/$1')

  content = content.replace(/@repo\/shadcn-vue\/(?:.*\/)?(lib|composables|ui|components)\/([\w-]+)/g, (match, type, name) => {
    if (type === 'lib')
      return `@/lib/${name}`

    if (type === 'composables')
      return `@/composables/${name}`

    if (type === 'ui' || type === 'components') {
      const parts = match.split('/')
      const componentName = parts[parts.length - 1]
      return `@/components/ui/${componentName}`
    }

    return match
  })

  return content
}

const modules = import.meta.glob(
  '../../../packages/examples/src/**/*.{vue,ts}',
  { query: '?raw', import: 'default' },
)

const keys = Object.keys(modules)

function resolveKey(name?: string) {
  return name
    ? keys.find(k => k.endsWith(`/${name}.vue`)) ?? null
    : null
}

const key = resolveKey(props.name)
const code = key
  ? fixImport(await (modules[key]!() as Promise<string>))
  : ''
</script>

<template>
  <div v-if="!collapsible" :class="cn('relative', props.class)">
    <ProsePre :code :language meta="'showLineNumbers'" :title />
  </div>
  <CodeCollapsibleWrapper v-else :class="props.class">
    <figure data-pretty-code-figure="" class="[&>pre]:max-h-96">
      <figcaption
        v-if="title"
        data-pretty-code-title=""
        class="text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70"
        :data-language="language"
      >
        <component :is="getIconForLanguageExtension(language)" />
        {{ title }}
      </figcaption>
      <CopyButton :value="code" />
      <div>
        <ProsePre unwrap :code :language meta="'showLineNumbers'" :title />
      </div>
    </figure>
  </CodeCollapsibleWrapper>
</template>
