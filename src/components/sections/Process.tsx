import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Check, ClipboardList, Code2, LayoutGrid, MouseIcon, Rocket } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'

import { processSteps } from '@/content/process'

const icons: Record<string, ComponentType<{ className?: string }>> = {
  brief: ClipboardList,
  structure: LayoutGrid,
  build: Code2,
  launch: Rocket,
}

/** Кривая, по которой идёт точка. Координаты — в системе viewBox ниже. */
const VIEW_W = 1200
const VIEW_H = 260
const CURVE = 'M 60 200 C 220 200 260 60 420 60 S 640 200 780 200 S 1000 60 1140 60'

/** Доли пути, на которых стоят узлы этапов. */
const NODE_T = [0.03, 0.35, 0.66, 0.98]

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

type NodePosition = { left: number; top: number }

export default function Process() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [nodes, setNodes] = useState<NodePosition[]>([])
  const [active, setActive] = useState(0)

  // Позиция бегущей точки в координатах viewBox и её прозрачность:
  // внутри круга этапа точку не должно быть видно вовсе.
  const dotX = useMotionValue(60)
  const dotY = useMotionValue(200)
  const dotFade = useMotionValue(1)

  /** Узлы в координатах viewBox и радиус притяжения — считаются при замере. */
  const nodePoints = useRef<Array<{ x: number; y: number }>>([])
  const snapRadius = useRef(26)

  // Пока идёт прокрутка внутри закреплённого экрана, progress меняется от 0 до 1.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  /** Узлы считаем по самому пути — так метки всегда лежат ровно на кривой. */
  const measure = useCallback(() => {
    const path = pathRef.current
    const svg = svgRef.current
    // getTotalLength есть не везде (в том числе в jsdom) — без него узлы просто не размечаем.
    if (!path || !svg || typeof path.getTotalLength !== 'function') return

    const total = path.getTotalLength()
    const scale = svg.getBoundingClientRect().width / VIEW_W

    setNodes(
      NODE_T.map((t) => {
        const point = path.getPointAtLength(total * t)
        return { left: point.x * scale, top: point.y * scale }
      }),
    )
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)

    // Круги стоят в пикселях поверх svg: если холст сменил ширину без события
    // resize (шрифты, раскрытие блоков), разметку нужно пересчитать, иначе
    // круги съедут относительно кривой и точка перестанет попадать в центр.
    const svg = svgRef.current
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    if (svg) observer?.observe(svg)

    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [measure])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const path = pathRef.current
    if (path && typeof path.getTotalLength === 'function') {
      // Путь точки ограничен крайними узлами — иначе в начале и в конце
      // она вылезает за первый и последний круг.
      const span = NODE_T[NODE_T.length - 1] - NODE_T[0]
      const point = path.getPointAtLength(path.getTotalLength() * (NODE_T[0] + progress * span))

      let x = point.x
      let y = point.y
      let nearest = 0

      nodePoints.current.forEach((node) => {
        const distance = Math.hypot(node.x - x, node.y - y)
        if (
          distance <
          Math.hypot(nodePoints.current[nearest].x - x, nodePoints.current[nearest].y - y)
        ) {
          nearest = nodePoints.current.indexOf(node)
        }
      })

      const target = nodePoints.current[nearest]
      if (target) {
        const distance = Math.hypot(target.x - x, target.y - y)
        const raw = clamp01(1 - distance / snapRadius.current)
        // Сглаживание, чтобы точка входила в круг плавно, а не притягивалась рывком.
        const pull = raw * raw * (3 - 2 * raw)
        x += (target.x - x) * pull
        y += (target.y - y) * pull
        dotFade.set(1 - pull)
      }

      dotX.set(x)
      dotY.set(y)
    }

    // Этап считается достигнутым чуть раньше узла — иначе подпись меняется с запозданием.
    let next = 0
    NODE_T.forEach((t, index) => {
      if (progress >= t - 0.06) next = index
    })
    setActive(next)
  })

  /** Клик по узлу — прокрутка к его месту на пути. */
  function goToStep(index: number) {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const distance = wrapper.offsetHeight - window.innerHeight
    window.scrollTo({ top: wrapper.offsetTop + distance * NODE_T[index], behavior: 'smooth' })
  }

  const step = processSteps[active]
  const StepIcon = icons[step.icon]

  return (
    <section id="process" className="relative border-t border-line">
      {/* Высокая обёртка задаёт длину прокрутки: 4 этапа ≈ по экрану на каждый. */}
      <div ref={wrapperRef} className="relative lg:h-[420vh]">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-dvh lg:items-center lg:overflow-hidden">
          <div className="container-page w-full py-24 lg:pt-10 lg:pb-0">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-3xl leading-none font-medium text-accent lg:text-4xl">
                    03
                  </span>
                  <span className="font-mono text-sm tracking-[0.16em] text-muted uppercase lg:text-base">
                    Процесс
                  </span>
                </div>
                <h2 className="text-display mt-6 text-[clamp(2rem,4vw,3.25rem)]">
                  Четыре этапа
                  <br />
                  без сюрпризов
                </h2>
              </div>

              <div className="w-full max-w-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-display text-4xl text-ember">{step.index}</span>
                  <span className="label-mono text-muted">/ 04</span>
                </div>
                <div className="mt-4 h-px w-full bg-line">
                  <motion.div
                    style={{ scaleX: barScale }}
                    className="h-px w-full origin-left bg-gradient-to-r from-accent to-ember"
                  />
                </div>
                <motion.p
                  style={{ opacity: hintOpacity }}
                  className="label-mono mt-4 hidden items-center gap-2 text-muted lg:flex"
                >
                  <MouseIcon className="size-3.5" />
                  Крутите — точка пойдёт по пути
                </motion.p>
              </div>
            </div>

            {/* Кривая с узлами — только на десктопе, где есть закреплённый экран. */}
            <div className="relative mx-auto mt-14 hidden max-w-[1200px] lg:block">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="h-auto w-full overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="process-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff6a00" />
                    <stop offset="100%" stopColor="#ffb020" />
                  </linearGradient>
                  <filter id="process-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Непройденный путь. */}
                <path
                  ref={pathRef}
                  d={CURVE}
                  fill="none"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                />

                {/* Пройденный путь прорисовывается по мере прокрутки. */}
                <motion.path
                  d={CURVE}
                  fill="none"
                  stroke="url(#process-line)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ pathLength: scrollYProgress }}
                />

                <motion.g style={{ x: dotX, y: dotY, opacity: dotFade }}>
                  <circle r="26" fill="rgba(255,106,0,0.12)" />
                  <circle r="14" fill="rgba(255,106,0,0.22)" />
                  <circle r="6" fill="#ff6a00" filter="url(#process-glow)" />
                </motion.g>
              </svg>

              {/* Узлы этапов лежат поверх svg в пиксельных координатах. */}
              {nodes.map((node, index) => {
                const done = index < active
                const current = index === active
                const NodeIcon = icons[processSteps[index].icon]
                const above = node.top < VIEW_H / 2

                return (
                  <button
                    key={processSteps[index].index}
                    type="button"
                    onClick={() => goToStep(index)}
                    style={{ left: node.left, top: node.top }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    aria-label={`Этап ${processSteps[index].index}: ${processSteps[index].title}`}
                  >
                    <span
                      className={`flex size-14 items-center justify-center rounded-full border transition-all duration-500 ${
                        current
                          ? 'scale-110 border-accent bg-accent text-bg shadow-glow'
                          : done
                            ? 'border-accent/50 bg-bg text-accent'
                            : 'border-line bg-surface text-muted group-hover:border-accent/60 group-hover:text-accent'
                      }`}
                    >
                      {done ? <Check className="size-5" /> : <NodeIcon className="size-5" />}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 -m-2 rounded-full border border-accent/40 transition-opacity duration-500 ${
                        current ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    <span
                      className={`label-mono absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-colors duration-500 ${
                        above ? '-top-9' : '-bottom-9'
                      } ${current ? 'text-accent' : 'text-muted'}`}
                    >
                      {processSteps[index].index} · {processSteps[index].duration}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Описание активного этапа. */}
            <div className="mt-14 hidden min-h-28 lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-8 lg:grid-cols-12"
                >
                  <div className="lg:col-span-1">
                    <span className="flex size-12 items-center justify-center rounded-card border border-accent/40 bg-accent/10 text-accent">
                      <StepIcon className="size-5" />
                    </span>
                  </div>

                  <div className="lg:col-span-6">
                    <h3 className="text-display text-2xl">{step.title}</h3>
                    <p className="mt-4 max-w-xl text-muted">{step.text}</p>
                  </div>

                  <ul className="flex flex-col gap-3 lg:col-span-5">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-sm">
                        <span className="flex size-5 items-center justify-center rounded-full border border-accent/40 text-accent">
                          <Check className="size-3" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Мобильная версия: обычный список без закрепления экрана. */}
            <div className="mt-14 flex flex-col gap-10 lg:hidden">
              {processSteps.map((item) => {
                const ItemIcon = icons[item.icon]
                return (
                  <div key={item.index} className="border-t border-line pt-6">
                    <div className="flex items-center gap-4">
                      <span className="flex size-11 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                        <ItemIcon className="size-5" />
                      </span>
                      <div>
                        <p className="label-mono text-muted">
                          {item.index} · {item.duration}
                        </p>
                        <h3 className="text-display mt-1 text-xl">{item.title}</h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted">{item.text}</p>
                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2 text-sm">
                          <span className="size-1 rounded-full bg-accent" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
