export type Frame = number[][]
export type MatrixMode = 'default' | 'vu'

export function clamp(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function ensureFrameSize(frame: Frame, rows: number, cols: number): Frame {
  const result: Frame = []
  for (let r = 0; r < rows; r++) {
    const row = frame[r] || []
    result.push([])
    for (let c = 0; c < cols; c++) {
      result[r][c] = row[c] ?? 0
    }
  }
  return result
}

export function emptyFrame(rows: number, cols: number): Frame {
  return Array.from({ length: rows }, () => new Array(cols).fill(0))
}

export function setPixel(frame: Frame, row: number, col: number, value: number): void {
  if (row >= 0 && row < frame.length && col >= 0 && col < frame[0].length) {
    frame[row][col] = value
  }
}

export const digits: Frame[] = [
  [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
  ],
  [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
]

export const chevronLeft: Frame = [
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
]

export const chevronRight: Frame = [
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
]

export const loader: Frame[] = (() => {
  const frames: Frame[] = []
  const size = 7
  const center = 3
  const radius = 2.5

  for (let frame = 0; frame < 12; frame++) {
    const f = emptyFrame(size, size)
    for (let i = 0; i < 8; i++) {
      const angle = (frame / 12) * Math.PI * 2 + (i / 8) * Math.PI * 2
      const x = Math.round(center + Math.cos(angle) * radius)
      const y = Math.round(center + Math.sin(angle) * radius)
      const brightness = 1 - i / 10
      setPixel(f, y, x, Math.max(0.2, brightness))
    }
    frames.push(f)
  }

  return frames
})()

export function vu(columns: number, levels: number[]): Frame {
  const rows = 7
  const frame = emptyFrame(rows, columns)

  for (let col = 0; col < Math.min(columns, levels.length); col++) {
    const level = Math.max(0, Math.min(1, levels[col]))
    const height = Math.floor(level * rows)

    for (let row = 0; row < rows; row++) {
      const rowFromBottom = rows - 1 - row
      if (rowFromBottom < height) {
        let brightness = 1
        if (row < rows * 0.3) {
          brightness = 1
        }
        else if (row < rows * 0.6) {
          brightness = 0.8
        }
        else {
          brightness = 0.6
        }
        frame[row][col] = brightness
      }
    }
  }

  return frame
}

export const wave: Frame[] = (() => {
  const frames: Frame[] = []
  const rows = 7
  const cols = 7

  for (let frame = 0; frame < 24; frame++) {
    const f = emptyFrame(rows, cols)
    const phase = (frame / 24) * Math.PI * 2

    for (let col = 0; col < cols; col++) {
      const colPhase = (col / cols) * Math.PI * 2
      const height = Math.sin(phase + colPhase) * 2.5 + 3.5
      const row = Math.floor(height)

      if (row >= 0 && row < rows) {
        setPixel(f, row, col, 1)
        const frac = height - row
        if (row > 0)
          setPixel(f, row - 1, col, 1 - frac)
        if (row < rows - 1)
          setPixel(f, row + 1, col, frac)
      }
    }

    frames.push(f)
  }

  return frames
})()

export const snake: Frame[] = (() => {
  const frames: Frame[] = []
  const rows = 7
  const cols = 7
  const path: Array<[number, number]> = []

  let x = 0
  let y = 0
  let dx = 1
  let dy = 0

  const visited = new Set<string>()
  while (path.length < rows * cols) {
    path.push([y, x])
    visited.add(`${y},${x}`)

    const nextX = x + dx
    const nextY = y + dy

    if (
      nextX >= 0
      && nextX < cols
      && nextY >= 0
      && nextY < rows
      && !visited.has(`${nextY},${nextX}`)
    ) {
      x = nextX
      y = nextY
    }
    else {
      const newDx = -dy
      const newDy = dx
      dx = newDx
      dy = newDy

      const nextX = x + dx
      const nextY = y + dy

      if (
        nextX >= 0
        && nextX < cols
        && nextY >= 0
        && nextY < rows
        && !visited.has(`${nextY},${nextX}`)
      ) {
        x = nextX
        y = nextY
      }
      else {
        break
      }
    }
  }

  const snakeLength = 5
  for (let frame = 0; frame < path.length; frame++) {
    const f = emptyFrame(rows, cols)

    for (let i = 0; i < snakeLength; i++) {
      const idx = frame - i
      if (idx >= 0 && idx < path.length) {
        const [y, x] = path[idx]
        const brightness = 1 - i / snakeLength
        setPixel(f, y, x, brightness)
      }
    }

    frames.push(f)
  }

  return frames
})()

export const pulse: Frame[] = (() => {
  const frames: Frame[] = []
  const size = 7
  const center = 3

  for (let frame = 0; frame < 16; frame++) {
    const f = emptyFrame(size, size)
    const phase = (frame / 16) * Math.PI * 2
    const intensity = (Math.sin(phase) + 1) / 2

    setPixel(f, center, center, 1)

    const radius = Math.floor((1 - intensity) * 3) + 1
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (Math.abs(dist - radius) < 0.7) {
          setPixel(f, center + dy, center + dx, intensity * 0.6)
        }
      }
    }

    frames.push(f)
  }

  return frames
})()
