<script setup lang="ts">
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const isDragging = ref(false)

const VolumeIcon = computed(() => {
  if (props.modelValue === 0)
    return VolumeX
  if (props.modelValue <= 0.33)
    return Volume
  if (props.modelValue <= 0.66)
    return Volume1
  return Volume2
})

function toggleMute() {
  emit('update:modelValue', props.modelValue > 0 ? 0 : 0.7)
}

function handleSliderClick(e: MouseEvent) {
  if (isDragging.value)
    return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  emit('update:modelValue', x)
}

function handleMouseDown(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  const sliderRect = (e.currentTarget as HTMLElement).getBoundingClientRect()

  // Set initial volume immediately
  const initialX = Math.max(0, Math.min(1, (e.clientX - sliderRect.left) / sliderRect.width))
  emit('update:modelValue', initialX)

  const handleMove = (e: MouseEvent) => {
    const x = Math.max(0, Math.min(1, (e.clientX - sliderRect.left) / sliderRect.width))
    emit('update:modelValue', x)
  }

  const handleUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}
</script>

<template>
  <div class="flex items-center justify-center gap-4 pt-4">
    <button
      class="text-muted-foreground hover:text-foreground transition-colors"
      @click="toggleMute"
    >
      <component
        :is="VolumeIcon"
        :class="cn('h-4 w-4 transition-all', modelValue === 0 && 'text-muted-foreground/50')"
      />
    </button>
    <div
      class="volume-slider bg-foreground/10 group relative h-1 w-48 cursor-pointer rounded-full"
      @click="handleSliderClick"
      @mousedown="handleMouseDown"
    >
      <div
        :class="cn('bg-primary absolute top-0 left-0 h-full rounded-full', !isDragging && 'transition-all duration-150')"
        :style="{ width: `${modelValue * 100}%` }"
      />
    </div>
    <span class="text-muted-foreground w-12 text-right font-mono text-xs">
      {{ Math.round(modelValue * 100) }}%
    </span>
  </div>
</template>
