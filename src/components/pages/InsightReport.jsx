import { useState } from 'react'
import JdUrlInput from '../JdUrlInput'
import { generateInsight } from '../../utils/ai'
import { getHistory } from '../../utils/storage'
import useAnalysisTask from '../../hooks/useAnalysisTask'

export default function InsightReport() {
  const [jdText, setJdText] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const {
    result: report,
    loading,
    error,
    loadingStep,
    execute,
  } = useAnalysisTask({
    type: 'insight',
    fallbackErrorMessage: '生成洞察报告失败，请重试',
    runAnalysis: async ({ jd }, setStep) => {
      setStep('正在分析岗位趋势...')
      return generateInsight(jd)
    },
    createHistoryRecord: ({ jd }, output) => ({
      jdText: jd,
      title: '洞察报告',
      results: output,
    }),
  })

  const history = getHistory()

  const handleGenerate = async () => {
    if (!jdText.trim()) return
    await execute({ jd: jdText })
  }

  const handleLoadHistory = (record) => {
    setJdText(record.jdText || '')
    setShowHistory(false)
  }

  const getHeatColor = (heat) => {
    if (heat === '高') return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (heat === '中') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  }

  const getRiskColor = (level) => {
    if (level === '高') return 'border-red-500/20 bg-red-500/5'
    if (level === '中') return 'border-amber-500/20 bg-amber-500/5'
    return 'border-blue-500/20 bg-blue-500/5'
  }

  const getRiskBadgeColor = (level) => {
    if (level === '高') return 'from-red-500 to-red-600'
    if (level === '中') return 'from-amber-500 to-orange-500'
    return 'from-blue-500 to-indigo-500'
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">洞察报告</h1>
        <p className="text-sm text-slate-500 mt-1">基于历史分析数据生成的深度洞察</p>
      </div>

      {/* JD Input Area */}
      <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">粘贴职位描述 (JD)</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {showHistory ? '收起历史' : '从历史加载'}
          </button>
        </div>

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-navy-900/80 border border-white/10 animate-fade-in">
            <h4 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">历史记录</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 5).map((record) => (
                <button
                  key={record.id}
                  onClick={() => handleLoadHistory(record)}
                  className="w-full text-left p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-indigo-500/20 transition-all duration-200"
                >
                  <p className="text-sm text-slate-300 truncate">{record.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{record.createdAt ? new Date(record.createdAt).toLocaleDateString('zh-CN') : ''}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* URL 获取 */}
        <JdUrlInput onJdFetched={(text) => setJdText(text)} className="mb-4" />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[11px] text-slate-600">或直接粘贴 JD 文本</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Textarea */}
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="请在此粘贴完整的职位描述（JD），AI 将为你生成深度洞察报告..."
          className="w-full h-48 bg-navy-900/80 border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
        />

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!jdText.trim() || loading}
          className={`w-full mt-4 py-4 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
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
              {loadingStep || '生成中...'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.09 8.26L20 9.27L15.54 13.47L16.82 19.27L12 16.02L7.18 19.27L8.46 13.47L4 9.27L9.91 8.26L12 2Z" fill="white" />
              </svg>
              生成洞察报告
            </>
          )}
        </button>
      </div>

      {/* Empty State */}
      {!report && !loading && (
        <div className="glass-card rounded-2xl p-12 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
              <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-slate-400 mb-2">暂无洞察数据</h3>
          <p className="text-sm text-slate-600">请先分析一个JD，即可生成深度洞察报告</p>
        </div>
      )}

      {/* Report Results */}
      {report && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          {report.summary && (
            <div className="glass-card rounded-2xl p-6">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <h4 className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  整体洞察
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
              </div>
            </div>
          )}

          {/* Trend Analysis */}
          {report.trend && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">岗位趋势分析</h3>
                  <p className="text-xs text-slate-500">市场热度与薪资趋势</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Market Heat */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-24 flex-shrink-0">市场热度</span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getHeatColor(report.trend.marketHeat)}`}>
                    {report.trend.marketHeat}
                  </span>
                </div>
                {/* Demand Trend */}
                {report.trend.demandTrend && (
                  <div>
                    <span className="text-sm text-slate-400">需求趋势</span>
                    <p className="text-sm text-slate-300 mt-1">{report.trend.demandTrend}</p>
                  </div>
                )}
                {/* Salary */}
                <div className="grid grid-cols-2 gap-4">
                  {report.trend.salaryRange && (
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-xs text-emerald-400 font-medium">薪资范围</span>
                      <p className="text-sm text-slate-300 mt-1">{report.trend.salaryRange}</p>
                    </div>
                  )}
                  {report.trend.salaryTrend && (
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <span className="text-xs text-blue-400 font-medium">薪资趋势</span>
                      <p className="text-sm text-slate-300 mt-1">{report.trend.salaryTrend}</p>
                    </div>
                  )}
                </div>
                {/* Trend Insights */}
                {Array.isArray(report.trend.insights) && report.trend.insights.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-slate-400">趋势洞察</span>
                    {report.trend.insights.map((insight, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-slate-300">
                        {insight}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Industry Benchmark */}
          {Array.isArray(report.benchmark) && report.benchmark.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">行业对标</h3>
                  <p className="text-xs text-slate-500">同类岗位对比分析</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {report.benchmark.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-pink-500/10 bg-pink-500/[0.02]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{item.role}</span>
                        {item.similarity && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                            相似度 {item.similarity}
                          </span>
                        )}
                      </div>
                      {item.differences && (
                        <p className="text-xs text-slate-400 mb-1"><span className="text-slate-500">差异：</span>{item.differences}</p>
                      )}
                      {item.advantages && (
                        <p className="text-xs text-slate-400"><span className="text-slate-500">优势：</span>{item.advantages}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Career Paths */}
          {Array.isArray(report.careerPaths) && report.careerPaths.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">职业发展路径建议</h3>
                  <p className="text-xs text-slate-500">可行的职业发展方向</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {report.careerPaths.map((path, i) => {
                  const pathColors = [
                    'border-indigo-500/20 bg-indigo-500/[0.02]',
                    'border-pink-500/20 bg-pink-500/[0.02]',
                    'border-emerald-500/20 bg-emerald-500/[0.02]',
                  ]
                  const titleColors = ['text-indigo-300', 'text-pink-300', 'text-emerald-300']
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${pathColors[i % pathColors.length]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-sm font-semibold ${titleColors[i % titleColors.length]}`}>
                          {path.direction}
                        </h4>
                        {path.timeline && (
                          <span className="text-xs text-slate-500">{path.timeline}</span>
                        )}
                      </div>
                      {path.description && (
                        <p className="text-sm text-slate-300 mb-2">{path.description}</p>
                      )}
                      {path.nextStep && (
                        <div className="mt-2 p-2 rounded-lg bg-white/[0.03]">
                          <span className="text-xs text-slate-500">下一步：</span>
                          <span className="text-xs text-slate-300">{path.nextStep}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Risk Alerts */}
          {Array.isArray(report.risks) && report.risks.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">关键风险提示</h3>
                  <p className="text-xs text-slate-500">需要关注的风险点</p>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {report.risks.map((risk, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${getRiskColor(risk.level)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r ${getRiskBadgeColor(risk.level)} text-white font-medium`}>
                        {risk.level}风险
                      </span>
                      <span className="text-sm font-medium text-white">{risk.title}</span>
                    </div>
                    {risk.description && (
                      <p className="text-sm text-slate-400 mb-2">{risk.description}</p>
                    )}
                    {risk.suggestion && (
                      <div className="p-2 rounded-lg bg-white/[0.03]">
                        <span className="text-xs text-slate-500">应对建议：</span>
                        <span className="text-xs text-slate-300">{risk.suggestion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
