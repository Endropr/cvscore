import { motion } from 'framer-motion'
import { ScoreGauge } from './ScoreGauge'
import { RoleCard } from './RoleCard'
import type { AnalyzeResult, PricingTier } from '../lib/types'
import { scoreColor } from '../lib/utils'
import { Lock, Download, Sparkles, AlertTriangle } from 'lucide-react'

type Props = {
  result: AnalyzeResult
  tier: PricingTier
  onUnlock: (tier: 'basic' | 'pro') => void
  onReset: () => void
}

const years = (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'год' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'года' : 'лет'}`

const FILL_FLAGS = [
  'Расплывчатые формулировки в блоке обязанностей',
  'Ключевые слова вакансии не найдены в тексте',
  'Нет подтверждения заявленного уровня навыков',
  'Формат резюме плохо читается ATS-системами',
]
const FILL_FIXES = [
  { problem: 'Ключевые слова не совпадают с вакансией', current: 'Список технологий без контекста', suggestion: 'Сгруппируйте навыки и добавьте уровень и опыт' },
  { problem: 'Слабое описание последнего места', current: 'Отвечал за разработку сервисов', suggestion: 'Начните с глагола и добавьте измеримый итог' },
]
const FILL_BULLETS = [
  'Сократил время отклика API на 76% и разгрузил базу данных',
  'Перевёл сервисы на контейнеры, релизы стали выходить вдвое чаще',
  'Автоматизировал проверки: количество багов в проде упало на 38%',
]

function Teaser({ text, locked, clear = 6 }: { text: string; locked: boolean; clear?: number }) {
  if (!locked) return <>{text}</>
  const words = text.split(' ')
  return (
    <>
      {words.slice(0, clear).join(' ')}{' '}
      <span className="select-none blur-[4px]" aria-hidden>{words.slice(clear).join(' ') || 'и ещё несколько важных деталей разбора'}</span>
    </>
  )
}
const Blur = ({ children }: { children: React.ReactNode }) => (
  <span className="select-none blur-[5px]" aria-hidden>{children}</span>
)

export function ResultsView({ result, tier, onUnlock, onReset }: Props) {
  const isPaid = tier === 'basic' || tier === 'pro'
  const isPro = tier === 'pro'
  const gain = result.projectedScore - result.trustIndex
  const hidden = result.criteria.length + Math.max(0, result.fixes.length - 2) + Math.max(0, result.redFlags.length - 1) + FILL_FIXES.length
  const stats = [
    { label: 'Стаж', value: years(result.stats.experienceYears) },
    { label: 'Мест работы', value: result.stats.jobsCount },
    { label: 'Ср. на месте', value: `${result.stats.avgMonths} мес.` },
    { label: 'С цифрами', value: result.stats.metricsCount },
    { label: 'Технологий', value: result.stats.techCount },
  ]

  return (
    <div className="space-y-10 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="w-full shrink-0 md:w-52"><ScoreGauge score={result.trustIndex} label="Индекс доверия" /></div>
          <div className="w-full min-w-0 flex-1 space-y-5">
            <p className="text-sm leading-relaxed text-white/60">{result.summary}</p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm text-white/50">Прогноз после правок</span>
              <span className={`font-display text-2xl font-semibold ${scoreColor(result.projectedScore)}`}>
                {result.trustIndex}<span className="mx-1.5 text-white/30">→</span>{result.projectedScore}
              </span>
              <span className="text-sm font-medium text-emerald-400">+{gain}</span>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-white/50">
                <span>Шанс пройти ИИ-фильтр</span>
                <span><span className="text-white">{result.overallScore}%</span> → <span className="text-emerald-400">{result.projectedScore}%</span></span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-emerald-400/30" initial={{ width: 0 }} animate={{ width: `${result.projectedScore}%` }} transition={{ duration: 1, delay: 0.5 }} />
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-soft to-magenta" initial={{ width: 0 }} animate={{ width: `${result.overallScore}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.techStack.map((t) => (
                <span key={t} className="rounded-md border border-violet-glow/15 bg-violet-deep/20 px-2 py-0.5 text-[11px] font-medium text-violet-glow">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0 rounded-xl border border-violet-glow/10 bg-white/[0.04] px-3 py-2.5 text-center">
              <p className="truncate font-display text-sm font-medium text-white">{s.value}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <section>
        <h2 className="mb-4 text-lg">Подходящие роли</h2>
        <div className="space-y-2">{result.roles.map((r, i) => <RoleCard key={r.role} role={r} defaultOpen={i === 0} />)}</div>
      </section>

      <section>
        <h2 className="mb-4 text-lg">Индекс доверия — разбор</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.criteria.map((c) => (
            <div key={c.id} className="card-glass rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">{c.label}</span>
                <span className={`text-sm font-bold ${scoreColor(c.score * 10)}`}>{c.score}/10</span>
              </div>
              <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-soft to-magenta" initial={{ width: 0 }} animate={{ width: `${c.score * 10}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
              </div>
              <p className="text-xs leading-relaxed text-white/55"><Teaser text={c.comment} locked={!isPaid} /></p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm text-amber-200">Что вызовет недоверие у рекрутера</h3>
        </div>
        <ul className="space-y-2">
          {(isPaid ? result.redFlags : [...result.redFlags.slice(0, 1), ...FILL_FLAGS.slice(0, 3)]).map((f, i) => (
            <li key={i} className="flex gap-2 text-xs text-white/65">
              <span className="text-amber-400/60">•</span>
              {!isPaid && i >= 1 ? <Blur>{f}</Blur> : f}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg">Что мешает пройти скрининг</h2>
          {!isPaid && <span className="flex items-center gap-1 text-xs text-white/40"><Lock className="h-3 w-3" /> часть скрыта</span>}
        </div>
        <div className="card-glass overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-violet-glow/15 bg-white/[0.03] text-xs text-white/40">
                <th className="px-4 py-3 font-medium">Проблема</th>
                <th className="px-4 py-3 font-medium">Сейчас</th>
                <th className="px-4 py-3 font-medium">Как исправить</th>
              </tr>
            </thead>
            <tbody>
              {(isPaid ? result.fixes : [...result.fixes.slice(0, 2), ...FILL_FIXES, ...FILL_FIXES.slice(0, 1)]).map((fix, i) => {
                const locked = !isPaid && i >= 2
                return (
                  <tr key={i} className="border-b border-violet-glow/10 last:border-0">
                    <td className="max-w-[160px] px-4 py-3 align-top text-white/85">{locked ? <Blur>{fix.problem}</Blur> : fix.problem}</td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-xs text-white/45">{locked ? <Blur>{fix.current}</Blur> : fix.current}</td>
                    <td className="max-w-[240px] px-4 py-3 align-top text-xs text-emerald-400/90">
                      {locked ? <span className="inline-flex items-center gap-1.5"><Lock className="h-3 w-3 shrink-0 text-violet-glow" /><Blur>{fix.suggestion}</Blur></span> : fix.suggestion}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {!isPro && (
        <section className="card-glass relative overflow-hidden rounded-2xl p-6">
          <p className="mb-1 text-sm font-medium">Так будет выглядеть ваш опыт после правок</p>
          <p className="mb-4 text-xs text-white/40">Нейросеть перепишет блоки под ваши данные и добавит измеримые результаты</p>
          <ul className="space-y-2.5 text-sm text-white/75">
            {FILL_BULLETS.map((b) => <li key={b} className="flex gap-2"><span className="text-magenta">▸</span><Blur>{b}</Blur></li>)}
          </ul>
          <div className="absolute inset-0 flex items-center justify-center bg-void-950/30">
            <button onClick={() => onUnlock('pro')} className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4" /> Показать в PRO — 399 ₽
            </button>
          </div>
        </section>
      )}

      {!isPro && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-violet-glow/30 bg-gradient-to-br from-violet-deep/15 to-magenta/10 p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-violet-glow" />
          <h3 className="mb-1 text-lg">Откройте полный разбор</h3>
          <p className="mx-auto mb-5 max-w-md text-sm text-white/50">
            Все исправления, детальный разбор 6 критериев и {isPaid ? 'готовое резюме в PDF' : 'подсказки по формулировкам'}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!isPaid && (
              <button onClick={() => onUnlock('basic')} className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 sm:w-auto">
                Полный разбор — 299 ₽
              </button>
            )}
            <button onClick={() => onUnlock('pro')} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white sm:w-auto">
              <Download className="h-4 w-4" /> PRO + готовый PDF — 399 ₽
            </button>
          </div>
        </motion.div>
      )}

      {isPro && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="mb-2 font-medium text-emerald-300">PRO активирован</p>
          <p className="mb-4 text-sm text-white/50">Здесь будет скачивание переписанного резюме (подключите генерацию PDF).</p>
          <button className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-void-950">
            <Download className="h-4 w-4" /> Скачать PDF
          </button>
        </div>
      )}

      <div className="text-center">
        <button onClick={onReset} className="text-sm text-white/40 transition-colors hover:text-white/70">← Проверить другое резюме</button>
      </div>

      {!isPaid && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring', damping: 20 }} className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-lg items-center gap-3 rounded-full border border-violet-glow/30 bg-void-900/85 py-2 pl-5 pr-2 shadow-glow backdrop-blur-xl">
          <Lock className="h-4 w-4 shrink-0 text-violet-glow" />
          <p className="min-w-0 flex-1 text-xs text-white/70">Скрыто пунктов разбора: <span className="font-semibold text-white">{hidden}</span><span className="hidden sm:inline"> · потенциал <span className="font-semibold text-emerald-400">+{gain}</span></span></p>
          <button onClick={() => onUnlock('basic')} className="btn-primary shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-white">Открыть за 299 ₽</button>
        </motion.div>
      )}
    </div>
  )
}
