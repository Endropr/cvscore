import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertTriangle, Wand2, Undo2 } from 'lucide-react'
import { scoreColor } from '../lib/utils'

const BEFORE = [
  { text: 'Занимался разработкой backend на Go', flag: 'Нет результата' },
  { text: 'Участвовал в оптимизации базы данных', flag: 'Нет цифр' },
  { text: 'Docker, Kubernetes, AWS, PHP, Rust, Kafka, Redis', flag: 'Раздутый стек' },
]
const AFTER = [
  'Ускорил API платежей с 800 до 190 мс (Go, gRPC)',
  'Оптимизировал запросы PostgreSQL: нагрузка на БД −45%',
  'Docker, PostgreSQL, Redis — в проде; Kubernetes — в учебных проектах',
]

function useCount(target: number) {
  const [v, setV] = useState(target)
  useEffect(() => {
    const from = v
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 900)
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return v
}

export function HeroDemo() {
  const [fixed, setFixed] = useState(false)
  const [touched, setTouched] = useState(false)
  const score = useCount(fixed ? 86 : 38)
  const C = 2 * Math.PI * 26

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-8 rounded-full bg-violet-deep/30 blur-3xl" aria-hidden />

      {/* score chip */}
      <div className="card-glass relative z-20 mb-3 ml-auto flex w-fit items-center gap-3 rounded-2xl py-2.5 pl-3 pr-4 sm:absolute sm:-right-4 sm:-top-6 sm:mb-0">
        <svg viewBox="0 0 64 64" className="h-12 w-12 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26" fill="none" strokeWidth="6" strokeLinecap="round"
            stroke={fixed ? '#34d399' : '#fb7185'}
            strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)}
          />
        </svg>
        <div>
          <p className={`font-display text-xl font-semibold tabular-nums leading-none ${scoreColor(score)}`}>{score}</p>
          <p className="mt-1 text-[11px] text-white/45">индекс доверия</p>
        </div>
      </div>

      {/* resume sheet */}
      <div className="sheet relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="beam" aria-hidden />
        <div className="flex items-center gap-3 border-b border-[#1a1033]/10 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d6001c] font-display text-sm font-semibold text-white">hh</div>
          <div>
            <p className="font-display text-sm font-semibold">Александр Бусыгин</p>
            <p className="text-xs text-[#1a1033]/55">Fullstack Developer · 3 года</p>
          </div>
        </div>
        <p className="mb-3 mt-5 text-xs font-medium text-[#1a1033]/45">Опыт работы</p>
        <ul className="space-y-4">
          {BEFORE.map((b, i) => (
            <li key={i} className="text-[13px] leading-snug sm:text-sm">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={fixed ? 'a' : 'b'}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                  className={fixed ? 'text-[#1a1033]' : 'mark-bad text-[#1a1033]/80'}
                >
                  {fixed ? AFTER[i] : b.text}
                </motion.span>
              </AnimatePresence>
              <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle text-[10px] font-medium ${fixed ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/12 text-rose-600'}`}>
                {fixed ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {fixed ? 'Усилено' : b.flag}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-5 flex justify-center">
        <button onClick={() => { setFixed((f) => !f); setTouched(true) }} className={`btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white ${touched ? '' : 'pulse-ring'}`}>
          {fixed ? <Undo2 className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
          {fixed ? 'Показать исходник' : 'Применить правки'}
        </button>
        <AnimatePresence>
          {!touched && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.2 }} className="pointer-events-none absolute left-1/2 top-full -ml-5 mt-1 flex items-start gap-3">
              <svg viewBox="0 0 40 64" className="nudge h-16 w-10 shrink-0 text-violet-neon" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M32 60 C32 42 20 40 20 10" />
                <path d="M13 18 L20 8 L27 18" />
              </svg>
              <p className="mt-6 w-44 text-xs leading-snug text-violet-glow">Нажмите и посмотрите, как резюме исправится</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!touched && <div className="h-16" />}
    </div>
  )
}
