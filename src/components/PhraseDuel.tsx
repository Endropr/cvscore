import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Gamepad2 } from 'lucide-react'

const ROUNDS = [
  { opts: ['Занимался разработкой API', 'Разработал REST API платежей: 1,2 млн запросов в сутки'], ok: 1, why: 'Конкретный объект и цифра: фильтр видит масштаб.' },
  { opts: ['Python, FastAPI, PostgreSQL, Docker — 4 года в проде', 'Работал с большим количеством технологий'], ok: 0, why: 'Названия технологий и срок — то, что ищет алгоритм.' },
  { opts: ['Улучшил производительность', 'Сократил время ответа сервиса с 800 до 190 мс'], ok: 1, why: 'Результат измерим, а «улучшил» ничего не доказывает.' },
  { opts: ['Провёл 40+ код-ревью, обучил 3 джунов', 'Ответственный, коммуникабельный, стрессоустойчивый'], ok: 0, why: 'Качества без фактов не считываются, факты — считываются.' },
  { opts: ['Использовал современные подходы и лучшие практики', 'Внедрил RabbitMQ: очередь обрабатывает 50 тыс. задач в час без потерь'], ok: 1, why: 'Модные слова — шум. Конкретный инструмент и нагрузка — сигнал.' },
]

export function PhraseDuel({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const done = i >= ROUNDS.length
  const r = ROUNDS[Math.min(i, ROUNDS.length - 1)]

  const choose = (n: number) => {
    if (pick !== null) return
    setPick(n)
    if (n === r.ok) setScore((s) => s + 1)
  }
  const next = () => { setPick(null); setI((v) => v + 1) }
  const restart = () => { setI(0); setPick(null); setScore(0) }

  return (
    <div className="card-glass relative flex h-full flex-col overflow-hidden rounded-2xl border-violet-glow/40 bg-gradient-to-br from-violet-deep/30 via-void-900 to-magenta/15 p-5 shadow-glow">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-magenta/25 blur-3xl" />
      <span className="relative mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-deep to-magenta px-3 py-1 text-[11px] font-semibold text-white"><Gamepad2 className="h-3.5 w-3.5" /> Мини-игра · верно: {score}</span>
      <div className="relative mb-4 flex items-center justify-between">
        <h3 className="text-base">Что пропустит фильтр?</h3>
        <div className="flex gap-1">{ROUNDS.map((_, k) => <span key={k} className={`h-1.5 w-5 rounded-full ${k < i || (k === i && pick !== null) ? 'bg-violet-neon' : 'bg-white/10'}`} />)}</div>
      </div>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex flex-1 flex-col gap-2.5">
            {r.opts.map((o, n) => {
              const show = pick !== null
              const good = show && n === r.ok
              const bad = show && n === pick && n !== r.ok
              return (
                <button key={n} onClick={() => choose(n)} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${good ? 'border-emerald-400/50 bg-emerald-500/10 text-white' : bad ? 'border-rose-400/50 bg-rose-500/10 text-white' : 'border-violet-glow/15 bg-white/[0.03] text-white/80 hover:border-violet-glow/50'}`}>
                  <span className="flex-1">{o}</span>
                  {good && <Check className="h-4 w-4 text-emerald-400" />}
                  {bad && <X className="h-4 w-4 text-rose-400" />}
                </button>
              )
            })}
            {pick !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 flex items-center gap-3">
                <p className="flex-1 text-xs text-white/55">{r.why}</p>
                <button onClick={next} className="btn-primary shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-white">{i === ROUNDS.length - 1 ? 'Результат' : 'Дальше'}</button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="end" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="font-display text-4xl font-semibold text-gradient-v">{score}/{ROUNDS.length}</p>
            <p className="max-w-xs text-sm text-white/55">{score >= 4 ? 'У вас острый глаз. Проверим, так ли написано ваше резюме?' : 'Фильтр заметит то, что вы пропустили. Посмотрите, что он найдёт в вашем резюме.'}</p>
            <button onClick={onDone} className="btn-primary rounded-full px-6 py-2.5 text-sm font-semibold text-white">Проверить моё резюме</button>
            <button onClick={restart} className="text-xs text-white/40 hover:text-white/70">Сыграть ещё раз</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
