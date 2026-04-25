export default function JobRealityCard({ data }) {
  if (!data) return null

  const sections = [
    { key: 'dailyReality', label: '日常工作', icon: '📋', color: 'indigo' },
    { key: 'hiddenRequirements', label: '隐藏要求', icon: '🔍', color: 'pink' },
    { key: 'redFlags', label: '风险信号', icon: '🚩', color: 'red' },
    { key: 'salaryInsight', label: '薪资洞察', icon: '💰', color: 'emerald' },
  ].filter(s => data[s.key])

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-lg">
          📋
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">工作内容解析</h3>
          <p className="text-xs text-slate-500">JD 背后的真实工作面貌</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Summary */}
        {data.summary && (
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Sections */}
        {sections.map(({ key, label, icon, color }) => {
          const items = Array.isArray(data[key]) ? data[key] : [data[key]]
          const colorMap = {
            indigo: 'border-indigo-500/20 bg-indigo-500/5',
            pink: 'border-pink-500/20 bg-pink-500/5',
            red: 'border-red-500/20 bg-red-500/5',
            emerald: 'border-emerald-500/20 bg-emerald-500/5',
          }
          const textColorMap = {
            indigo: 'text-indigo-300',
            pink: 'text-pink-300',
            red: 'text-red-300',
            emerald: 'text-emerald-300',
          }

          return (
            <div key={key}>
              <h4 className={`text-sm font-medium ${textColorMap[color]} mb-3 flex items-center gap-2`}>
                <span>{icon}</span> {label}
              </h4>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${colorMap[color]} text-sm text-slate-300 leading-relaxed`}
                  >
                    {typeof item === 'string' ? item : (
                      <>
                        <span className="font-medium text-white">{item.title || item.name}</span>
                        {item.description && <p className="mt-1 text-slate-400">{item.description}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
