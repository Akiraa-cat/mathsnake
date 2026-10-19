import type { Question } from './math'
export interface Point { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'
export type GameStatus = 'ready' | 'playing' | 'paused' | 'game-over'
export interface Fruit { pos: Point; value: number; correct: boolean }
export type Cause =
  | { kind: 'wall' }
  | { kind: 'self' }
  | { kind: 'too-short' }
export interface GameState {
  size: number
  snake: Point[] // head first
  dir: Direction
  queue: Direction[]
  fruits: Fruit[]
  question: Question
  score: number
  status: GameStatus
  cause: Cause | null
}
export type StepEvent = 'idle' | 'moved' | 'correct' | 'wrong' | 'dead'
