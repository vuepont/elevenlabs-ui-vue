<script setup lang="ts">
import { AudioPlayerDuration, AudioPlayerProgress, AudioPlayerTime } from '@repo/elements/audio-player'
</script>

<template>
  <div class="flex items-center gap-2">
    <AudioPlayerTime class="text-xs" />
    <AudioPlayerProgress class="flex-1" />
    <AudioPlayerDuration class="text-xs" />
  </div>
</template>
