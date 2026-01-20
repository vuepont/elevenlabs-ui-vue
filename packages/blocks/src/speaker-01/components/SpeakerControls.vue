<script setup lang="ts">
import type { AudioPlayerItem } from '@repo/elements/audio-player'
import type { HTMLAttributes } from 'vue'
import { useAudioPlayer } from '@repo/elements/audio-player'
import { Waveform } from '@repo/elements/waveform'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { Card } from '@repo/shadcn-vue/components/ui/card'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Music, SkipBack, SkipForward, Sparkles } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import PlayButton from './PlayButton.vue'
import SpeakerOrbsSection from './SpeakerOrbsSection.vue'
import TimeDisplay from './TimeDisplay.vue'
import VolumeSlider from './VolumeSlider.vue'

// Types
export interface Track {
  id: string
  name: string
  url: string
}

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

// Example tracks
const exampleTracks: Track[] = [
  { id: '0', name: 'II - 00', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3' },
  { id: '1', name: 'II - 01', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/01.mp3' },
  { id: '2', name: 'II - 02', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/02.mp3' },
  { id: '3', name: 'II - 03', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/03.mp3' },
  { id: '4', name: 'II - 04', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/04.mp3' },
  { id: '5', name: 'II - 05', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/05.mp3' },
  { id: '6', name: 'II - 06', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/06.mp3' },
  { id: '7', name: 'II - 07', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/07.mp3' },
  { id: '8', name: 'II - 08', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/08.mp3' },
  { id: '9', name: 'II - 09', url: 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/09.mp3' },
]

const playerApi = useAudioPlayer<Track>()

// State
const volume = ref(0.7)
const currentTrackIndex = ref(0)
const showTrackList = ref(false)
const audioDataRef = ref<number[]>([])
const isDark = ref(false)
const isScrubbing = ref(false)
const isMomentumActive = ref(false)
const precomputedWaveform = shallowRef<number[]>([])
const ambienceMode = ref(false)

// Refs
const waveformOffset = ref(0)
const waveformElementRef = ref<HTMLElement | null>(null)
const containerWidthRef = ref(300)
const isPlayingRef = ref(false)

// Audio refs
const analyserRef = ref<AnalyserNode | null>(null)
const audioContextRef = ref<AudioContext | null>(null)
const sourceRef = ref<MediaElementAudioSourceNode | null>(null)
const audioBufferRef = ref<AudioBuffer | null>(null)
const scratchBufferRef = ref<AudioBufferSourceNode | null>(null)
const totalBarsRef = ref(600)
const convolverRef = ref<ConvolverNode | null>(null)
const delayRef = ref<DelayNode | null>(null)
const feedbackRef = ref<GainNode | null>(null)
const wetGainRef = ref<GainNode | null>(null)
const dryGainRef = ref<GainNode | null>(null)
const masterGainRef = ref<GainNode | null>(null)
const lowPassFilterRef = ref<BiquadFilterNode | null>(null)
const highPassFilterRef = ref<BiquadFilterNode | null>(null)

// Computed
const tracks = computed(() =>
  exampleTracks.map(t => ({
    id: t.id,
    title: t.name,
    artist: 'ElevenLabs Music',
  })),
)

const currentTrack = computed(() => tracks.value[currentTrackIndex.value])

// Theme detection
onMounted(() => {
  const checkTheme = () => {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  checkTheme()

  const observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  onUnmounted(() => observer.disconnect())
})

// Container width setup
onMounted(() => {
  const container = document.querySelector('.waveform-container')
  if (container) {
    const rect = container.getBoundingClientRect()
    containerWidthRef.value = rect.width
    waveformOffset.value = rect.width
    if (waveformElementRef.value) {
      waveformElementRef.value.style.transform = `translateX(${rect.width}px)`
    }
  }
})

// Precompute waveform
async function precomputeWaveform(audioUrl: string) {
  try {
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()

    const offlineContext = new OfflineAudioContext(1, 44100 * 5, 44100)
    const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer.slice(0))

    if (!audioContextRef.value) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.value = audioContext
    }

    audioBufferRef.value = await audioContextRef.value.decodeAudioData(arrayBuffer)

    const channelData = audioBuffer.getChannelData(0)
    const samplesPerBar = Math.floor(channelData.length / totalBarsRef.value)
    const waveformData: number[] = []

    for (let i = 0; i < totalBarsRef.value; i++) {
      const start = i * samplesPerBar
      const end = start + samplesPerBar
      let sum = 0
      let count = 0

      for (let j = start; j < end && j < channelData.length; j += 100) {
        sum += Math.abs(channelData[j])
        count++
      }

      const average = count > 0 ? sum / count : 0
      waveformData.push(Math.min(1, average * 3))
    }

    precomputedWaveform.value = waveformData
  }
  catch (error) {
    console.error('Error precomputing waveform:', error)
  }
}

// Watch precomputed waveform changes
watch(precomputedWaveform, () => {
  if (precomputedWaveform.value.length > 0 && containerWidthRef.value > 0) {
    waveformOffset.value = containerWidthRef.value
    if (waveformElementRef.value) {
      waveformElementRef.value.style.transform = `translateX(${containerWidthRef.value}px)`
    }
    if (playerApi.audioRef.value) {
      playerApi.audioRef.value.currentTime = 0
    }
  }
})

// Create impulse response for reverb
function createImpulseResponse(audioContext: AudioContext, duration: number, decay: number) {
  const sampleRate = audioContext.sampleRate
  const length = sampleRate * duration
  const impulse = audioContext.createBuffer(2, length, sampleRate)

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      const envelope = (1 - i / length) ** decay
      const earlyReflections = i < length * 0.1 ? Math.random() * 0.5 : 0
      const diffusion = (Math.random() * 2 - 1) * envelope
      const stereoWidth = channel === 0 ? 0.9 : 1.1

      channelData[i] = (diffusion + earlyReflections) * stereoWidth * 0.8
    }
  }
  return impulse
}

// Setup audio context
function setupAudioContext(ambience: boolean) {
  if (!playerApi.audioRef.value)
    return

  if (
    audioContextRef.value
    && sourceRef.value
    && wetGainRef.value
    && dryGainRef.value
  ) {
    return
  }

  try {
    let audioContext = audioContextRef.value
    let source = sourceRef.value
    let analyser = analyserRef.value

    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.value = audioContext
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    if (!source) {
      source = audioContext.createMediaElementSource(playerApi.audioRef.value)
      sourceRef.value = source
    }

    if (!analyser) {
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.7
      analyserRef.value = analyser
    }

    const convolver = audioContext.createConvolver()
    convolver.buffer = createImpulseResponse(audioContext, 6, 1.5)

    const delay = audioContext.createDelay(2)
    delay.delayTime.value = 0.001

    const feedback = audioContext.createGain()
    feedback.gain.value = 0.05

    const lowPassFilter = audioContext.createBiquadFilter()
    lowPassFilter.type = 'lowpass'
    lowPassFilter.frequency.value = 1500
    lowPassFilter.Q.value = 0.5

    const highPassFilter = audioContext.createBiquadFilter()
    highPassFilter.type = 'highpass'
    highPassFilter.frequency.value = 100
    highPassFilter.Q.value = 0.7

    const wetGain = audioContext.createGain()
    wetGain.gain.value = ambience ? 0.85 : 0

    const dryGain = audioContext.createGain()
    dryGain.gain.value = ambience ? 0.4 : 1

    const masterGain = audioContext.createGain()
    masterGain.gain.value = 1

    const compressor = audioContext.createDynamicsCompressor()
    compressor.threshold.value = -12
    compressor.knee.value = 2
    compressor.ratio.value = 8
    compressor.attack.value = 0.003
    compressor.release.value = 0.1

    try {
      source.disconnect()
      if (analyserRef.value)
        analyserRef.value.disconnect()
    }
    catch {}

    source.connect(dryGain)
    dryGain.connect(masterGain)

    source.connect(highPassFilter)
    highPassFilter.connect(convolver)
    convolver.connect(delay)

    delay.connect(feedback)
    feedback.connect(lowPassFilter)
    lowPassFilter.connect(delay)

    delay.connect(wetGain)
    wetGain.connect(masterGain)

    masterGain.connect(compressor)
    compressor.connect(analyser)
    analyser.connect(audioContext.destination)

    convolverRef.value = convolver
    delayRef.value = delay
    feedbackRef.value = feedback
    wetGainRef.value = wetGain
    dryGainRef.value = dryGain
    masterGainRef.value = masterGain
    lowPassFilterRef.value = lowPassFilter
    highPassFilterRef.value = highPassFilter
  }
  catch (error) {
    console.error('Error setting up audio context:', error)
  }
}

// Initialize first track
onMounted(() => {
  const track = exampleTracks[0]
  const item: AudioPlayerItem<Track> = {
    id: track.id,
    src: track.url,
    data: { id: track.id, name: track.name, url: track.url },
  }
  playerApi.setActiveItem(item)
  precomputeWaveform(track.url)
})

// Audio event listeners
onMounted(() => {
  const handlePlay = () => {
    isPlayingRef.value = true

    if (!analyserRef.value) {
      setTimeout(() => {
        setupAudioContext(ambienceMode.value)
      }, 100)
    }
  }

  const handlePause = () => {
    isPlayingRef.value = false
  }

  const checkInterval = setInterval(() => {
    const audioEl = playerApi.audioRef.value
    if (audioEl) {
      clearInterval(checkInterval)

      audioEl.addEventListener('play', handlePlay)
      audioEl.addEventListener('pause', handlePause)
      audioEl.addEventListener('ended', handlePause)

      if (!audioEl.paused) {
        handlePlay()
      }
    }
  }, 100)

  onUnmounted(() => {
    clearInterval(checkInterval)
    const audioEl = playerApi.audioRef.value
    if (audioEl) {
      audioEl.removeEventListener('play', handlePlay)
      audioEl.removeEventListener('pause', handlePause)
      audioEl.removeEventListener('ended', handlePause)
    }
  })
})

// Sync volume with audio element
watch(volume, (val) => {
  if (playerApi.audioRef.value) {
    playerApi.audioRef.value.volume = val
  }
})

// Ambience mode effect
watch(ambienceMode, (val) => {
  if (!audioContextRef.value)
    return

  const targetWet = val ? 0.7 : 0
  const targetDry = val ? 0.5 : 1
  const currentTime = audioContextRef.value.currentTime

  if (wetGainRef.value && dryGainRef.value) {
    wetGainRef.value.gain.cancelScheduledValues(currentTime)
    dryGainRef.value.gain.cancelScheduledValues(currentTime)

    wetGainRef.value.gain.setValueAtTime(wetGainRef.value.gain.value, currentTime)
    dryGainRef.value.gain.setValueAtTime(dryGainRef.value.gain.value, currentTime)

    wetGainRef.value.gain.linearRampToValueAtTime(targetWet, currentTime + 0.5)
    dryGainRef.value.gain.linearRampToValueAtTime(targetDry, currentTime + 0.5)
  }

  if (feedbackRef.value) {
    feedbackRef.value.gain.cancelScheduledValues(currentTime)
    feedbackRef.value.gain.setValueAtTime(feedbackRef.value.gain.value, currentTime)
    feedbackRef.value.gain.linearRampToValueAtTime(val ? 0.25 : 0.05, currentTime + 0.5)
  }

  if (delayRef.value) {
    delayRef.value.delayTime.cancelScheduledValues(currentTime)
    delayRef.value.delayTime.setValueAtTime(delayRef.value.delayTime.value, currentTime)
    delayRef.value.delayTime.linearRampToValueAtTime(val ? 0.25 : 0.001, currentTime + 0.5)
  }

  if (lowPassFilterRef.value) {
    lowPassFilterRef.value.frequency.cancelScheduledValues(currentTime)
    lowPassFilterRef.value.frequency.setValueAtTime(lowPassFilterRef.value.frequency.value, currentTime)
    lowPassFilterRef.value.frequency.linearRampToValueAtTime(val ? 800 : 1500, currentTime + 0.5)
    lowPassFilterRef.value.Q.linearRampToValueAtTime(val ? 0.7 : 0.5, currentTime + 0.5)
  }

  if (highPassFilterRef.value) {
    highPassFilterRef.value.frequency.cancelScheduledValues(currentTime)
    highPassFilterRef.value.frequency.setValueAtTime(highPassFilterRef.value.frequency.value, currentTime)
    highPassFilterRef.value.frequency.linearRampToValueAtTime(val ? 200 : 100, currentTime + 0.5)
  }

  if (masterGainRef.value) {
    masterGainRef.value.gain.cancelScheduledValues(currentTime)
    masterGainRef.value.gain.setValueAtTime(masterGainRef.value.gain.value, currentTime)
    masterGainRef.value.gain.linearRampToValueAtTime(val ? 1.2 : 1, currentTime + 0.5)
  }
})

// Waveform position update animation
let waveformAnimationId: number | null = null

onMounted(() => {
  const updatePosition = () => {
    const audioEl = playerApi.audioRef.value
    if (
      audioEl
      && !isScrubbing.value
      && !isMomentumActive.value
      && waveformElementRef.value
    ) {
      const duration = audioEl.duration
      const currentTime = audioEl.currentTime
      if (!Number.isNaN(duration) && duration > 0) {
        const position = currentTime / duration
        const containerWidth = containerWidthRef.value
        const totalWidth = totalBarsRef.value * 5
        const newOffset = containerWidth - position * totalWidth
        waveformOffset.value = newOffset
        waveformElementRef.value.style.transform = `translateX(${newOffset}px)`
      }
    }
    waveformAnimationId = requestAnimationFrame(updatePosition)
  }

  waveformAnimationId = requestAnimationFrame(updatePosition)

  onUnmounted(() => {
    if (waveformAnimationId) {
      cancelAnimationFrame(waveformAnimationId)
    }
  })
})

// Audio data update animation
let audioAnimationId: number | null = null

onMounted(() => {
  const updateWaveform = () => {
    if (analyserRef.value && isPlayingRef.value) {
      const dataArray = new Uint8Array(analyserRef.value.frequencyBinCount)
      analyserRef.value.getByteFrequencyData(dataArray)

      const normalizedData = Array.from(dataArray).map(value => value / 255)
      audioDataRef.value = normalizedData
    }
    else if (!isPlayingRef.value && audioDataRef.value.length > 0) {
      audioDataRef.value = audioDataRef.value.map(v => v * 0.9)
    }

    audioAnimationId = requestAnimationFrame(updateWaveform)
  }

  audioAnimationId = requestAnimationFrame(updateWaveform)

  onUnmounted(() => {
    if (audioAnimationId) {
      cancelAnimationFrame(audioAnimationId)
    }
  })
})

// Track control functions
function playTrack(index: number) {
  currentTrackIndex.value = index
  const track = exampleTracks[index]
  const item: AudioPlayerItem<Track> = {
    id: track.id,
    src: track.url,
    data: { id: track.id, name: track.name, url: track.url },
  }
  playerApi.play(item)
  showTrackList.value = false
  precomputeWaveform(track.url)
}

function nextTrack() {
  const nextIndex = (currentTrackIndex.value + 1) % exampleTracks.length
  playTrack(nextIndex)
}

function prevTrack() {
  const prevIndex = (currentTrackIndex.value - 1 + exampleTracks.length) % exampleTracks.length
  playTrack(prevIndex)
}

// Scratch sound functions
function playScratchSound(position: number, speed = 1) {
  if (!audioContextRef.value) {
    audioContextRef.value = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  if (audioContextRef.value.state === 'suspended') {
    audioContextRef.value.resume()
  }

  if (!audioBufferRef.value)
    return

  stopScratchSound()

  try {
    const source = audioContextRef.value.createBufferSource()
    source.buffer = audioBufferRef.value

    const startTime = Math.max(
      0,
      Math.min(audioBufferRef.value.duration - 0.1, position * audioBufferRef.value.duration),
    )

    const filter = audioContextRef.value.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = Math.max(800, 2500 - speed * 1500)
    filter.Q.value = 3

    source.playbackRate.value = Math.max(0.4, Math.min(2.5, 1 + speed * 0.5))

    const gainNode = audioContextRef.value.createGain()
    gainNode.gain.value = 1.0

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContextRef.value.destination)

    source.start(0, startTime, 0.06)

    scratchBufferRef.value = source
  }
  catch (error) {
    console.error('Error playing scratch sound:', error)
  }
}

function stopScratchSound() {
  if (scratchBufferRef.value) {
    try {
      scratchBufferRef.value.stop()
    }
    catch {}
    scratchBufferRef.value = null
  }
}

// Waveform scrubbing handlers
function handleWaveformMouseDown(e: MouseEvent) {
  e.preventDefault()
  isScrubbing.value = true

  const wasPlaying = isPlayingRef.value

  if (isPlayingRef.value) {
    playerApi.pause()
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const startX = e.clientX
  const containerWidth = rect.width
  containerWidthRef.value = containerWidth
  const totalWidth = totalBarsRef.value * 5
  const currentOffset = waveformOffset.value
  let lastMouseX = startX
  let lastScratchTime = 0
  const scratchThrottle = 10

  let velocity = 0
  let lastTime = Date.now()
  let lastClientX = e.clientX

  const handleMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const newOffset = currentOffset + deltaX

    const minOffset = containerWidth - totalWidth
    const maxOffset = containerWidth
    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset))
    waveformOffset.value = clampedOffset
    if (waveformElementRef.value) {
      waveformElementRef.value.style.transform = `translateX(${clampedOffset}px)`
    }

    const position = Math.max(0, Math.min(1, (containerWidth - clampedOffset) / totalWidth))

    const audioEl = playerApi.audioRef.value
    if (audioEl && !Number.isNaN(audioEl.duration)) {
      audioEl.currentTime = position * audioEl.duration
    }

    const now = Date.now()
    const mouseDelta = e.clientX - lastMouseX

    const timeDelta = now - lastTime
    if (timeDelta > 0) {
      const instantVelocity = (e.clientX - lastClientX) / timeDelta
      velocity = velocity * 0.6 + instantVelocity * 0.4
    }
    lastTime = now
    lastClientX = e.clientX

    if (Math.abs(mouseDelta) > 0) {
      if (now - lastScratchTime >= scratchThrottle) {
        const speed = Math.min(3, Math.abs(mouseDelta) / 3)
        playScratchSound(position, speed)
        lastScratchTime = now
      }
    }
    lastMouseX = e.clientX
  }

  const handleUp = () => {
    isScrubbing.value = false
    stopScratchSound()

    if (Math.abs(velocity) > 0.1) {
      isMomentumActive.value = true
      let momentumOffset = waveformOffset.value
      let currentVelocity = velocity * 15
      const friction = 0.92
      const minVelocity = 0.5
      let lastScratchFrame = 0
      const scratchFrameInterval = 50

      const animateMomentum = () => {
        if (Math.abs(currentVelocity) > minVelocity) {
          momentumOffset += currentVelocity
          currentVelocity *= friction

          const minOffset = containerWidth - totalWidth
          const maxOffset = containerWidth
          const clampedOffset = Math.max(minOffset, Math.min(maxOffset, momentumOffset))

          if (clampedOffset !== momentumOffset) {
            currentVelocity = 0
          }

          momentumOffset = clampedOffset
          waveformOffset.value = clampedOffset
          if (waveformElementRef.value) {
            waveformElementRef.value.style.transform = `translateX(${clampedOffset}px)`
          }

          const position = Math.max(0, Math.min(1, (containerWidth - clampedOffset) / totalWidth))

          const audioEl2 = playerApi.audioRef.value
          if (audioEl2 && !Number.isNaN(audioEl2.duration)) {
            audioEl2.currentTime = position * audioEl2.duration
          }

          const now = Date.now()
          if (now - lastScratchFrame >= scratchFrameInterval) {
            const speed = Math.min(2.5, Math.abs(currentVelocity) / 10)
            if (speed > 0.1) {
              playScratchSound(position, speed)
            }
            lastScratchFrame = now
          }

          requestAnimationFrame(animateMomentum)
        }
        else {
          stopScratchSound()
          isMomentumActive.value = false
          if (wasPlaying) {
            setTimeout(() => {
              playerApi.play()
            }, 10)
          }
        }
      }

      requestAnimationFrame(animateMomentum)
    }
    else {
      if (wasPlaying) {
        playerApi.play()
      }
    }

    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleUp)
}

function handleWaveformTouchStart(e: TouchEvent) {
  e.preventDefault()
  isScrubbing.value = true

  const wasPlaying = isPlayingRef.value

  if (isPlayingRef.value) {
    playerApi.pause()
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const startX = e.touches[0].clientX
  const containerWidth = rect.width
  containerWidthRef.value = containerWidth
  const totalWidth = totalBarsRef.value * 5
  const currentOffset = waveformOffset.value
  let lastTouchX = startX
  let lastScratchTime = 0
  const scratchThrottle = 10

  let velocity = 0
  let lastTime = Date.now()
  let lastClientX = e.touches[0].clientX

  const handleMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const newOffset = currentOffset + deltaX

    const minOffset = containerWidth - totalWidth
    const maxOffset = containerWidth
    const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset))
    waveformOffset.value = clampedOffset
    if (waveformElementRef.value) {
      waveformElementRef.value.style.transform = `translateX(${clampedOffset}px)`
    }

    const position = Math.max(0, Math.min(1, (containerWidth - clampedOffset) / totalWidth))

    const audioEl = playerApi.audioRef.value
    if (audioEl && !Number.isNaN(audioEl.duration)) {
      audioEl.currentTime = position * audioEl.duration
    }

    const now = Date.now()
    const touchDelta = touch.clientX - lastTouchX

    const timeDelta = now - lastTime
    if (timeDelta > 0) {
      const instantVelocity = (touch.clientX - lastClientX) / timeDelta
      velocity = velocity * 0.6 + instantVelocity * 0.4
    }
    lastTime = now
    lastClientX = touch.clientX

    if (Math.abs(touchDelta) > 0) {
      if (now - lastScratchTime >= scratchThrottle) {
        const speed = Math.min(3, Math.abs(touchDelta) / 3)
        playScratchSound(position, speed)
        lastScratchTime = now
      }
    }
    lastTouchX = touch.clientX
  }

  const handleEnd = () => {
    isScrubbing.value = false
    stopScratchSound()

    if (Math.abs(velocity) > 0.1) {
      isMomentumActive.value = true
      let momentumOffset = waveformOffset.value
      let currentVelocity = velocity * 15
      const friction = 0.92
      const minVelocity = 0.5
      let lastScratchFrame = 0
      const scratchFrameInterval = 50

      const animateMomentum = () => {
        if (Math.abs(currentVelocity) > minVelocity) {
          momentumOffset += currentVelocity
          currentVelocity *= friction

          const minOffset = containerWidth - totalWidth
          const maxOffset = containerWidth
          const clampedOffset = Math.max(minOffset, Math.min(maxOffset, momentumOffset))

          if (clampedOffset !== momentumOffset) {
            currentVelocity = 0
          }

          momentumOffset = clampedOffset
          waveformOffset.value = clampedOffset
          if (waveformElementRef.value) {
            waveformElementRef.value.style.transform = `translateX(${clampedOffset}px)`
          }

          const position = Math.max(0, Math.min(1, (containerWidth - clampedOffset) / totalWidth))

          const audioEl2 = playerApi.audioRef.value
          if (audioEl2 && !Number.isNaN(audioEl2.duration)) {
            audioEl2.currentTime = position * audioEl2.duration
          }

          const now = Date.now()
          if (now - lastScratchFrame >= scratchFrameInterval) {
            const speed = Math.min(2.5, Math.abs(currentVelocity) / 10)
            if (speed > 0.1) {
              playScratchSound(position, speed)
            }
            lastScratchFrame = now
          }

          requestAnimationFrame(animateMomentum)
        }
        else {
          stopScratchSound()
          isMomentumActive.value = false
          if (wasPlaying) {
            setTimeout(() => {
              playerApi.play()
            }, 10)
          }
        }
      }

      requestAnimationFrame(animateMomentum)
    }
    else {
      if (wasPlaying) {
        playerApi.play()
      }
    }

    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }

  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}
</script>

<template>
  <Card :class="cn('relative', props.class)">
    <div class="bg-muted-foreground/30 absolute top-0 left-1/2 h-3 w-48 -translate-x-1/2 rounded-b-full" />
    <div class="bg-muted-foreground/20 absolute top-0 left-1/2 h-2 w-44 -translate-x-1/2 rounded-b-full" />

    <div class="relative space-y-6 p-4">
      <div class="border-border rounded-lg border bg-black/5 p-4 backdrop-blur-sm dark:bg-black/50">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <h3 class="text-foreground truncate text-sm font-medium">
                {{ currentTrack.title }}
              </h3>
              <a
                href="https://elevenlabs.io/music"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground truncate text-xs"
              >
                {{ currentTrack.artist }}
              </a>
            </div>
            <div class="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                :class="cn(
                  'h-8 w-8 transition-all',
                  ambienceMode
                    ? 'text-primary hover:text-primary/80'
                    : 'text-muted-foreground hover:text-foreground',
                )"
                @click="ambienceMode = !ambienceMode"
              >
                <Sparkles class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-foreground h-8 w-8"
                @click="showTrackList = !showTrackList"
              >
                <Music class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            class="waveform-container bg-foreground/10 relative h-12 cursor-grab overflow-hidden rounded-lg p-2 active:cursor-grabbing dark:bg-black/80"
            @touchstart="handleWaveformTouchStart"
            @mousedown="handleWaveformMouseDown"
          >
            <div class="relative h-full w-full overflow-hidden">
              <div
                ref="waveformElementRef"
                :style="{
                  transform: `translateX(${waveformOffset}px)`,
                  transition: isScrubbing || isMomentumActive ? 'none' : 'transform 0.016s linear',
                  width: `${totalBarsRef * 5}px`,
                  position: 'absolute',
                  left: 0,
                }"
              >
                <Waveform
                  :key="isDark ? 'dark' : 'light'"
                  :data="precomputedWaveform.length > 0 ? precomputedWaveform : audioDataRef"
                  :height="32"
                  :bar-width="3"
                  :bar-gap="2"
                  :fade-edges="true"
                  :fade-width="24"
                  :bar-radius="1"
                  :bar-color="isDark ? '#a1a1aa' : '#71717a'"
                />
              </div>
            </div>
          </div>

          <TimeDisplay />
        </div>
      </div>

      <!-- Track list -->
      <div
        v-if="showTrackList"
        class="bg-card/95 border-border absolute top-36 right-8 left-8 z-10 rounded-lg border p-3 shadow-xl backdrop-blur"
      >
        <h4 class="text-muted-foreground mb-2 font-mono text-xs tracking-wider uppercase">
          Playlist
        </h4>
        <div class="max-h-32 space-y-1 overflow-y-auto">
          <button
            v-for="(track, index) in tracks"
            :key="track.id"
            :class="cn(
              'w-full rounded px-2 py-1 text-left text-xs transition-all',
              currentTrackIndex === index
                ? 'bg-foreground/10 text-foreground dark:bg-primary/20 dark:text-primary'
                : 'hover:bg-muted text-muted-foreground',
            )"
            @click="playTrack(index)"
          >
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground/60">{{ index + 1 }}</span>
              <div class="min-w-0 flex-1">
                <div class="truncate">
                  {{ track.title }}
                </div>
                <div class="text-muted-foreground/60 truncate text-xs">
                  {{ track.artist }}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Play controls -->
      <div class="flex justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          class="border-border bg-background hover:bg-muted h-10 w-10 rounded-full"
          @click="prevTrack"
        >
          <SkipBack class="text-muted-foreground h-4 w-4" />
        </Button>

        <PlayButton :track="exampleTracks[currentTrackIndex]" />

        <Button
          variant="outline"
          size="icon"
          class="border-border bg-background hover:bg-muted h-10 w-10 rounded-full"
          @click="nextTrack"
        >
          <SkipForward class="text-muted-foreground h-4 w-4" />
        </Button>
      </div>

      <SpeakerOrbsSection
        :is-dark="isDark"
        :audio-data="audioDataRef"
        :is-playing="isPlayingRef"
        :volume="volume"
      />

      <VolumeSlider v-model="volume" />
    </div>
  </Card>
</template>
