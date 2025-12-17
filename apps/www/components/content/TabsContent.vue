<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { TabsContent } from '@/registry/new-york-v4/ui/tabs'

const props = defineProps<{
  value: string | number
  class?: HTMLAttributes['class']
  forceMount?: boolean
}>()
</script>

<template>
  <TabsContent
    v-bind="props"
    :class="cn(
      'relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0 [&>.steps]:mt-6',
      props.class,
    )"
  >
    <slot />
  </TabsContent>
</template>
