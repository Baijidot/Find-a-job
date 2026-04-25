import { useState, useCallback } from 'react'
import { generateInterviewQuestions } from '../../utils/ai'
import useAnalysisTask from '../../hooks/useAnalysisTask'

const PLATFORMS = {
  '小红书': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '📕', url: 'https://www.xiaohongshu.com' },
  '牛客': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '🟢', url: 'https://www.nowcoder.com' },
  '知乎': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '📘', url: 'https://www.zhihu.com' },
  '力扣': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🟡', url: 'https://leetcode.cn' },
  'V2EX': { color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: '🟣', url: 'https://www.v2ex.com' },
  '抖音': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: '🎵', url: 'https://www.douyin.com' },
}

const DIFFICULTY_STYLES = {
  '简单': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  '中等': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  '困难': 'bg-red-500/20 text-red-400 border-red-500/30',
}

const CATEGORY_STYLES = {
  '技术基础': { icon: '💻', color: 'text-blue-400', bg: 'bg-blue-500/5' },
  '项目经验': { icon: '🏗️', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
  '系统设计': { icon: '📐', color: 'text-purple-400', bg: 'bg-purple-500/5' },
  '行为面试': { icon: '🧠', color: 'text-amber-400', bg: 'bg-amber-500/5' },
  '开放性问题': { icon: '💡', color: 'text-pink-400', bg: 'bg-pink-500/5' },
}

export default function InterviewPrep() {
  const [jdText, setJdText] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const {
    result,
    loading,
    error,
    setError,
    execute,
  } = useAnalysisTask({
    type: 'interview',
    fallbackErrorMessage: '面试问题生成失败，请重试',
    runAnalysis: ({ jd }) => generateInterviewQuestions(jd),
    createHistoryRecord: ({ jd }, output) => ({
      jdText: jd,
      title: '面试问题生成',
      results: output,
    }),
  })

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim()) {
      setError('请先输入JD内容')
      return
    }
    await execute({ jd: jdText })
  }, [execute, jdText, setError])

  const filteredQuestions = result?.questions?.filter(
    (q) => activeCategory === 'all' || q.category === activeCategory
  ) || []

  const categories = result?.questions
    ? ['all', ...new Set(result.questions.map((q) => q.category))]
    : ['all']

  const openSearchLink = (keyword, platform) => {
    const encodedKeyword = encodeURIComponent(keyword + ' 面经 面试')
    const urls = {
      '小红书': `https://www.xiaohongshu.com/search_result?keyword=${encodedKeyword}&source=web_search_result_notes`,
      '牛客': `https://www.nowcoder.com/search?type=article&query=${encodedKeyword}`,
      '知乎': `https://www.zhihu.com/search?type=content&q=${encodedKeyword}`,
      '力扣': `https://leetcode.cn/problemset/all/?search=${encodeURIComponent(keyword)}`,
      'V2EX': `https://www.google.com/search?q=site:v2ex.com+${encodedKeyword}`,
      '抖音': `https://www.douyin.com/search/${encodedKeyword}`,
    }
    const url = urls[platform] || `https://www.google.com/search?q=${encodedKeyword}`
    window.open(url, '_blank')
  }

  const openGoogleSearch = (keyword) => {
    const query = encodeURIComponent(keyword + ' 面经 面试 经验 site:xiaohongshu.com OR site:nowcoder.com OR site:zhihu.com')
    window.open(`https://www.google.com/search?q=${query}`, '_blank')
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">面试问题生成</h2>
        <p className="text-slate-400 text-sm">基于JD生成针对性面试问题 + 真实面经搜索，帮你高效备战面试</p>
      </div>

      {/* Input Area */}
      {!result && !loading && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">📋 目标岗位 JD</label>
            <span className="text-xs text-slate-500">{jdText.length} 字</span>
          </div>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="粘贴目标岗位的职位描述，AI将基于JD生成针对性的面试问题..."
            className="w-full h-48 bg-navy-900/50 border border-white/5 rounded-lg p-4 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={!jdText.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🎯 生成面试问题
            </button>
            {error && (
              <span className="text-sm text-red-400">{error}</span>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-12 text-center">
          <div className="inline-flex items-center gap-3 text-slate-300">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span>正在生成面试问题并搜索面经参考...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary + Search Panel Toggle */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-300 text-sm">{result.summary}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-slate-500">共 {result.questions?.length || 0} 道面试题</span>
                  <span className="text-xs text-slate-600">|</span>
                  <span className="text-xs text-slate-500">{result.searchQueries?.length || 0} 组面经搜索关键词</span>
                </div>
              </div>
              <button
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                className="px-4 py-2 text-sm text-pink-400 border border-pink-500/20 rounded-lg hover:bg-pink-500/10 transition-all flex items-center gap-2"
              >
                🔍 面经搜索
              </button>
            </div>

            {/* Red Flags */}
            {result.redFlags && result.redFlags.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="text-xs text-red-400 font-medium mb-2">🚨 面试雷区</div>
                <div className="flex flex-wrap gap-2">
                  {result.redFlags.map((flag, i) => (
                    <span key={i} className="text-xs text-red-300/80 px-2 py-1 rounded bg-red-500/10">{flag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Panel - 面经搜索 */}
          {showSearchPanel && (
            <div className="glass-card p-5 animate-fade-in">
              <h3 className="text-sm font-medium text-pink-400 mb-4 flex items-center gap-2">
                <span>🔍</span> 真实面经搜索
                <span className="text-xs text-slate-500 font-normal">— 点击关键词跳转到对应平台搜索真实面经</span>
              </h3>
              <div className="space-y-3">
                {result.searchQueries?.map((query, i) => (
                  <div key={i} className="p-4 rounded-lg bg-navy-900/50 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">"{query.keyword}"</span>
                        <span className="text-xs text-slate-500">{query.reason}</span>
                      </div>
                      <button
                        onClick={() => openGoogleSearch(query.keyword)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                      >
                        🔎 Google 全平台搜索
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(PLATFORMS).map(([name, config]) => (
                        <button
                          key={name}
                          onClick={() => openSearchLink(query.keyword, name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-all hover:scale-105 ${config.bg} ${config.color} ${config.border}`}
                        >
                          <span>{config.icon}</span>
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Search Tips */}
              <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                <div className="text-xs text-indigo-400 font-medium mb-2">💡 搜索技巧</div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• <span className="text-slate-300">小红书</span>：搜索 "公司名+岗位+面试" 或 "公司名+面经"，个人用户分享的真实经验最多</li>
                  <li>• <span className="text-slate-300">牛客</span>：搜索 "公司名+岗位"，有大量技术面试真题和面经</li>
                  <li>• <span className="text-slate-300">知乎</span>：搜索 "公司名+面试体验"，深度长文面经</li>
                  <li>• <span className="text-slate-300">抖音</span>：搜索 "公司名+面试"，视频形式的面经分享</li>
                  <li>• <span className="text-slate-300">Google</span>：用 site: 语法可以精准搜索特定平台的面经</li>
                </ul>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const style = cat === 'all'
                ? 'bg-indigo-500/20 text-white border-indigo-500/30'
                : (CATEGORY_STYLES[cat] ? `${CATEGORY_STYLES[cat].bg} ${CATEGORY_STYLES[cat].color} border-white/10` : 'bg-white/5 text-slate-400 border-white/10')
              const label = cat === 'all' ? '📋 全部' : `${CATEGORY_STYLES[cat]?.icon || '📌'} ${cat}`
              const count = cat === 'all'
                ? result.questions?.length
                : result.questions?.filter((q) => q.category === cat).length

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border whitespace-nowrap transition-all ${
                    activeCategory === cat ? style : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                  <span className="text-xs opacity-60">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((q, i) => {
              const catStyle = CATEGORY_STYLES[q.category] || { icon: '📌', color: 'text-slate-400', bg: 'bg-slate-500/5' }
              const diffStyle = DIFFICULTY_STYLES[q.difficulty] || DIFFICULTY_STYLES['中等']
              const isExpanded = expandedQuestion === i

              return (
                <div
                  key={i}
                  className={`glass-card overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-indigo-500/20' : ''}`}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : i)}
                    className="w-full p-5 text-left flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${catStyle.bg}`}>
                      {catStyle.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm text-white font-medium">{q.question}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${diffStyle}`}>{q.difficulty}</span>
                        <span className="text-xs text-slate-600">{q.category}</span>
                      </div>
                      <div className="text-xs text-slate-500">{q.focus}</div>
                    </div>
                    <div className={`text-slate-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Answer Tips */}
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <div className="text-xs text-emerald-400 font-medium mb-2">💡 答题思路</div>
                          <ul className="space-y-1.5">
                            {q.answerTips?.map((tip, j) => (
                              <li key={j} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Common Mistakes */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                            <div className="text-xs text-red-400 font-medium mb-2">⚠️ 常见踩坑</div>
                            <p className="text-sm text-slate-400">{q.commonMistakes}</p>
                          </div>

                          {/* Follow Up */}
                          {q.followUp && (
                            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                              <div className="text-xs text-amber-400 font-medium mb-2">🔄 可能追问</div>
                              <p className="text-sm text-slate-400">{q.followUp}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Preparation Strategy */}
          {result.preparationStrategy && result.preparationStrategy.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-indigo-400 mb-4">📅 面试准备策略</h3>
              <div className="space-y-3">
                {result.preparationStrategy.map((phase, i) => (
                  <div key={i} className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-white font-medium">{phase.phase}</span>
                    </div>
                    <ul className="space-y-1 mb-2">
                      {phase.tasks?.map((task, j) => (
                        <li key={j} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">☐</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                    {phase.tips && (
                      <div className="text-xs text-indigo-300/70 mt-2 pt-2 border-t border-indigo-500/10">
                        💡 {phase.tips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setResult(null)
                setJdText('')
                setActiveCategory('all')
                setExpandedQuestion(null)
              }}
              className="px-6 py-2.5 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all"
            >
              ← 重新生成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
