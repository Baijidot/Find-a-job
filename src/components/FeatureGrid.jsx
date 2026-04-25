const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
        <path d="M8.25 9.93A4 4 0 0 1 8 6a4 4 0 0 1 4-4" />
        <path d="M12 18v-4" />
        <path d="M8 22h8" />
        <path d="M7 14h10" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
      </svg>
    ),
    title: 'AI 智能洞察',
    description: '基于大语言模型深度解析JD，揭示隐藏的真实工作要求',
    color: 'from-indigo-500/20 to-indigo-500/5',
    iconColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: '角色清晰化',
    description: '拆解岗位职责，让你清楚知道每天实际要做什么',
    color: 'from-pink-500/20 to-pink-500/5',
    iconColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    title: '数据驱动分析',
    description: '量化技能要求，精准匹配你的能力与岗位需求',
    color: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: '隐私安全保障',
    description: '数据全程加密处理，不存储不泄露你的职位信息',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
]

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {features.map((feature, index) => (
        <div
          key={index}
          className={`p-5 rounded-xl bg-gradient-to-br ${feature.color} border ${feature.borderColor} hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className={`${feature.iconColor} mb-3`}>
            {feature.icon}
          </div>
          <h3 className="text-sm font-medium text-white mb-1.5">{feature.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
