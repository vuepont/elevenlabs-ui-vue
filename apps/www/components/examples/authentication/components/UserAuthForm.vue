<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@repo/shadcn-vue/components/ui/field'
import { Input } from '@repo/shadcn-vue/components/ui/input'
import { Spinner } from '@repo/shadcn-vue/components/ui/spinner'
import { Icons } from '@/components/Icons'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const isLoading = ref(false)

async function onSubmit(event: Event) {
  event.preventDefault()
  isLoading.value = (true)

  setTimeout(() => {
    isLoading.value = (false)
  }, 3000)
}
</script>

<template>
  <div :class="cn('grid gap-6', props.class)">
    <form @submit="onSubmit">
      <FieldGroup>
        <Field>
          <FieldLabel class="sr-only" for="email">
            Email
          </FieldLabel>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            autocapitalize="none"
            autocomplete="email"
            autocorrect="off"
            :disabled="isLoading"
          />
        </Field>
        <Field>
          <Button :disabled="isLoading">
            <Spinner v-if="isLoading" />
            Sign In with Email
          </Button>
        </Field>
      </FieldGroup>
    </form>
    <FieldSeparator>Or continue with</FieldSeparator>
    <Button variant="outline" type="button" disabled="{isLoading}">
      <Spinner v-if="isLoading" />
      <Icons.gitHub v-else class="mr-2 h-4 w-4" />

      GitHub
    </Button>
  </div>
</template>
