import { useState } from 'react'
import JdUrlInput from '../JdUrlInput'
import { breakdownRole } from '../../utils/ai'
import useAnalysisTask from '../../hooks/useAnalysisTask'

export default function RoleBreakdown() {
  const [jdText, setJdText] = useState('')
  const {
    result,
    loading,
    error,
    loadingStep,
    execute,
  } = useAnalysisTask({
    type: 'roles',
    fallbackErrorMessage: '角色拆解失败，请重试',
    runAnalysis: async ({ jd }, setStep) => {
      setStep('正在拆解岗位角色...')
      return breakdownRole(jd)
    },
    createHistoryRecord: ({ jd }, output) => ({
      jdText: jd,
      title: '岗位角色拆解',
      results: output,
    }),
  })

  const handleBreakdown = async () => {
    if (!jdText.trim()) return
    await execute({ jd: jdText })
  }

  const getBarColor = (index) => {
    const colors = [
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-emerald-500 to-emerald-600',
      'from-amber-500 to-amber-600',
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-cyan-500 to-cyan-600',
      'from-rose-500 to-rose-600',
    ]
    return colors[index % colors.length]
  }

  const getFrequencyColor = (freq) => {
    if (freq.includes('频繁')) return 'text-red-400 bg-red-500/10 border-red-500/20'
    if (freq.includes('定期')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }

  // CSS Pie Chart
  const renderPieChart = (timeAllocation) => {
    if (!timeAllocation || timeAllocation.length === 0) return null

    const pieColors = [
      '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e',
    ]

    // Build conic-gradient
    let cumulative = 0
    const gradientStops = timeAllocation.map((item, i) => {
      const start = cumulative
      cumulative += item.percentage
      const color = pieColors[i % pieColors.length]
      return `${color} ${start}% ${cumulative}%`
    }).join(', ')

    return (
      <div className="flex flex-col items-center">
        <div
          className="w-48 h-48 rounded-full relative"
          style={{
            background: `conic-gradient(${gradientStops})`,
          }}
        >
          {/* Center hole to make it a donut chart */}
          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-navy-900/90 flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-bold text-white">8h</span>
              <p className="text-[10px] text-slate-500">工作日</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
          {timeAllocation.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: pieColors[i % pieColors.length] }}
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 truncate max-w-[100px]">{item.activity}</span>
                <span className="text-xs text-slate-500">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">角色拆解</h1>
        <p className="text-sm text-slate-500 mt-1">深度拆解岗位角色与职责</p>
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
          placeholder="请在此粘贴完整的职位描述（JD），AI 将为你深度拆解岗位角色..."
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

        {/* Breakdown Button */}
        <button
          onClick={handleBreakdown}
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
              {loadingStep || '拆解中...'}
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              拆解角色
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
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              </div>
            </div>
          )}

          {/* Role Position Card */}
          {result.rolePosition && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">角色定位</h3>
                  <p className="text-xs text-slate-500">岗位在团队中的真实角色</p>
                </div>
              </div>
              <div className="p-6">
                {result.rolePosition.title && (
                  <h4 className="text-lg font-bold gradient-text mb-3">{result.rolePosition.title}</h4>
                )}
                {result.rolePosition.description && (
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{result.rolePosition.description}</p>
                )}
                {result.rolePosition.teamContext && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 mb-4">
                    <span className="text-xs text-slate-500">团队上下文：</span>
                    <span className="text-sm text-slate-300 ml-1">{result.rolePosition.teamContext}</span>
                  </div>
                )}
                {Array.isArray(result.rolePosition.keyTraits) && result.rolePosition.keyTraits.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-500 mb-2 block">关键特质</span>
                    <div className="flex flex-wrap gap-2">
                      {result.rolePosition.keyTraits.map((trait, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hierarchy Tree */}
          {result.hierarchy && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">上下级关系</h3>
                  <p className="text-xs text-slate-500">组织架构中的位置</p>
                </div>
              </div>
              <div className="p-6">
                {/* Tree Structure */}
                <div className="flex flex-col items-center">
                  {/* Reports To (Top) */}
                  {result.hierarchy.reportsTo && (
                    <div className="mb-2">
                      <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center min-w-[200px]">
                        <div className="text-xs text-amber-400 mb-1">汇报对象</div>
                        <div className="text-sm font-medium text-white">{result.hierarchy.reportsTo.title}</div>
                        {result.hierarchy.reportsTo.description && (
                          <div className="text-xs text-slate-500 mt-1">{result.hierarchy.reportsTo.description}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connector line */}
                  {result.hierarchy.reportsTo && (
                    <div className="w-px h-6 bg-gradient-to-b from-amber-500/30 to-indigo-500/30" />
                  )}

                  {/* Current Role (Center) */}
                  <div className="my-2">
                    <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-500/30 text-center min-w-[240px] glow-purple">
                      <div className="text-xs text-indigo-400 mb-1">当前岗位</div>
                      <div className="text-base font-bold text-white">{result.rolePosition?.title || '目标岗位'}</div>
                    </div>
                  </div>

                  {/* Connector line */}
                  <div className="w-px h-6 bg-gradient-to-b from-indigo-500/30 to-emerald-500/30" />

                  {/* Manages (Bottom) */}
                  {result.hierarchy.manages && (
                    <div className="mt-2">
                      <div className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center min-w-[200px]">
                        <div className="text-xs text-emerald-400 mb-1">下属</div>
                        <div className="text-sm font-medium text-white">{result.hierarchy.manages.title}</div>
                        {result.hierarchy.manages.description && (
                          <div className="text-xs text-slate-500 mt-1">{result.hierarchy.manages.description}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Peers */}
                {Array.isArray(result.hierarchy.peers) && result.hierarchy.peers.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <span className="text-xs text-slate-500 mb-3 block">平级协作角色</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.hierarchy.peers.map((peer, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="text-sm font-medium text-white">{peer.title}</div>
                          {peer.description && (
                            <div className="text-xs text-slate-500 mt-1">{peer.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Core Responsibilities - Horizontal Bar Chart */}
          {Array.isArray(result.responsibilities) && result.responsibilities.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">核心职责占比</h3>
                  <p className="text-xs text-slate-500">各项工作职责的时间分配</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {result.responsibilities.map((resp, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-300">{resp.name}</span>
                      <span className="text-xs text-slate-500">{resp.percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-navy-900/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getBarColor(i)} transition-all duration-700`}
                        style={{ width: `${resp.percentage}%` }}
                      />
                    </div>
                    {resp.description && (
                      <p className="text-xs text-slate-500 mt-1">{resp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collaborators */}
          {Array.isArray(result.collaborators) && result.collaborators.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">协作对象分析</h3>
                  <p className="text-xs text-slate-500">需要密切协作的角色</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {result.collaborators.map((collab, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{collab.role}</span>
                          {collab.frequency && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getFrequencyColor(collab.frequency)}`}>
                              {collab.frequency}
                            </span>
                          )}
                        </div>
                        {collab.purpose && (
                          <p className="text-xs text-slate-400">{collab.purpose}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time Allocation - Pie Chart */}
          {Array.isArray(result.timeAllocation) && result.timeAllocation.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">日常工作时间分配</h3>
                  <p className="text-xs text-slate-500">典型工作日的时间分布</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Pie Chart */}
                  {renderPieChart(result.timeAllocation)}

                  {/* Detail List */}
                  <div className="flex-1 space-y-3 w-full">
                    {result.timeAllocation.map((item, i) => {
                      const pieColors = [
                        '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e',
                      ]
                      return (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: pieColors[i % pieColors.length] }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">{item.activity}</span>
                                <div className="flex items-center gap-2">
                                  {item.hours && (
                                    <span className="text-xs text-slate-500">{item.hours}h</span>
                                  )}
                                  <span className="text-xs text-slate-500">{item.percentage}%</span>
                                </div>
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
