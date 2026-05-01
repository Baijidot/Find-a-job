import { useState, useCallback } from 'react'
import { checkSalaryCredibility } from '../../utils/ai'

const SAMPLE_JD = `职位名称：高级前端工程师

岗位职责：
1. 负责公司核心产品的前端架构设计与开发
2. 参与产品需求评审，提供技术方案
3. 优化前端性能，提升用户体验

任职要求：
1. 5年以上前端开发经验，3年以上 React 开发经验
2. 精通 JavaScript/TypeScript
3. 熟悉前端工程化工具

薪资范围：30K-50K · 14薪
工作地点：北京·海淀区`

function WaterMeter({ waterIndex }) {
  const height = 160
  const fillHeight = (waterIndex / 100) * height
  const color = waterIndex <= 30 ? '#10b981' : waterIndex <= 60 ? '#f59e0b' : '#ef4444'
  const label = waterIndex <= 30 ? '低水分' : waterIndex <= 60 ? '中等水分' : '高水分'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 80, height }}>
        <div className="absolute inset-0 rounded-2xl border-2 border-white/10 bg-white/[0.02] overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out rounded-b-2xl"
            style={{
              height: `${(waterIndex / 100) * 100}%`,
              backgroundColor: color,
              opacity: 0.3,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            style={{
              height: '3px',
              backgroundColor: color,
              bottom: `${(waterIndex / 100) * 100}%`,
            }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{waterIndex}</span>
          <span className="text-xs text-slate-400 mt-1">水分指数</span>
        </div>
      </div>
      <span
        className="text-xs font-medium mt-3 px-3 py-1 rounded-full border"
        style={{
          color,
          borderColor: color,
          backgroundColor: `${color}10`,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function CredibilityGauge({ score }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="104" height="104" className="-rotate-90">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="52" cy="52" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-white">{score}</span>
    </div>
  )
}

export default function SalaryCheck() {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await checkSalaryCredibility(jdText)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [jdText])

  const handleReset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  const handleTrySample = useCallback(() => {
    setJdText(SAMPLE_JD)
    setError(null)
  }, [])

  if (result) {
    const verdictColors = {
      '可信': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      '基本可信': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      '需谨慎': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      '不可信': 'text-red-400 bg-red-500/10 border-red-500/20',
    }

    return (
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">薪资可信度检测</h2>
            <p className="text-sm text-slate-500">AI分析JD薪资是否靠谱</p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            重新检测
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-300 mb-4">可信度评分</h3>
            <CredibilityGauge score={result.credibilityScore} />
            <span className={`text-xs px-3 py-1 rounded-full border mt-4 ${verdictColors[result.verdict] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {result.verdict}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-300 mb-4">水分指数</h3>
            <WaterMeter waterIndex={result.waterIndex} />
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">提取薪资</h3>
            {result.extractedSalary ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">范围</span>
                  <span className="text-sm text-white font-medium">
                    {result.extractedSalary.min?.toLocaleString()} - {result.extractedSalary.max?.toLocaleString()}
                    {result.extractedSalary.period ? ` /${result.extractedSalary.period}` : ''}
                  </span>
                </div>
                {result.extractedSalary.months && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">月数</span>
                    <span className="text-sm text-white">{result.extractedSalary.months}薪</span>
                  </div>
                )}
                {result.extractedSalary.raw && (
                  <div className="mt-2 p-2 rounded-lg bg-navy-900/50">
                    <p className="text-xs text-slate-500">原文</p>
                    <p className="text-sm text-slate-300 mt-0.5">{result.extractedSalary.raw}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">JD中未明确标注薪资</p>
            )}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">分析总结</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{result.summary}</p>
        </div>

        {result.marketComparison && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">市场对比</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500">市场均价</span>
                <p className="text-lg font-bold text-white mt-1">
                  {result.marketComparison.marketAvg?.toLocaleString() || '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">市场范围</span>
                <p className="text-lg font-bold text-white mt-1">
                  {result.marketComparison.marketRange || '-'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-500">该JD薪资在市场中的位置：</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                result.marketComparison.position === '偏高' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                result.marketComparison.position === '合理' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {result.marketComparison.position}
              </span>
            </div>
            {result.marketComparison.analysis && (
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">{result.marketComparison.analysis}</p>
            )}
          </div>
        )}

        {result.risks.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">风险提示</h3>
            <div className="space-y-3">
              {result.risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    risk.severity === '高' ? 'bg-red-400' : risk.severity === '中' ? 'bg-amber-400' : 'bg-slate-400'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{risk.type}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        risk.severity === '高' ? 'bg-red-500/10 text-red-400' :
                        risk.severity === '中' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {risk.severity}风险
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.negotiationTips.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500/5 to-pink-500/5 border border-indigo-500/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-indigo-400 mb-4">薪资谈判建议</h3>
            <div className="space-y-2">
              {result.negotiationTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 text-sm mt-0.5">{i + 1}.</span>
                  <span className="text-sm text-slate-300">{tip}</span>
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
        <h2 className="text-2xl font-bold text-white mb-2">薪资可信度检测</h2>
        <p className="text-slate-400">AI分析JD中的薪资是否靠谱，识别薪资陷阱，给出谈判建议</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">粘贴职位描述（JD）</h3>
          <button
            onClick={handleTrySample}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            试用示例JD
          </button>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="在此粘贴招聘JD..."
          rows={10}
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
        disabled={!jdText.trim() || loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-pink-400 transition-all"
      >
        {loading ? 'AI正在分析薪资可信度...' : '开始检测'}
      </button>
    </div>
  )
}
