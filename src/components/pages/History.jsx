import { useState } from 'react'
import { getHistory, deleteHistory, clearHistory, addFavorite, formatDate } from '../../utils/storage'
import AnalysisRecordContent from '../AnalysisRecordContent'
import ReportExportMenu from '../ReportExportMenu'

const TYPE_CONFIG = {
  analyze: { label: '分析JD', icon: '🔍', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  resume: { label: '简历匹配', icon: '📄', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  interview: { label: '面试准备', icon: '🎯', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  insight: { label: '洞察报告', icon: '📊', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  skills: { label: '技能提取', icon: '⚡', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  roles: { label: '角色拆解', icon: '👥', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  compare: { label: '对比分析', icon: '⚖️', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
}

const FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'analyze', label: '🔍 分析JD' },
  { value: 'resume', label: '📄 简历匹配' },
  { value: 'interview', label: '🎯 面试准备' },
  { value: 'insight', label: '📊 洞察报告' },
  { value: 'skills', label: '⚡ 技能提取' },
  { value: 'roles', label: '👥 角色拆解' },
  { value: 'compare', label: '⚖️ 对比分析' },
]

export default function History() {
  const [history, setHistory] = useState(getHistory())
  const [expandedId, setExpandedId] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const filteredHistory = filterType === 'all'
    ? history
    : history.filter(r => r.type === filterType)

  const handleDelete = (id) => {
    const updated = deleteHistory(id)
    setHistory(updated)
    if (expandedId === id) setExpandedId(null)
  }

  const handleClearAll = () => {
    if (history.length === 0) return
    const updated = clearHistory()
    setHistory(updated)
    setExpandedId(null)
  }

  const handleFavorite = (record) => {
    addFavorite({
      type: record.type,
      jdText: record.jdText,
      title: record.title,
      results: record.results,
    })
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getTypeInfo = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.analyze

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">历史记录</h1>
          <p className="text-sm text-slate-500 mt-1">共 {history.length} 条分析记录</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            清空历史记录
          </button>
        )}
      </div>

      {/* Type Filter */}
      {history.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in">
          {FILTER_OPTIONS.map(opt => {
            const count = opt.value === 'all'
              ? history.length
              : history.filter(r => r.type === opt.value).length
            if (count === 0 && opt.value !== 'all') return null
            return (
              <button
                key={opt.value}
                onClick={() => setFilterType(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border whitespace-nowrap transition-all ${
                  filterType === opt.value
                    ? 'bg-indigo-500/20 text-white border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300 border-white/5 hover:border-white/10'
                }`}
              >
                {opt.label}
                <span className="text-xs opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/10 flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-400 mb-2">
            {filterType === 'all' ? '暂无历史记录' : `暂无${getTypeInfo(filterType).label}记录`}
          </h3>
          <p className="text-sm text-slate-600">
            {filterType === 'all' ? '分析一个JD后，结果会自动保存在这里' : `切换到「全部」查看所有记录`}
          </p>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length > 0 && (
        <div className="space-y-4">
          {filteredHistory.map((record, index) => {
            const typeInfo = getTypeInfo(record.type)
            return (
              <div
                key={record.id}
                className="glass-card rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <h3 className="text-base font-semibold text-white truncate">{record.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => toggleExpand(record.id)}
                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-500/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        {expandedId === record.id ? '收起' : '重新查看'}
                      </button>
                      <button
                        onClick={() => handleFavorite(record)}
                        className="text-sm text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-pink-500/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        收藏
                      </button>
                      <ReportExportMenu
                        record={record}
                        label="导出"
                        className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10"
                      />
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        删除
                      </button>
                    </div>
                  </div>
                  {/* JD Summary */}
                  {record.jdText && (
                    <p className="text-sm text-slate-500 leading-relaxed mt-2">
                      {record.jdText.length > 100 ? record.jdText.slice(0, 100) + '...' : record.jdText}
                    </p>
                  )}
                </div>

                {/* Expanded Detail */}
                {expandedId === record.id && record.results && (
                  <div className="border-t border-white/5 p-5 space-y-6 animate-fade-in">
                    <AnalysisRecordContent record={record} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
