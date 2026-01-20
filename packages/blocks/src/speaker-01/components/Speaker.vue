<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AudioPlayer } from '@repo/elements/audio-player'
import SpeakerControls from './SpeakerControls.vue'

defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <AudioPlayer>
    <SpeakerControls :class="$props.class" />
  </AudioPlayer>
</template>
