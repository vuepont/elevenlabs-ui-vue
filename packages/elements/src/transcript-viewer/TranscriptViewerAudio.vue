<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { useAttrs } from 'vue'
import { useTranscriptViewerContext } from './useTranscriptViewer'

const attrs = useAttrs()
const { audioRef, audioProps } = useTranscriptViewerContext()

function setAudioRef(el: Element | ComponentPublicInstance | null) {
  audioRef.value = el as HTMLAudioElement | null
}
</script>

<template>
  <audio
    :ref="setAudioRef"
    data-slot="transcript-audio"
    :controls="audioProps.controls"
    :preload="audioProps.preload"
    :src="audioProps.src"
    v-bind="attrs"
  >
    <slot :audio-props="audioProps">
      <source :src="audioProps.src" :type="audioProps.type">
    </slot>
  </audio>
</template>
