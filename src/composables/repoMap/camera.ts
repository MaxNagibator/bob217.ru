import { easeOutQuint } from './math'

export interface Camera {
  x: number
  y: number
  s: number
  tx: number
  ty: number
  ts: number
}

export interface Viewport {
  cam: Camera
  W: number
  H: number
  R: number
  kx: number
  w2s: (wx: number, wy: number) => [number, number]
  s2w: (sx: number, sy: number) => [number, number]
}

export const DOLLY_FROM = 1.5
export const DOLLY_MS = 2600
export const ZOOM_MIN = 0.6
export const ZOOM_MAX = 2.5

export const createViewport = (): Viewport => {
  const cam: Camera = { x: 0, y: 0, s: 1, tx: 0, ty: 0, ts: 1 }
  const vp: Viewport = {
    cam,
    W: 0,
    H: 0,
    R: 340,
    kx: 1,
    w2s: (wx, wy) => [(wx - cam.x) * cam.s + vp.W / 2, (wy - cam.y) * cam.s + vp.H / 2],
    s2w: (sx, sy) => [(sx - vp.W / 2) / cam.s + cam.x, (sy - vp.H / 2) / cam.s + cam.y],
  }
  return vp
}

export const followTargets = (cam: Camera, dt: number): void => {
  const k = Math.min(1, dt * 6)
  cam.x += (cam.tx - cam.x) * k
  cam.y += (cam.ty - cam.y) * k
  cam.s += (cam.ts - cam.s) * k
}

export const dollyScale = (age: number): number =>
  DOLLY_FROM + (1 - DOLLY_FROM) * easeOutQuint(Math.min(1, age / DOLLY_MS))
