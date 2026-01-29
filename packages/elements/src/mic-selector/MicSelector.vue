<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/shadcn-vue/components/ui/dropdown-menu'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { Check, ChevronsUpDown, Mic, MicOff } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { LiveWaveform } from '../live-waveform'
import { useAudioDevices } from './useAudioDevices'

interface Props {
  modelValue?: string
  muted?: boolean
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  muted: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [deviceId: string]
  'update:muted': [muted: boolean]
}>()

const { devices, loading, error, hasPermission, requestPermissionAndLoad } = useAudioDevices()

const internalDevice = ref('')
const internalMuted = ref(false)
const isDropdownOpen = ref(false)

// Controlled vs Uncontrolled logic
const selectedDevice = computed({
  get: () => props.modelValue ?? internalDevice.value,
  set: (val) => {
    internalDevice.value = val
    emit('update:modelValue', val)
  },
})

const isMuted = computed({
  get: () => props.muted ?? internalMuted.value,
  set: (val) => {
    internalMuted.value = val
    emit('update:muted', val)
  },
})

// Select first device by default
watch(devices, (newDevices) => {
  if (!selectedDevice.value && newDevices.length > 0) {
    selectedDevice.value = newDevices[0].deviceId
  }
}, { immediate: true })

const currentDevice = computed(() => {
  return devices.value.find(d => d.deviceId === selectedDevice.value)
    || devices.value[0] || {
    label: loading.value ? 'Loading...' : 'No microphone',
    deviceId: '',
  }
})

async function handleDropdownOpenChange(open: boolean) {
  isDropdownOpen.value = open
  if (open && !hasPermission.value && !loading.value) {
    await requestPermissionAndLoad()
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value
}

const isPreviewActive = computed(() => isDropdownOpen.value && !isMuted.value)
</script>

<template>
  <DropdownMenu @update:open="handleDropdownOpenChange">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        :class="cn(
          'hover:bg-accent flex w-40 min-w-0 shrink cursor-pointer items-center gap-1.5 sm:w-48',
          props.class,
        )"
        :disabled="loading || disabled"
      >
        <MicOff v-if="isMuted" class="h-4 w-4 shrink-0" />
        <Mic v-else class="h-4 w-4 shrink-0" />

        <span class="min-w-0 flex-1 truncate text-left text-xs sm:text-sm">
          {{ currentDevice.label }}
        </span>
        <ChevronsUpDown class="h-3 w-3 shrink-0" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="center" side="top" class="w-72">
      <template v-if="loading">
        <DropdownMenuItem disabled>
          Loading devices...
        </DropdownMenuItem>
      </template>

      <template v-else-if="error">
        <DropdownMenuItem disabled>
          Error: {{ error }}
        </DropdownMenuItem>
      </template>

      <template v-else>
        <DropdownMenuItem
          v-for="device in devices"
          :key="device.deviceId"
          class="flex items-center justify-between"
          @click.prevent="selectedDevice = device.deviceId"
        >
          <span class="truncate">{{ device.label }}</span>
          <Check v-if="selectedDevice === device.deviceId" class="h-4 w-4 shrink-0" />
        </DropdownMenuItem>
      </template>

      <template v-if="devices.length > 0">
        <DropdownMenuSeparator />
        <div class="flex items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="sm"
            class="h-8 gap-2"
            @click.prevent="toggleMute"
          >
            <MicOff v-if="isMuted" class="h-4 w-4" />
            <Mic v-else class="h-4 w-4" />
            <span class="text-sm">{{ isMuted ? "Unmute" : "Mute" }}</span>
          </Button>

          <div class="bg-accent ml-auto w-16 overflow-hidden rounded-md p-1.5">
            <LiveWaveform
              :active="isPreviewActive"
              :device-id="selectedDevice"
              mode="static"
              :height="15"
              :bar-width="2"
              :bar-gap="1"
            />
          </div>
        </div>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
