import type { Fruit, Point } from '../types/game'
import type { Rng } from '../types/math'

function shuffle<T>(a: T[], rng: Rng): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j]!, r[i]!] }
  return r
}

/** Unique wrong values, mixing near misses, sign flips and random values. */
export function makeDistractors(answer: number, n: number, rng: Rng): number[] {
  const near = shuffle([-1, 1, -2, 2, 3, -3, 10, -10, 5, -5], rng).slice(0, 3).map(o => answer + o)
  const extra: number[] = []
  if (answer !== 0) extra.push(-answer)
  for (let i = 0; i < 4; i++) extra.push(Math.floor(rng() * 41) - 10)
  const pool = shuffle([...near, ...extra], rng)
  const out: number[] = []
  for (const v of [...pool, ...Array.from({ length: 60 }, (_, k) => k - 30)]) {
    if (v !== answer && Math.abs(v) <= 99 && !out.includes(v)) out.push(v)
    if (out.length === n) break
  }
  return out
}

export function makeFruits(answer: number, size: number, snake: Point[], rng: Rng = Math.random): Fruit[] {
  const count = 3 + Math.floor(rng() * 3) // 3..5
  const head = snake[0]!
  const cells: Point[] = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (snake.some(s => s.x === x && s.y === y)) continue
    if (Math.abs(x - head.x) + Math.abs(y - head.y) < 3) continue // not right in front of the head
    cells.push({ x, y })
  }
  const spots = shuffle(cells, rng).slice(0, count)
  const values = shuffle([answer, ...makeDistractors(answer, spots.length - 1, rng)], rng)
  return spots.map((pos, i) => ({ pos, value: values[i]!, correct: values[i] === answer }))
}
