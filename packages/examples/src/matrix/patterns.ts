/* eslint-disable style/max-statements-per-line */
import type { Frame } from '@repo/elements/matrix'
import { emptyFrame, setPixel } from '@repo/elements/matrix'

const createBlank = () => emptyFrame(7, 7)

export const elevenLogo: Frame[] = (() => {
  const frames: Frame[] = []
  const totalFrames = 30

  for (let f = 0; f < totalFrames; f++) {
    const frame = createBlank()
    const phase = (f / totalFrames) * Math.PI * 2
    const intensity = ((Math.sin(phase) + 1) / 2) * 0.3 + 0.7

    for (let r = 1; r <= 5; r++) {
      setPixel(frame, r, 2, intensity)
      setPixel(frame, r, 4, intensity)
    }
    frames.push(frame)
  }
  return frames
})()

export const sandTimer: Frame[] = (() => {
  const frames: Frame[] = []
  const totalFrames = 60

  for (let f = 0; f < totalFrames; f++) {
    const frame = createBlank()
    const staticPixels = [[0, 2], [0, 3], [0, 4], [1, 2], [1, 4], [5, 2], [5, 4], [6, 2], [6, 3], [6, 4]]
    staticPixels.forEach(([r, c]) => setPixel(frame, r, c, 1))

    const progress = f / totalFrames
    const topSand = Math.floor((1 - progress) * 8)
    const bottomSand = Math.floor(progress * 8)

    if (topSand > 0)
      setPixel(frame, 1, 3, 1)
    if (topSand >= 3)
      setPixel(frame, 2, 3, 1)

    if (bottomSand > 0)
      setPixel(frame, 5, 3, 1)
    if (bottomSand >= 3)
      setPixel(frame, 4, 3, 1)
    if (bottomSand >= 6)
      setPixel(frame, 3, 3, 0.5)

    frames.push(frame)
  }
  return frames
})()

export const spinner: Frame[] = (() => {
  const frames: Frame[] = []
  const positions = [
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 4],
    [5, 3],
    [5, 2],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 2],
  ]

  for (let f = 0; f < positions.length; f++) {
    const frame = createBlank()
    for (let i = 0; i < 3; i++) {
      const idx = (f + i) % positions.length
      const [r, c] = positions[idx]
      setPixel(frame, r, c, 1 - i * 0.3)
    }
    frames.push(frame)
  }
  return frames
})()

export const corners: Frame[] = (() => {
  const frames: Frame[] = []
  for (let i = 0; i < 16; i++) {
    const frame = createBlank()
    const threshold = (i / 16) * 8
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const dist = Math.min(
          Math.sqrt(r * r + c * c),
          Math.sqrt(r * r + (6 - c) * (6 - c)),
          Math.sqrt((6 - r) * (6 - r) + c * c),
          Math.sqrt((6 - r) * (6 - r) + (6 - c) * (6 - c)),
        )
        if (dist <= threshold) {
          setPixel(frame, r, c, Math.max(0, 1 - Math.abs(dist - threshold)))
        }
      }
    }
    frames.push(frame)
  }
  return frames
})()

export const sweep: Frame[] = (() => {
  const frames: Frame[] = []
  for (let i = 0; i < 14; i++) {
    const frame = createBlank()
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const sum = r + c
        if (sum === i)
          setPixel(frame, r, c, 1)
        else if (Math.abs(sum - i) === 1)
          setPixel(frame, r, c, 0.5)
      }
    }
    frames.push(frame)
  }
  return frames
})()

export const expand: Frame[] = (() => {
  const frames: Frame[] = []
  const sizes = [0, 1, 2, 3, 2, 1]
  for (const i of sizes) {
    const frame = createBlank()
    for (let r = 3 - i; r <= 3 + i; r++) {
      for (let c = 3 - i; c <= 3 + i; c++) {
        if (r === 3 - i || r === 3 + i || c === 3 - i || c === 3 + i) {
          setPixel(frame, r, c, 1)
        }
      }
    }
    frames.push(frame)
  }
  return frames
})()

export const burst: Frame[] = (() => {
  const frames: Frame[] = []
  for (let f = 0; f < 8; f++) {
    const frame = createBlank()
    const intensity = f < 4 ? f / 3 : (7 - f) / 3
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const distance = Math.sqrt((r - 3) ** 2 + (c - 3) ** 2)
        if (Math.abs(distance - f * 0.8) < 1.2)
          setPixel(frame, r, c, intensity)
      }
    }
    frames.push(frame)
  }
  return frames
})()

export function createUnifiedPattern(frameIndex: number): Frame[] {
  const pattern: number[][] = Array.from({ length: 21 }, (_, r) =>
    Array.from({ length: 21 }, (_, c) => {
      const distance = Math.sqrt((c - 10.5) ** 2 + (r - 10.5) ** 2)
      return (Math.sin(distance * 0.5 - frameIndex * 0.2) + 1) / 2
    }))

  const matrices: Frame[] = []
  for (let mR = 0; mR < 3; mR++) {
    for (let mC = 0; mC < 3; mC++) {
      const f = createBlank()
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          f[r][c] = pattern[mR * 7 + r][mC * 7 + c]
        }
      }
      matrices.push(f)
    }
  }
  return matrices
}

export function createExpandedLogo(progress: number): Frame[] {
  const matrices = Array.from({ length: 9 }, () => createBlank())
  const ease = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2

  if (ease < 0.3) {
    for (let r = 1; r <= 5; r++) {
      matrices[4][r][2] = 1; matrices[4][r][4] = 1
    }
    return matrices
  }

  const p = (ease - 0.3) / 0.7
  for (let gR = 0; gR < 21; gR++) {
    for (let gC = 0; gC < 21; gC++) {
      const lR = gR % 7; const lC = gC % 7
      const mIdx = Math.floor(gR / 7) * 3 + Math.floor(gC / 7)

      const leftS = Math.floor(9 + (5 - 9) * p); const leftE = Math.floor(9 + (7 - 9) * p)
      const rightS = Math.floor(11 + (13 - 11) * p); const rightE = Math.floor(11 + (15 - 11) * p)

      if (((gC >= leftS && gC <= leftE) || (gC >= rightS && gC <= rightE)) && gR >= 4 && gR <= 16) {
        matrices[mIdx][lR][lC] = 1
      }
    }
  }
  return matrices
}

export function createCollapseEffect(progress: number): Frame[] {
  const matrices = Array.from({ length: 9 }, () => createBlank())
  const ease = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2

  if (ease < 0.4) {
    const p = ease / 0.4
    for (let gR = 0; gR < 21; gR++) {
      for (let gC = 0; gC < 21; gC++) {
        const mIdx = Math.floor(gR / 7) * 3 + Math.floor(gC / 7)
        const leftS = Math.floor(5 + (9 - 5) * p); const leftE = Math.floor(7 + (9 - 7) * p)
        const rightS = Math.floor(13 + (11 - 13) * p); const rightE = Math.floor(15 + (11 - 15) * p)
        if (((gC >= leftS && gC <= leftE) || (gC >= rightS && gC <= rightE)) && gR >= 4 && gR <= 16) {
          matrices[mIdx][gR % 7][gC % 7] = 1
        }
      }
    }
  }
  else {
    const bright = 1 - (ease - 0.4) / 0.6
    for (let r = 1; r <= 5; r++) {
      matrices[4][r][2] = bright; matrices[4][r][4] = bright
    }
  }
  return matrices
}

export { pulse, snake, wave } from '@repo/elements/matrix'
