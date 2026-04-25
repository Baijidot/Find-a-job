import { useEffect, useRef, useState } from 'react'
import { downloadHtmlReport, downloadMarkdownReport, exportReportToPdf } from '../utils/reportExport'

const EXPORT_OPTIONS = [
  { id: 'html', label: '导出 HTML', run: downloadHtmlReport },
  { id: 'pdf', label: '导出 PDF', run: exportReportToPdf },
  { id: 'markdown', label: '导出 Markdown', run: downloadMarkdownReport },
]

export default function ReportExportMenu({ record, label = '导出报告', className = '' }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleExport = (run) => {
    try {
      run(record)
      setError('')
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败，请重试')
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(value => !value)}
        className={className}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden z-20">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option.run)}
              className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-red-500/20 bg-slate-950/95 px-3 py-2 text-xs text-red-300 shadow-2xl z-30">
          {error}
        </div>
      )}
    </div>
  )
}
