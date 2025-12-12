<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed } from 'vue'
import { useAudioPlayer } from './useAudioPlayer'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const { class: _, ...otherProps } = props

const player = useAudioPlayer()

const formattedDuration = computed(() => {
  const d = player.duration.value
  return (d !== null && d !== undefined && !Number.isNaN(d))
    ? formatTime(d)
    : '--:--'
})

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const formattedMins = mins < 10 ? `0${mins}` : mins
  const formattedSecs = secs < 10 ? `0${secs}` : secs

  return hrs > 0
    ? `${hrs}:${formattedMins}:${formattedSecs}`
    : `${mins}:${formattedSecs}`
}
</script>

<template>
  <span v-bind="otherProps" :class="cn('text-muted-foreground text-sm tabular-nums', props.class)">
    {{ formattedDuration }}
  </span>
</template>
