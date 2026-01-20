<script setup lang="ts">
import {
  AudioPlayerButton,
  AudioPlayerDuration,
  AudioPlayerProgress,
  AudioPlayerTime,
  useAudioPlayer,
} from '@repo/elements/audio-player'
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { onMounted } from 'vue'

const exampleTracks = [
  { id: '0', name: 'II - 00', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3' },
  { id: '1', name: 'II - 01', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/01.mp3' },
  { id: '2', name: 'II - 02', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/02.mp3' },
  { id: '3', name: 'II - 03', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/03.mp3' },
  { id: '4', name: 'II - 04', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/04.mp3' },
  { id: '5', name: 'II - 05', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/05.mp3' },
  { id: '6', name: 'II - 06', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/06.mp3' },
  { id: '7', name: 'II - 07', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/07.mp3' },
  { id: '8', name: 'II - 08', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/08.mp3' },
  { id: '9', name: 'II - 09', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/09.mp3' },
]

const player = useAudioPlayer<{ name: string }>()
const track = exampleTracks[9]

const trackItem = {
  id: track.id,
  src: track.url,
  data: track,
}

onMounted(() => {
  player.setActiveItem(trackItem)
})
</script>

<template>
  <Card class="w-full overflow-hidden p-4">
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold">
          {{ player.activeItem.value?.data?.name || track.name }}
        </h3>
      </div>
      <div class="flex items-center gap-3">
        <AudioPlayerButton
          variant="outline"
          size="default"
          class="h-10 w-10 shrink-0"
          :item="trackItem"
        />
        <div class="flex flex-1 items-center gap-2">
          <AudioPlayerTime class="text-xs tabular-nums" />
          <AudioPlayerProgress class="flex-1" />
          <AudioPlayerDuration class="text-xs tabular-nums" />
        </div>
      </div>
    </div>
  </Card>
</template>
