<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  name: string
  align?: 'center' | 'start' | 'end'
  description?: string
  hideCode?: boolean
  type?: 'block' | 'component' | 'example'
  class?: HTMLAttributes['class']
}>()

const modules = import.meta.glob(
  '../../../../packages/examples/src/**/*.vue',
)

const moduleMap = Object.create(null) as Record<string, () => Promise<any>>

for (const path in modules) {
  // case 1：src/foo.vue
  let match = path.match(/\/src\/([^/]+)\.vue$/)
  if (match && match[1] && modules[path]) {
    moduleMap[match[1]] = modules[path]
    continue
  }

  // case 2：src/foo/foo.vue
  match = path.match(/\/src\/([^/]+)\/\1\.vue$/)
  if (match && match[1] && modules[path]) {
    moduleMap[match[1]] = modules[path]
  }
}

const Component = computed(() => {
  const loader = props.name ? moduleMap[props.name] : null
  return loader ? defineAsyncComponent(loader) : null
})
</script>

<template>
  <p v-if="!Component" class="text-muted-foreground text-sm">
    Component
    <code class="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
      {{ name }}
    </code>
    not found in examples.
  </p>

  <ComponentPreviewTabs
    v-else
    :class="props.class"
    :align
    :hide-code
    :component="Component"
  >
    <ComponentSource v-if="!hideCode" :name :collapsible="false" />
  </ComponentPreviewTabs>
</template>
