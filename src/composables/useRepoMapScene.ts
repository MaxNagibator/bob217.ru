import { ref, watch, type Ref } from 'vue'
import { DOMAINS, langColor, OWNER, type Repo, type SizeBy } from '@/composables/useForkMap'

export interface TipState {
  repo: Repo
  x: number
  y: number
  pinned: boolean
}

export interface SatTipState {
  login: string
  repo: string
  merged: number
  share: number
  people: number
  last: string
  x: number
  y: number
}

export interface CoreTipState {
  x: number
  y: number
}

interface SceneParams {
  repos: Ref<Repo[]>
  filt: Ref<'all' | 'forked'>
  flowLayer: Ref<boolean>
  langOff: Ref<Set<string>>
  sizeBy: Ref<SizeBy>
}

interface Anchor {
  key: string
  label: string
  ang: number
  radFrac: number
  bx: number
  by: number
  introDelay: number
  calloutStart: number
  sx: number
  sy: number
}

interface Node {
  repo: Repo
  anchor: Anchor
  ang: number
  radFrac: number
  bx: number
  by: number
  ox: number
  oy: number
  ovx: number
  ovy: number
  col: string
  satPhase: number
  satPer: number
  introDelay: number
  dist: number
}

interface Particle {
  node: Node
  i: number
  t: number
  sp: number
}

interface SatHit {
  node: Node
  i: number
  login: string
  merged: number
  last: string
  x: number
  y: number
}

const D2R = Math.PI / 180
const SEED = 20240720

const mulberry32 = (a: number) => () => {
  a |= 0
  a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3)
const CORE_BASE = 26

