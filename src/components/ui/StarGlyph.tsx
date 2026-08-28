type Glyph = {
  points: Array<[number, number]>
  edges: Array<[number, number]>
}

/**
 * Рисунки собраны из звёзд и линий между ними в системе 100×100.
 * Каждый — узнаваемый символ обещания: лист договора, щит, теги кода,
 * команда вокруг общего узла и растущий график.
 */
const GLYPHS: Record<string, Glyph> = {
  contract: {
    points: [
      [28, 12],
      [72, 12],
      [72, 88],
      [28, 88],
      [40, 34],
      [62, 34],
      [40, 50],
      [62, 50],
      [40, 66],
      [54, 66],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [6, 7],
      [8, 9],
    ],
  },
  shield: {
    points: [
      [50, 10],
      [80, 26],
      [80, 52],
      [50, 90],
      [20, 52],
      [20, 26],
      [50, 34],
      [50, 66],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [6, 7],
    ],
  },
  code: {
    points: [
      [34, 30],
      [16, 50],
      [34, 70],
      [62, 24],
      [46, 76],
      [66, 30],
      [84, 50],
      [66, 70],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [3, 4],
      [5, 6],
      [6, 7],
    ],
  },
  team: {
    points: [
      [50, 50],
      [26, 24],
      [74, 24],
      [26, 76],
      [74, 76],
      [50, 14],
    ],
    edges: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 5],
      [5, 2],
      [3, 4],
    ],
  },
  chart: {
    points: [
      [16, 84],
      [16, 16],
      [84, 84],
      [24, 70],
      [42, 56],
      [58, 62],
      [76, 26],
    ],
    edges: [
      [1, 0],
      [0, 2],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
}

type StarGlyphProps = {
  shape: keyof typeof GLYPHS | string
  className?: string
}

/**
 * Созвездие соединяется само: линии прочерчиваются волной, держатся,
 * а к концу десятисекундного круга гаснут и всё начинается заново.
 * Наведение на плитку собирает рисунок мгновенно и зажигает его.
 */
export default function StarGlyph({ shape, className = '' }: StarGlyphProps) {
  const glyph = GLYPHS[shape] ?? GLYPHS.contract

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      {glyph.edges.map(([from, to], index) => (
        <line
          key={`${from}-${to}`}
          x1={glyph.points[from][0]}
          y1={glyph.points[from][1]}
          x2={glyph.points[to][0]}
          y2={glyph.points[to][1]}
          // pathLength нормирует длину: штрих одинаков для линий любой длины.
          pathLength={1}
          className="glyph-line"
          style={{ animationDelay: `${index * 0.09}s` }}
        />
      ))}

      {glyph.points.map(([x, y], index) => (
        <circle
          key={`${x}-${y}-${index}`}
          cx={x}
          cy={y}
          r={2}
          className="glyph-star"
          style={{ animationDelay: `${index * 0.07}s` }}
        />
      ))}
    </svg>
  )
}
