import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Continuous pipeline animation inspired by resume-screener.void.app:
 * sources → document scan → AI bars → recruiter check
 */
export function FlowDiagram() {
  const [phase, setPhase] = useState(0)
  // 0: particle to doc, 1: scanning, 2: through AI, 3: arrive + check

  useEffect(() => {
    const cycle = 3200
    const id = setInterval(() => {
      setPhase((p) => (p + 1) % 4)
    }, cycle / 4)
    return () => clearInterval(id)
  }, [])

  const showCheck = phase === 3

  return (
    <div className="relative mx-auto w-full max-w-3xl px-2 py-10 select-none">
      {/* Ambient glow behind AI */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-deep/30 blur-3xl" />

      <svg
        viewBox="0 0 640 200"
        className="w-full h-auto overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="aiGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main dashed path */}
        <path d="M 95 100 H 520" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 8" opacity="0.8">
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" />
        </path>
        
        

        {/* Branch from sources */}
        <path
          d="M 55 72 Q 80 72 95 100"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          opacity="0.45"
        />
        <path
          d="M 55 128 Q 80 128 95 100"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          opacity="0.45"
        />

        {/* Animated particles */}
        <PipelineParticle delay={0} />
        <PipelineParticle delay={1.1} />
        <PipelineParticle delay={2.2} />

        {/* Source: hh */}
        <g transform="translate(28, 52)">
          <circle r="22" fill="#d6001c" filter="url(#softGlow)" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="13"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            hh
          </text>
        </g>

        {/* Source: in */}
        <g transform="translate(28, 128)">
          <circle r="22" fill="#0a66c2" filter="url(#softGlow)" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="13"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            in
          </text>
        </g>

        {/* Document card */}
        <g transform="translate(200, 52)">
          <rect
            width="80"
            height="96"
            rx="12"
            fill="#16122a"
            stroke="#a78bfa"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          {/* lines */}
          <rect x="14" y="18" width="52" height="6" rx="2" fill="#a78bfa" opacity="0.45" />
          <rect x="14" y="32" width="44" height="5" rx="2" fill="#a78bfa" opacity="0.3" />
          <rect x="14" y="44" width="48" height="5" rx="2" fill="#a78bfa" opacity="0.25" />
          <rect x="14" y="56" width="36" height="5" rx="2" fill="#a78bfa" opacity="0.2" />
          <rect x="14" y="68" width="40" height="5" rx="2" fill="#a78bfa" opacity="0.18" />
          {/* scan overlay via foreignObject-like rect animated */}
          <rect
            className="doc-scan-rect"
            x="4"
            width="72"
            height="22"
            rx="4"
            fill="url(#aiGrad)"
            opacity="0.35"
          >
            <animate
              attributeName="y"
              values="8;70;8"
              dur="2.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.15;0.45;0.15"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* AI bars */}
        <g transform="translate(360, 55)">
          <text
            x="20"
            y="-12"
            textAnchor="middle"
            fill="#c4b5fd"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.08em"
          >
            ИИ
          </text>
          {/* glow */}
          <ellipse cx="20" cy="50" rx="36" ry="48" fill="#7c3aed" opacity="0.2" filter="url(#softGlow)" />
          <rect className="ai-bar" x="4" y="20" width="8" height="60" rx="3" fill="url(#aiGrad)">
            <animate
              attributeName="height"
              values="28;60;28"
              dur="1.1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="52;20;52"
              dur="1.1s"
              repeatCount="indefinite"
            />
          </rect>
          <rect className="ai-bar" x="16" y="12" width="8" height="68" rx="3" fill="url(#aiGrad)">
            <animate
              attributeName="height"
              values="40;68;40"
              dur="1.1s"
              begin="0.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="40;12;40"
              dur="1.1s"
              begin="0.2s"
              repeatCount="indefinite"
            />
          </rect>
          <rect className="ai-bar" x="28" y="24" width="8" height="56" rx="3" fill="url(#aiGrad)">
            <animate
              attributeName="height"
              values="24;56;24"
              dur="1.1s"
              begin="0.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="56;24;56"
              dur="1.1s"
              begin="0.4s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* Recruiter avatar */}
        <g transform="translate(520, 58)">
          <circle cx="32" cy="42" r="36" fill="#1e1838" stroke="#a78bfa" strokeOpacity="0.25" strokeWidth="1.5" />
          {/* head */}
          <circle cx="32" cy="30" r="12" fill="#4c3d6e" />
          {/* body */}
          <path d="M 14 62 Q 14 46 32 46 Q 50 46 50 62 Z" fill="#4c3d6e" />
          {/* check badge */}
          {showCheck && (
            <g>
              <circle cx="54" cy="18" r="11" fill="#22c55e" filter="url(#softGlow)" />
              <path
                d="M 49 18 L 52.5 21.5 L 59 14.5"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
          {!showCheck && (
            <circle cx="54" cy="18" r="11" fill="#22c55e" opacity="0.15" />
          )}
        </g>
      </svg>

      {/* Labels */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
        <div>
          <p className="font-medium text-white/80">Резюме с hh.ru</p>
          <p className="text-white/35">или LinkedIn</p>
        </div>
        <div>
          <p className="font-medium text-violet-glow">ИИ-скрининг</p>
        </div>
        <div>
          <p className="font-medium text-white/80">Живой рекрутер</p>
        </div>
      </div>
    </div>
  )
}

function PipelineParticle({ delay }: { delay: number }) {
  // SVG animateMotion along the pipeline
  return (
    <circle r="4.5" fill="#c084fc" filter="url(#softGlow)" opacity="0.95">
      <animateMotion
        dur="3.2s"
        begin={`${delay}s`}
        repeatCount="indefinite"
        path="M 50 100 C 120 100, 180 100, 240 100 S 340 100, 380 100 S 460 100, 530 100"
        keyPoints="0;1"
        keyTimes="0;1"
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.08;0.9;1"
        dur="3.2s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}
