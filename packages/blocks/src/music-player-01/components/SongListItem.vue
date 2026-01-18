<script setup lang="ts">
import { useAudioPlayer } from '@repo/elements/audio-player'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { PauseIcon, PlayIcon } from 'lucide-vue-next'
import { computed } from 'vue'

interface Track {
  id: string
  name: string
  url: string
}

const props = defineProps<{
  song: Track
  trackNumber: number
}>()

const player = useAudioPlayer<Track>()

const isActive = computed(() => player.isItemActive(props.song.id))
const isCurrentlyPlaying = computed(() => isActive.value && player.isPlaying.value)

function handleClick() {
  if (isCurrentlyPlaying.value) {
    player.pause()
  }
  else {
    player.play({
      id: props.song.id,
      src: props.song.url,
      data: props.song,
    })
  }
}
</script>

<template>
  <div class="group/song relative">
    <Button
      :variant="isActive ? 'secondary' : 'ghost'"
      size="sm"
      :class="cn(
        'h-10 w-full justify-start px-3 font-normal sm:h-9 sm:px-2',
        isActive && 'bg-secondary',
      )"
      @click="handleClick"
    >
      <div class="flex w-full items-center gap-3">
        <div class="flex w-5 shrink-0 items-center justify-center">
          <PauseIcon
            v-if="isCurrentlyPlaying"
            class="h-4 w-4 sm:h-3.5 sm:w-3.5"
          />
          <template v-else>
            <span
              class="text-muted-foreground/60 text-sm tabular-nums group-hover/song:invisible"
            >
              {{ props.trackNumber }}
            </span>
            <PlayIcon
              class="invisible absolute h-4 w-4 group-hover/song:visible sm:h-3.5 sm:w-3.5"
            />
          </template>
        </div>
        <span class="truncate text-left text-sm">
          {{ props.song.name }}
        </span>
      </div>
    </Button>
  </div>
</template>
