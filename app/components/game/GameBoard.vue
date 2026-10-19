<script setup lang="ts">
import type { Direction, GameState } from '~/types/game'
const props = defineProps<{ state: GameState; best: number; snakeColor: string; theme: string }>()
const emit = defineEmits<{ start: []; restart: []; turn: [Direction] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)
const px = ref(0)
let ro: ResizeObserver | null = null
let stopDraw: (() => void) | null = null
let t0: { x: number; y: number } | null = null

const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()

function draw() {
  const c = canvas.value
  const s = props.state
  void props.theme
  if (!c || !px.value) return
  const dpr = window.devicePixelRatio || 1
  c.width = c.height = Math.round(px.value * dpr)
  const g = c.getContext('2d')!
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  const cell = px.value / s.size
  g.fillStyle = css('--arena'); g.fillRect(0, 0, px.value, px.value)
  g.strokeStyle = css('--grid'); g.lineWidth = 1; g.beginPath()
  for (let i = 1; i < s.size; i++) { g.moveTo(i * cell, 0); g.lineTo(i * cell, px.value); g.moveTo(0, i * cell); g.lineTo(px.value, i * cell) }
  g.stroke()

  const palette = [css('--accent'), css('--f2'), css('--f3'), css('--f4')]
  g.textAlign = 'center'; g.textBaseline = 'middle'
  s.fruits.forEach((f, i) => {
    const cx = (f.pos.x + 0.5) * cell, cy = (f.pos.y + 0.55) * cell
    g.fillStyle = palette[i % palette.length]!
    g.beginPath(); g.arc(cx, cy, cell * 0.44, 0, Math.PI * 2); g.fill()
    g.fillStyle = css('--text'); g.beginPath(); g.ellipse(cx + cell * 0.08, cy - cell * 0.46, cell * 0.12, cell * 0.06, -0.5, 0, Math.PI * 2); g.fill()
    const label = String(f.value)
    g.font = `700 ${cell * (label.length > 2 ? 0.36 : 0.46)}px 'Space Mono', monospace`
    g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeText(label, cx, cy + 1)
    g.fillStyle = css('--on-fruit')
    g.fillText(label, cx, cy + 1)
  })

  g.fillStyle = props.snakeColor
  s.snake.forEach((p, i) => {
    g.beginPath(); g.roundRect(p.x * cell + 1.5, p.y * cell + 1.5, cell - 3, cell - 3, cell * 0.3); g.fill()
    if (i === 0) {
      const dx = s.dir === 'left' ? -1 : s.dir === 'right' ? 1 : 0, dy = s.dir === 'up' ? -1 : s.dir === 'down' ? 1 : 0
      g.fillStyle = css('--eye')
      for (const k of [-1, 1]) {
        g.beginPath()
        g.arc((p.x + 0.5) * cell + dx * cell * 0.15 + (dy ? k * cell * 0.18 : 0), (p.y + 0.5) * cell + dy * cell * 0.15 + (dx ? k * cell * 0.18 : 0), cell * 0.08, 0, Math.PI * 2)
        g.fill()
      }
      g.fillStyle = props.snakeColor
    }
  })
}

function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!t0 || !t) return
  const dx = t.clientX - t0.x, dy = t.clientY - t0.y
  t0 = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
  emit('turn', Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
}

onMounted(() => {
  ro = new ResizeObserver(([e]) => { px.value = Math.floor(e!.contentRect.width) })
  ro.observe(wrap.value!)
  stopDraw = watchEffect(draw, { flush: 'post' })
})
onBeforeUnmount(() => { ro?.disconnect(); stopDraw?.() })

const message = computed(() => {
  const c = props.state.cause
  if (!c) return ''
  if (c.kind === 'wall') return 'You hit the wall.'
  if (c.kind === 'too-short') return 'You lost your last segment after a wrong answer.'
  return 'You bit your own tail.'
})
</script>

<template>
  <div ref="wrap" class="arena relative mx-auto w-full"
    style="aspect-ratio:1; max-width:min(100%, 520px, 52dvh)">
    <canvas ref="canvas" role="img" aria-label="Game board" class="block rounded-[10px]"
      :style="{ width: px + 'px', height: px + 'px', touchAction: 'none' }"
      @touchstart.passive="t0 = { x: $event.touches[0]!.clientX, y: $event.touches[0]!.clientY }" @touchend="onTouchEnd" />
    <div v-if="state.status === 'ready'" class="overlay">
      <button class="btn btn-primary" @click="emit('start')">Start</button>
    </div>
    <div v-else-if="state.status === 'paused'" class="overlay"><p class="mono font-bold">PAUSED</p></div>
    <div v-else-if="state.status === 'game-over'" class="overlay" role="alertdialog" aria-label="Game over">
      <p class="mono text-xl font-bold">GAME OVER</p>
      <p>{{ message }}</p>
      <p class="mono">Score: {{ state.score }} · Best: {{ best }}</p>
      <button class="btn btn-primary" autofocus @click="emit('restart')">Play Again</button>
    </div>
  </div>
</template>
