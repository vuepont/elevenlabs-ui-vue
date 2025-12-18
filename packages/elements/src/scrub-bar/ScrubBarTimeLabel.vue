<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { formatTimestamp } from './useScrubBar'

interface Props {
  time: number
  format?: (time: number) => string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  format: formatTimestamp,
})
</script>

<template>
  <span
    data-slot="scrub-bar-time-label"
    :class="cn('tabular-nums', props.class)"
  >
    {{ format(time) }}
  </span>
</template>
