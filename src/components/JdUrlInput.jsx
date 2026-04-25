import { useState, useCallback } from 'react'
import { fetchJDFromUrl, detectSiteName, setProgressCallback } from '../utils/jdFetcher'

/**
 * 可复用的 URL 获取 JD 组件
 * @param {function} onJdFetched - 成功获取JD后的回调 (jdText: string) => void
 * @param {string} className - 可选的额外样式
 */
export default function JdUrlInput({ onJdFetched, className = '' }) {
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [fetchSuccess, setFetchSuccess] = useState(false)
  const [detectedSite, setDetectedSite] = useState(null)
  const [progressMsg, setProgressMsg] = useState('')
  const [usedStrategy, setUsedStrategy] = useState('')

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.match(/^https?:\/\//i) || pastedText.includes('.com/') || pastedText.includes('.cn/')) {
      setUrl(pastedText)
      setDetectedSite(detectSiteName(pastedText))
    }
  }

  const handleUrlChange = (e) => {
    const val = e.target.value
    setUrl(val)
    setFetchError('')
    setFetchSuccess(false)
    setUsedStrategy('')
    if (val.trim()) {
      setDetectedSite(detectSiteName(val))
    } else {
      setDetectedSite(null)
    }
  }

  const handleFetch = useCallback(async () => {
    if (!url.trim() || fetching) return

    setFetching(true)
    setFetchError('')
    setFetchSuccess(false)
    setUsedStrategy('')
    setProgressMsg('正在准备获取...')

    // 注册进度回调
    setProgressCallback((msg) => {
      setProgressMsg(msg)
    })

    try {
      const result = await fetchJDFromUrl(url)

      if (result.success) {
        setFetchSuccess(true)
        setUsedStrategy(result.strategy || '')
        onJdFetched(result.jdText)
        setTimeout(() => setFetchSuccess(false), 4000)
      } else {
        setFetchError(result.error)
      }
    } catch (err) {
      setFetchError(err.message || '获取失败')
    } finally {
      setFetching(false)
      setProgressMsg('')
      setProgressCallback(null)
    }
  }, [url, fetching, onJdFetched])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFetch()
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* URL Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {/* Link icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>

          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="粘贴招聘链接，自动获取JD内容..."
            className="w-full pl-10 pr-4 py-2.5 bg-navy-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
          />

          {/* Site badge */}
          {detectedSite && url.trim() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
              <span>{detectedSite.icon}</span>
              <span>{detectedSite.name}</span>
            </div>
          )}
        </div>

        {/* Fetch button */}
        <button
          onClick={handleFetch}
          disabled={!url.trim() || fetching}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            url.trim() && !fetching
              ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-md shadow-indigo-500/20'
              : 'text-slate-600 bg-slate-800 cursor-not-allowed'
          }`}
        >
          {fetching ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
              </svg>
              获取中
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              获取JD
            </>
          )}
        </button>
      </div>

      {/* Progress message */}
      {progressMsg && (
        <div className="flex items-center gap-2 text-xs text-indigo-400 animate-fade-in">
          <svg className="animate-spin flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
          </svg>
          <span>{progressMsg}</span>
        </div>
      )}

      {/* Status messages */}
      {fetchError && (
        <div className="flex items-start gap-2 text-xs text-amber-400 animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{fetchError}</span>
        </div>
      )}

      {fetchSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>
            JD 内容获取成功！{usedStrategy && <span className="text-slate-500">（通过{usedStrategy}）</span>}
            已自动填入下方文本框。
          </span>
        </div>
      )}

      {/* Supported sites hint */}
      {!url.trim() && !fetchError && !fetchSuccess && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <span>支持：</span>
          <span className="flex items-center gap-1">🔵 字节跳动</span>
          <span>·</span>
          <span className="flex items-center gap-1">🟢 Boss直聘</span>
          <span>·</span>
          <span className="flex items-center gap-1">🟡 拉勾</span>
          <span>·</span>
          <span className="flex items-center gap-1">🔷 LinkedIn</span>
          <span>·</span>
          <span>及其他招聘网站</span>
        </div>
      )}
    </div>
  )
}
