import { useState } from 'react'
import JdUrlInput from '../JdUrlInput'
import { extractSkillMap } from '../../utils/ai'
import useAnalysisTask from '../../hooks/useAnalysisTask'

export default function SkillExtract() {
  const [jdText, setJdText] = useState('')
  const {
    result,
    loading,
    error,
    loadingStep,
    execute,
  } = useAnalysisTask({
    type: 'skills',
    fallbackErrorMessage: '技能提取失败，请重试',
    runAnalysis: async ({ jd }, setStep) => {
      setStep('正在提取技能要求...')
      return extractSkillMap(jd)
    },
    createHistoryRecord: ({ jd }, output) => ({
      jdText: jd,
      title: '技能全景图',
      results: output,
    }),
  })

  const handleExtract = async () => {
    if (!jdText.trim()) return
    await execute({ jd: jdText })
  }

  const getMatchColor = (match) => {
    if (match >= 90) return 'from-red-500 to-red-600'
    if (match >= 70) return 'from-orange-500 to-amber-500'
    if (match >= 50) return 'from-blue-500 to-indigo-500'
    if (match >= 30) return 'from-emerald-500 to-teal-500'
    return 'from-slate-500 to-slate-600'
  }

  const getMatchBarColor = (match) => {
    if (match >= 90) return 'bg-gradient-to-r from-red-500 to-red-600'
    if (match >= 70) return 'bg-gradient-to-r from-orange-500 to-amber-500'
    if (match >= 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500'
    if (match >= 30) return 'bg-gradient-to-r from-emerald-500 to-teal-500'
    return 'bg-gradient-to-r from-slate-500 to-slate-600'
  }

  const getCategoryStyle = (name) => {
    if (name.includes('技术')) return { border: 'border-indigo-500/20', bg: 'bg-indigo-500/[0.02]', text: 'text-indigo-300', icon: 'code' }
    if (name.includes('软')) return { border: 'border-pink-500/20', bg: 'bg-pink-500/[0.02]', text: 'text-pink-300', icon: 'users' }
    return { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.02]', text: 'text-emerald-300', icon: 'wrench' }
  }

  // CSS Radar Chart - hexagonal shape
  const renderRadarChart = (dimensions) => {
    if (!dimensions || dimensions.length < 6) return null

    const size = 220
    const center = size / 2
    const maxRadius = 90

    // Generate 6 points evenly around a circle (hexagonal)
    const getPoint = (index, value) => {
      const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
      const radius = (value / 100) * maxRadius
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      }
    }

    // Grid levels
    const levels = [20, 40, 60, 80, 100]

    // Data polygon points
    const dataPoints = dimensions.map((d, i) => getPoint(i, d.score))
    const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

    // Label positions (slightly outside)
    const labelPositions = dimensions.map((d, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
      const labelRadius = maxRadius + 28
      return {
        x: center + labelRadius * Math.cos(angle),
        y: center + labelRadius * Math.sin(angle),
      }
    })

    return (
      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid levels */}
            {levels.map((level) => {
              const points = [0, 1, 2, 3, 4, 5].map(i => {
                const p = getPoint(i, level)
                return `${p.x},${p.y}`
              }).join(' ')
              return (
                <polygon
                  key={level}
                  points={points}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.1)"
                  strokeWidth="1"
                />
              )
            })}

            {/* Axis lines */}
            {[0, 1, 2, 3, 4, 5].map(i => {
              const p = getPoint(i, 100)
              return (
                <line
                  key={i}
                  x1={center} y1={center}
                  x2={p.x} y2={p.y}
                  stroke="rgba(99, 102, 241, 0.1)"
                  strokeWidth="1"
                />
              )
            })}

            {/* Data polygon */}
            <polygon
              points={dataPolygon}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="rgba(99, 102, 241, 0.6)"
              strokeWidth="2"
            />

            {/* Data points */}
            {dataPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x} cy={p.y}
                r="4"
                fill="#6366f1"
                stroke="#0a0f1c"
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Labels */}
          {dimensions.map((d, i) => {
            const pos = labelPositions[i]
            const textAlign = i === 0 ? 'center' : i <= 2 ? 'left' : i >= 4 ? 'right' : 'center'
            const verticalAlign = i === 0 ? 'bottom' : i === 3 ? 'top' : 'middle'
            return (
              <div
                key={i}
                className="absolute text-xs text-slate-400 whitespace-nowrap"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: `translate(-50%, ${verticalAlign === 'top' ? '0' : verticalAlign === 'bottom' ? '-100%' : '-50%'})`,
                  textAlign,
                }}
              >
                <span className="font-medium text-slate-300">{d.name}</span>
                <span className="ml-1 text-indigo-400">{d.score}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">技能提取</h1>
        <p className="text-sm text-slate-500 mt-1">从JD中精准提取技能要求</p>
      </div>

      {/* JD Input Area */}
      <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-lg font-medium text-white mb-4">粘贴职位描述 (JD)</h2>

        {/* URL 获取 */}
        <JdUrlInput onJdFetched={(text) => setJdText(text)} className="mb-4" />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[11px] text-slate-600">或直接粘贴 JD 文本</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="请在此粘贴完整的职位描述（JD），AI 将为你精准提取技能要求..."
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

        {/* Extract Button */}
        <button
          onClick={handleExtract}
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
              {loadingStep || '提取中...'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
              提取技能
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          {result.summary && (
            <div className="glass-card rounded-2xl p-6">
              <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
                <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              </div>
            </div>
          )}

          {/* Radar Chart */}
          {result.radarDimensions && result.radarDimensions.length >= 6 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    <line x1="12" y1="22" x2="12" y2="15.5" /><line x1="22" y1="8.5" x2="12" y2="15.5" /><line x1="2" y1="8.5" x2="12" y2="15.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">技能雷达图</h3>
                  <p className="text-xs text-slate-500">核心能力维度分布</p>
                </div>
              </div>
              <div className="p-6">
                <div className="py-4">
                  {renderRadarChart(result.radarDimensions)}
                </div>
              </div>
            </div>
          )}

          {/* Skill Categories */}
          {Array.isArray(result.categories) && result.categories.map((category, catIdx) => {
            const style = getCategoryStyle(category.name)
            return (
              <div key={catIdx} className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.bg} border ${style.border} flex items-center justify-center`}>
                    {style.icon === 'code' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={style.text}>
                        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                      </svg>
                    )}
                    {style.icon === 'users' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={style.text}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                    )}
                    {style.icon === 'wrench' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={style.text}>
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{category.name}</h3>
                    <p className="text-xs text-slate-500">{Array.isArray(category.skills) ? category.skills.length : 0} 项技能</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {Array.isArray(category.skills) && category.skills.map((skill, skillIdx) => (
                    <div key={skillIdx} className={`p-4 rounded-xl border ${style.border} ${style.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{skill.name}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r ${getMatchColor(skill.match)} text-white font-medium`}>
                          {skill.match}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-navy-900/80 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full ${getMatchBarColor(skill.match)} transition-all duration-700`}
                          style={{ width: `${skill.match}%` }}
                        />
                      </div>

                      {skill.description && (
                        <p className="text-xs text-slate-400 mb-2">{skill.description}</p>
                      )}

                      {skill.resource && (
                        <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-white/[0.03]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 flex-shrink-0 mt-0.5">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          </svg>
                          <span className="text-xs text-slate-400">{skill.resource}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
