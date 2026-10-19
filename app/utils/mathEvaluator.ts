import type { Expr, Op } from '../types/math'

const PREC: Record<Op, number> = { '+': 1, '−': 1, '×': 2, '÷': 2 }

/** Returns null when invalid: division by zero or non-integer division. */
export function evaluate(e: Expr): number | null {
  if (e.t === 'n') return e.v
  const l = evaluate(e.l)
  const r = evaluate(e.r)
  if (l === null || r === null) return null
  switch (e.op) {
    case '+': return l + r
    case '−': return l - r
    case '×': return l * r
    case '÷': return r === 0 || l % r !== 0 ? null : l / r
  }
}

/** Formats with only the parentheses needed to preserve the tree's meaning. */
export function format(e: Expr, parent?: Op, isRight = false): string {
  if (e.t === 'n') return String(e.v)
  const s = `${format(e.l, e.op, false)} ${e.op} ${format(e.r, e.op, true)}`
  if (!parent) return s
  const need = PREC[parent] > PREC[e.op] ||
    (PREC[parent] === PREC[e.op] && isRight && (parent === '−' || parent === '÷'))
  return need ? `(${s})` : s
}

/** Small recursive-descent parser (no eval): used to verify displayed text. */
export function parse(text: string): Expr {
  const tokens = text.match(/\d+|[+−×÷()]/g) ?? []
  let i = 0
  const expr = (): Expr => {
    let l = term()
    while (tokens[i] === '+' || tokens[i] === '−') { const op = tokens[i++] as Op; l = { t: 'b', op, l, r: term() } }
    return l
  }
  const term = (): Expr => {
    let l = factor()
    while (tokens[i] === '×' || tokens[i] === '÷') { const op = tokens[i++] as Op; l = { t: 'b', op, l, r: factor() } }
    return l
  }
  const factor = (): Expr => {
    const tk = tokens[i++]
    if (tk === '(') { const e = expr(); i++; return e }
    return { t: 'n', v: Number(tk) }
  }
  return expr()
}

export function isValidAnswer(n: number | null): n is number {
  return n !== null && Number.isInteger(n) && Math.abs(n) <= 99
}
