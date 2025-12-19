<script setup lang="ts">
import type { ButtonVariants } from '@repo/shadcn-vue/components/ui/button'
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/shadcn-vue/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/shadcn-vue/components/ui/drawer'
import { IconCopy } from '@tabler/icons-vue'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: HTMLAttributes['class']
  size?: ButtonVariants['size']
}>()

const { config } = useConfig()
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button :class="cn('sm:hidden', props.class)" v-bind="$attrs">
        Copy Code
      </Button>
    </DrawerTrigger>
    <DrawerContent class="h-auto">
      <DrawerHeader>
        <DrawerTitle class="capitalize">
          {{ config.activeTheme === "neutral" ? "Default" : config.activeTheme }}
        </DrawerTitle>
        <DrawerDescription>
          Copy and paste the following code into your CSS file.
        </DrawerDescription>
      </DrawerHeader>
      <CustomizerCode :theme-name="config.activeTheme" />
    </DrawerContent>
  </Drawer>
  <Dialog>
    <DialogTrigger as-child>
      <Button :data-size="props.size" :class="cn('group/button hidden sm:flex', props.class)" :size="props.size" v-bind="$attrs">
        <IconCopy />
        <span class="group-data-[size=icon-sm]/button:sr-only">
          Copy Code
        </span>
      </Button>
    </DialogTrigger>
    <DialogContent class="rounded-xl border-none bg-clip-padding shadow-2xl ring-4 ring-neutral-200/80 outline-none md:max-w-2xl dark:bg-neutral-800 dark:ring-neutral-900">
      <DialogHeader>
        <DialogTitle class="capitalize">
          {{ config.activeTheme === "neutral" ? "Default" : config.activeTheme }}
        </DialogTitle>
        <DialogDescription>
          Copy and paste the following code into your CSS file.
        </DialogDescription>
      </DialogHeader>
      <CustomizerCode :theme-name="config.activeTheme" />
    </DialogContent>
  </Dialog>
</template>
