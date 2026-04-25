export default function SkillsCard({ data }) {
  if (!data) return null

  const getLevelColor = (level) => {
    const map = {
      '必须掌握': 'from-red-500 to-red-600',
      '核心技能': 'from-orange-500 to-amber-500',
      '重要技能': 'from-blue-500 to-indigo-500',
      '加分技能': 'from-emerald-500 to-teal-500',
      '了解即可': 'from-slate-500 to-slate-600',
    }
    return map[level] || 'from-indigo-500 to-pink-500'
  }

  const getLevelBg = (level) => {
    const map = {
      '必须掌握': 'bg-red-500/10 border-red-500/20',
      '核心技能': 'bg-orange-500/10 border-orange-500/20',
      '重要技能': 'bg-blue-500/10 border-blue-500/20',
      '加分技能': 'bg-emerald-500/10 border-emerald-500/20',
      '了解即可': 'bg-slate-500/10 border-slate-500/20',
    }
    return map[level] || 'bg-indigo-500/10 border-indigo-500/20'
  }

  const skills = Array.isArray(data) ? data : (data.skills || [])

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center text-lg">
          🎯
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">技能分析</h3>
          <p className="text-xs text-slate-500">岗位所需技能及优先级</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {data.summary && (
          <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 mb-5">
            <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="space-y-3">
          {skills.map((skill, index) => {
            const name = skill.name || skill.skill || skill
            const level = skill.level || skill.priority || '重要技能'
            const reason = skill.reason || skill.description || ''
            const isString = typeof skill === 'string'

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${getLevelBg(level)} transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{isString ? skill : name}</span>
                  {!isString && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r ${getLevelColor(level)} text-white font-medium`}>
                      {level}
                    </span>
                  )}
                </div>
                {!isString && reason && (
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{reason}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
