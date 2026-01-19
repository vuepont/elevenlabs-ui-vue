<script setup lang="ts">
import { Orb } from '@repo/elements/orb'
import { computed } from 'vue'

const props = defineProps<{
  seed: number
  side: 'left' | 'right'
  isDark: boolean
  audioData: number[]
  isPlaying: boolean
  volume: number
}>()

const colors = computed<[string, string]>(() =>
  props.isDark ? ['#A0A0A0', '#232323'] : ['#F4F4F4', '#E0E0E0'],
)

function getInputVolume(): number {
  const audioData = props.audioData || []
  if (
    !props.isPlaying
    || props.volume === 0
    || audioData.length === 0
  ) {
    return 0
  }
  const lowFreqEnd = Math.floor(audioData.length * 0.25)
  let sum = 0
  for (let i = 0; i < lowFreqEnd; i++) {
    sum += audioData[i]
  }
  const avgLow = sum / lowFreqEnd
  const amplified = avgLow ** 0.5 * 3.5
  return Math.max(0.2, Math.min(1.0, amplified))
}

function getOutputVolume(): number {
  const audioData = props.audioData || []
  if (
    !props.isPlaying
    || props.volume === 0
    || audioData.length === 0
  ) {
    return 0
  }
  const midStart = Math.floor(audioData.length * 0.25)
  const midEnd = Math.floor(audioData.length * 0.75)
  let sum = 0
  for (let i = midStart; i < midEnd; i++) {
    sum += audioData[i]
  }
  const avgMid = sum / (midEnd - midStart)
  const modifier = props.side === 'left' ? 0.9 : 1.1
  const amplified = avgMid ** 0.5 * 4.0
  return Math.max(0.25, Math.min(1.0, amplified * modifier))
}
</script>

<template>
  <Orb
    :colors="colors"
    :seed="seed"
    volume-mode="manual"
    :get-input-volume="getInputVolume"
    :get-output-volume="getOutputVolume"
  />
</template>
