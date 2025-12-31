import type { Ref } from 'vue'
import type { Frame } from './types'
import { useRafFn } from '@vueuse/core'
import { ref, watch } from 'vue'

export function useAnimation(
  frames: Ref<Frame[] | undefined>,
  options: {
    fps: number
    autoplay: boolean
    loop: boolean
    onFrame?: (index: number) => void
  },
) {
  const frameIndex = ref(0)
  const isPlaying = ref(options.autoplay)

  let lastTime = 0
  let accumulator = 0

  const { resume } = useRafFn(({ timestamp }) => {
    if (!frames.value || frames.value.length === 0 || !isPlaying.value)
      return

    const frameInterval = 1000 / options.fps

    if (lastTime === 0) {
      lastTime = timestamp
    }

    const deltaTime = timestamp - lastTime
    lastTime = timestamp
    accumulator += deltaTime

    if (accumulator >= frameInterval) {
      accumulator -= frameInterval

      const next = frameIndex.value + 1

      if (next >= frames.value.length) {
        if (options.loop) {
          frameIndex.value = 0
          options.onFrame?.(0)
        }
        else {
          isPlaying.value = false
        }
      }
      else {
        frameIndex.value = next
        options.onFrame?.(next)
      }
    }
  }, { immediate: options.autoplay })

  watch([frames, () => options.autoplay], ([newFrames, newAutoplay]) => {
    frameIndex.value = 0
    isPlaying.value = !!newAutoplay
    lastTime = 0
    accumulator = 0

    if (newAutoplay && newFrames && newFrames.length > 0) {
      resume()
    }
  }, { immediate: true })

  return { frameIndex, isPlaying }
}
