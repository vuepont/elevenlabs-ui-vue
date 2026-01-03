<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { onUnmounted, ref, watch } from 'vue'
import Waveform from './Waveform.vue'

const props = withDefaults(defineProps<{
  active?: boolean
  processing?: boolean
  fftSize?: number
  smoothingTimeConstant?: number
  sensitivity?: number
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
  active: false,
  processing: false,
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  sensitivity: 1,
})

const emit = defineEmits<{
  error: [error: Error]
}>()

const data = ref<number[]>([])
const analyserRef = ref<AnalyserNode | null>(null)
const audioContextRef = ref<AudioContext | null>(null)
const streamRef = ref<MediaStream | null>(null)
let animationId: number | null = null
let processingAnimationId: number | null = null
const lastActiveData = ref<number[]>([])
let transitionProgress = 0

// Processing animation
watch(() => [props.processing, props.active], () => {
  if (props.processing && !props.active) {
    let time = 0
    transitionProgress = 0

    const animateProcessing = () => {
      time += 0.03
      transitionProgress = Math.min(1, transitionProgress + 0.02)

      const processingData: number[] = []
      const barCount = 45

      for (let i = 0; i < barCount; i++) {
        const normalizedPosition = (i - barCount / 2) / (barCount / 2)
        const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4

        const wave1 = Math.sin(time * 1.5 + i * 0.15) * 0.25
        const wave2 = Math.sin(time * 0.8 - i * 0.1) * 0.2
        const wave3 = Math.cos(time * 2 + i * 0.05) * 0.15
        const combinedWave = wave1 + wave2 + wave3
        const processingValue = (0.2 + combinedWave) * centerWeight

        let finalValue = processingValue
        if (lastActiveData.value.length > 0 && transitionProgress < 1) {
          const lastDataIndex = Math.floor((i / barCount) * lastActiveData.value.length)
          const lastValue = lastActiveData.value[lastDataIndex] || 0
          finalValue = lastValue * (1 - transitionProgress) + processingValue * transitionProgress
        }

        processingData.push(Math.max(0.05, Math.min(1, finalValue)))
      }

      data.value = processingData
      processingAnimationId = requestAnimationFrame(animateProcessing)
    }

    animateProcessing()
  }
  else if (!props.active && !props.processing) {
    if (processingAnimationId) {
      cancelAnimationFrame(processingAnimationId)
      processingAnimationId = null
    }

    if (data.value.length > 0) {
      let fadeProgress = 0
      const fadeToIdle = () => {
        fadeProgress += 0.03
        if (fadeProgress < 1) {
          data.value = data.value.map(value => value * (1 - fadeProgress))
          requestAnimationFrame(fadeToIdle)
        }
        else {
          data.value = []
        }
      }
      fadeToIdle()
    }
  }
  else {
    if (processingAnimationId) {
      cancelAnimationFrame(processingAnimationId)
      processingAnimationId = null
    }
  }
})

// Microphone Setup
watch(() => props.active, (isActive) => {
  if (!isActive) {
    if (streamRef.value) {
      streamRef.value.getTracks().forEach(track => track.stop())
      streamRef.value = null
    }
    if (audioContextRef.value && audioContextRef.value.state !== 'closed') {
      audioContextRef.value.close()
      audioContextRef.value = null
    }
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    return
  }

  const setupMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.value = stream

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = props.fftSize
      analyser.smoothingTimeConstant = props.smoothingTimeConstant

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.value = audioContext
      analyserRef.value = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateData = () => {
        if (!analyserRef.value || !props.active)
          return

        analyserRef.value.getByteFrequencyData(dataArray)

        const startFreq = Math.floor(dataArray.length * 0.05)
        const endFreq = Math.floor(dataArray.length * 0.4)
        const relevantData = dataArray.slice(startFreq, endFreq)

        const halfLength = Math.floor(relevantData.length / 2)
        const normalizedData: number[] = []

        for (let i = halfLength - 1; i >= 0; i--) {
          const value = Math.min(1, (relevantData[i] / 255) * props.sensitivity)
          normalizedData.push(value)
        }

        for (let i = 0; i < halfLength; i++) {
          const value = Math.min(1, (relevantData[i] / 255) * props.sensitivity)
          normalizedData.push(value)
        }

        data.value = normalizedData
        lastActiveData.value = normalizedData

        animationId = requestAnimationFrame(updateData)
      }

      updateData()
    }
    catch (error) {
      emit('error', error as Error)
    }
  }

  setupMicrophone()
})

onUnmounted(() => {
  if (streamRef.value) {
    streamRef.value.getTracks().forEach(track => track.stop())
  }
  if (audioContextRef.value && audioContextRef.value.state !== 'closed') {
    audioContextRef.value.close()
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (processingAnimationId) {
    cancelAnimationFrame(processingAnimationId)
  }
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
