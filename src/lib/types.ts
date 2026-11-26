export type RoleScore = {
  role: string
  score: number
  verdict: 'recommend' | 'consider' | 'weak'
  missing: string
  requirements?: { text: string; ok: boolean; quote?: string | null }[]
}

export type TrustCriterion = {
  id: string
  label: string
  score: number // 0-10
  comment: string
}

export type FixItem = {
  problem: string
  current: string
  suggestion: string
}

export type AnalyzeResult = {
  overallScore: number
  trustIndex: number
  projectedScore: number
  summary: string
  roles: RoleScore[]
  criteria: TrustCriterion[]
  fixes: FixItem[]
  stats: {
    experienceYears: number
    jobsCount: number
    avgMonths: number
    metricsCount: number
    techCount: number
  }
  techStack: string[]
  redFlags: string[]
  extractedName?: string
  extractedTitle?: string
}

export type PricingTier = 'free' | 'basic' | 'pro'
