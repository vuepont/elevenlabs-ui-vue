<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsContent } from '@repo/shadcn-vue/components/ui/tabs'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
// Ignore Vue tsc warning as the props will be passed as fallback attribute
</script>

<template>
  <TabsContent :class="cn('relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0 [&>.steps]:mt-6', props.class)">
    <slot />
  </TabsContent>
</template>
