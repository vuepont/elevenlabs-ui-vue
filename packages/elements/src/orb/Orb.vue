<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import OrbScene from './OrbScene.vue'

export type AgentState = null | 'thinking' | 'listening' | 'talking'

interface Props {
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
  classes?: string
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#CADCFC', '#A0B9D1'],
  resizeDebounce: 100,
  volumeMode: 'auto',
  agentState: null,
})
</script>

<template>
  <div :class="classes ?? 'relative h-full w-full'">
    <TresCanvas
      :alpha="true"
      :antialias="true"
      :premultiplied-alpha="true"
      window-size
      :resize="{ debounce: resizeDebounce }"
    >
      <Suspense>
        <OrbScene
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
      </Suspense>
    </TresCanvas>
  </div>
</template>
