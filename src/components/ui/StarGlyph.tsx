import type { CSSProperties } from 'react'

type Glyph = {
  points: Array<[number, number]>
  edges: Array<[number, number]>
}

/**
 * Фоновая звёздная пыль — она и делает рисунок созвездием, а не схемой из линий.
 * Координаты заданы вручную: случайные ломали бы картинку на каждом рендере.
 */
const DUST: Array<[number, number, number]> = [
  [8, 14, 0.9],
  [18, 6, 0.7],
  [30, 22, 0.6],
  [44, 8, 0.8],
  [58, 16, 0.6],
  [72, 6, 0.9],
  [88, 18, 0.7],
  [94, 34, 0.6],
  [6, 38, 0.8],
  [14, 58, 0.6],
  [4, 76, 0.9],
  [22, 90, 0.7],
  [38, 78, 0.6],
  [52, 94, 0.8],
  [68, 86, 0.6],
  [84, 72, 0.9],
  [92, 56, 0.7],
  [78, 46, 0.5],
  [34, 46, 0.5],
  [62, 66, 0.5],
]

/**
 * Рисунки собраны из звёзд и линий между ними в системе 100×100.
 * Каждый — узнаваемый символ обещания.
 */
const GLYPHS: Record<string, Glyph> = {
  // Лист договора с полями текста.
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
  // Щит: прямой верх, скошенные плечи, острие внизу и галочка внутри.
  shield: {
    points: [
      [26, 18],
      [50, 10],
      [74, 18],
      [72, 50],
      [50, 88],
      [28, 50],
      [39, 47],
      [47, 58],
      [63, 38],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [6, 7],
      [7, 8],
    ],
  },
  // Теги кода: две скобки и слэш между ними.
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
  // Три силуэта: головы-звёзды и плечи. Центральный крупнее и ближе.
  team: {
    points: [
      [50, 26],
      [34, 56],
      [44, 44],
      [56, 44],
      [66, 56],
      [24, 34],
      [12, 62],
      [20, 50],
      [76, 34],
      [88, 62],
      [80, 50],
    ],
    edges: [
      [1, 2],
      [2, 3],
      [3, 4],
      [6, 7],
      [7, 5],
      [9, 10],
      [10, 8],
    ],
  },
  // Оси и растущий график.
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
 * Наведение на плитку рисует фигуру заново, но быстро.
 */
export default function StarGlyph({ shape, className = '' }: StarGlyphProps) {
  const glyph = GLYPHS[shape] ?? GLYPHS.contract

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      {DUST.map(([x, y, r], index) => (
        <circle
          key={`dust-${index}`}
          cx={x}
          cy={y}
          r={r}
          className="glyph-dust"
          style={{ '--i': index } as CSSProperties}
        />
      ))}

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
          style={{ '--i': index } as CSSProperties}
        />
      ))}

      {glyph.points.map(([x, y], index) => (
        <circle
          key={`star-${index}`}
          cx={x}
          cy={y}
          r={2}
          className="glyph-star"
          style={{ '--i': index } as CSSProperties}
        />
      ))}
    </svg>
  )
}
