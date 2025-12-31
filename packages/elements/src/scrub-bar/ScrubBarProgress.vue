<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Progress } from '@repo/shadcn-vue/components/ui/progress'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { useScrubBar } from './useScrubBar'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const { progress } = useScrubBar()
</script>

<template>
  <Progress
    data-slot="scrub-bar-progress"
    :model-value="progress"
    :class="cn('absolute h-full [&>div]:transition-none', props.class)"
  />
</template>
