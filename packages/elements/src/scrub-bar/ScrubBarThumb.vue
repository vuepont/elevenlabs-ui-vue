<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { useScrubBar } from './useScrubBar'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const { progress } = useScrubBar()
</script>

<template>
  <div
    data-slot="scrub-bar-thumb"
    :class="cn(
      'bg-primary absolute top-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50',
      props.class,
    )"
    :style="{ left: `${progress}%` }"
  >
    <slot />
  </div>
</template>
