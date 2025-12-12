<script setup lang="ts">
import { AudioPlayerButton, AudioPlayerDuration, AudioPlayerProgress, AudioPlayerSpeed, AudioPlayerTime, useAudioPlayer } from '@repo/elements/audio-player'

const player = useAudioPlayer<{ name: string }>()
</script>

<template>
  <div class="flex flex-1 items-center p-4 sm:p-6">
    <div class="mx-auto w-full max-w-2xl">
      <div class="mb-4">
        <h3 class="text-base font-semibold sm:text-lg">
          {{ (player.activeItem.value?.data as { name: string } | undefined)?.name ?? "No track selected" }}
        </h3>
      </div>

      <div class="flex items-center gap-3 sm:gap-4">
        <AudioPlayerButton
          variant="outline"
          size="default"
          class="h-12 w-12 shrink-0 sm:h-10 sm:w-10"
          :disabled="!player.activeItem"
        />

        <div class="flex flex-1 items-center gap-2 sm:gap-3">
          <AudioPlayerTime class="text-xs tabular-nums" />
          <AudioPlayerProgress class="flex-1" />
          <AudioPlayerDuration class="text-xs tabular-nums" />
          <AudioPlayerSpeed variant="ghost" size="icon" />
        </div>
      </div>
    </div>
  </div>
</template>
