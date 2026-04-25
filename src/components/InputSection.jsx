import { useRef } from 'react'
import JdUrlInput from './JdUrlInput'

export default function InputSection({ jdText, onTextChange, onAnalyze, onTrySample, loading, error }) {
  const textareaRef = useRef(null)
  const charCount = jdText.length
  const maxChars = 20000

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onAnalyze()
    }
  }

  const handleJdFetched = (fetchedText) => {
    onTextChange(fetchedText)
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="glass-card rounded-2xl p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">粘贴职位描述 (JD)</h2>
          <button
            onClick={onTrySample}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            试试示例 JD →
          </button>
        </div>

        {/* URL Input */}
        <JdUrlInput onJdFetched={handleJdFetched} className="mb-4" />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[11px] text-slate-600">或直接粘贴 JD 文本</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={jdText}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请在此粘贴完整的职位描述（JD）..."
            className="w-full h-64 bg-navy-900/80 border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
          />
          <div className="absolute bottom-3 right-4 text-xs text-slate-600">
            {charCount.toLocaleString()} / {maxChars.toLocaleString()} 字符
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            你的数据安全保密，不会被用于训练模型或泄露。
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            小贴士：粘贴完整的 JD 可获得更准确的分析结果
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={!jdText.trim() || loading}
        className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          jdText.trim() && !loading
            ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-400 hover:to-pink-400 glow-purple shadow-lg shadow-indigo-500/25'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
            </svg>
            分析中...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="btn-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#fff" />
                </linearGradient>
              </defs>
              <path d="M12 2L14.09 8.26L20 9.27L15.54 13.47L16.82 19.27L12 16.02L7.18 19.27L8.46 13.47L4 9.27L9.91 8.26L12 2Z" fill="url(#btn-sparkle)" />
            </svg>
            立即分析
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      {/* Keyboard shortcut hint */}
      <p className="text-center text-xs text-slate-600 mt-3">
        按 <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">Enter</kbd> 快速分析
      </p>
    </div>
  )
}
