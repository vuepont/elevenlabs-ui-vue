<script setup lang="ts" generic="TData = unknown">
import type { HTMLAttributes } from 'vue'
import type { AudioPlayerItem } from './useAudioPlayer'
import { computed } from 'vue'
import PlayButton from './PlayButton.vue'
import { useAudioPlayer } from './useAudioPlayer'

type PlayButtonProps = InstanceType<typeof PlayButton>['$props']

const props = defineProps<
  /* @vue-ignore */ Omit<PlayButtonProps, 'playing' | 'loading'> & {
    item?: AudioPlayerItem<TData>
    class?: HTMLAttributes['class']
  }
>()
const { item: _, class: __, ...otherProps } = props

const player = useAudioPlayer<TData>()

const isPlaying = computed(() => {
  if (!props.item)
    return player.isPlaying.value
  return player.isItemActive(props.item.id) && player.isPlaying.value
})

const isBuffering = computed(() => {
  if (!props.item)
    return player.isBuffering.value && player.isPlaying.value
  return player.isItemActive(props.item.id) && player.isBuffering.value && player.isPlaying.value
})

function handleToggle(shouldPlay: boolean) {
  if (shouldPlay) {
    if (props.item) {
      player.play(props.item)
    }
    else {
      player.play()
    }
  }
  else {
    player.pause()
  }
}
</script>

<template>
  <PlayButton
    v-bind="otherProps"
    :class="props.class"
    :playing="isPlaying"
    :loading="isBuffering"
    @toggle="handleToggle"
  />
</template>
