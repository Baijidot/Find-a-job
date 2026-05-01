import { useState, useCallback } from 'react'
import { generateResumeTailor } from '../../utils/ai'

const SAMPLE_RESUME = `个人总结：
3年前端开发经验，熟悉React和Vue，参与过多个项目开发，有良好的团队协作能力。

工作经历：
2022-至今 XX科技 前端开发工程师
- 负责公司后台管理系统前端开发
- 参与移动端H5页面开发
- 配合后端完成接口联调

2021-2022 YY网络 初级前端开发
- 负责公司官网维护和更新
- 编写页面组件

项目经验：
电商后台管理系统：使用React+Ant Design开发，实现了商品管理、订单管理等功能

技能：
JavaScript, React, Vue, CSS, Git`

const SAMPLE_COMPANY = `公司：某AI创业公司，B轮融资
团队：前端团队10人，技术氛围好，用React+TypeScript+Next.js
文化：扁平化管理，鼓励技术创新，每周有技术分享`

const SECTION_ICONS = {
  '个人总结': '📝',
  '工作经历': '💼',
  '项目经验': '🚀',
  '技能描述': '🛠️',
  '教育背景': '🎓',
}

export default function ResumeTailor() {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [companyInfo, setCompanyInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('sections')

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim() || !resumeText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await generateResumeTailor(jdText, resumeText, companyInfo)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [jdText, resumeText, companyInfo])

  const handleReset = useCallback(() => {
    setResult(null)
    setError(null)
    setActiveTab('sections')
  }, [])

  const handleCopyFinal = useCallback(() => {
    if (result?.finalResume) {
      navigator.clipboard.writeText(result.finalResume).catch(() => {})
    }
  }, [result])

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">简历定制优化</h2>
            <p className="text-sm text-slate-500">AI教你根据JD和公司特性改写简历</p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            重新定制
          </button>
        </div>

        <div className="bg-gradient-to-r from-indigo-500/5 to-pink-500/5 border border-indigo-500/10 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-white/5 pb-0">
          {[
            { id: 'sections', label: '逐段优化' },
            { id: 'keywords', label: '关键词策略' },
            { id: 'strategy', label: '突出/弱化' },
            { id: 'tips', label: '定制建议' },
            { id: 'final', label: '完整简历' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'sections' && (
          <div className="space-y-4">
            {result.sections.map((sec, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <span>{SECTION_ICONS[sec.section] || '📄'}</span>
                  <span className="text-sm font-medium text-white">{sec.section}</span>
                </div>
                <div className="p-5 space-y-4">
                  {sec.original && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">原始版本</p>
                      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-sm text-slate-400 whitespace-pre-wrap">{sec.original}</p>
                      </div>
                    </div>
                  )}
                  {sec.issue && (
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 text-xs mt-0.5">⚠</span>
                      <p className="text-xs text-amber-400/80">{sec.issue}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-emerald-400 mb-2">优化版本</p>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{sec.optimized}</p>
                    </div>
                  </div>
                  {sec.reason && (
                    <p className="text-xs text-slate-500">为什么这样改：{sec.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'keywords' && result.keywordStrategy && (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4">JD关键词</h3>
              <div className="flex flex-wrap gap-2">
                {result.keywordStrategy.jdKeywords.map((kw, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">如何融入简历</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{result.keywordStrategy.howToEmbed}</p>
            </div>
          </div>
        )}

        {activeTab === 'strategy' && result.highlightStrategy && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-emerald-400 mb-4">应该突出</h3>
              <div className="space-y-2">
                {result.highlightStrategy.emphasize.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-500/5 border border-slate-500/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">可以弱化</h3>
              <div className="space-y-2">
                {result.highlightStrategy.downplay.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">-</span>
                    <span className="text-sm text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4">针对这家公司的定制建议</h3>
            <div className="space-y-3">
              {result.tailoringTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'final' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-300">定制后的完整简历</h3>
              <button
                onClick={handleCopyFinal}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                一键复制
              </button>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-7">
                {result.finalResume}
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">简历定制优化</h2>
        <p className="text-slate-400">粘贴JD+简历+公司信息，AI逐段教你如何定制简历，让HR一眼相中</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">职位描述（JD）</h3>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="在此粘贴招聘JD..."
          rows={6}
          className="w-full bg-navy-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors"
        />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">你的简历/经历</h3>
          <button
            onClick={() => setResumeText(SAMPLE_RESUME)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            填入示例
          </button>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="粘贴你的简历或经历描述..."
          rows={8}
          className="w-full bg-navy-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors"
        />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">公司/团队信息（选填）</h3>
          <button
            onClick={() => setCompanyInfo(SAMPLE_COMPANY)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            填入示例
          </button>
        </div>
        <textarea
          value={companyInfo}
          onChange={(e) => setCompanyInfo(e.target.value)}
          placeholder="公司规模、团队情况、技术栈、企业文化等（选填，有助于更精准的定制建议）"
          rows={4}
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
        disabled={!jdText.trim() || !resumeText.trim() || loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-pink-400 transition-all"
      >
        {loading ? 'AI正在定制简历...' : '开始定制'}
      </button>
    </div>
  )
}
