import { TAU } from './math'
import type { Node } from './types'

export const satScreen = (
  n: Node,
  i: number,
  sx: number,
  sy: number,
  nr: number,
  now: number,
): [number, number] => {
  const cnt = Math.max(1, n.repo.contributors.length)
  const outward = Math.atan2(n.by + n.oy, n.bx + n.ox)
  const spread = Math.min(Math.PI * 1.15, 0.5 + cnt * 0.42)
  const base = cnt === 1 ? 0 : -spread / 2 + (i / (cnt - 1)) * spread
  const sway = Math.sin((now / 1000) * (TAU / n.satPer) + n.satPhase) * 0.16
  const ang = outward + base + sway
  const rr = nr + 10
  return [sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr]
}
