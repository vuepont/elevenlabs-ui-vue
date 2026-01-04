<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import Waveform from './Waveform.vue'

const props = withDefaults(defineProps<{
  bars?: number
  seed?: number
  barWidth?: number
  barHeight?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  class?: HTMLAttributes['class']
}>(), {
  bars: 40,
  seed: 42,
  barWidth: 4,
  barHeight: 4,
  barGap: 2,
  barRadius: 2,
  fadeEdges: true,
  fadeWidth: 24,
  height: 128,
})

const data = computed(() => {
  const random = (seedValue: number) => {
    const x = Math.sin(seedValue) * 10000
    return x - Math.floor(x)
  }

  return Array.from({ length: props.bars }, (_, i) => 0.2 + random(props.seed + i) * 0.6)
})
</script>

<template>
  <Waveform
    :data="data"
    :bar-width="barWidth"
    :bar-height="barHeight"
    :bar-gap="barGap"
    :bar-radius="barRadius"
    :bar-color="barColor"
    :fade-edges="fadeEdges"
    :fade-width="fadeWidth"
    :height="height"
    :class="props.class"
  />
</template>
