import { TAU, withAlpha } from './math'

const GLOW_SIZE = 128
const SPIKE_SIZE = 256

const glowCache = new Map<string, HTMLCanvasElement>()
const spikeCache = new Map<string, HTMLCanvasElement>()

const surface = (size: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const el = document.createElement('canvas')
  el.width = size
  el.height = size
  return [el, el.getContext('2d') as CanvasRenderingContext2D]
}

export const glowSprite = (color: string): HTMLCanvasElement => {
  const hit = glowCache.get(color)
  if (hit) return hit
  const [el, ctx] = surface(GLOW_SIZE)
  const c = GLOW_SIZE / 2
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c)
  grad.addColorStop(0, withAlpha(color, 0.95))
  grad.addColorStop(0.18, withAlpha(color, 0.5))
  grad.addColorStop(0.45, withAlpha(color, 0.14))
  grad.addColorStop(1, withAlpha(color, 0))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE)
  glowCache.set(color, el)
  return el
}

export const spikeSprite = (color: string): HTMLCanvasElement => {
  const hit = spikeCache.get(color)
  if (hit) return hit
  const [el, ctx] = surface(SPIKE_SIZE)
  const c = SPIKE_SIZE / 2
  const ray = (angle: number, len: number, width: number, alpha: number): void => {
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    const grad = ctx.createLinearGradient(c, c, c + dx * len, c + dy * len)
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`)
    grad.addColorStop(0.12, withAlpha(color, alpha * 0.85))
    grad.addColorStop(1, withAlpha(color, 0))
    ctx.strokeStyle = grad
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(c, c)
    ctx.lineTo(c + dx * len, c + dy * len)
    ctx.stroke()
  }
  for (let i = 0; i < 4; i++) ray((i * TAU) / 4, c * 0.96, 2.6, 0.85)
  for (let i = 0; i < 4; i++) ray(Math.PI / 4 + (i * TAU) / 4, c * 0.4, 1.6, 0.4)
  spikeCache.set(color, el)
  return el
}

export const blit = (
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  alpha: number,
): void => {
  if (alpha <= 0.01 || radius <= 0) return
  ctx.globalAlpha = alpha
  ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2)
  ctx.globalAlpha = 1
}
