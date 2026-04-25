import { useState } from 'react'
import JdUrlInput from '../JdUrlInput'
import { compareJDs } from '../../utils/ai'
import useAnalysisTask from '../../hooks/useAnalysisTask'

export default function CompareAnalysis() {
  const [jd1Title, setJd1Title] = useState('')
  const [jd1Text, setJd1Text] = useState('')
  const [jd2Title, setJd2Title] = useState('')
  const [jd2Text, setJd2Text] = useState('')
  const {
    result,
    loading,
    error,
    execute,
  } = useAnalysisTask({
    type: 'compare',
    fallbackErrorMessage: '对比分析失败，请重试',
    runAnalysis: ({ jdA, jdB, titleA, titleB }) => compareJDs(jdA, jdB, titleA, titleB),
    createHistoryRecord: ({ titleA, titleB }, output) => ({
      jdText: `${titleA || '职位A'}\n${titleB || '职位B'}`,
      title: '职位对比分析',
      results: output,
    }),
  })

  const handleCompare = async () => {
    if (!jd1Text.trim() || !jd2Text.trim()) return
    await execute({
      jdA: jd1Text,
      jdB: jd2Text,
      titleA: jd1Title,
      titleB: jd2Title,
    })
  }

  const getAdvantageLabel = (advantage) => {
    if (advantage === 'A') return { text: jd1Title || '职位A', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' }
    if (advantage === 'B') return { text: jd2Title || '职位B', color: 'text-pink-300 bg-pink-500/10 border-pink-500/20' }
    return { text: '持平', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
  }

  const getRecommendationColor = (choice) => {
    if (choice === 'A') return 'from-indigo-500 to-indigo-600'
    if (choice === 'B') return 'from-pink-500 to-pink-600'
    return 'from-amber-500 to-orange-500'
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">对比分析</h1>
        <p className="text-sm text-slate-500 mt-1">对比多个JD，找到最适合你的岗位</p>
      </div>

      {/* JD Input Area */}
      <div className="grid grid-cols-2 gap-6 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        {/* JD 1 */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-400">A</span>
            </div>
            <h2 className="text-base font-medium text-white">职位 A</h2>
          </div>
          <input
            type="text"
            value={jd1Title}
            onChange={(e) => setJd1Title(e.target.value)}
            placeholder="输入职位标题（可选）"
            className="w-full mb-3 bg-navy-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
          />
          {/* URL 获取 */}
          <JdUrlInput onJdFetched={(text) => setJd1Text(text)} className="mb-4" />

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-slate-600">或直接粘贴 JD 文本</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <textarea
            value={jd1Text}
            onChange={(e) => setJd1Text(e.target.value)}
            placeholder="请粘贴第一个职位描述（JD）..."
            className="w-full h-56 bg-navy-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>

        {/* JD 2 */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-pink-400">B</span>
            </div>
            <h2 className="text-base font-medium text-white">职位 B</h2>
          </div>
          <input
            type="text"
            value={jd2Title}
            onChange={(e) => setJd2Title(e.target.value)}
            placeholder="输入职位标题（可选）"
            className="w-full mb-3 bg-navy-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
          />
          {/* URL 获取 */}
          <JdUrlInput onJdFetched={(text) => setJd2Text(text)} className="mb-4" />

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-slate-600">或直接粘贴 JD 文本</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <textarea
            value={jd2Text}
            onChange={(e) => setJd2Text(e.target.value)}
            placeholder="请粘贴第二个职位描述（JD）..."
            className="w-full h-56 bg-navy-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          {error}
        </div>
      )}

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={!jd1Text.trim() || !jd2Text.trim() || loading}
        className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${
          jd1Text.trim() && jd2Text.trim() && !loading
            ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-indigo-400 hover:to-pink-400 glow-purple shadow-lg shadow-indigo-500/25'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
            </svg>
            正在对比分析...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            开始对比
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Similarity Score */}
          {result.similarityScore !== undefined && (
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/5 border border-indigo-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">相似度评分</h3>
                  <p className="text-xs text-slate-500">两个岗位的相似程度</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.similarityScore / 100) * 314.16} 314.16`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{result.similarityScore}</span>
                    <span className="text-xs text-slate-500">相似度</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {Array.isArray(result.comparison) && result.comparison.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">优势对比</h3>
                  <p className="text-xs text-slate-500">多维度对比分析</p>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4 w-28">对比维度</th>
                      <th className="text-left text-xs font-medium text-indigo-400 pb-3 pr-4">{jd1Title || '职位A'}</th>
                      <th className="text-left text-xs font-medium text-pink-400 pb-3 pr-4">{jd2Title || '职位B'}</th>
                      <th className="text-left text-xs font-medium text-slate-500 pb-3 w-24">优势方</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparison.map((item, i) => {
                      const adv = getAdvantageLabel(item.advantage)
                      return (
                        <tr key={i} className="border-b border-white/[0.03] last:border-0">
                          <td className="py-3 pr-4 text-sm font-medium text-slate-300">{item.dimension}</td>
                          <td className="py-3 pr-4 text-sm text-slate-400">{item.jd1}</td>
                          <td className="py-3 pr-4 text-sm text-slate-400">{item.jd2}</td>
                          <td className="py-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${adv.color}`}>
                              {adv.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Differences */}
          {Array.isArray(result.differences) && result.differences.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">差异分析</h3>
                  <p className="text-xs text-slate-500">两个岗位的主要差异</p>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {result.differences.map((diff, i) => (
                  <div key={i} className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/[0.02] text-sm text-slate-300 leading-relaxed">
                    {diff}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">推荐结论</h3>
                  <p className="text-xs text-slate-500">AI 给你的选择建议</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-slate-400">推荐选择：</span>
                  <span className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${getRecommendationColor(result.recommendation.choice)} text-white font-semibold`}>
                    {result.recommendation.choice === 'A' ? (jd1Title || '职位A') : result.recommendation.choice === 'B' ? (jd2Title || '职位B') : '视情况而定'}
                  </span>
                </div>
                {result.recommendation.reason && (
                  <p className="text-sm text-slate-300 leading-relaxed mb-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    {result.recommendation.reason}
                  </p>
                )}
                {Array.isArray(result.recommendation.details) && result.recommendation.details.length > 0 && (
                  <div className="space-y-2">
                    {result.recommendation.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400 mt-0.5 flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="glass-card rounded-2xl p-12 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-slate-400 mb-2">输入两个JD开始对比</h3>
          <p className="text-sm text-slate-600">在上方分别粘贴两个职位描述，AI 将为你多维度对比分析</p>
        </div>
      )}
    </div>
  )
}
