<script setup lang="ts">
import SpeakerOrb from './SpeakerOrb.vue'

defineProps<{
  isDark: boolean
  audioData: number[]
  isPlaying: boolean
  volume: number
}>()
</script>

<template>
  <div class="mt-8 grid grid-cols-2 gap-8">
    <div class="relative aspect-square">
      <div class="bg-muted relative h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
        <div class="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
          <SpeakerOrb
            :key="`left-${isDark}`"
            :seed="100"
            side="left"
            :is-dark="isDark"
            :audio-data="audioData"
            :is-playing="isPlaying"
            :volume="volume"
          />
        </div>
      </div>
    </div>

    <div class="relative aspect-square">
      <div class="bg-muted relative h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
        <div class="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
          <SpeakerOrb
            :key="`right-${isDark}`"
            :seed="2000"
            side="right"
            :is-dark="isDark"
            :audio-data="audioData"
            :is-playing="isPlaying"
            :volume="volume"
          />
        </div>
      </div>
    </div>
  </div>
</template>
