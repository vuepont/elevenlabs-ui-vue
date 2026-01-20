<script setup lang="ts">
import { AudioPlayer } from '@repo/elements/audio-player'
import MusicPlayerDemo from './components/MusicPlayerDemo.vue'
</script>

<template>
  <AudioPlayer>
    <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div class="w-full max-w-lg">
        <MusicPlayerDemo />
      </div>
    </div>
  </AudioPlayer>
</template>
