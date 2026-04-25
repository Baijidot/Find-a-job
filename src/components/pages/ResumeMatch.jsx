import { useState, useCallback } from 'react'
import { matchResume } from '../../utils/ai'
import useAnalysisTask from '../../hooks/useAnalysisTask'

const SAMPLE_RESUME = `个人信息：
姓名：张三 | 年龄：28 | 学历：本科·计算机科学与技术

工作经历：
1. ABC科技有限公司 · 前端工程师（2021.06 - 至今）
   - 负责公司SaaS产品前端开发，使用React + TypeScript技术栈
   - 主导前端性能优化，首屏加载时间从4.2s降低到1.8s
   - 搭建组件库，包含50+通用组件，团队开发效率提升40%
   - 参与需求评审，与产品、设计团队协作完成多个重要项目

2. XYZ互联网公司 · 初级前端工程师（2019.07 - 2021.05）
   - 使用Vue.js开发公司官网和管理后台
   - 负责移动端H5页面开发和适配
   - 参与前端自动化测试体系建设

技术栈：
- 熟练掌握：JavaScript/TypeScript、React、Vue.js、HTML5/CSS3
- 熟悉：Node.js、Webpack、Vite、Git、Docker
- 了解：Next.js、Redux、GraphQL、Jest

项目经验：
- 企业级SaaS管理平台：React + TypeScript + Ant Design，负责架构设计和核心模块开发
- 移动端电商H5：Vue3 + Vant，日活用户10万+
- 内部组件库：基于React，支持主题定制和按需加载

教育背景：
2015.09 - 2019.06 | 某某大学 | 计算机科学与技术 | 本科 | GPA 3.5/4.0`

