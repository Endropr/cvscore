import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

const STAGES = [
  'Чтение документа',
  'Извлечение навыков и технологий',
  'Проверка хронологии опыта',
  'Поиск измеримых результатов',
  'Подбор подходящих ролей',
  'Расчёт индекса доверия',
]
const TECH = ['Golang', 'Rust', 'Python', 'TypeScript', 'JavaScript', 'React', 'Vue', 'Node.js', 'PHP', 'Java', 'Kotlin', 'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL', 'Redis', 'RabbitMQ', 'Kafka', 'gRPC', 'REST', 'GraphQL', 'AWS', 'Linux', 'Git', 'Nginx']

export function AnalysisLoader({ text }: { text: string }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 0.1), 100)
    return () => clearInterval(id)
  }, [])

  const found = useMemo(() => {
    const low = text.toLowerCase()
    const list = TECH.filter((k) => low.includes(k.toLowerCase()))
    if (/\bGo\b/.test(text) && !list.includes('Golang')) list.unshift('Go')
    return list.slice(0, 10)
  }, [text])
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text])
  const metrics = useMemo(() => (text.match(/\d+\s?(%|млн|тыс|мс|раз)/gi) ?? []).length, [text])

  const stage = Math.min(STAGES.length - 1, Math.floor(t / 1.8))
  const pct = Math.round(95 * (1 - Math.exp(-t / 7)))
  const shownTech = Math.min(found.length, Math.floor(t / 0.9))
  const C = 2 * Math.PI * 44

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mt-6 grid gap-6 rounded-2xl border border-violet-glow/20 bg-void-900/70 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        {/* scanned document + ring */}
        <div className="flex items-center justify-center gap-5 sm:flex-col">
          <div className="relative h-40 w-32 overflow-hidden rounded-xl border border-violet-glow/25 bg-void-800 p-3">
            {[70, 90, 55, 80, 40, 85, 60, 75, 50].map((w, i) => (
              <div key={i} className="mb-2 h-1.5 rounded bg-violet-glow/25" style={{ width: `${w}%` }} />
            ))}
            <motion.div className="absolute inset-x-0 h-10 border-b-2 border-violet-neon bg-gradient-to-b from-transparent to-violet-neon/40" animate={{ y: [-40, 160] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .3s' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-semibold tabular-nums">{pct}%</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-display text-sm font-medium">Нейросеть читает ваше резюме</p>
          <ul className="mt-4 space-y-2">
            {STAGES.map((st, i) => (
              <li key={st} className={`flex items-center gap-2.5 text-sm transition-colors ${i < stage ? 'text-white/45' : i === stage ? 'text-white' : 'text-white/20'}`}>
                <span className="flex h-5 w-5 items-center justify-center">
                  {i < stage ? <Check className="h-4 w-4 text-emerald-400" /> : i === stage ? <Loader2 className="h-4 w-4 animate-spin text-violet-neon" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                </span>
                {st}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[['Слов', words], ['Технологий', shownTech], ['Метрик', stage >= 3 ? metrics : '…']].map(([l, v]) => (
              <div key={l as string} className="rounded-lg border border-violet-glow/10 bg-white/[0.03] py-2">
                <p className="font-display text-base font-medium tabular-nums">{v}</p>
                <p className="text-[11px] text-white/40">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex min-h-[28px] flex-wrap gap-1.5">
            <AnimatePresence>
              {found.slice(0, shownTech).map((k) => (
                <motion.span key={k} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="rounded-md border border-violet-glow/25 bg-violet-deep/25 px-2 py-0.5 text-[11px] font-medium text-violet-glow">{k}</motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
