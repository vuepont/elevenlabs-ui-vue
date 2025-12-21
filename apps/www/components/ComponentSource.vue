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
