// Серверная функция Vercel: ключ OpenRouter хранится только здесь, в браузер он не попадает.
const SYSTEM_PROMPT = `You are an expert ATS resume analyzer and career coach. Analyze the provided resume text and return ONLY a valid JSON object matching this exact schema. No markdown, no explanations outside JSON.

Schema:
{
  "overallScore": number (0-100),
  "trustIndex": number (0-100),
  "projectedScore": number (0-100, realistic improvement potential),
  "summary": string (1-2 short sentences in Russian about overall quality and main risk),
  "roles": [
    { "role": string, "score": number (0-100), "verdict": "recommend"|"consider"|"weak", "missing": string, "requirements": [ { "text": string, "ok": boolean, "quote": string | null } ] }
  ],
  "criteria": [
    { "id": string, "label": string, "score": number (0-10), "comment": string }
  ],
  "fixes": [
    { "problem": string, "current": string, "suggestion": string }
  ],
  "stats": {
    "experienceYears": number,
    "jobsCount": number,
    "avgMonths": number,
    "metricsCount": number,
    "techCount": number
  },
  "techStack": string[],
  "redFlags": string[],
  "extractedName": string | null,
  "extractedTitle": string | null
}

Rules:
- Write all human-readable text (summary, comments, fixes, redFlags) in Russian.
- Be critical but constructive. Point out weak metrics, vague bullets, timeline overlaps, missing quantifiable results, stack inflation.
- overallScore reflects current ATS/recruiter readiness.
- trustIndex reflects how credible and well-supported the claims look.
- Provide 3 roles, each with exactly 4 requirements typical for that role's vacancy. Set ok=true ONLY if the resume text explicitly contains it (check every technology literally: if Kubernetes is written in the resume, ok must be true); put a short verbatim quote from the resume in quote, or null if ok=false.
- Provide exactly 6 criteria; each comment is 1-2 short sentences, at most 130 characters.
- Provide exactly 5 concrete fixes (keep every field short) with specific 'current' text from the resume and a ready rewrite in 'suggestion'.
- Provide exactly 4 redFlags, each one short specific sentence. Output ONLY the JSON, no extra text.
- Extract 4-8 most relevant technologies into techStack.
- If resume is short or poor quality, reflect that in low scores.`

const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600_000)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > 15 // не больше 15 анализов в час с одного IP (в рамках одного инстанса)
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

export async function POST(request) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) return json({ error: 'На сервере не задан OPENROUTER_API_KEY' }, 500)

  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  if (limited(ip)) return json({ error: 'Слишком много запросов. Попробуйте через час.' }, 429)

  let text = ''
  try { text = (await request.json()).text } catch { /* ignore */ }
  if (typeof text !== 'string' || text.trim().length < 40) return json({ error: 'Слишком короткий текст резюме' }, 400)

  const model = process.env.OPENROUTER_MODEL || process.env.VITE_OPENROUTER_MODEL || 'anthropic/claude-sonnet-5.5'
  const makeBody = (m, retry) => JSON.stringify({
    model: m,
    temperature: 0.3,
    max_tokens: retry ? 5500 : 4000,
    reasoning: retry ? { enabled: false } : { effort: 'low' }, // на повторах полностью отключаем размышление, чтобы токены шли в ответ
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Проанализируй это резюме:\n\n${text.slice(0, 12000)}` },
    ],
  })

  // Цепочка моделей: основная → бесплатная Nemotron → бесплатный роутер. Если одна недоступна или медленная, берём следующую
  const chain = [...new Set([model, 'nvidia/nemotron-3-ultra-550b-a55b:free', 'openrouter/free'])]
  const started = Date.now()
  const BUDGET = 52000 // функция Vercel живёт максимум 60 с: укладываемся и отдаём понятную ошибку вместо 504
  let last = 'Пустой ответ от модели'

  for (let attempt = 0; attempt < chain.length + 1; attempt++) {
    const left = BUDGET - (Date.now() - started)
    if (left < 8000) break
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), attempt === 0 ? Math.min(left, 32000) : left)
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': request.headers.get('origin') || 'https://cvscore.app',
          'X-Title': 'CVScore',
        },
        body: makeBody(chain[attempt % chain.length], attempt > 0),
      })
      if (!res.ok) {
        last = `OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`
        if ([400, 402, 404, 429].includes(res.status) || res.status >= 500) continue
        return json({ error: last }, 502)
      }
      const data = await res.json()
      const choice = data.choices?.[0]
      let content = choice?.message?.content
      if (Array.isArray(content)) content = content.map((c) => c?.text || '').join('')
      // некоторые модели кладут ответ в поле reasoning
      if (!(typeof content === 'string' && /\{[\s\S]*\}/.test(content)) && typeof choice?.message?.reasoning === 'string' && /"trustIndex"/.test(choice.message.reasoning)) content = choice.message.reasoning
      if (typeof content === 'string' && /\{[\s\S]*\}/.test(content)) {
        console.log('model', data.model, 'tokens', JSON.stringify(data.usage || {}), 'ms', Date.now() - started)
        return json({ content, usage: data.usage || null, model: data.model || chain[attempt % chain.length] })
      }
      last = `Модель ${data.model || chain[attempt % chain.length]} вернула пустой ответ (finish_reason: ${choice?.finish_reason || '?'})`
      console.log(last)
    } catch (e) {
      last = e && e.name === 'AbortError' ? 'Модель отвечает слишком долго' : String(e)
      console.log(last)
    } finally {
      clearTimeout(timer)
    }
  }
  return json({ error: last + '. Попробуйте ещё раз.' }, 504)
}
