import type { CharacterAlignmentResponseModel } from '@elevenlabs/elevenlabs-js/api/types/CharacterAlignmentResponseModel'
import type { Ref } from 'vue'
import { useRafFn } from '@vueuse/core'
import { createContext } from 'reka-ui'
import { computed, ref, unref, watch } from 'vue'

interface ComposeSegmentsOptions {
  hideAudioTags?: boolean
}

interface BaseSegment {
  segmentIndex: number
  text: string
}

export type TranscriptWord = BaseSegment & {
  kind: 'word'
  wordIndex: number
  startTime: number
  endTime: number
}

type GapSegment = BaseSegment & {
  kind: 'gap'
}

export type TranscriptGap = GapSegment
export type TranscriptSegment = TranscriptWord | TranscriptGap

interface ComposeSegmentsResult {
  segments: TranscriptSegment[]
  words: TranscriptWord[]
}

export type SegmentComposer = (
  alignment: CharacterAlignmentResponseModel,
) => ComposeSegmentsResult

export type TranscriptViewerAudioType
  = | 'audio/mpeg'
    | 'audio/wav'
    | 'audio/ogg'
    | 'audio/mp3'
    | 'audio/m4a'
    | 'audio/aac'
    | 'audio/webm'

export interface TranscriptViewerAudioProps {
  controls: boolean
  preload: 'metadata'
  src: string
  type: TranscriptViewerAudioType
}

function composeSegments(
  alignment: CharacterAlignmentResponseModel,
  options: ComposeSegmentsOptions = {},
): ComposeSegmentsResult {
  const {
    characters,
    characterStartTimesSeconds: starts,
    characterEndTimesSeconds: ends,
  } = alignment

  const segments: TranscriptSegment[] = []
  const words: TranscriptWord[] = []

  let wordBuffer = ''
  let whitespaceBuffer = ''
  let wordStart = 0
  let wordEnd = 0
  let segmentIndex = 0
  let wordIndex = 0
  let insideAudioTag = false

  const hideAudioTags = options.hideAudioTags ?? false

  const flushWhitespace = () => {
    if (!whitespaceBuffer)
      return
    segments.push({
      kind: 'gap',
      segmentIndex: segmentIndex++,
      text: whitespaceBuffer,
    })
    whitespaceBuffer = ''
  }

  const flushWord = () => {
    if (!wordBuffer)
      return
    const word: TranscriptWord = {
      kind: 'word',
      segmentIndex: segmentIndex++,
      wordIndex: wordIndex++,
      text: wordBuffer,
      startTime: wordStart,
      endTime: wordEnd,
    }
    segments.push(word)
    words.push(word)
    wordBuffer = ''
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]
    const start = starts?.[i] ?? 0
    const end = ends?.[i] ?? start

    if (hideAudioTags) {
      if (char === '[') {
        flushWord()
        whitespaceBuffer = ''
        insideAudioTag = true
        continue
      }

      if (insideAudioTag) {
        if (char === ']')
          insideAudioTag = false
        continue
      }
    }

    if (/\s/.test(char)) {
      flushWord()
      whitespaceBuffer += char
      continue
    }

    if (whitespaceBuffer) {
      flushWhitespace()
    }

    if (!wordBuffer) {
      wordBuffer = char
      wordStart = start
      wordEnd = end
    }
    else {
      wordBuffer += char
      wordEnd = end
    }
  }

  flushWord()
  flushWhitespace()

  return { segments, words }
}

export interface UseTranscriptViewerProps {
  alignment: CharacterAlignmentResponseModel | Ref<CharacterAlignmentResponseModel>
  segmentComposer?: SegmentComposer
  hideAudioTags?: boolean
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (time: number) => void
  onEnded?: () => void
  onDurationChange?: (duration: number) => void
}

export interface UseTranscriptViewerResult {
  segments: Ref<TranscriptSegment[]>
  words: Ref<TranscriptWord[]>
  spokenSegments: Ref<TranscriptSegment[]>
  unspokenSegments: Ref<TranscriptSegment[]>
  currentWord: Ref<TranscriptWord | null>
  currentSegmentIndex: Ref<number>
  currentWordIndex: Ref<number>
  seekToTime: (time: number) => void
  seekToWord: (word: number | TranscriptWord) => void
  audioRef: Ref<HTMLAudioElement | null>
  isPlaying: Ref<boolean>
  isScrubbing: Ref<boolean>
  duration: Ref<number>
  currentTime: Ref<number>
  play: () => void
  pause: () => void
  startScrubbing: () => void
  endScrubbing: () => void
}

export type TranscriptViewerContextValue = UseTranscriptViewerResult & {
  audioProps: TranscriptViewerAudioProps
}

export const [useTranscriptViewerContext, provideTranscriptViewerContext]
  = createContext<TranscriptViewerContextValue>('TranscriptViewer')

