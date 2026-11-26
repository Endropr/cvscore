import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import type { RoleScore } from '../lib/types'
import { scoreColor, scoreBg, verdictLabel } from '../lib/utils'

type Props = { role: RoleScore; defaultOpen?: boolean }

export function RoleCard({ role, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const reqs = role.requirements ?? []

  return (
    <div className={`overflow-hidden rounded-xl border ${scoreBg(role.score)} transition-colors`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-violet-deep/10">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{role.role}</p>
          <p className="mt-0.5 text-xs text-white/50">{verdictLabel(role.verdict)}</p>
        </div>
        <span className={`text-lg font-bold tabular-nums ${scoreColor(role.score)}`}>{role.score}</span>
        <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="space-y-3 border-t border-violet-glow/10 px-4 py-3">
              <p className="text-xs text-white/50"><span className="text-white/70">Чего не хватает: </span>{role.missing}</p>
              {reqs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/35">Требования типичной вакансии</p>
                  {reqs.map((r, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className={r.ok ? 'text-emerald-400' : 'text-white/25'}>{r.ok ? <Check className="mt-0.5 h-3.5 w-3.5" /> : '○'}</span>
                      <div>
                        <p className={r.ok ? 'text-white/80' : 'text-white/40'}>{r.text}</p>
                        {r.ok && r.quote && <p className="mt-0.5 italic text-white/35">«{r.quote}»</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
