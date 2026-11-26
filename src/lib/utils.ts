import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-rose-400'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/30'
  if (score >= 60) return 'bg-amber-500/15 border-amber-500/30'
  return 'bg-rose-500/15 border-rose-500/30'
}

export function verdictLabel(v: 'recommend' | 'consider' | 'weak') {
  if (v === 'recommend') return 'Рекомендуем'
  if (v === 'consider') return 'Можно рассмотреть'
  return 'Слабо'
}
