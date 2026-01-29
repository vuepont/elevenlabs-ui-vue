<script setup lang="ts">
import type { ElevenLabs } from '@elevenlabs/elevenlabs-js'
import { CommandItem } from '@repo/shadcn-vue/components/ui/command'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Check, Pause, Play } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useAudioPlayer } from '../audio-player'
import { Orb } from '../orb'

const props = defineProps<{
  voice: ElevenLabs.Voice
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const isHovered = ref(false)
const player = useAudioPlayer()

const preview = computed(() => props.voice.previewUrl)
const audioItem = computed(() => (preview.value ? { id: props.voice.voiceId!, src: preview.value, data: props.voice } : null))

const isPlaying = computed(() => {
  return audioItem.value && player.isItemActive(audioItem.value.id) && player.isPlaying.value
})

async function handlePreview(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  if (!audioItem.value)
    return

  if (isPlaying.value) {
    player.pause()
  }
  else {
    player.play(audioItem.value)
  }
}

const keywords = computed(() => [
  props.voice.name,
  props.voice.labels?.accent,
  props.voice.labels?.gender,
  props.voice.labels?.age,
  props.voice.labels?.description,
  props.voice.labels?.['use case'],
].filter(Boolean) as string[])
</script>

<template>
  <CommandItem
    :value="voice.voiceId!"
    :keywords="keywords"
    class="flex items-center gap-3"
    @select="emit('select')"
  >
    <div
      class="relative z-10 size-8 shrink-0 cursor-pointer overflow-visible"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @click="handlePreview"
    >
      <Orb
        :agent-state="isPlaying ? 'talking' : undefined"
        class="pointer-events-none absolute inset-0"
      />
      <div
        v-if="preview && isHovered"
        class="pointer-events-none absolute inset-0 flex size-8 shrink-0 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-opacity hover:bg-black/50"
      >
        <Pause v-if="isPlaying" class="size-3 text-white" />
        <Play v-else class="size-3 text-white" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-0.5">
      <span class="font-medium">{{ voice.name }}</span>
      <div v-if="voice.labels" class="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span v-if="voice.labels.accent">{{ voice.labels.accent }}</span>
        <span v-if="voice.labels.gender">•</span>
        <span v-if="voice.labels.gender" class="capitalize">{{ voice.labels.gender }}</span>
        <span v-if="voice.labels.age">•</span>
        <span v-if="voice.labels.age" class="capitalize">{{ voice.labels.age }}</span>
      </div>
    </div>

    <Check
      :class="cn(
        'ml-auto size-4 shrink-0',
        isSelected ? 'opacity-100' : 'opacity-0',
      )"
    />
  </CommandItem>
</template>
