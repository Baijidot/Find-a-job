import { useMemo, useState } from 'react'
import AnalysisRecordContent from './AnalysisRecordContent'
import ReportExportMenu from './ReportExportMenu'
import { addFavorite, getFavorites, isFavorited, removeFavorite } from '../utils/storage'
import { createRecordFingerprint } from '../utils/resultModel'

export default function ResultPanel({ results, jdText, onBack }) {
  const baseRecord = useMemo(() => ({
    type: 'analyze',
    jdText,
    title: 'JD 分析报告',
    results,
  }), [jdText, results])

  const [, setFavoriteVersion] = useState(0)

  const fingerprint = useMemo(() => createRecordFingerprint(baseRecord), [baseRecord])
  const favorited = isFavorited(fingerprint)

  const handleFavorite = () => {
    if (favorited) {
      const favorites = getFavorites()
      const matched = favorites.find((item) => item.fingerprint === fingerprint)
      if (matched) {
        removeFavorite(matched.id)
      }
      setFavoriteVersion((version) => version + 1)
      return
    }

    addFavorite(baseRecord)
    setFavoriteVersion((version) => version + 1)
  }

  return (
    <div>
      {/* Back button & title */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">分析结果</h2>
            <p className="text-sm text-slate-500 mt-0.5">基于 AI 深度解析的 JD 分析报告</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ReportExportMenu
            record={{
              ...baseRecord,
              createdAt: new Date().toISOString(),
            }}
            label="导出报告"
            className="px-4 py-2 rounded-lg text-sm text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-2"
          />
          <button
            onClick={handleFavorite}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
              favorited
                ? 'text-pink-200 bg-pink-500/15 border border-pink-400/20 hover:bg-pink-500/20'
                : 'text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {favorited ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>

      {/* Result Cards */}
      <div className="space-y-6">
        <AnalysisRecordContent record={baseRecord} />
      </div>
    </div>
  )
}