export function useRepoMapScene(params: SceneParams) {
  const tip = ref<TipState | null>(null)
  const satTip = ref<SatTipState | null>(null)
  const coreTip = ref<CoreTipState | null>(null)
  const counter = ref(0)

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let rnd = mulberry32(SEED)

  const nodes: Node[] = []
  const anchors: Anchor[] = []
  const anchorByKey = new Map<string, Anchor>()
  const particles: Particle[] = []
  const spawnAcc = new Map<Node, number>()

  let W = 0
  let H = 0
  let DPR = 1
  let R = 340

  const cam = { x: 0, y: 0, s: 1, tx: 0, ty: 0, ts: 1 }
  let T0 = 0
  let last = 0
  let nowMs = 0
  let nextCallout = 11000
  let pulseStart = -1e9
  let introBase = 0

  const maxMetric: Record<SizeBy, number> = { stars: 1, forks: 1, merged: 1, size: 1, commits: 1 }

  let hover: Node | null = null
  let focusNode: Node | null = null
  let hoverDomain: string | null = null
  let satHover: SatHit | null = null
  let hoverCore = false
  let focusSX = 0
  let focusSY = 0
  const domIdxCounter = new Map<string, number>()

  const metricVal = (n: Node): number => {
    const r = n.repo
    switch (params.sizeBy.value) {
      case 'stars':
        return r.stars
      case 'forks':
        return r.forks
      case 'merged':
        return r.merged
      case 'size':
        return r.sizeKb
      case 'commits':
        return r.commits ?? 0
    }
  }
  const nR = (n: Node): number => {
    const mx = maxMetric[params.sizeBy.value] || 1
    return 5 + 9 * Math.sqrt(Math.max(0, metricVal(n)) / mx)
  }

  const build = (): void => {
    const reposByDomain = new Map<string, Repo[]>()
    for (const r of params.repos.value) {
      const list = reposByDomain.get(r.domain) ?? []
      list.push(r)
      reposByDomain.set(r.domain, list)
    }

    DOMAINS.forEach((dom, di) => {
      const anchor: Anchor = {
        key: dom.key,
        label: dom.label,
        ang: dom.bisector * D2R,
        radFrac: 0.4,
        bx: 0,
        by: 0,
        introDelay: 400 + di * 80,
        calloutStart: -1e9,
        sx: 0,
        sy: 0,
      }
      anchors.push(anchor)
      anchorByKey.set(dom.key, anchor)

      const list = (reposByDomain.get(dom.key) ?? []).slice().sort((a, b) => b.stars - a.stars)
      placeRow(list.slice(0, Math.min(5, list.length)), dom, di, anchor, 0.56, 0)
      placeRow(list.slice(Math.min(5, list.length)), dom, di, anchor, 0.76, 1)
    })
  }

  const placeRow = (
    list: Repo[],
    dom: (typeof DOMAINS)[number],
    di: number,
    anchor: Anchor,
    radBase: number,
    rowShift: number,
  ): void => {
    const k = list.length
    const spread = 0.8 * dom.width
    const stepHalf = k > 1 ? (spread / (k - 1)) * 0.5 : 0
    list.forEach((r, i) => {
      const frac = k === 1 ? 0.5 : i / (k - 1)
      let angDeg = dom.bisector - spread / 2 + spread * frac + rowShift * stepHalf
      angDeg += (rnd() * 2 - 1) * 4
      const radFrac = radBase * (1 + (rnd() * 2 - 1) * 0.04)
      const idx = (domIdxCounter.get(dom.key) ?? 0) + 1
      domIdxCounter.set(dom.key, idx)
      nodes.push({
        repo: r,
        anchor,
        ang: angDeg * D2R,
        radFrac,
        bx: 0,
        by: 0,
        ox: 0,
        oy: 0,
        ovx: 0,
        ovy: 0,
        col: langColor(r.lang),
        satPhase: rnd() * Math.PI * 2,
        satPer: 30 + (rnd() * 2 - 1) * 10,
        introDelay: 900 + di * 280 + (idx - 1) * 30,
        dist: 0,
      })
    })
  }

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  const layout = (): void => {
    const host = canvas.parentElement as HTMLElement
    DPR = Math.min(window.devicePixelRatio || 1, 2)
    W = host.clientWidth
    H = host.clientHeight
    canvas.width = Math.round(W * DPR)
    canvas.height = Math.round(H * DPR)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    R = Math.min(W, H) / 2 - (W < 560 ? 36 : 64)
    for (const a of anchors) {
      const rad = a.radFrac * R
      a.bx = Math.cos(a.ang) * rad
      a.by = Math.sin(a.ang) * rad
    }
    for (const n of nodes) {
      const rad = n.radFrac * R
      n.bx = Math.cos(n.ang) * rad
      n.by = Math.sin(n.ang) * rad
      n.dist = Math.hypot(n.bx, n.by)
    }
  }

  const w2s = (wx: number, wy: number): [number, number] => [
    (wx - cam.x) * cam.s + W / 2,
    (wy - cam.y) * cam.s + H / 2,
  ]
  const s2w = (sx: number, sy: number): [number, number] => [
    (sx - W / 2) / cam.s + cam.x,
    (sy - H / 2) / cam.s + cam.y,
  ]

  const introProg = (startMs: number, durMs: number): number => {
    if (reduce) return 1
    const t = (nowMs - introBase - startMs) / durMs
    return t <= 0 ? 0 : t >= 1 ? 1 : easeOut(t)
  }

  const domGlow = (key: string): number => {
    if (hoverDomain === key) return 1
    if (reduce) return 0
    const a = anchorByKey.get(key)
    if (!a) return 0
    const age = nowMs - a.calloutStart
    if (age < 0 || age > 2500) return 0
    return age < 800 ? age / 800 : Math.max(0, 1 - (age - 800) / 1200)
  }

  const pulseWave = (dist: number): number => {
    if (reduce) return 0
    const age = nowMs - pulseStart
    if (age < 0 || age >= 700) return 0
    const front = easeOut(age / 700) * R * 1.1
    return Math.max(0, 1 - Math.abs(dist - front) / 70)
  }

  const hardOut = (n: Node): boolean => {
    if (params.filt.value === 'forked' && n.repo.forks === 0) return true
    if (params.langOff.value.size && params.langOff.value.has(n.repo.lang)) return true
    return false
  }

  const emitsFlow = (n: Node): boolean => n.repo.contributors.length > 0

  const pickSource = (n: Node): number => {
    const list = n.repo.contributors
    let roll = rnd() * n.repo.merged
    for (let i = 0; i < list.length; i++) {
      roll -= list[i]!.merged
      if (roll <= 0) return i
    }
    return list.length - 1
  }

  const activeFlow = (): Node[] => {
    if (params.flowLayer.value) return nodes.filter((n) => emitsFlow(n) && !hardOut(n))
    if (hover && emitsFlow(hover)) return [hover]
    if (focusNode && emitsFlow(focusNode)) return [focusNode]
    return []
  }

  const emit = (dt: number): void => {
    if (reduce) return
    if (introProg(2800, 500) < 1) return
    const active = activeFlow()
    const set = new Set(active)
    for (const n of active) {
      const rate = Math.min(8, n.repo.merged / 8)
      let acc = (spawnAcc.get(n) ?? 0) + rate * dt
      while (acc >= 1) {
        particles.push({ node: n, i: pickSource(n), t: 0, sp: 70 * (0.9 + rnd() * 0.2) })
        acc -= 1
      }
      spawnAcc.set(n, acc)
    }
    for (const k of spawnAcc.keys()) if (!set.has(k)) spawnAcc.set(k, 0)
  }

  const satScreen = (n: Node, i: number, sx: number, sy: number, nr: number): [number, number] => {
    const cnt = Math.max(1, n.repo.contributors.length)
    const outward = Math.atan2(n.by + n.oy, n.bx + n.ox)
    const spread = Math.min(Math.PI * 1.15, 0.5 + cnt * 0.42)
    const base = cnt === 1 ? 0 : -spread / 2 + (i / (cnt - 1)) * spread
    const sway = Math.sin((nowMs / 1000) * ((Math.PI * 2) / n.satPer) + n.satPhase) * 0.16
    const ang = outward + base + sway
    const rr = nr + 10
    return [sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr]
  }

  const draw = (): void => {
    ctx.clearRect(0, 0, W, H)
    const [hsx, hsy] = w2s(0, 0)

    for (const a of anchors) {
      const intro = introProg(a.introDelay, 250)
      if (intro <= 0) continue
      const [ax, ay] = w2s(a.bx, a.by)
      const ex = hsx + (ax - hsx) * intro
      const ey = hsy + (ay - hsy) * intro
      const g = domGlow(a.key)
      ctx.save()
      ctx.globalAlpha = 0.8 * (0.7 + 0.3 * g)
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(hsx, hsy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.restore()
    }

    for (const n of nodes) {
      const intro = introProg(n.introDelay, 300)
      if (intro <= 0) continue
      const [ax, ay] = w2s(n.anchor.bx, n.anchor.by)
      const [sx, sy] = w2s(n.bx + n.ox, n.by + n.oy)
      const ex = ax + (sx - ax) * intro
      const ey = ay + (sy - ay) * intro
      const g = domGlow(n.repo.domain)
      const out = hardOut(n)
      const dimN = hover && hover !== n ? 0.4 : 1
      ctx.save()
      ctx.globalAlpha = (out ? 0.1 : 0.7 * dimN) * (0.75 + 0.35 * g)
      ctx.strokeStyle = g > 0.02 ? '#555' : '#333'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.restore()
    }

    for (const a of anchors) {
      const intro = introProg(a.introDelay + 120, 400)
      const [ax, ay] = w2s(a.bx, a.by)
      a.sx = ax
      a.sy = ay
      if (intro <= 0) continue
      const g = domGlow(a.key)
      ctx.save()
      ctx.globalAlpha = intro
      ctx.fillStyle = g > 0.02 ? `rgba(255,255,255,${0.6 + 0.4 * g})` : '#999'
      ctx.font = "700 11px 'Roboto Mono', monospace"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(a.label.toUpperCase().split('').join(' '), ax, ay)
      ctx.restore()
    }

    for (const p of particles) {
      const n = p.node
      const [sx, sy] = w2s(n.bx + n.ox, n.by + n.oy)
      const nr = nR(n) * cam.s
      const [fx, fy] = satScreen(n, p.i, sx, sy, nr)
      const te = p.t < 0.12 ? p.t / 0.12 : 1
      const ee = easeOut(Math.min(p.t, 1))
      const cx = fx + (sx - fx) * ee
      const cy = fy + (sy - fy) * ee
      const tailT = Math.max(0, ee - 0.35)
      const tx = fx + (sx - fx) * tailT
      const ty = fy + (sy - fy) * tailT
      ctx.save()
      const grad = ctx.createLinearGradient(tx, ty, cx, cy)
      grad.addColorStop(0, 'rgba(255,204,0,0)')
      grad.addColorStop(1, `rgba(255,204,0,${0.9 * te})`)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(cx, cy)
      ctx.stroke()
      ctx.restore()
    }

    if (reduce) {
      for (const n of activeFlow()) {
        const [sx, sy] = w2s(n.bx + n.ox, n.by + n.oy)
        const nr = nR(n) * cam.s
        n.repo.contributors.forEach((_, i) => {
          const [fx, fy] = satScreen(n, i, sx, sy, nr)
          const grad = ctx.createLinearGradient(fx, fy, sx, sy)
          grad.addColorStop(0, 'rgba(255,204,0,.15)')
          grad.addColorStop(1, 'rgba(255,204,0,.6)')
          ctx.save()
          ctx.strokeStyle = grad
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(fx, fy)
          ctx.lineTo(sx, sy)
          ctx.stroke()
          ctx.restore()
        })
      }
    }

    const satIntro = introProg(2800, 500)
    if (satIntro > 0) {
      for (const n of nodes) {
        if (!n.repo.contributors.length || hardOut(n)) continue
        const [sx, sy] = w2s(n.bx + n.ox, n.by + n.oy)
        const nr = nR(n) * cam.s
        const dimN = hover && hover !== n ? 0.4 : 1
        const top = n.repo.contributors[0]?.merged ?? 1
        n.repo.contributors.forEach((c, i) => {
          const [fx, fy] = satScreen(n, i, sx, sy, nr)
          const on = satHover && satHover.node === n && satHover.i === i
          const rad = 3 + 1.6 * Math.sqrt(c.merged / top) + (on ? 2 : 0)
          ctx.save()
          ctx.globalAlpha = (on ? 1 : 0.7) * satIntro * dimN
          ctx.strokeStyle = 'rgba(255,204,0,.55)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(fx, fy, rad + 2, 0, 7)
          ctx.stroke()
          ctx.fillStyle = on ? '#fff' : '#ffcc00'
          ctx.beginPath()
          ctx.arc(fx, fy, rad, 0, 7)
          ctx.fill()
          ctx.restore()
        })
      }
    }

    for (const n of nodes) {
      const introS = introProg(n.introDelay, 400)
      if (introS <= 0) continue
      const [sx, sy] = w2s(n.bx + n.ox, n.by + n.oy)
      if (n === focusNode) {
        focusSX = sx
        focusSY = sy
      }
      const out = hardOut(n)
      const dimN = hover && hover !== n && !out ? 0.35 : 1
      const A = out ? 0.15 : (params.flowLayer.value && !emitsFlow(n) ? 0.35 : 1) * dimN
      const hv = hover === n
      const g = domGlow(n.repo.domain)
      const wave = pulseWave(n.dist)
      const nr = nR(n) * cam.s * introS * (hv ? 1.3 : 1 + 0.1 * g + 0.4 * wave)

      ctx.save()
      ctx.globalAlpha = A
      if (n.repo.stars >= 4 || hv || wave > 0.05) {
        ctx.shadowColor = n.col
        ctx.shadowBlur = hv ? 14 : 9 + 8 * wave
      }
      ctx.fillStyle = n.col
      ctx.beginPath()
      ctx.arc(sx, sy, nr, 0, 7)
      ctx.fill()
      ctx.restore()

      if (cam.s >= 1.3 && !out) {
        ctx.save()
        ctx.globalAlpha = Math.min(1, (cam.s - 1.3) / 0.3) * introS
        ctx.fillStyle = '#999'
        ctx.font = "10px 'Roboto Mono', monospace"
        ctx.textAlign = 'center'
        ctx.fillText(n.repo.name, sx, sy + nr + 11)
        ctx.restore()
      }
    }

    if (!reduce) {
      const age = nowMs - pulseStart
      if (age >= 0 && age < 700) {
        const p = age / 700
        ctx.save()
        ctx.globalAlpha = (1 - p) * 0.5
        ctx.strokeStyle = '#ffcc00'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(hsx, hsy, easeOut(p) * R * 1.1 * cam.s, 0, 7)
        ctx.stroke()
        ctx.restore()
      }
    }

    const coreI = introProg(0, 500)
    if (coreI > 0) {
      const cr = (CORE_BASE + (hoverCore ? 6 : 0)) * cam.s * coreI
      ctx.save()
      ctx.shadowColor = 'rgba(255,204,0,.55)'
      ctx.shadowBlur = hoverCore ? 30 : 20
      ctx.fillStyle = '#ffcc00'
      ctx.globalAlpha = coreI
      ctx.beginPath()
      ctx.arc(hsx, hsy, cr, 0, 7)
      ctx.fill()
      ctx.restore()

      if (hoverCore) {
        ctx.save()
        ctx.globalAlpha = 0.5 * coreI
        ctx.strokeStyle = '#ffcc00'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(hsx, hsy, cr + 9, 0, 7)
        ctx.stroke()
        ctx.restore()
      }

      ctx.save()
      ctx.globalAlpha = (hoverCore ? 0.95 : 0.6) * coreI
      ctx.fillStyle = hoverCore ? '#fff' : '#999'
      ctx.font = "700 11px 'Roboto Mono', monospace"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`@${OWNER}`, hsx, hsy + cr + 14)
      ctx.restore()
    }
  }

  const update = (dt: number): void => {
    let ms = 1
    let mf = 1
    let mm = 1
    let mz = 1
    let mc = 1
    for (const n of nodes) {
      ms = Math.max(ms, n.repo.stars)
      mf = Math.max(mf, n.repo.forks)
      mm = Math.max(mm, n.repo.merged)
      mz = Math.max(mz, n.repo.sizeKb)
      mc = Math.max(mc, n.repo.commits ?? 0)
    }
    maxMetric.stars = ms
    maxMetric.forks = mf
    maxMetric.merged = mm
    maxMetric.size = mz
    maxMetric.commits = mc

    for (const n of nodes) {
      let tox = 0
      let toy = 0
      if (dragNode === n && dragging) {
        tox = dragW[0] - n.bx
        toy = dragW[1] - n.by
      }
      n.ovx += (tox - n.ox) * 0.12
      n.ovx *= 0.82
      n.ox += n.ovx
      n.ovy += (toy - n.oy) * 0.12
      n.ovy *= 0.82
      n.oy += n.ovy
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!
      const dist = nR(p.node) * cam.s + 13
      p.t += (p.sp * dt) / dist
      if (p.t >= 1) particles.splice(i, 1)
    }
    cam.x += (cam.tx - cam.x) * Math.min(1, dt * 6)
    cam.y += (cam.ty - cam.y) * Math.min(1, dt * 6)
    cam.s += (cam.ts - cam.s) * Math.min(1, dt * 6)
    emit(dt)
    if (!reduce && nowMs > nextCallout) {
      const cands = anchors.filter((a) => nowMs - a.calloutStart > 2600)
      const pick = cands[Math.floor(Math.random() * cands.length)]
      if (pick) pick.calloutStart = nowMs
      nextCallout = nowMs + 10000 + Math.random() * 4000
    }
  }

  const tickCounter = (): void => {
    if (reduce) {
      counter.value = nodes.length
      return
    }
    let seated = 0
    for (const n of nodes) if (nowMs - introBase >= n.introDelay) seated++
    const v = Math.min(nodes.length, seated)
    if (v !== counter.value) counter.value = v
  }

  const syncPinned = (): void => {
    if (!focusNode || !tip.value?.pinned) return
    const x = Math.round(focusSX)
    const y = Math.round(focusSY)
    const t = tip.value
    if (Math.abs(t.x - x) > 0.6 || Math.abs(t.y - y) > 0.6) tip.value = { ...t, x, y }
  }

  let raf = 0
  const frame = (t: number): void => {
    nowMs = t - T0
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    update(dt)
    draw()
    syncPinned()
    tickCounter()
    raf = requestAnimationFrame(frame)
  }

  const pickNode = (sx: number, sy: number): Node | null => {
    let best: Node | null = null
    let bd = 1e9
    for (const n of nodes) {
      if (hardOut(n)) continue
      const [nx, ny] = w2s(n.bx + n.ox, n.by + n.oy)
      const rr = Math.max(6, nR(n) * cam.s) + 4
      const d = Math.hypot(sx - nx, sy - ny)
      if (d < rr && d < bd) {
        bd = d
        best = n
      }
    }
    return best
  }

  const pickSat = (sx: number, sy: number): SatHit | null => {
    if (introProg(2800, 500) <= 0) return null
    let best: SatHit | null = null
    let bd = 1e9
    for (const n of nodes) {
      if (!n.repo.contributors.length || hardOut(n)) continue
      const [nx, ny] = w2s(n.bx + n.ox, n.by + n.oy)
      const nr = nR(n) * cam.s
      n.repo.contributors.forEach((c, i) => {
        const [fx, fy] = satScreen(n, i, nx, ny, nr)
        const d = Math.hypot(sx - fx, sy - fy)
        if (d < 9 && d < bd) {
          bd = d
          best = { node: n, i, login: c.login, merged: c.merged, last: c.last, x: fx, y: fy }
        }
      })
    }
    return best
  }

  const pickCore = (sx: number, sy: number): boolean => {
    const [hx, hy] = w2s(0, 0)
    return Math.hypot(sx - hx, sy - hy) < CORE_BASE * cam.s + 10
  }

  const pickDomain = (sx: number, sy: number): string | null => {
    for (const a of anchors) {
      if (Math.abs(sx - a.sx) < 44 && Math.abs(sy - a.sy) < 14) return a.key
    }
    return null
  }

  const calloutAll = (): void => {
    anchors.forEach((a, i) => {
      a.calloutStart = nowMs + i * 150
    })
    nextCallout = nowMs + anchors.length * 150 + 12000
  }

  const pulse = (): void => {
    pulseStart = nowMs
  }

  const rebuild = (): void => {
    introBase = nowMs
    focusNode = null
    hover = null
    satHover = null
    hoverCore = false
    hoverDomain = null
    tip.value = null
    satTip.value = null
    coreTip.value = null
    counter.value = 0
    particles.length = 0
    spawnAcc.clear()
    for (const n of nodes) {
      n.ox = n.oy = n.ovx = n.ovy = 0
    }
    for (const a of anchors) a.calloutStart = -1e9
    cam.x = cam.tx = 0
    cam.y = cam.ty = 0
    cam.s = cam.ts = 1
    pulseStart = nowMs
    nextCallout = nowMs + 9000
  }

  const rebuildAll = (): void => {
    nodes.length = 0
    anchors.length = 0
    anchorByKey.clear()
    domIdxCounter.clear()
    rnd = mulberry32(SEED)
    build()
    layout()
    rebuild()
  }

  let mounted = false
  watch(params.repos, () => {
    if (mounted) rebuildAll()
  })

  const showTip = (n: Node, sx: number, sy: number, pin: boolean): void => {
    tip.value = { repo: n.repo, x: sx, y: sy, pinned: pin }
    satTip.value = null
    coreTip.value = null
  }
  const hideTip = (): void => {
    tip.value = null
  }

  const satTipFor = (hit: SatHit, sx: number, sy: number): SatTipState => {
    const repo = hit.node.repo
    return {
      login: hit.login,
      repo: repo.name,
      merged: hit.merged,
      share: Math.round((hit.merged / (repo.merged || 1)) * 100),
      people: repo.contributors.length,
      last: hit.last,
      x: sx,
      y: sy,
    }
  }

  const focusOn = (n: Node): void => {
    focusNode = n
    hover = n
    satHover = null
    hoverCore = false
    coreTip.value = null
    satTip.value = null
    cam.tx = n.bx + n.ox
    cam.ty = n.by + n.oy
    cam.ts = 1.6
    const [sx, sy] = w2s(n.bx + n.ox, n.by + n.oy)
    focusSX = sx
    focusSY = sy
    tip.value = { repo: n.repo, x: Math.round(sx), y: Math.round(sy), pinned: true }
  }

  const resetHome = (): void => {
    focusNode = null
    hover = null
    cam.ts = 1
    cam.tx = 0
    cam.ty = 0
    hideTip()
    coreTip.value = null
    calloutAll()
    pulse()
  }

  let dragging = false
  let dragNode: Node | null = null
  let dragW: [number, number] = [0, 0]
  let panning = false
  let panStart: [number, number] = [0, 0]
  let moved = false
  let satDown: SatHit | null = null
  let coreDown = false

  const localXY = (e: { clientX: number; clientY: number }): [number, number] => {
    const rect = canvas.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  const onMove = (e: MouseEvent): void => {
    const [sx, sy] = localXY(e)
    if (dragging && dragNode) {
      dragW = s2w(sx, sy)
      moved = true
      return
    }
    if (panning) {
      const w1 = s2w(panStart[0], panStart[1])
      const w2 = s2w(sx, sy)
      cam.x -= w2[0] - w1[0]
      cam.y -= w2[1] - w1[1]
      cam.tx = cam.x
      cam.ty = cam.y
      panStart = [sx, sy]
      moved = true
      return
    }
    const n = pickNode(sx, sy)
    hover = n
    if (n) {
      satHover = null
      hoverCore = false
      hoverDomain = null
      canvas.classList.add('pointing')
      if (!focusNode) showTip(n, sx, sy, false)
      return
    }
    if (!focusNode) {
      const s = pickSat(sx, sy)
      if (s) {
        satHover = s
        hoverCore = false
        hoverDomain = null
        canvas.classList.add('pointing')
        satTip.value = satTipFor(s, sx, sy)
        tip.value = null
        coreTip.value = null
        return
      }
      satHover = null
      const onCore = pickCore(sx, sy)
      if (onCore) {
        if (!hoverCore) calloutAll()
        hoverCore = true
        hoverDomain = null
        canvas.classList.add('pointing')
        const [hx, hy] = w2s(0, 0)
        coreTip.value = { x: hx, y: hy }
        tip.value = null
        satTip.value = null
        return
      }
      hoverCore = false
      coreTip.value = null
      satTip.value = null
      canvas.classList.remove('pointing')
      hoverDomain = pickDomain(sx, sy)
      hideTip()
    } else {
      satHover = null
      hoverCore = false
      satTip.value = null
      canvas.classList.remove('pointing')
      hoverDomain = pickDomain(sx, sy)
    }
  }

  const onDown = (e: MouseEvent): void => {
    moved = false
    satDown = null
    coreDown = false
    const [sx, sy] = localXY(e)
    const n = pickNode(sx, sy)
    if (n) {
      dragging = true
      dragNode = n
      dragW = s2w(sx, sy)
      return
    }
    const s = pickSat(sx, sy)
    if (s) {
      satDown = s
      return
    }
    if (pickCore(sx, sy)) {
      coreDown = true
      return
    }
    panning = true
    panStart = [sx, sy]
    canvas.classList.add('grabbing')
  }

  const onUp = (): void => {
    canvas.classList.remove('grabbing')
    if (dragging && dragNode && !moved) focusOn(dragNode)
    else if (satDown && !moved)
      window.open(`https://github.com/${satDown.login}`, '_blank', 'noopener,noreferrer')
    else if (coreDown && !moved) resetHome()
    else if (panning && !moved) {
      const wasFocus = focusNode !== null
      focusNode = null
      cam.ts = 1
      if (wasFocus) {
        cam.tx = 0
        cam.ty = 0
      }
      hideTip()
      coreTip.value = null
    }
    dragging = false
    dragNode = null
    panning = false
    satDown = null
    coreDown = false
  }

  const onWheel = (e: WheelEvent): void => {
    e.preventDefault()
    const [sx, sy] = localXY(e)
    const [wx, wy] = s2w(sx, sy)
    const ns = Math.max(0.6, Math.min(2.5, cam.ts * (e.deltaY < 0 ? 1.12 : 0.89)))
    cam.ts = ns
    cam.s = ns
    cam.x = wx - (sx - W / 2) / ns
    cam.y = wy - (sy - H / 2) / ns
    cam.tx = cam.x
    cam.ty = cam.y
  }

  let tStart: [number, number] | null = null
  const onTouchStart = (e: TouchEvent): void => {
    const touch = e.touches[0]
    if (e.touches.length !== 1 || !touch) return
    const [sx, sy] = localXY(touch)
    const n = pickNode(sx, sy)
    if (n) {
      focusOn(n)
      return
    }
    const s = pickSat(sx, sy)
    if (s) {
      satTip.value = satTipFor(s, sx, sy)
      return
    }
    if (pickCore(sx, sy)) {
      resetHome()
      return
    }
    tStart = [sx, sy]
  }
  const onTouchMove = (e: TouchEvent): void => {
    const touch = e.touches[0]
    if (!tStart || e.touches.length !== 1 || !touch) return
    const [sx, sy] = localXY(touch)
    const w1 = s2w(tStart[0], tStart[1])
    const w2 = s2w(sx, sy)
    cam.x -= w2[0] - w1[0]
    cam.y -= w2[1] - w1[1]
    cam.tx = cam.x
    cam.ty = cam.y
    tStart = [sx, sy]
  }
  const onTouchEnd = (): void => {
    tStart = null
  }

  const mount = (el: HTMLCanvasElement): (() => void) => {
    canvas = el
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    build()
    layout()
    mounted = true
    T0 = performance.now()
    last = T0
    window.addEventListener('resize', layout)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd)
    raf = requestAnimationFrame(frame)

    return () => {
      mounted = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layout)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }

  return { tip, satTip, coreTip, counter, mount, pulse, rebuild }
}
