<script setup lang="ts">
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import type { Direction } from '~/types/game'
defineEmits<{ turn: [Direction] }>()
</script>
<template>
  <div class="pad" role="group" aria-label="Direction pad">
    <button class="btn" style="grid-column:2;grid-row:1" aria-label="Up" @pointerdown.prevent="$emit('turn', 'up')"><ArrowUp :size="22" /></button>
    <button class="btn" style="grid-column:1;grid-row:2" aria-label="Left" @pointerdown.prevent="$emit('turn', 'left')"><ArrowLeft :size="22" /></button>
    <button class="btn" style="grid-column:2;grid-row:2" aria-label="Down" @pointerdown.prevent="$emit('turn', 'down')"><ArrowDown :size="22" /></button>
    <button class="btn" style="grid-column:3;grid-row:2" aria-label="Right" @pointerdown.prevent="$emit('turn', 'right')"><ArrowRight :size="22" /></button>
  </div>
</template>
