import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ListChecks, Gauge, AlertTriangle, PenLine, FileDown, MessageCircleQuestion, ArrowRight } from 'lucide-react'

type Tier = 'basic' | 'pro'
type Props = { onSelect: (tier: Tier) => void }

const DETAILS = {
  basic: {
    name: 'Разбор', price: '299 ₽',
    lead: 'Для тех, кто хочет понять, что именно не так с резюме, и исправить это самостоятельно.',
    items: [
      { icon: ListChecks, title: 'Все исправления', text: 'Полная таблица «Проблема → Сейчас → Как исправить». Видна конкретная фраза из вашего резюме и подсказка, как её переписать. Ничего не скрыто.' },
      { icon: Gauge, title: 'Разбор 6 критериев', text: 'Опыт, навыки, достижения, ясность, образование и хронология: у каждого оценка и полный комментарий — что хорошо и что улучшить.' },
      { icon: AlertTriangle, title: 'Красные флаги', text: 'Всё, что насторожит рекрутера или фильтр: пересечения дат, раздутый стек, расплывчатые формулировки.' },
    ],
    example: ['Отсутствие количественных результатов', 'Добавьте метрики и достижения для каждого проекта.'],
    exLabel: 'Пример строки из разбора',
    cta: 'Открыть за 299 ₽',
  },
  pro: {
    name: 'PRO', price: '399 ₽',
    lead: 'Для тех, кто хочет не просто знать проблемы, а получить готовое резюме и сразу откликаться.',
    items: [
      { icon: Check, title: 'Всё из тарифа 299 ₽', text: 'Все исправления, разбор 6 критериев и красные флаги — без скрытых строк.' },
      { icon: PenLine, title: 'Переписанные формулировки', text: 'Нейросеть переписывает слабые места: сильный глагол, технологии и измеримый результат вместо общих слов.' },
      { icon: FileDown, title: 'Готовый PDF резюме', text: 'Аккуратный документ с внесёнными исправлениями — можно сразу отправлять работодателю.' },
      { icon: MessageCircleQuestion, title: 'Вопросы под ваши цифры', text: 'Подскажем, какие метрики вспомнить (нагрузка, сроки, экономия), чтобы формулировки были честными и убедительными.' },
    ],
    example: ['Занимался разработкой API', 'Разработал REST API платежей: 1,2 млн запросов в сутки'],
    exLabel: 'Пример: было → стало',
    cta: 'PRO за 399 ₽',
  },
} as const

export function Pricing({ onSelect }: Props) {
  const [open, setOpen] = useState<Tier | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const list = (arr: string[], c: string) => (
    <ul className="mt-5 flex-1 space-y-2.5 text-sm text-white/60">
      {arr.map((t) => <li key={t} className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${c}`} />{t}</li>)}
    </ul>
  )
  const d = open ? DETAILS[open] : null

  return (
    <section id="pricing" className="py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl">Начните <span className="text-gradient">бесплатно</span></h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/40">Базовый разбор — сразу. Полные правки и PDF — когда будете готовы.</p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-5 pt-3 sm:grid-cols-3">
        <div className="card-glass flex flex-col rounded-2xl p-6">
          <p className="text-xs text-white/40">Базовый</p>
          <p className="mt-2 font-display text-2xl font-semibold">0 ₽</p>
          {list(['Баллы по ролям', 'Индекс доверия', '2 главных исправления', 'Краткий PDF'], 'text-violet-glow')}
        </div>
        <motion.div whileHover={{ y: -4 }} className="card-glass flex flex-col rounded-2xl p-6">
          <p className="text-xs text-white/40">Разбор</p>
          <p className="mt-2 font-display text-2xl font-semibold">299 ₽</p>
          {list(['Всё из базового', 'Все исправления', 'Разбор 6 критериев', 'Красные флаги'], 'text-violet-glow')}
          <button onClick={() => setOpen('basic')} className="mt-6 w-full rounded-full border border-violet-glow/30 py-2.5 text-sm font-medium transition-colors hover:bg-violet-deep/25">Подробнее</button>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="relative flex flex-col rounded-2xl border border-violet-glow/40 bg-gradient-to-b from-violet-deep/25 to-void-900/90 p-6 shadow-glow">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-deep to-magenta px-3 py-1 text-[11px] font-semibold text-white">Лучший выбор</span>
          <p className="text-xs text-violet-glow">PRO</p>
          <p className="mt-2 font-display text-2xl font-semibold">399 ₽</p>
          {list(['Всё из тарифа 299 ₽', 'Переписанные формулировки', 'Готовый PDF резюме', 'Вопросы под ваши цифры'], 'text-magenta')}
          <button onClick={() => setOpen('pro')} className="btn-primary mt-6 w-full rounded-full py-2.5 text-sm font-semibold text-white">Подробнее</button>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && d && (
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 z-[70] flex items-end justify-center bg-void-950/80 p-3 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ type: 'spring', damping: 26, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-violet-glow/30 bg-void-900 p-6 shadow-glow sm:p-8">
              <button onClick={() => setOpen(null)} aria-label="Закрыть" className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>

              <div className="mb-6 grid w-fit grid-cols-2 gap-1 rounded-full border border-violet-glow/20 bg-white/[0.04] p-1">
                {(['basic', 'pro'] as Tier[]).map((k) => (
                  <button key={k} onClick={() => setOpen(k)} className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${open === k ? 'bg-gradient-to-r from-violet-deep to-magenta text-white' : 'text-white/55 hover:text-white'}`}>{DETAILS[k].price}</button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={open} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18 }}>
                  <h3 className="text-2xl">Тариф «{d.name}» <span className="text-gradient">{d.price}</span></h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{d.lead}</p>
                  <ul className="mt-6 space-y-4">
                    {d.items.map((it) => (
                      <li key={it.title} className="flex gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-deep/30 text-violet-glow"><it.icon className="h-5 w-5" /></span>
                        <div><p className="text-sm font-medium">{it.title}</p><p className="mt-0.5 text-[13px] leading-relaxed text-white/50">{it.text}</p></div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-xl border border-violet-glow/15 bg-white/[0.03] p-4">
                    <p className="mb-2 text-[11px] text-white/35">{d.exLabel}</p>
                    <p className="text-sm text-white/45 line-through decoration-rose-400/60">{d.example[0]}</p>
                    <p className="mt-1 flex gap-2 text-sm text-emerald-300"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />{d.example[1]}</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => { onSelect(open); setOpen(null) }} className="btn-primary flex-1 rounded-full py-3 text-sm font-semibold text-white">{d.cta}</button>
                    <button onClick={() => setOpen(null)} className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 transition-colors hover:bg-white/5">Закрыть</button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
