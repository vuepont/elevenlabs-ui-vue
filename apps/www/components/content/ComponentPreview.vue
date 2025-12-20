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

const Component = defineAsyncComponent({
  loader: () => import(`@/components/demo/${props.name}.vue`),
})
</script>

<template>
  <p v-if="!Component" class="text-muted-foreground text-sm">
    Component
    <code class="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
      {{ name }}
    </code>
    not found.
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
