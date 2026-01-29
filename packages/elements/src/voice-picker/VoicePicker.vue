<script setup lang="ts">
import type { ElevenLabs } from '@elevenlabs/elevenlabs-js'
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@repo/shadcn-vue/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/shadcn-vue/components/ui/popover'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { ChevronsUpDown } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { AudioPlayer } from '../audio-player'
import { Orb } from '../orb'
import VoicePickerItem from './VoicePickerItem.vue'

const props = withDefaults(defineProps<{
  voices: ElevenLabs.Voice[]
  modelValue?: string
  placeholder?: string
  class?: HTMLAttributes['class']
  open?: boolean
}>(), {
  placeholder: 'Select a voice...',
  open: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [value: boolean]
}>()

const internalOpen = ref(false)

const isOpen = computed({
  get: () => props.open !== undefined ? props.open : internalOpen.value,
  set: (val) => {
    if (props.open !== undefined) {
      emit('update:open', val)
    }
    else {
      internalOpen.value = val
    }
  },
})

const selectedVoice = computed(() => props.voices.find(v => v.voiceId === props.modelValue))

function handleSelect(voiceId: string) {
  emit('update:modelValue', voiceId)
}
</script>

<template>
  <AudioPlayer>
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="isOpen"
          :class="cn('w-full justify-between', props.class)"
        >
          <div v-if="selectedVoice" class="flex items-center gap-2 overflow-hidden">
            <div class="relative size-6 shrink-0 overflow-visible">
              <Orb agent-state="thinking" class="absolute inset-0" />
            </div>
            <span class="truncate">{{ selectedVoice.name }}</span>
          </div>
          <span v-else>{{ placeholder }}</span>
          <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-(--reka-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search voices..." />
          <CommandList>
            <CommandEmpty>No voice found.</CommandEmpty>
            <CommandGroup>
              <VoicePickerItem
                v-for="voice in voices"
                :key="voice.voiceId"
                :voice="voice"
                :is-selected="modelValue === voice.voiceId"
                @select="handleSelect(voice.voiceId!)"
              />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </AudioPlayer>
</template>
