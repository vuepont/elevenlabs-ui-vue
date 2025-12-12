<script setup lang="ts">
import { AudioPlayerProvider } from '@repo/elements/audio-player'
import AudioPlayerDemo from './audio-player-demo.vue'
</script>

<template>
  <div class="w-1/2 mx-auto mt-20">
    <AudioPlayerProvider>
      <AudioPlayerDemo />
    </AudioPlayerProvider>
  </div>
</template>
