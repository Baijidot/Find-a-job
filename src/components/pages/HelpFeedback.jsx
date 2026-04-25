import { useState } from 'react'

const faqData = [
  {
    question: '如何配置API Key？',
    answer: '点击页面右上角的设置图标，在设置弹窗中填入你的 OpenAI 兼容 API Key。支持 OpenAI、DeepSeek、通义千问等兼容 OpenAI 协议的服务。你还可以自定义 Base URL 和模型名称，以适配不同的 API 服务商。',
  },
  {
    question: '支持哪些AI模型？',
    answer: '支持所有兼容 OpenAI API 协议的模型，包括但不限于：GPT-4o、GPT-4o-mini、GPT-3.5-turbo、DeepSeek-V3、DeepSeek-Chat、通义千问（Qwen）系列等。你可以在设置中自由切换模型。推荐使用 GPT-4o-mini 或 DeepSeek-Chat 以获得最佳性价比。',
  },
  {
    question: '分析结果准确吗？',
    answer: '分析结果基于AI对JD文本的理解和推理，具有较高的参考价值。但需要注意：AI分析仅供参考，实际工作情况可能因公司、团队、领导等因素有所不同。建议结合其他渠道的信息（如面经、员工评价等）综合判断。',
  },
  {
    question: '数据安全吗？',
    answer: '你的所有数据（JD内容、分析结果、历史记录等）都存储在浏览器本地（localStorage），不会上传到任何第三方服务器。API Key 同样只存储在本地。唯一的网络请求是直接从你的浏览器发送到你所配置的 AI API 服务。',
  },
  {
    question: '如何导出分析报告？',
    answer: '目前你可以通过收藏功能保存有价值的分析结果，方便随时查看。未来版本将支持导出为 PDF、Markdown 等格式。如果你有导出需求，也可以通过下方的反馈表单告诉我们。',
  },
  {
    question: '支持哪些语言？',
    answer: '目前主要支持中文职位描述（JD）的分析。AI 会以中文返回分析结果。如果你输入英文 JD，AI 也能理解并分析，但返回结果可能包含中英文混合。未来将支持更多语言的分析和结果展示。',
  },
]

const guideSteps = [
  {
    step: 1,
    title: '配置 API Key',
    description: '点击右上角设置图标，填入你的 API Key，选择合适的模型',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: '粘贴职位描述',
    description: '将目标岗位的完整 JD 粘贴到输入框中',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'AI 深度分析',
    description: 'AI 将从多个维度分析 JD，揭示真实工作情况',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    step: 4,
    title: '查看与收藏',
    description: '查看分析结果，收藏有价值的报告，制定提升计划',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
]

export default function HelpFeedback() {
  const [openFaq, setOpenFaq] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return
    // In a real app, this would send to a backend
    setFeedbackSubmitted(true)
    setFeedbackText('')
    setTimeout(() => setFeedbackSubmitted(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">帮助与反馈</h1>
        <p className="text-sm text-slate-500 mt-1">有问题？我们来帮你</p>
      </div>

      <div className="space-y-6">
        {/* FAQ Section */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">常见问题</h3>
              <p className="text-xs text-slate-500">点击问题查看答案</p>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {faqData.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-slate-300">{faq.question}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ml-4 ${openFaq === index ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 animate-fade-in">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Usage Guide Section */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">使用指南</h3>
              <p className="text-xs text-slate-500">快速上手 JD 真相分析器</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {guideSteps.map((item, index) => {
                const colors = [
                  'border-indigo-500/20 bg-indigo-500/[0.02]',
                  'border-pink-500/20 bg-pink-500/[0.02]',
                  'border-emerald-500/20 bg-emerald-500/[0.02]',
                  'border-amber-500/20 bg-amber-500/[0.02]',
                ]
                const iconColors = [
                  'text-indigo-400',
                  'text-pink-400',
                  'text-emerald-400',
                  'text-amber-400',
                ]
                return (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border ${colors[index]} transition-all duration-200 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center ${iconColors[index]}`}>
                        {item.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${iconColors[index]}`}>{item.step}</span>
                        <span className="text-sm font-semibold text-white">{item.title}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">反馈建议</h3>
              <p className="text-xs text-slate-500">告诉我们你的想法和建议</p>
            </div>
          </div>
          <div className="p-6">
            {feedbackSubmitted ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-emerald-300 mb-1">感谢反馈</h4>
                <p className="text-sm text-slate-500">我们会认真考虑你的建议，持续改进产品</p>
              </div>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="请输入你的反馈或建议，例如：希望增加的功能、遇到的问题、改进建议等..."
                  className="w-full h-36 bg-navy-900/80 border border-white/10 rounded-xl px-5 py-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                />
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim()}
                  className={`mt-4 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    feedbackText.trim()
                      ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:from-pink-400 hover:to-indigo-400 shadow-lg shadow-pink-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  提交反馈
                </button>
              </>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">关于</h3>
              <p className="text-xs text-slate-500">JD 真相分析器</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-sm text-slate-400">版本号</span>
              <span className="text-sm font-medium text-white">v1.0.0</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h4 className="text-sm font-medium text-white mb-3">技术栈</h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vite', 'TailwindCSS', 'OpenAI API', 'localStorage'].map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              JD 真相分析器是一款基于 AI 的职位描述深度分析工具，帮助求职者看透 JD 背后的真实工作情况。
              所有数据本地存储，保护你的隐私安全。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
