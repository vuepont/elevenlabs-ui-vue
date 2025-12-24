<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/shadcn-vue/components/ui/dropdown-menu'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Check, Settings } from 'lucide-vue-next'
import { computed } from 'vue'
import { useAudioPlayer } from './context'

type AudioPlayerSpeedProps = InstanceType<typeof Button>['$props']

interface Props extends /* @vue-ignore */ AudioPlayerSpeedProps {
  class?: HTMLAttributes['class']
  speeds?: readonly number[]
  variant?: AudioPlayerSpeedProps['variant']
  size?: AudioPlayerSpeedProps['size']
}

const props = withDefaults(defineProps<Props>(), {
  speeds: () => [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  variant: 'ghost',
  size: 'icon',
})

const { size, variant, speeds: _, class: __, ...otherProps } = props

const player = useAudioPlayer()
const currentSpeed = computed(() => player.playbackRate.value)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        v-bind="otherProps"
        :variant="variant"
        :size="size"
        :class="cn(props.class)"
        aria-label="Playback speed"
      >
        <Settings class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-[120px]">
      <DropdownMenuItem
        v-for="speed in speeds"
        :key="speed"
        class="flex items-center justify-between cursor-pointer"
        @click="player.setPlaybackRate(speed)"
      >
        <span :class="speed === 1 ? '' : 'font-mono'">
          {{ speed === 1 ? "Normal" : `${speed}x` }}
        </span>
        <Check v-if="currentSpeed === speed" class="size-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
