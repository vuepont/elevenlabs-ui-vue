<script setup lang="ts">
import { AudioPlayerProvider } from '@repo/elements/audio-player'
import AudioPlayerDemo from './audio-player-demo.vue'
</script>

<template>
  <AudioPlayerProvider>
    <AudioPlayerDemo />
  </AudioPlayerProvider>
</template>
