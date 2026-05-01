import { useState, useCallback } from 'react'
import { analyzeSkillGap } from '../../utils/ai'

const SAMPLE_SKILLS = `JavaScript/TypeScript: 4年，熟练
React: 3年，熟练
Vue: 1年，了解
CSS/Tailwind: 熟练
Git: 日常使用
Node.js: 基础了解
Webpack: 使用过
英语: CET-6，读写良好`

const CATEGORY_COLORS = {
  '前端': '#6366f1',
  '后端': '#10b981',
  '数据库': '#f59e0b',
  'DevOps': '#ec4899',
  '软技能': '#8b5cf6',
  '工具': '#06b6d4',
}

const IMPORTANCE_BADGES = {
  '关键': 'bg-red-500/10 text-red-400 border-red-500/20',
  '重要': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '加分项': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

function GapBar({ required, current, gap }) {
  const barWidth = Math.max(required, current)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 w-10">要求</span>
        <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500/60 transition-all duration-700"
            style={{ width: `${(required / 100) * 100}%` }}
          />
        </div>
        <span className="text-slate-400 w-8 text-right">{required}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 w-10">当前</span>
        <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(current / 100) * 100}%`,
              backgroundColor: current >= required ? '#10b981' : current >= required * 0.6 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
        <span className="text-slate-400 w-8 text-right">{current}</span>
      </div>
    </div>
  )
}

function HeatmapCell({ skill }) {
  const gapPercent = skill.gap
  const intensity = Math.min(gapPercent / 100, 1)
  const isCritical = skill.importance === '关键'

  const bgColor = gapPercent <= 20
    ? `rgba(16, 185, 129, ${0.1 + intensity * 0.3})`
    : gapPercent <= 50
    ? `rgba(245, 158, 11, ${0.1 + intensity * 0.3})`
    : `rgba(239, 68, 68, ${0.1 + intensity * 0.3})`

  const borderColor = gapPercent <= 20
    ? 'border-emerald-500/20'
    : gapPercent <= 50
    ? 'border-amber-500/20'
    : 'border-red-500/20'

  const textColor = gapPercent <= 20
    ? 'text-emerald-400'
    : gapPercent <= 50
    ? 'text-amber-400'
    : 'text-red-400'

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${borderColor} ${isCritical ? 'ring-1 ring-red-500/10' : ''}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[skill.category] || '#64748b' }}
          />
          <span className="text-sm font-medium text-white">{skill.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${IMPORTANCE_BADGES[skill.importance] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
          {skill.importance}
        </span>
      </div>

      <GapBar required={skill.required} current={skill.current} gap={skill.gap} />

      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs font-medium ${textColor}`}>
          差距 {skill.gap}%
        </span>
        <span className="text-xs text-slate-500">{skill.category}</span>
      </div>

      {skill.suggestion && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{skill.suggestion}</p>
      )}
    </div>
  )
}

export default function SkillGap() {
  const [jdText, setJdText] = useState('')
  const [mySkills, setMySkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim() || !mySkills.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeSkillGap(jdText, mySkills)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [jdText, mySkills])

  const handleReset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  if (result) {
    const sortedSkills = [...result.skills].sort((a, b) => b.gap - a.gap)

    return (
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">技能差距热力图</h2>
            <p className="text-sm text-slate-500">JD要求 vs 你的技能栈</p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            重新分析
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">整体匹配度</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke="url(#matchGrad)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.overallMatch / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                  {result.overallMatch}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex-1">{result.summary}</p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">关键差距</h3>
            <div className="space-y-2">
              {result.criticalGaps.map((gap, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-300 mb-4">技能热力图（按差距从大到小排列）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedSkills.map((skill, i) => (
              <HeatmapCell key={i} skill={skill} />
            ))}
          </div>
        </div>

        {result.strengths.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <h3 className="text-sm font-medium text-emerald-400 mb-3">你的优势</h3>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((s, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.learningPlan.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">学习计划</h3>
            <div className="space-y-3">
              {result.learningPlan.map((plan, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.01]">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {plan.priority}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{plan.skill}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {plan.timeline && `${plan.timeline} · `}{plan.resources}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">技能差距热力图</h2>
        <p className="text-slate-400">输入JD和你的技能栈，AI对比分析差距，可视化展示短板</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">职位描述（JD）</h3>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="在此粘贴招聘JD..."
          rows={8}
          className="w-full bg-navy-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors"
        />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">你的技能栈</h3>
          <button
            onClick={() => setMySkills(SAMPLE_SKILLS)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            填入示例
          </button>
        </div>
        <textarea
          value={mySkills}
          onChange={(e) => setMySkills(e.target.value)}
          placeholder="列出你掌握的技能，格式不限（如：React: 3年，熟练）"
          rows={6}
          className="w-full bg-navy-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!jdText.trim() || !mySkills.trim() || loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-pink-400 transition-all"
      >
        {loading ? 'AI正在分析技能差距...' : '开始分析'}
      </button>
    </div>
  )
}
