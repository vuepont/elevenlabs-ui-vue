<script setup lang="ts">
import type { AgentState } from './useAudioVisualizer'
import { cn } from '@repo/shadcn-vue/lib/utils'

defineProps<{
  heightPct: number
  isHighlighted: boolean
  state?: AgentState
}>()
</script>

<template>
  <div
    :data-highlighted="isHighlighted"
    :class="cn(
      'max-w-3 min-w-2 flex-1 transition-all duration-150',
      'rounded-full',
      'bg-border data-[highlighted=true]:bg-primary',
      state === 'speaking' && 'bg-primary',
      state === 'thinking' && isHighlighted && 'animate-pulse',
    )"
    :style="{
      height: `${heightPct}%`,
      animationDuration: state === 'thinking' ? '300ms' : undefined,
    }"
  />
</template>
