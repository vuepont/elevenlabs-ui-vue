<script setup lang="ts">
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Motion, useInView } from 'motion-v'
import { computed, ref } from 'vue'

interface Props {
  text: string
  duration?: number
  delay?: number
  repeat?: boolean
  repeatDelay?: number
  class?: string
  startOnView?: boolean
  once?: boolean
  inViewMargin?: string
  spread?: number
  color?: string
  shimmerColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2,
  delay: 0,
  repeat: true,
  repeatDelay: 0.5,
  startOnView: true,
  once: false,
  spread: 2,
})

const elementRef = ref<HTMLElement | null>(null)

// Use motion-v's native hook
const isInView = useInView(elementRef, {
  once: props.once,
  margin: props.inViewMargin, // motion-v expects 'margin' (e.g. "100px")
})

const dynamicSpread = computed(() => {
  return props.text.length * props.spread
})

const shouldAnimate = computed(() => {
  return !props.startOnView || isInView.value
})

const styles = computed(() => {
  return {
    '--spread': `${dynamicSpread.value}px`,
    ...(props.color && { '--base-color': props.color }),
    ...(props.shimmerColor && { '--shimmer-color': props.shimmerColor }),
    'backgroundImage': `var(--shimmer-bg), linear-gradient(var(--base-color), var(--base-color))`,
  }
})
</script>

<template>
  <Motion
    ref="elementRef"
    as="span"
    :class="
      cn(
        'relative inline-block bg-size-[250%_100%,auto] bg-clip-text text-transparent',
        '[--base-color:var(--muted-foreground)] [--shimmer-color:var(--foreground)]',
        '[background-repeat:no-repeat,padding-box]',
        '[--shimmer-bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),var(--shimmer-color),transparent_calc(50%+var(--spread)))]',
        'dark:[--base-color:var(--muted-foreground)] dark:[--shimmer-color:var(--foreground)]',
        props.class,
      )
    "
    :style="styles"
    :initial="{
      backgroundPosition: '100% center',
      opacity: 0,
    }"
    :animate="
      shouldAnimate
        ? {
          backgroundPosition: '0% center',
          opacity: 1,
        }
        : {}
    "
    :transition="{
      backgroundPosition: {
        repeat: props.repeat ? Infinity : 0,
        duration: props.duration,
        delay: props.delay,
        repeatDelay: props.repeatDelay,
        ease: 'linear',
      },
      opacity: {
        duration: 0.3,
        delay: props.delay,
      },
    }"
  >
    {{ text }}
  </Motion>
</template>
