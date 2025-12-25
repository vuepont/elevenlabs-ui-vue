<script setup lang="ts">
import type { CharacterAlignmentResponseModel } from '@elevenlabs/elevenlabs-js/api/types/CharacterAlignmentResponseModel'
import {
  TranscriptViewer,
  TranscriptViewerAudio,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  TranscriptViewerWords,
} from '@repo/elements/transcript-viewer'
import { Skeleton } from '@repo/shadcn-vue/components/ui/skeleton'
import { PauseIcon, PlayIcon } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const audioSrc = '/sounds/transcript-viewer/transcript-viewer-audio.mp3'
const alignment = ref<CharacterAlignmentResponseModel | undefined>(undefined)

onMounted(() => {
  fetch('/sounds/transcript-viewer/transcript-viewer-alignment.json')
    .then(res => res.json())
    .then((data) => {
      alignment.value = data
    })
})
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <TranscriptViewer
      :key="audioSrc"
      class="bg-card w-full rounded-xl border p-4"
      :audio-src="audioSrc"
      audio-type="audio/mpeg"
      :alignment="
        alignment ?? {
          characters: [],
          characterStartTimesSeconds: [],
          characterEndTimesSeconds: [],
        }
      "
    >
      <TranscriptViewerAudio class="sr-only" />
      <template v-if="alignment">
        <TranscriptViewerWords />
        <div class="flex items-center gap-3">
          <TranscriptViewerScrubBar />
        </div>
      </template>
      <template v-else>
        <div class="flex w-full flex-col gap-3">
          <Skeleton class="h-5 w-full" />
          <Skeleton class="mb-4 h-5 w-1/2" />
          <Skeleton class="h-2 w-full" />
          <div class="-mt-1 flex items-center justify-between">
            <Skeleton class="h-2 w-6" />
            <Skeleton class="h-2 w-6" />
          </div>
        </div>
      </template>
      <TranscriptViewerPlayPauseButton
        class="w-full cursor-pointer"
        size="default"
        :disabled="!alignment"
      >
        <template #default="{ isPlaying }">
          <PauseIcon v-if="isPlaying" class="size-4" />
          <PlayIcon v-else class="size-4" />
          <span>{{ isPlaying ? 'Pause' : 'Play' }}</span>
        </template>
      </TranscriptViewerPlayPauseButton>
    </TranscriptViewer>
  </div>
</template>
