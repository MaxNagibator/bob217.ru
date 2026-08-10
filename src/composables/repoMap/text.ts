export const MONO = "'Roboto Mono', monospace"

export const trackedWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
): number => ctx.measureText(text).width + tracking * Math.max(0, text.length - 1)

export const drawTracked = (
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
): number => {
  const total = trackedWidth(ctx, text, tracking)
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  let x = cx - total / 2
  for (const ch of text) {
    ctx.fillText(ch, x, y)
    x += ctx.measureText(ch).width + tracking
  }
  ctx.textAlign = prev
  return total
}

export const hairline = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  color: string,
): void => {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - width / 2, y)
  ctx.lineTo(cx + width / 2, y)
  ctx.stroke()
}

export const drawChip = (
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  top: number,
  color: string,
): void => {
  const w = ctx.measureText(text).width
  const padX = 5
  const h = 15
  ctx.fillStyle = 'rgba(18,18,18,.72)'
  ctx.beginPath()
  ctx.roundRect(cx - w / 2 - padX, top, w + padX * 2, h, 3)
  ctx.fill()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, top + h / 2 + 0.5)
}
