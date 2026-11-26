import { motion } from 'framer-motion'
import { scoreColor } from '../lib/utils'

type Props = {
  score: number
  label?: string
  sublabel?: string
}

export function ScoreGauge({ score, label = 'Индекс доверия', sublabel }: Props) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score)) / 100
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-bold tabular-nums ${scoreColor(score)}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-wider text-white/40">/ 100</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
      {sublabel && <p className="text-xs text-white/40 mt-0.5">{sublabel}</p>}
    </div>
  )
}
