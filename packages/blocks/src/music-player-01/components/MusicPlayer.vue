<script setup lang="ts">
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { ScrollArea } from '@repo/shadcn-vue/components/ui/scroll-area'
import Player from './Player.vue'
import SongListItem from './SongListItem.vue'

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
</script>

<template>
  <Card class="mx-auto w-full overflow-hidden p-0">
    <div class="flex flex-col lg:h-[180px] lg:flex-row">
      <div class="bg-muted/50 flex flex-col overflow-hidden lg:h-full lg:w-64">
        <ScrollArea class="h-48 w-full lg:h-full">
          <div class="space-y-1 p-3">
            <SongListItem
              v-for="(song, index) in exampleTracks"
              :key="song.id"
              :song="song"
              :track-number="index + 1"
            />
          </div>
        </ScrollArea>
      </div>

      <Player />
    </div>
  </Card>
</template>
