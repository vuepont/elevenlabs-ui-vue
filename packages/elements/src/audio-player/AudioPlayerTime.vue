<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { formatTime, useAudioPlayerTime } from './context'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const { class: _, ...otherProps } = props
const time = useAudioPlayerTime()
</script>

<template>
  <span v-bind="otherProps" :class="cn('text-muted-foreground text-sm tabular-nums', props.class)">
    {{ formatTime(time) }}
  </span>
</template>
