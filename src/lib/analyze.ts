import type { AnalyzeResult } from './types'

export async function analyzeResume(text: string): Promise<AnalyzeResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    let msg = ''
    try { msg = (await res.json()).error } catch { /* ignore */ }
    throw new Error(msg || `Ошибка сервера ${res.status}`)
  }
  const data = await res.json()
  if (data.usage) console.info('Расход токенов:', data.usage)
  const content: string | undefined = data.content
  if (!content) throw new Error('Пустой ответ от модели')

  // Extract JSON (model might wrap it in ```json)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Модель не вернула JSON')

  try {
    const parsed = JSON.parse(jsonMatch[0]) as AnalyzeResult
    // Basic sanity
    if (typeof parsed.overallScore !== 'number') throw new Error('Некорректный формат ответа')
    return parsed
  } catch (e) {
    console.error('Parse error:', content)
    throw new Error('Не удалось разобрать ответ ИИ. Попробуйте ещё раз.')
  }
}
