<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TresCanvas } from '@tresjs/core'
import OrbbScene from './OrbScene.vue'

export type AgentState = null | 'thinking' | 'listening' | 'talking'

interface OrbProps {
  colors?: [string, string]
  colorsRef?: { value: [string, string] }
  resizeDebounce?: number
  seed?: number
  agentState?: AgentState
  volumeMode?: 'auto' | 'manual'
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: { value: number }
  outputVolumeRef?: { value: number }
  getInputVolume?: () => number
  getOutputVolume?: () => number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<OrbProps>(), {
  colors: () => ['#CADCFC', '#A0B9D1'],
  resizeDebounce: 100,
  volumeMode: 'auto',
  agentState: null,
})
</script>

<template>
  <div :class="props.class ?? 'relative h-full w-full'">
    <TresCanvas
      :resize="{ debounce: resizeDebounce }"
      :clear-color="'#ffffff'"
      :clear-alpha="0"
      :gl="{
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      }"
    >
      <TresPerspectiveCamera :position="[0, 0, 5]" :fov="75" />
      <OrbbScene
        :colors="colors"
        :colors-ref="colorsRef"
        :seed="seed"
        :agent-state="agentState"
        :volume-mode="volumeMode"
        :manual-input="manualInput"
        :manual-output="manualOutput"
        :input-volume-ref="inputVolumeRef"
        :output-volume-ref="outputVolumeRef"
        :get-input-volume="getInputVolume"
        :get-output-volume="getOutputVolume"
      />
    </TresCanvas>
  </div>
</template>
