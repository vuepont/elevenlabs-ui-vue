<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { PauseIcon, PlayIcon } from 'lucide-vue-next'
import Spinner from './Spinner.vue'

type PlayerButtonProps = InstanceType<typeof Button>['$props']

interface Props extends /* @vue-ignore */ PlayerButtonProps {
  class?: HTMLAttributes['class']
  playing: boolean
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click', payload: MouseEvent): void
  (e: 'toggle', playing: boolean): void
}>()

const { class: _, ...otherProps } = props

function handleClick(e: MouseEvent) {
  emit('toggle', !props.playing)
  emit('click', e)
}
</script>

<template>
  <Button
    v-bind="otherProps"
    type="button"
    :class="cn('relative', props.class)"
    :aria-label="playing ? 'Pause' : 'Play'"
    @click="handleClick"
  >
    <PauseIcon
      v-if="playing"
      :class="cn('size-4', loading && 'opacity-0')"
    />
    <PlayIcon
      v-else
      :class="cn('size-4', loading && 'opacity-0')"
    />

    <div v-if="loading" class="absolute inset-0 flex items-center justify-center rounded-[inherit] backdrop-blur-xs">
      <Spinner />
    </div>
  </Button>
</template>
