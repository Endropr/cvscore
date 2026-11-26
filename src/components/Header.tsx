import { motion } from 'framer-motion'

type Props = { onCheck: () => void }

export function Header({ onCheck }: Props) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="nav-pill mx-auto flex h-12 max-w-3xl items-center justify-between rounded-full pl-3 pr-1.5">
        <a href="/" className="group flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-7 w-7 rounded-lg shadow-glow-sm" />
          <span className="font-display text-sm font-semibold tracking-tight">CVScore</span>
        </a>
        <nav className="hidden items-center gap-1 text-sm text-white/55 md:flex">
          {[['#how', 'Как работает'], ['#analyze', 'Проверка'], ['#pricing', 'Тарифы']].map(([h, t]) => (
            <a key={h} href={h} className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white">{t}</a>
          ))}
        </nav>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onCheck} className="btn-primary rounded-full px-5 py-2 text-sm font-medium text-white">
          Проверить
        </motion.button>
      </div>
    </header>
  )
}