export default function ResumeMatch() {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const {
    result,
    loading,
    error,
    setError,
    execute,
  } = useAnalysisTask({
    type: 'resume',
    fallbackErrorMessage: '匹配分析失败，请重试',
    runAnalysis: ({ jd, resume }) => matchResume(jd, resume),
    createHistoryRecord: ({ jd }, output) => ({
      jdText: jd,
      title: '简历匹配分析',
      results: output,
    }),
  })

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim() || !resumeText.trim()) {
      setError('请同时输入JD和简历内容')
      return
    }
    await execute({ jd: jdText, resume: resumeText })
  }, [execute, jdText, resumeText, setError])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5'
    if (score >= 60) return 'from-amber-500/20 to-amber-500/5'
    return 'from-red-500/20 to-red-500/5'
  }

  const getScoreRingColor = (score) => {
    if (score >= 80) return '#34d399'
    if (score >= 60) return '#fbbf24'
    return '#f87171'
  }

  const getSeverityColor = (severity) => {
    if (severity === '关键缺失') return 'bg-red-500/20 text-red-400 border-red-500/30'
    if (severity === '重要缺失') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  const getVerdictColor = (verdict) => {
    if (verdict.includes('强烈推荐')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (verdict.includes('推荐')) return 'text-green-400 bg-green-500/10 border-green-500/20'
    if (verdict.includes('可以尝试')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    if (verdict.includes('补强')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    return 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  const ScoreRing = ({ score, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = getScoreRingColor(score)

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className="text-xs text-slate-500 mt-0.5">匹配度</span>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '总览', icon: '📊' },
    { id: 'strengths', label: '匹配优势', icon: '✅' },
    { id: 'gaps', label: '差距分析', icon: '⚠️' },
    { id: 'optimization', label: '简历优化', icon: '📝' },
    { id: 'interview', label: '面试重点', icon: '🎯' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">简历匹配分析</h2>
        <p className="text-slate-400 text-sm">粘贴目标岗位JD和你的简历，AI帮你量化匹配度、找出差距、优化简历</p>
      </div>

      {/* Input Area */}
      {!result && !loading && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* JD Input */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">📋 目标岗位 JD</label>
              <span className="text-xs text-slate-500">{jdText.length} 字</span>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="粘贴目标岗位的职位描述..."
              className="w-full h-64 bg-navy-900/50 border border-white/5 rounded-lg p-4 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Resume Input */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">👤 你的简历</label>
              <span className="text-xs text-slate-500">{resumeText.length} 字</span>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="粘贴你的简历内容..."
              className="w-full h-64 bg-navy-900/50 border border-white/5 rounded-lg p-4 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!result && !loading && (
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleAnalyze}
            disabled={!jdText.trim() || !resumeText.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🔍 开始匹配分析
          </button>
          <button
            onClick={() => {
              setResumeText(SAMPLE_RESUME)
            }}
            className="px-4 py-3 text-sm text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg hover:border-white/20 transition-all"
          >
            📄 填入示例简历
          </button>
          {error && (
            <span className="text-sm text-red-400 ml-2">{error}</span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-12 text-center">
          <div className="inline-flex items-center gap-3 text-slate-300">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>正在深度分析简历与岗位的匹配度...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary + Score */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-8">
              <ScoreRing score={result.overallScore} />
              <div className="flex-1">
                <p className="text-slate-300 text-sm mb-3">{result.summary}</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getVerdictColor(result.verdict)}`}>
                  <span>{result.verdict}</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            {result.scoreBreakdown && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h4 className="text-sm font-medium text-slate-400 mb-4">分维度评分</h4>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(result.scoreBreakdown).map(([key, value]) => {
                    const labels = {
                      skillMatch: '技能匹配',
                      experienceMatch: '经验匹配',
                      educationMatch: '学历匹配',
                      softSkillMatch: '软技能匹配',
                      cultureFit: '文化契合',
                    }
                    return (
                      <div key={key} className={`rounded-lg p-3 bg-gradient-to-b ${getScoreBg(value)} border border-white/5`}>
                        <div className="text-xs text-slate-500 mb-1">{labels[key] || key}</div>
                        <div className={`text-xl font-bold ${getScoreColor(value)}`}>{value}</div>
                        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${value}%`,
                              backgroundColor: getScoreRingColor(value),
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-navy-900/50 rounded-lg border border-white/5 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-6">
                {/* Strengths Preview */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
                    <span>✅</span> 匹配优势 ({result.matchedStrengths?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {result.matchedStrengths?.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.confidence === '高' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.confidence === '中' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>{item.confidence}</span>
                        <div>
                          <div className="text-sm text-white">{item.item}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps Preview */}
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2">
                    <span>⚠️</span> 差距分析 ({result.gaps?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {result.gaps?.slice(0, 4).map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white">{item.item}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{item.suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {activeTab === 'strengths' && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-medium text-emerald-400 mb-4">✅ 匹配优势详情</h3>
                <div className="space-y-3">
                  {result.matchedStrengths?.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">{item.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.confidence === '高' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.confidence === '中' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>置信度: {item.confidence}</span>
                      </div>
                      <div className="text-sm text-white font-medium">{item.item}</div>
                      <div className="text-sm text-slate-400 mt-1">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {activeTab === 'gaps' && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-medium text-amber-400 mb-4">⚠️ 差距分析详情</h3>
                <div className="space-y-3">
                  {result.gaps?.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">{item.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>
                      <div className="text-sm text-white font-medium">{item.item}</div>
                      <div className="text-sm text-slate-400 mt-2">
                        <span className="text-amber-400">💡 建议：</span>{item.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Optimization */}
            {activeTab === 'optimization' && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-medium text-indigo-400 mb-4">📝 简历优化建议</h3>
                <div className="space-y-4">
                  {result.resumeOptimization?.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">{item.section}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-red-400">❌ 当前问题：</span>
                          <span className="text-sm text-slate-400">{item.currentIssue}</span>
                        </div>
                        <div>
                          <span className="text-xs text-emerald-400">✅ 优化建议：</span>
                          <span className="text-sm text-slate-300">{item.suggestedFix}</span>
                        </div>
                        {item.example && (
                          <div className="mt-2 p-3 rounded bg-navy-900/50 border border-white/5">
                            <div className="text-xs text-slate-500 mb-1">📝 示例：</div>
                            <div className="text-sm text-slate-300">{item.example}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Focus */}
            {activeTab === 'interview' && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-medium text-pink-400 mb-4">🎯 面试准备重点</h3>
                <div className="space-y-3">
                  {result.interviewFocus?.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-pink-500/5 border border-pink-500/10">
                      <div className="text-sm text-white font-medium mb-1">{item.topic}</div>
                      <div className="text-xs text-slate-500 mb-2">📌 {item.reason}</div>
                      <div className="text-sm text-slate-400">
                        <span className="text-pink-400">💡 准备方向：</span>{item.preparation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setResult(null)
                setJdText('')
                setResumeText('')
              }}
              className="px-6 py-2.5 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all"
            >
              ← 重新分析
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
