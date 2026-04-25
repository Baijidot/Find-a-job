import { useState } from 'react'

export default function PlanCard({ data }) {
  const [checkedItems, setCheckedItems] = useState({})

  if (!data) return null

  const phases = Array.isArray(data) ? data : (data.phases || data.steps || [])

  const toggleCheck = (phaseIdx, itemIdx) => {
    const key = `${phaseIdx}-${itemIdx}`
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getPhaseIcon = (index) => {
    const icons = ['🚀', '📚', '💪', '🎯', '⭐']
    return icons[index % icons.length]
  }

  const getPhaseColor = (index) => {
    const colors = [
      'border-indigo-500/20 bg-indigo-500/5',
      'border-pink-500/20 bg-pink-500/5',
      'border-blue-500/20 bg-blue-500/5',
      'border-emerald-500/20 bg-emerald-500/5',
      'border-amber-500/20 bg-amber-500/5',
    ]
    return colors[index % colors.length]
  }

  const getPhaseTitleColor = (index) => {
    const colors = ['text-indigo-300', 'text-pink-300', 'text-blue-300', 'text-emerald-300', 'text-amber-300']
    return colors[index % colors.length]
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-lg">
          📝
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">行动计划</h3>
          <p className="text-xs text-slate-500">可追踪的学习与提升计划</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {data.summary && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-5">
            <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="space-y-4">
          {phases.map((phase, phaseIdx) => {
            const title = phase.title || phase.name || phase.phase || `阶段 ${phaseIdx + 1}`
            const items = Array.isArray(phase.items) ? phase.items : (phase.tasks || [])
            const isStringPhase = typeof phase === 'string'

            if (isStringPhase) {
              return (
                <div key={phaseIdx} className={`p-4 rounded-xl border ${getPhaseColor(phaseIdx)}`}>
                  <p className="text-sm text-slate-300">{phase}</p>
                </div>
              )
            }

            return (
              <div key={phaseIdx}>
                {/* Phase header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{getPhaseIcon(phaseIdx)}</span>
                  <h4 className={`text-sm font-semibold ${getPhaseTitleColor(phaseIdx)}`}>{title}</h4>
                  {phase.timeline && (
                    <span className="text-[11px] text-slate-500 ml-auto">{phase.timeline}</span>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 ml-6">
                  {items.map((item, itemIdx) => {
                    const itemText = typeof item === 'string' ? item : (item.title || item.task || item.description || '')
                    const itemDetail = typeof item === 'object' ? (item.detail || item.note || '') : ''
                    const key = `${phaseIdx}-${itemIdx}`
                    const isChecked = checkedItems[key]

                    return (
                      <label
                        key={itemIdx}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          isChecked
                            ? 'bg-white/5 border border-white/5'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="custom-checkbox mt-0.5"
                          checked={isChecked || false}
                          onChange={() => toggleCheck(phaseIdx, itemIdx)}
                        />
                        <div className="flex-1">
                          <span className={`text-sm leading-relaxed transition-all duration-200 ${
                            isChecked ? 'text-slate-500 line-through' : 'text-slate-300'
                          }`}>
                            {itemText}
                          </span>
                          {itemDetail && (
                            <p className="text-xs text-slate-500 mt-1">{itemDetail}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
