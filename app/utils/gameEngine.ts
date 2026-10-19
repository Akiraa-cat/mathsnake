import type { Direction, GameDifficulty, GameState, Point, StepEvent } from '../types/game'
import type { Rng } from '../types/math'
import { generateQuestion } from './mathGenerator'
import { makeFruits } from './fruitGenerator'

export const GRID = 15
const VEC: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }

const SPEEDS: Record<GameDifficulty, { initial: number; decrement: number; minimum: number }> = {
  beginner: { initial: 260, decrement: 4, minimum: 190 },
  normal: { initial: 190, decrement: 5, minimum: 135 },
  nightmare: { initial: 135, decrement: 3, minimum: 90 }
}

export const speedMs = (snakeLength: number, difficulty: GameDifficulty = 'normal') => {
  const speed = SPEEDS[difficulty]
  return Math.max(speed.minimum, speed.initial - Math.max(0, snakeLength - 3) * speed.decrement)
}

export function createState(size = GRID, rng: Rng = Math.random): GameState {
  const m = Math.floor(size / 2)
  const snake = [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }]
  const question = generateQuestion(rng)
  return { size, snake, dir: 'right', queue: [], question, fruits: makeFruits(question.answer, size, snake, rng), score: 0, status: 'ready', cause: null }
}

/** Queues a turn; ignores repeats and 180° reversals (relative to the last queued direction). */
export function queueDirection(s: GameState, d: Direction): boolean {
  const last = s.queue[s.queue.length - 1] ?? s.dir
  if (d === last || d === OPPOSITE[last] || s.queue.length >= 2) return false
  s.queue.push(d)
  return true
}

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y

export function step(s: GameState, rng: Rng = Math.random): StepEvent {
  if (s.status !== 'playing') return 'idle'
  s.dir = s.queue.shift() ?? s.dir
  const h = s.snake[0]!
  const next = { x: h.x + VEC[s.dir].x, y: h.y + VEC[s.dir].y }
  const die = (cause: GameState['cause']): StepEvent => { s.status = 'game-over'; s.cause = cause; return 'dead' }

  if (next.x < 0 || next.y < 0 || next.x >= s.size || next.y >= s.size) return die({ kind: 'wall' })
  if (s.snake.slice(0, -1).some(p => same(p, next))) return die({ kind: 'self' }) // tail cell is vacated this tick

  const fruit = s.fruits.find(f => same(f.pos, next))
  s.snake.unshift(next)
  if (fruit && !fruit.correct) {
    s.snake.pop()
    s.snake.pop()
    s.fruits = s.fruits.filter(f => f !== fruit)
    if (s.snake.length < 2) return die({ kind: 'too-short' })
    return 'wrong'
  }
  if (!fruit) { s.snake.pop(); return 'moved' }
  s.score += 1
  s.question = generateQuestion(rng, s.question.text)
  s.fruits = makeFruits(s.question.answer, s.size, s.snake, rng)
  return 'correct'
}
