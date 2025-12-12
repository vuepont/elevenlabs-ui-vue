<script setup lang="ts">
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { ScrollArea } from '@repo/shadcn-vue/components/ui/scroll-area'
import { exampleTracks } from './example-tracks'
import Player from './player.vue'
import SongListItem from './song-list-item.vue'
</script>

<template>
  <Card class="w-full overflow-hidden p-0">
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
