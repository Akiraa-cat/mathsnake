import type { Expr, Op, Question, Rng } from '../types/math'
import { evaluate, format, isValidAnswer } from './mathEvaluator'

const OPS: Op[] = ['+', '−', '×', '÷']

export function generateQuestion(rng: Rng = Math.random, prevText?: string): Question {
  const int = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))
  const num = (lo = 2, hi = 12): Expr => ({ t: 'n', v: int(lo, hi) })
  const bin = (op: Op, l: Expr, r: Expr): Expr => ({ t: 'b', op, l, r })
  const op = () => OPS[int(0, 3)]!
  const pair = (o: Op): Expr => {
    if (o === '÷') { const b = int(2, 9); return bin(o, { t: 'n', v: b * int(2, 9) }, { t: 'n', v: b }) }
    if (o === '×') return bin(o, num(2, 9), num(2, 9))
    return bin(o, num(2, 20), num(2, 20))
  }
  const shape = (): Expr => {
    switch (int(0, 4)) {
      case 0: return pair(op())
      case 1: return bin(op(), num(), pair(op()))
      case 2: return bin(op(), pair(op()), num())
      case 3: return bin(op(), pair(op()), pair(op()))
      default: return bin(OPS[int(0, 1)]!, pair('÷'), pair('×')) // e.g. 18 ÷ 3 + 2 × 4
    }
  }
  for (let i = 0; i < 400; i++) {
    const expr = shape()
    const answer = evaluate(expr)
    const text = format(expr)
    if (isValidAnswer(answer) && text !== prevText) return { expr, text, answer }
  }
  const expr: Expr = bin('+', { t: 'n', v: 7 }, { t: 'n', v: 5 })
  return { expr, text: format(expr), answer: 12 }
}
