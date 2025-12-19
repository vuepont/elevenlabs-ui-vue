<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/shadcn-vue/components/ui/alert-dialog'
import { Button } from '@repo/shadcn-vue/components/ui/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/shadcn-vue/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/shadcn-vue/components/ui/dropdown-menu'
import { Label } from '@repo/shadcn-vue/components/ui/label'
import { Switch } from '@repo/shadcn-vue/components/ui/switch'
import { MoreHorizontal } from 'lucide-vue-next'
import { ref } from 'vue'

// import { toast } from "@repo/shadcn-vue/components/ui/use-toast"

const open = ref(false)
const showDeleteDialog = ref(false)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary">
        <span class="sr-only">Actions</span>
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @select="open = true">
        Content filter preferences
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="text-red-600"
        @select="showDeleteDialog = true"
      >
        Delete preset
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Content filter preferences</DialogTitle>
        <DialogDescription>
          The content filter flags text that may violate our content policy.
          It's powered by our moderation endpoint which is free to use
          to moderate your OpenAI API traffic. Learn more.
        </DialogDescription>
      </DialogHeader>
      <div class="py-6">
        <h4 class="text-sm text-muted-foreground">
          Playground Warnings
        </h4>
        <div class="flex items-start justify-between space-x-4 pt-3">
          <Switch id="show" name="show" :default-value="true" />
          <Label class="grid gap-1 font-normal" for="show">
            <span class="font-semibold">
              Show a warning when content is flagged
            </span>
            <span class="text-sm text-muted-foreground">
              A warning will be shown when sexual, hateful, violent or
              self-harm content is detected.
            </span>
          </Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" @click="open = false">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <AlertDialog v-model:open="showDeleteDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This preset will no longer be
          accessible by you or others you've shared it with.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button
          variant="destructive"
          @click="showDeleteDialog = false"
        >
          Delete
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
