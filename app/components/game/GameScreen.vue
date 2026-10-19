<script setup lang="ts">
import { Sun, Moon, Pause, Play, RotateCcw } from 'lucide-vue-next'
import { SKINS } from '~/composables/useSnakeSkin'

const { theme, toggle: toggleTheme } = useTheme()
const skin = useSnakeSkin()
const { state, best, feedback, start, restart, togglePause, turn } = useSnakeGame()
const snakeColor = computed(() => skin.color(theme.value))
const onPlayPause = () => (state.status === 'ready' ? start() : togglePause())
</script>

<template>
  <div class="safe-bottom mx-auto flex min-h-dvh w-full max-w-[560px] flex-col gap-3 px-4 pt-3">
    <header class="flex items-center justify-between">
      <h1 class="mono text-lg font-bold">math snake</h1>
      <button class="btn" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
        <Sun v-if="theme === 'dark'" :size="20" /><Moon v-else :size="20" />
      </button>
    </header>

    <p class="question mono" :class="feedback ? `fb-${feedback}` : ''" aria-live="polite">{{ state.question.text }}</p>

    <GameBoard :state="state" :best="best" :snake-color="snakeColor" :theme="theme" @start="start" @restart="restart" @turn="turn" />

    <div class="mx-auto flex w-full max-w-[520px] items-center justify-between gap-2">
      <div class="mono leading-tight">
        <div>Score <strong>{{ state.score }}</strong></div>
        <div class="muted text-sm">Best {{ best }}</div>
      </div>
      <div class="flex gap-2">
        <button class="btn" :aria-label="state.status === 'playing' ? 'Pause' : 'Resume'" :disabled="state.status === 'game-over'" @click="onPlayPause">
          <Pause v-if="state.status === 'playing'" :size="20" /><Play v-else :size="20" />
        </button>
        <button class="btn" aria-label="Restart" @click="restart"><RotateCcw :size="20" /></button>
      </div>
    </div>

    <DirectionPad @turn="turn" />

    <div class="mx-auto flex items-center gap-3" role="radiogroup" aria-label="Snake Color">
      <span class="muted text-sm">Snake Color</span>
      <button v-for="s in SKINS" :key="s.id" class="swatch" role="radio" :aria-checked="skin.skinId.value === s.id"
        :aria-label="s.name" :title="s.name" :style="{ background: theme === 'dark' ? s.dark : s.light }" @click="skin.select(s.id)" />
    </div>

    <div class="snake-preview" role="img" aria-label="Snake color preview" :style="{ '--snake-color': snakeColor }">
      <span v-for="segment in 5" :key="segment" class="snake-preview__segment" :class="{ 'snake-preview__head': segment === 1 }" />
    </div>
  </div>
</template>
