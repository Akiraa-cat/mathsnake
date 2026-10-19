export type Op = '+' | '−' | '×' | '÷'
export type Expr = { t: 'n'; v: number } | { t: 'b'; op: Op; l: Expr; r: Expr }
export interface Question { expr: Expr; text: string; answer: number }
export type Rng = () => number