export function useTranscriptViewer({
  alignment,
  hideAudioTags = true,
  segmentComposer,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
  onDurationChange,
}: UseTranscriptViewerProps): UseTranscriptViewerResult {
  const audioRef = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const isScrubbing = ref(false)
  const duration = ref(0)
  const currentTime = ref(0)

  // Track alignment reactively using unref
  // This ensures Vue properly tracks changes whether alignment is a Ref or plain object
  const alignmentValue = computed(() => unref(alignment))

  const segmentsResult = computed(() => {
    const align = alignmentValue.value
    if (!align || !align.characters || align.characters.length === 0) {
      return { segments: [], words: [] }
    }
    if (segmentComposer) {
      return segmentComposer(align)
    }
    return composeSegments(align, { hideAudioTags })
  })

  const segments = computed(() => segmentsResult.value.segments)
  const words = computed(() => segmentsResult.value.words)

  // Best-effort duration guess from alignment data while metadata loads
  const guessedDuration = computed(() => {
    const align = alignmentValue.value
    const ends = align?.characterEndTimesSeconds
    if (Array.isArray(ends) && ends.length) {
      const last = ends[ends.length - 1]
      return Number.isFinite(last) ? last : 0
    }
    if (words.value.length) {
      const lastWord = words.value[words.value.length - 1]
      return Number.isFinite(lastWord.endTime) ? lastWord.endTime : 0
    }
    return 0
  })

  const findWordIndex = (time: number): number => {
    if (!words.value.length)
      return -1
    let lo = 0
    let hi = words.value.length - 1
    let answer = -1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const word = words.value[mid]
      if (time >= word.startTime && time < word.endTime) {
        answer = mid
        break
      }
      if (time < word.startTime) {
        hi = mid - 1
      }
      else {
        lo = mid + 1
      }
    }
    return answer
  }

  // Initialize with first word if available, or -1 if no words
  const getInitialWordIndex = (): number => (words.value.length ? 0 : -1)

  const currentWordIndex = ref<number>(getInitialWordIndex())

  watch(
    [() => words.value.length, alignmentValue, guessedDuration],
    () => {
      currentTime.value = 0
      duration.value = guessedDuration.value
      isPlaying.value = false
      currentWordIndex.value = getInitialWordIndex()
    },
    { immediate: true },
  )

  const handleTimeUpdate = (currentTimeValue: number) => {
    if (!words.value.length)
      return

    const currentWord
      = currentWordIndex.value >= 0 && currentWordIndex.value < words.value.length
        ? words.value[currentWordIndex.value]
        : undefined

    if (!currentWord) {
      const found = findWordIndex(currentTimeValue)
      if (found !== -1)
        currentWordIndex.value = found
      return
    }

    let next = currentWordIndex.value
    if (
      currentTimeValue >= currentWord.endTime
      && currentWordIndex.value + 1 < words.value.length
    ) {
      while (
        next + 1 < words.value.length
        && currentTimeValue >= words.value[next + 1].startTime
      ) {
        next++
      }
      // If we're inside the next word's window, pick it.
      if (currentTimeValue < words.value[next].endTime) {
        currentWordIndex.value = next
        return
      }
      // If we landed in a timing gap (no word contains currentTime),
      // snap to the latest word that started at or before currentTime.
      currentWordIndex.value = next
      return
    }

    if (currentTimeValue < currentWord.startTime) {
      const found = findWordIndex(currentTimeValue)
      if (found !== -1)
        currentWordIndex.value = found
      return
    }

    const found = findWordIndex(currentTimeValue)
    if (found !== -1 && found !== currentWordIndex.value) {
      currentWordIndex.value = found
    }
  }

  // Animation Frame Loop to sync state
  const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
    () => {
      if (isScrubbing.value)
        return
      const node = audioRef.value
      if (!node)
        return

      const time = node.currentTime
      // Opportunistically pick up duration when metadata arrives, even if
      // duration events were missed or coalesced by the browser.
      // Always update duration if it's available to ensure it's current
      if (Number.isFinite(node.duration) && node.duration > 0) {
        // Update duration if it changed (important for handling duration updates)
        if (Math.abs(duration.value - node.duration) > 0.001) {
          duration.value = node.duration
          onDurationChange?.(node.duration)
        }
      }

      // Clamp currentTime to duration to prevent values exceeding duration
      // Use node.duration if available (most accurate), otherwise use state duration
      const actualDuration = Number.isFinite(node.duration) && node.duration > 0
        ? node.duration
        : duration.value
      const clampedTime = actualDuration > 0 ? Math.min(time, actualDuration) : time
      currentTime.value = clampedTime
      handleTimeUpdate(clampedTime)
    },
    { immediate: false },
  )

  watch(
    audioRef,
    (audio, oldAudio) => {
      if (oldAudio) {
        pauseRaf()
      }
      if (!audio) {
        pauseRaf()
        return
      }

      const syncPlayback = () => {
        isPlaying.value = !audio.paused
      }
      const syncTime = () => {
        const time = audio.currentTime
        // Use actual audio duration if available, otherwise use state duration
        const actualDuration = Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : duration.value
        // Clamp currentTime to duration to prevent values exceeding duration
        const clampedTime = actualDuration > 0 ? Math.min(time, actualDuration) : time
        currentTime.value = clampedTime
      }
      const syncDuration = () => {
        duration.value = Number.isFinite(audio.duration) ? audio.duration : 0
      }

      const handlePlay = () => {
        syncPlayback()
        if (!isScrubbing.value) {
          resumeRaf()
        }
        onPlay?.()
      }
      const handlePause = () => {
        syncPlayback()
        syncTime()
        pauseRaf()
        onPause?.()
      }
      const handleEnded = () => {
        syncPlayback()
        syncTime()
        pauseRaf()
        onEnded?.()
      }
      const handleTimeUpdateEvent = () => {
        syncTime()
        // Use the clamped time from syncTime to ensure consistency
        onTimeUpdate?.(currentTime.value)
      }
      const handleSeeked = () => {
        syncTime()
        // Use the clamped time from syncTime to ensure consistency
        handleTimeUpdate(currentTime.value)
      }
      const handleDuration = () => {
        syncDuration()
        onDurationChange?.(audio.duration)
      }

      syncPlayback()
      syncTime()
      syncDuration()
      if (!audio.paused && !isScrubbing.value) {
        resumeRaf()
      }
      else {
        pauseRaf()
      }

      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('timeupdate', handleTimeUpdateEvent)
      audio.addEventListener('seeked', handleSeeked)
      audio.addEventListener('durationchange', handleDuration)
      audio.addEventListener('loadedmetadata', handleDuration)

      return () => {
        pauseRaf()
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('timeupdate', handleTimeUpdateEvent)
        audio.removeEventListener('seeked', handleSeeked)
        audio.removeEventListener('durationchange', handleDuration)
        audio.removeEventListener('loadedmetadata', handleDuration)
      }
    },
    { immediate: true },
  )

  watch(
    [isPlaying, isScrubbing],
    ([playing, scrubbing]) => {
      if (!audioRef.value)
        return
      if (playing && !scrubbing && !audioRef.value.paused) {
        resumeRaf()
      }
      else {
        pauseRaf()
      }
    },
  )

  const seekToTime = (time: number) => {
    const node = audioRef.value
    if (!node)
      return
    // Clamp time to duration to prevent seeking beyond the end
    const clampedTime = duration.value > 0 ? Math.min(Math.max(time, 0), duration.value) : Math.max(time, 0)
    // Optimistically update UI time immediately to reflect the seek,
    // since some browsers coalesce timeupdate/seeked events under rapid seeks.
    currentTime.value = clampedTime
    node.currentTime = clampedTime
    handleTimeUpdate(clampedTime)
  }

  const seekToWord = (word: number | TranscriptWord) => {
    const target = typeof word === 'number' ? words.value[word] : word
    if (!target)
      return
    seekToTime(target.startTime)
  }

  const play = () => {
    const audio = audioRef.value
    if (!audio)
      return
    if (audio.paused) {
      void audio.play()
      isPlaying.value = true
    }
  }

  const pause = () => {
    const audio = audioRef.value
    if (audio && !audio.paused) {
      audio.pause()
      isPlaying.value = false
    }
  }

  const startScrubbing = () => {
    isScrubbing.value = true
    pauseRaf()
  }

  const endScrubbing = () => {
    isScrubbing.value = false
    // Resume RAF if audio is still playing after scrubbing ends
    const node = audioRef.value
    if (node && !node.paused) {
      resumeRaf()
    }
  }

  const currentWord = computed(() => {
    if (currentWordIndex.value >= 0 && currentWordIndex.value < words.value.length)
      return words.value[currentWordIndex.value]
    return null
  })
  const currentSegmentIndex = computed(() => currentWord.value?.segmentIndex ?? -1)

  const spokenSegments = computed(() => {
    if (!segments.value.length || currentSegmentIndex.value <= 0)
      return []
    return segments.value.slice(0, currentSegmentIndex.value)
  })

  const unspokenSegments = computed(() => {
    if (!segments.value.length)
      return []
    if (currentSegmentIndex.value === -1)
      return segments.value
    if (currentSegmentIndex.value + 1 >= segments.value.length)
      return []
    return segments.value.slice(currentSegmentIndex.value + 1)
  })

  return {
    segments,
    words,
    spokenSegments,
    unspokenSegments,
    currentWord,
    currentSegmentIndex,
    currentWordIndex,
    seekToTime,
    seekToWord,
    audioRef,
    isPlaying,
    isScrubbing,
    duration,
    currentTime,
    play,
    pause,
    startScrubbing,
    endScrubbing,
  }
}

export type { CharacterAlignmentResponseModel }
