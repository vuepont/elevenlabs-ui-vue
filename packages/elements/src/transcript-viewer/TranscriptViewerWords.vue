<script setup lang="ts">
import type { HTMLAttributes, PropType, VNodeChild } from 'vue'
import type {
  TranscriptGap,
  TranscriptSegment,
  TranscriptWord,
} from './useTranscriptViewer'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed, defineComponent, useSlots } from 'vue'
import TranscriptViewerWord from './TranscriptViewerWord.vue'
import { useTranscriptViewerContext } from './useTranscriptViewer'

type TranscriptViewerWordStatus = 'spoken' | 'unspoken' | 'current'

const props = defineProps<Props>()

const RenderContent = defineComponent({
  name: 'TranscriptViewerRenderContent',
  props: {
    node: {
      type: null as unknown as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(props) {
    return () => props.node
  },
})

interface Props {
  renderWord?: (props: {
    word: TranscriptWord
    status: TranscriptViewerWordStatus
  }) => VNodeChild
  renderGap?: (props: {
    segment: TranscriptGap
    status: TranscriptViewerWordStatus
  }) => VNodeChild
  wordClassNames?: string
  gapClassNames?: string
  class?: HTMLAttributes['class']
}

const slots = useSlots()
const context = useTranscriptViewerContext()

const nearEnd = computed(() => {
  if (!context.duration.value)
    return false
  return context.currentTime.value >= context.duration.value - 0.01
})

const segmentsWithStatus = computed(() => {
  if (!context.segments.value?.length)
    return []

  if (nearEnd.value) {
    return context.segments.value.map(segment => ({ segment, status: 'spoken' as const }))
  }

  const entries: Array<{
    segment: TranscriptSegment
    status: TranscriptViewerWordStatus
  }> = []

  for (const segment of context.spokenSegments.value) {
    entries.push({ segment, status: 'spoken' })
  }

  if (context.currentWord.value) {
    entries.push({ segment: context.currentWord.value, status: 'current' })
  }

  for (const segment of context.unspokenSegments.value) {
    entries.push({ segment, status: 'unspoken' })
  }

  return entries
})

const hasWordSlot = computed(() => Boolean(slots.word))
const hasGapSlot = computed(() => Boolean(slots.gap))
</script>

<template>
  <div
    data-slot="transcript-words"
    :class="cn('text-xl leading-relaxed', props.class)"
  >
    <template
      v-for="{ segment, status } in segmentsWithStatus"
      :key="segment.kind === 'gap' ? `gap-${segment.segmentIndex}` : `word-${segment.segmentIndex}`"
    >
      <span
        v-if="segment.kind === 'gap'"
        data-kind="gap"
        :data-status="status"
        :class="cn(props.gapClassNames)"
      >
        <slot
          v-if="hasGapSlot"
          name="gap"
          :segment="segment"
          :status="status"
        />
        <RenderContent
          v-else-if="props.renderGap"
          :node="props.renderGap({ segment, status })"
        />
        <template v-else>
          {{ segment.text }}
        </template>
      </span>
      <span
        v-else-if="hasWordSlot || props.renderWord"
        data-kind="word"
        :data-status="status"
        :class="cn(props.wordClassNames)"
      >
        <slot
          v-if="hasWordSlot"
          name="word"
          :word="segment"
          :status="status"
        />
        <RenderContent
          v-else
          :node="props.renderWord?.({ word: segment, status })"
        />
      </span>
      <TranscriptViewerWord
        v-else
        :word="segment"
        :status="status"
        :class="props.wordClassNames"
      />
    </template>
  </div>
</template>
