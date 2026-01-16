<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ScrubBarContextValue } from './useScrubBar'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed, provide, toRefs } from 'vue'
import { ScrubBarKey } from './useScrubBar'

interface Props {
  duration: number
  value: number
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'scrub', time: number): void
  (e: 'scrubStart'): void
  (e: 'scrubEnd'): void
}>()

const { duration, value } = toRefs(props)

const progress = computed(() => {
  if (duration.value <= 0)
    return 0
  // Clamp progress to [0, 100] to prevent values > 100
  // This can happen when value slightly exceeds duration due to timing precision
  const calculated = (value.value / duration.value) * 100
  return Math.min(Math.max(calculated, 0), 100)
})

const contextValue: ScrubBarContextValue = {
  duration,
  value,
  progress,
  onScrub: time => emit('scrub', time),
  onScrubStart: () => emit('scrubStart'),
  onScrubEnd: () => emit('scrubEnd'),
}

provide(ScrubBarKey, contextValue)
</script>

<template>
  <div
    data-slot="scrub-bar-root"
    :class="cn('flex w-full items-center', props.class)"
  >
    <slot />
  </div>
</template>
