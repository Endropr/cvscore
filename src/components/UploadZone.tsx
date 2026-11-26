import { useCallback, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
// legacy-сборка pdf.js работает и на старых телефонах; воркер входит в сборку сайта (без CDN)
// @ts-ignore: у legacy-сборки нет отдельных типов
import * as legacyPdf from 'pdfjs-dist/legacy/build/pdf.mjs'
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

const pdfjsLib = legacyPdf as unknown as typeof import('pdfjs-dist')
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

type Props = {
  onAnalyze: (text: string) => void
  loading: boolean
}

async function extractPdfText(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjsLib.getDocument({ data }).promise
  let out = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    for (const it of content.items as any[]) {
      if ('str' in it) out += it.str + (it.hasEOL ? '\n' : ' ')
    }
    out += '\n\n'
  }
  return out.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

// DOCX — это zip: достаём word/document.xml и убираем разметку
async function extractDocxText(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer())
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('not a zip')
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break
    const method = dv.getUint16(p + 10, true)
    const csize = dv.getUint32(p + 20, true)
    const nlen = dv.getUint16(p + 28, true)
    const elen = dv.getUint16(p + 30, true)
    const clen = dv.getUint16(p + 32, true)
    const lho = dv.getUint32(p + 42, true)
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nlen))
    if (name === 'word/document.xml') {
      const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true)
      const raw = buf.subarray(start, start + csize)
      const xml = new TextDecoder().decode(method === 0 ? raw : await inflateRaw(raw))
      return xml
        .replace(/<\/w:p>/g, '\n').replace(/<w:tab\/>/g, '\t').replace(/<w:br\/>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
        .trim()
    }
    p += 46 + nlen + elen + clen
  }
  throw new Error('document.xml not found')
}

export function UploadZone({ onAnalyze, loading }: Props) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setFileName(file.name)
    setExtracting(true)
    const name = file.name.toLowerCase()
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
    try {
      let t = ''
      if (file.type === 'text/plain' || name.endsWith('.txt')) t = await file.text()
      else if (isPdf) t = await extractPdfText(file)
      else if (name.endsWith('.docx')) t = await extractDocxText(file)
      else {
        setError('Этот формат не читается. Загрузите PDF, DOCX или TXT либо вставьте текст вручную.')
        return
      }
      if (t.trim().length < 40) {
        setText('')
        setError(isPdf ? 'В PDF не найден текст: похоже, это скан или картинка. Вставьте текст вручную.' : 'В файле не нашлось текста.')
        return
      }
      setText(t)
    } catch (e) {
      console.error(e)
      setError('Не удалось прочитать файл. Попробуйте другой файл или вставьте текст вручную.')
    } finally {
      setExtracting(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDrag(false)
      const f = e.dataTransfer.files?.[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          drag
            ? 'border-violet-glow bg-violet-deep/10'
            : 'border-violet-glow/15 bg-void-800/50 hover:border-white/20 hover:bg-void-700/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
        <Upload className="mx-auto h-8 w-8 text-white/30 mb-3" />
        <p className="text-sm font-medium text-white/80">
          Загрузить PDF / DOCX или перетащить файл
        </p>
        <p className="mt-1 text-xs text-white/40">
          PDF, DOCX и TXT читаются автоматически · или вставьте текст
        </p>
        {fileName && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
            <FileText className="h-3.5 w-3.5" />
            {fileName}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFileName(null)
                setError(null)
                setText('')
              }}
              className="ml-1 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setError(null) }}
        placeholder="Или вставьте текст резюме сюда…"
        rows={8}
        className="w-full resize-y rounded-xl border border-violet-glow/15 bg-void-900/80 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-violet-glow/50 focus:outline-none focus:ring-1 focus:ring-violet-glow/30"
      />

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading || extracting || text.trim().length < 40}
          onClick={() => onAnalyze(text)}
          className="rounded-full btn-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-glow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Анализируем…
            </span>
          ) : extracting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Читаем файл…
            </span>
          ) : (
            'Оценить резюме'
          )}
        </motion.button>
        <span className="text-xs text-white/25 ml-auto">{text.length} символов</span>
      </div>
    </div>
  )
}
