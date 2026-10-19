import type { Direction } from '../types/game'
import { GRID, createState, queueDirection, speedMs, step } from '../utils/gameEngine'

const KEYS: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }

export function useSnakeGame() {
  const state = reactive(createState(GRID))
  const best = ref(0)
  const feedback = ref<'ok' | 'bad' | null>(null)
  let raf = 0, last = 0, acc = 0
  let fbTimer: ReturnType<typeof setTimeout> | undefined

  const flash = (f: 'ok' | 'bad') => { feedback.value = f; clearTimeout(fbTimer); fbTimer = setTimeout(() => (feedback.value = null), 400) }
  const halt = () => { if (raf) cancelAnimationFrame(raf); raf = 0 }
  const run = () => { if (raf) return; last = performance.now(); acc = 0; raf = requestAnimationFrame(frame) }

  function frame(t: number) {
    raf = requestAnimationFrame(frame)
    acc += Math.min(t - last, 100)
    last = t
    while (state.status === 'playing' && acc >= speedMs(state.snake.length)) {
      acc -= speedMs(state.snake.length)
      const ev = step(state)
      if (ev === 'correct') {
        flash('ok')
        if (state.score > best.value) { best.value = state.score; try { localStorage.setItem('mathsnake:best', String(best.value)) } catch { /* ignore */ } }
      } else if (ev === 'wrong') {
        flash('bad')
      } else if (ev === 'dead') { flash('bad'); halt(); return }
    }
  }

  function start() {
    if (state.status === 'game-over') restart()
    else if (state.status === 'ready') { state.status = 'playing'; run() }
  }
  function restart() { halt(); Object.assign(state, createState(GRID), { status: 'playing' }); feedback.value = null; run() }
  function togglePause() {
    if (state.status === 'playing') { state.status = 'paused'; halt() }
    else if (state.status === 'paused') { state.status = 'playing'; run() }
  }
  function turn(d: Direction) {
    if (state.status === 'paused' || state.status === 'game-over') return
    queueDirection(state, d)
    if (state.status === 'ready') start()
  }

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
    const d = KEYS[e.key]
    if (d) { e.preventDefault(); turn(d); return }
    if (t?.tagName === 'BUTTON') return // let focused buttons handle Space/Enter themselves
    if (e.key === ' ') { e.preventDefault(); state.status === 'ready' ? start() : togglePause() }
    else if (e.key === 'Enter') { e.preventDefault(); start() }
  }
  const onVisibility = () => { if (document.hidden && state.status === 'playing') togglePause() }

  onMounted(() => {
    try { best.value = Number(localStorage.getItem('mathsnake:best')) || 0 } catch { /* ignore */ }
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
  })
  onBeforeUnmount(() => {
    halt(); clearTimeout(fbTimer)
    window.removeEventListener('keydown', onKey)
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return { state, best, feedback, start, restart, togglePause, turn }
}
