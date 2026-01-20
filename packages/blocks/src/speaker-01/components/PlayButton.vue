<script setup lang="ts">
import type { AudioPlayerItem } from '@repo/elements/audio-player'
import { AudioPlayerButton, useAudioPlayer } from '@repo/elements/audio-player'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed } from 'vue'

export interface Track {
  id: string
  name: string
  url: string
}

const props = defineProps<{
  track: Track
}>()

const player = useAudioPlayer<Track>()

const item = computed<AudioPlayerItem<Track> | undefined>(() => {
  if (!player.activeItem.value)
    return undefined
  return {
    id: props.track.id,
    src: props.track.url,
    data: props.track,
  }
})

const buttonClass = computed(() =>
  cn(
    'border-border h-14 w-14 rounded-full transition-all duration-300',
    player.isPlaying.value
      ? 'bg-foreground/10 hover:bg-foreground/15 border-foreground/30 dark:bg-primary/20 dark:hover:bg-primary/30 dark:border-primary/50'
      : 'bg-background hover:bg-muted',
  ),
)
</script>

<template>
  <AudioPlayerButton
    variant="outline"
    size="icon"
    :item="item"
    :class="buttonClass"
  />
</template>
