import { describe, it, expect } from 'vitest'
import { evaluate, format, parse } from '../app/utils/mathEvaluator'
import { generateQuestion } from '../app/utils/mathGenerator'
import { makeFruits } from '../app/utils/fruitGenerator'
import { createState, queueDirection, speedMs, step } from '../app/utils/gameEngine'
import type { GameState } from '../app/types/game'

const val = (s: string) => evaluate(parse(s))
function lcg(seed: number) { return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296 }
const playing = (p: Partial<GameState>): GameState => ({ ...createState(15, lcg(1)), status: 'playing', fruits: [], ...p })

describe('evaluator', () => {
  it('respects precedence and parentheses', () => {
    expect(val('4 + 3 × 2')).toBe(10)
    expect(val('8 − (7 + 5)')).toBe(-4)
    expect(val('(12 − 4) ÷ 2')).toBe(4)
    expect(val('18 ÷ 3 + 2 × 4')).toBe(14)
  })
  it('rejects zero and non-integer division', () => {
    expect(val('5 ÷ 0')).toBeNull()
    expect(val('7 ÷ 2')).toBeNull()
  })
  it('format keeps needed parens only', () => {
    expect(format(parse('8 − (7 + 5)'))).toBe('8 − (7 + 5)')
    expect(format(parse('4 + 3 × 2'))).toBe('4 + 3 × 2')
  })
})

describe('question generator', () => {
  it('displayed text evaluates to the stored answer', () => {
    const rng = lcg(42); let prev: string | undefined; let neg = 0, paren = 0
    for (let i = 0; i < 500; i++) {
      const q = generateQuestion(rng, prev)
      expect(val(q.text)).toBe(q.answer)
      expect(Number.isInteger(q.answer)).toBe(true)
      expect(q.text).not.toBe(prev)
      if (q.answer < 0) neg++
      if (q.text.includes('(')) paren++
      prev = q.text
    }
    expect(neg).toBeGreaterThan(0); expect(paren).toBeGreaterThan(0)
  })
})

describe('fruit generator', () => {
  it('3-5 fruits, exactly one correct, unique values, free in-bounds cells', () => {
    const rng = lcg(7); const snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }]
    for (let i = 0; i < 300; i++) {
      const answer = Math.floor(rng() * 60) - 20
      const f = makeFruits(answer, 15, snake, rng)
      expect(f.length).toBeGreaterThanOrEqual(3); expect(f.length).toBeLessThanOrEqual(5)
      expect(f.filter(x => x.correct)).toHaveLength(1)
      expect(f.find(x => x.correct)!.value).toBe(answer)
      expect(new Set(f.map(x => x.value)).size).toBe(f.length)
      expect(new Set(f.map(x => `${x.pos.x},${x.pos.y}`)).size).toBe(f.length)
      for (const x of f) {
        expect(x.pos.x >= 0 && x.pos.y >= 0 && x.pos.x < 15 && x.pos.y < 15).toBe(true)
        expect(snake.some(s => s.x === x.pos.x && s.y === x.pos.y)).toBe(false)
      }
    }
  })
})

describe('engine', () => {
  it('blocks 180° reversal and double-turn', () => {
    const s = playing({})
    expect(queueDirection(s, 'left')).toBe(false)
    expect(queueDirection(s, 'up')).toBe(true)
    expect(queueDirection(s, 'down')).toBe(false)
  })
  it('increases speed gradually with snake length within comfortable limits', () => {
    expect(speedMs(3)).toBe(190)
    expect(speedMs(8)).toBe(165)
    expect(speedMs(20)).toBe(135)
  })
  it('wall collision ends the game', () => {
    const s = playing({ snake: [{ x: 14, y: 3 }, { x: 13, y: 3 }, { x: 12, y: 3 }] })
    expect(step(s)).toBe('dead'); expect(s.cause).toEqual({ kind: 'wall' })
  })
  it('self collision ends the game', () => {
    const s = playing({ dir: 'up', snake: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 4 }] })
    expect(step(s)).toBe('dead'); expect(s.cause).toEqual({ kind: 'self' })
  })
  it('correct fruit grows and scores; wrong fruit removes one segment', () => {
    const base = { get snake() { return [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }] } }
    const ok = playing({ snake: base.snake, fruits: [{ pos: { x: 6, y: 5 }, value: 12, correct: true }] })
    expect(step(ok)).toBe('correct'); expect(ok.snake).toHaveLength(4); expect(ok.score).toBe(1)
    const bad = playing({ snake: base.snake, fruits: [{ pos: { x: 6, y: 5 }, value: 4, correct: false }] })
    expect(step(bad)).toBe('wrong')
    expect(bad.snake).toHaveLength(2)
    expect(bad.status).toBe('playing')
    expect(bad.cause).toBeNull()
  })
  it('ends the game when a wrong answer leaves only one segment', () => {
    const bad = playing({
      snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
      fruits: [{ pos: { x: 6, y: 5 }, value: 4, correct: false }]
    })
    expect(step(bad)).toBe('dead')
    expect(bad.snake).toHaveLength(1)
    expect(bad.status).toBe('game-over')
    expect(bad.cause).toEqual({ kind: 'too-short' })
  })
})
