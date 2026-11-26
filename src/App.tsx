import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { Header } from './components/Header'
import { FlowDiagram } from './components/FlowDiagram'
import { UploadZone } from './components/UploadZone'
import { ResultsView } from './components/ResultsView'
import { Pricing } from './components/Pricing'
import { ParticleField } from './components/ParticleField'
import { HeroDemo } from './components/HeroDemo'
import { PhraseDuel } from './components/PhraseDuel'
import { AnalysisLoader } from './components/AnalysisLoader'
import { analyzeResume } from './lib/analyze'
import type { AnalyzeResult, PricingTier } from './lib/types'
import {
  Shield,
  Zap,
  Target,
  FileSearch,
  Bot,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  BarChart3,
} from 'lucide-react'

type Screen = 'landing' | 'analyze' | 'results'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [loading, setLoading] = useState(false)
  const [srcText, setSrcText] = useState('')
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [tier, setTier] = useState<PricingTier>('free')
  const analyzeRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const scrollToAnalyze = () => {
    setScreen('analyze')
    setTimeout(() => {
      analyzeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleAnalyze = async (text: string) => {
    setLoading(true)
    setSrcText(text)
    setScreen('analyze')
    // плавно показываем блок «Нейросеть читает ваше резюме»
    setTimeout(() => loaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    try {
      const res = await analyzeResume(text)
      setResult(res)
      setTier('free')
      setScreen('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Неизвестная ошибка'
      alert('Ошибка анализа:\n' + msg)
      setScreen('analyze')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = (t: 'basic' | 'pro') => {
    // Demo unlock for now. Replace with real payment later.
    setTier(t)
  }

  return (
    <div className="relative min-h-screen surface-grid text-white noise">
      {/* Ambient orbs */}
      <div className="orb top-[-10%] left-[10%] h-[420px] w-[420px] bg-violet-deep/30" />
      <div
        className="orb bottom-[20%] right-[-5%] h-[360px] w-[360px] bg-magenta/15"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="orb top-[40%] left-[-8%] h-[280px] w-[280px] bg-indigo-600/20"
        style={{ animationDelay: '3s' }}
      />

      <motion.div style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-violet-deep via-violet-neon to-magenta" />
      <Header onCheck={scrollToAnalyze} />

      <main className="relative pt-14">
        <AnimatePresence mode="wait">
          {screen === 'results' && result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
            >
              <ResultsView
                result={result}
                tier={tier}
                onUnlock={handleUnlock}
                onReset={() => {
                  setResult(null)
                  setScreen('analyze')
                  setTier('free')
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* HERO */}
              <section className="relative overflow-hidden px-4 pt-24 pb-10 sm:pt-28 sm:pb-12">
                <div className="hero-floor" aria-hidden />
                <div className="absolute inset-0 opacity-60"><ParticleField /></div>
                <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                  <div>
                    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-glow/25 bg-void-800/60 px-3.5 py-1.5 text-xs text-violet-glow backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-neon shadow-[0_0_10px_#c084fc]" />
                      Скрининг резюме нейросетью
                    </p>
                    <h1 className="scan-in font-display text-[clamp(1.7rem,3.1vw,2.7rem)] font-semibold leading-[1.08] text-gradient-v">
                      Пройдите <span className="whitespace-nowrap">ИИ-скрининг.</span>
                      <br />
                      Попадите к человеку.
                    </h1>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
                      Прежде чем рекрутер увидит резюме, его оценивает алгоритм. Покажем слабые места и перепишем формулировки так, чтобы фильтр пропустил вас дальше.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button onClick={scrollToAnalyze} className="btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white sm:w-auto">
                        Проверить резюме
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                      <a href="#how" className="w-full rounded-full border border-violet-glow/25 bg-void-800/40 px-6 py-3.5 text-center text-sm sm:w-auto text-white/70 backdrop-blur-sm transition-colors hover:border-violet-glow/60 hover:text-white">
                        Как это работает
                      </a>
                    </div>
                    <dl className="mt-8 flex max-w-md divide-x divide-violet-glow/15">
                      {[['≈10 сек', 'до результата'], ['6', 'критериев доверия'], ['0 ₽', 'базовый разбор']].map(([v, l]) => (
                        <div key={l} className="flex-1 px-3 first:pl-0 sm:px-4">
                          <dt className="whitespace-nowrap font-display text-base font-medium text-white sm:text-xl">{v}</dt>
                          <dd className="mt-1 text-[11px] leading-tight text-white/40 sm:text-xs">{l}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <HeroDemo />
                </div>
              </section>

              {/* MARQUEE */}
              <div className="relative space-y-3 overflow-hidden border-y border-violet-glow/10 bg-void-900/40 py-4" style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
                {[0, 1].map((row) => (
                  <div key={row} className="ticker-track" style={row ? { animationDirection: 'reverse', animationDuration: '38s' } : undefined}>
                    {[0, 1].map((k) => (
                      <div key={k} className="flex shrink-0 items-center gap-3 pr-3">
                        {(row ? [['REST API','#c084fc'],['gRPC','#22d3ee'],['GraphQL','#e535ab'],['PostgreSQL','#336791'],['MySQL','#00758f'],['Redis','#dc382d'],['RabbitMQ','#ff6600'],['Kafka','#e5e7eb'],['Docker','#2496ed'],['Kubernetes','#326ce5'],['Nginx','#009639'],['AWS','#ff9900'],['Git','#f05032'],['Linux','#fcc624'],['CI/CD','#34d399']] : [['Golang','#00ADD8'],['Rust','#f74c00'],['Python','#4b8bbe'],['PHP','#8892bf'],['TypeScript','#3178c6'],['JavaScript','#f7df1e'],['Java','#f89820'],['C#','#9b4f96'],['Kotlin','#a97bff'],['Swift','#fa7343'],['React','#61dafb'],['Vue','#42b883'],['Next.js','#ffffff'],['Node.js','#68a063'],['Svelte','#ff3e00']]).map(([t, c]) => (
                          <span key={t} className="flex shrink-0 items-center gap-2 rounded-full border border-violet-glow/15 bg-white/[0.03] px-4 py-1.5 text-sm text-white/75"><span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />{t}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* FLOW */}
              <section id="how" className="relative px-4 py-16">
                <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center mb-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet-glow/50 mb-3">
                    PIPELINE
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Рекрутер не увидит резюме,
                    <br />
                    <span className="text-white/30">если его отсеет ИИ.</span>
                  </h2>
                </motion.div>

                <motion.div
                  {...fadeUp}
                  transition={{ delay: 0.1 }}
                  className="card-glass mx-auto max-w-3xl rounded-2xl px-2 py-4 sm:px-4 relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px shimmer-line" />
                  <FlowDiagram />
                </motion.div>

                {/* 3 steps */}
                <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: FileSearch,
                      step: '01',
                      title: 'Загрузка',
                      text: 'PDF, DOCX или текст. Разбор на клиенте — без лишней бюрократии.',
                    },
                    {
                      icon: Bot,
                      step: '02',
                      title: 'Скрининг',
                      text: 'Сравнение с типовыми IT-вакансиями: баллы, роли, красные флаги.',
                    },
                    {
                      icon: UserCheck,
                      step: '03',
                      title: 'Допуск',
                      text: 'Что поправить, чтобы пройти фильтр и дойти до живого человека.',
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={s.step}
                      {...fadeUp}
                      transition={{ delay: 0.08 * i }}
                      className="card-glass card-glass-hover rounded-2xl p-5 relative"
                    >
                      <span className="absolute top-4 right-4 font-mono text-[10px] text-violet-glow/40">
                        {s.step}
                      </span>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-deep/30 border border-violet-glow/20">
                        <s.icon className="h-5 w-5 text-violet-glow" />
                      </div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="mt-1.5 text-sm text-white/40 leading-relaxed">{s.text}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* FEATURES */}
              <section className="px-4 py-6">
                <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center mb-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet-glow/50 mb-3">
                    WHAT YOU GET
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Не «советы», а <span className="text-gradient">разбор по делу</span>
                  </h2>
                </motion.div>

                <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      icon: Target,
                      title: 'Баллы по ролям',
                      text: 'Backend, Fullstack, Frontend — куда вы ближе и каких требований не хватает.',
                    },
                    {
                      icon: Shield,
                      title: 'Индекс доверия',
                      text: 'Цифры, конкретика, стаж, логика карьеры. Что вызовет сомнение у фильтра и HR.',
                    },
                    {
                      icon: Zap,
                      title: 'Было → стало',
                      text: 'Готовые формулировки под ATS: измеримый результат вместо воды.',
                    },
                    {
                      icon: BarChart3,
                      title: 'Красные флаги',
                      text: 'Пробелы, расплывчатый опыт, ключевые слова, которые ИИ не считывает.',
                    },
                    {
                      icon: Sparkles,
                      title: 'Перепись блоков',
                      text: 'На PRO — переписанные буллеты опыта, которые можно вставить в резюме.',
                    },
                    {
                      icon: Lock,
                      title: 'Без слива данных',
                      text: 'Можно работать с текстом сессии. Почта — только если нужна доставка PDF.',
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={f.title}
                      {...fadeUp}
                      transition={{ delay: 0.05 * i }}
                      className="card-glass card-glass-hover rounded-2xl p-5"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-deep/25 border border-violet-glow/15">
                        <f.icon className="h-4 w-4 text-violet-glow" />
                      </div>
                      <h3 className="font-semibold text-sm">{f.title}</h3>
                      <p className="mt-1.5 text-[13px] text-white/40 leading-relaxed">{f.text}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* SIX CHECKS + GAME */}
              <section className="px-4 py-16">
                <div className="mx-auto max-w-4xl">
                  <motion.div {...fadeUp} className="mb-10 text-center">
                    <h2 className="text-2xl sm:text-3xl">Шесть проверок за десять секунд</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm text-white/45">Тот же набор, по которому фильтр решает, звать ли вас на собеседование.</p>
                  </motion.div>
                  <div className="grid gap-4 md:grid-cols-[1fr_1.05fr]">
                    <motion.div {...fadeUp} className="card-glass rounded-2xl p-5">
                      <ul className="grid grid-cols-2 gap-2.5">
                        {[['Опыт работы', 7], ['Навыки', 8], ['Достижения', 5], ['Ясность', 6], ['Образование', 6], ['Хронология', 9]].map(([t, v], i) => (
                          <li key={t as string} className="rounded-xl border border-violet-glow/10 bg-white/[0.03] p-3">
                            <p className="text-xs text-white/60">{t}</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-soft to-magenta" initial={{ width: 0 }} whileInView={{ width: `${(v as number) * 10}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1 * i }} />
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs text-white/35">Пример оценок. Ваши появятся после проверки.</p>
                    </motion.div>
                    <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                      <PhraseDuel onDone={scrollToAnalyze} />
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* UPLOAD */}
              <section ref={analyzeRef} id="analyze" className="px-4 py-16">
                <div className="mx-auto max-w-2xl">
                  <motion.div {...fadeUp} className="text-center mb-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-glow/50 mb-2">
                      SYSTEM // ANALYZE
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      Пройдёт ли ваше резюме?
                    </h2>
                    <p className="mt-2 text-sm text-white/40">
                      Файл или текст — результат за ~10 секунд.
                    </p>
                  </motion.div>

                  <motion.div
                    {...fadeUp}
                    className="card-glass rounded-2xl p-5 sm:p-7 relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-px shimmer-line" />
                    <UploadZone onAnalyze={handleAnalyze} loading={loading} />
                    <div ref={loaderRef} className="scroll-mt-24"><AnimatePresence>{loading && <AnalysisLoader text={srcText} />}</AnimatePresence></div>
                  </motion.div>
                </div>
              </section>

              {/* Pricing */}
              <div className="px-4">
                <div className="mx-auto max-w-4xl">
                  <Pricing onSelect={handleUnlock} />
                </div>
              </div>

              {/* FAQ */}
              <section className="px-4 py-10">
                <motion.div {...fadeUp} className="mx-auto max-w-2xl">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet-glow/50 text-center mb-6">
                    FAQ
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        q: 'Это замена карьерному консультанту?',
                        a: 'Нет. Это быстрый разбор под ИИ/ATS-фильтры: баллы, дыры, формулировки. Стратегию карьеры и софт-скиллы — отдельно.',
                      },
                      {
                        q: 'Откуда берутся роли и вакансии?',
                        a: 'В demo — типовые IT-роли (Backend / Fullstack / Frontend). В проде можно подключать живые описания или ваш текст вакансии.',
                      },
                      {
                        q: 'Куда уходит текст резюме?',
                        a: 'Текст уходит в модель только на время разбора. Хранение можно отключить.',
                      },
                    ].map((item) => (
                      <details
                        key={item.q}
                        className="card-glass group rounded-xl px-4 py-3 open:pb-4"
                      >
                        <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-white/85">
                          {item.q}
                          <span className="text-violet-glow/50 group-open:rotate-45 transition-transform text-lg leading-none">
                            +
                          </span>
                        </summary>
                        <p className="mt-2 text-[13px] text-white/40 leading-relaxed pr-6">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Privacy strip */}
              <section className="px-4 pb-20 pt-4">
                <motion.div
                  {...fadeUp}
                  className="mx-auto max-w-2xl text-center card-glass rounded-2xl px-6 py-8"
                >
                  <Lock className="mx-auto h-6 w-6 text-violet-glow mb-3" />
                  <h3 className="text-lg font-semibold">
                    Ваши данные —{' '}
                    <span className="text-gradient">не наш продукт</span>
                  </h3>
                  <p className="mt-2 text-sm text-white/40 max-w-md mx-auto">
                    Почта и телефон не уходят в модель без необходимости. Текст
                    резюме можно не хранить — только score и сессию оплаты.
                  </p>
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative border-t border-violet-glow/10 py-8 text-center text-xs text-white/25">
        <p className="font-mono tracking-wide">CVScore · AI resume screening</p>
        <p className="mt-1">Не аффилированы с hh.ru или LinkedIn</p>
      </footer>
    </div>
  )
}
