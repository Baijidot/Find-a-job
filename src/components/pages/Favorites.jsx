import { useState } from 'react'
import { getFavorites, removeFavorite, clearFavorites, formatDate } from '../../utils/storage'
import AnalysisRecordContent from '../AnalysisRecordContent'
import ReportExportMenu from '../ReportExportMenu'

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites())
  const [expandedId, setExpandedId] = useState(null)

  const handleRemove = (id) => {
    const updated = removeFavorite(id)
    setFavorites(updated)
    if (expandedId === id) setExpandedId(null)
  }

  const handleClearAll = () => {
    if (favorites.length === 0) return
    setFavorites(clearFavorites())
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">收藏记录</h1>
          <p className="text-sm text-slate-500 mt-1">你收藏的分析报告</p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            清空全部收藏
          </button>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/10 to-indigo-500/10 border border-pink-500/10 flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-400 mb-2">暂无收藏记录</h3>
          <p className="text-sm text-slate-600">去分析一个JD吧，发现有价值的结果可以收藏起来</p>
        </div>
      )}

      {/* Favorites List */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          {favorites.map((record, index) => (
            <div
              key={record.id}
              className="glass-card rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">{record.title}</h3>
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
                      {expandedId === record.id ? '收起' : '查看详情'}
                    </button>
                    <ReportExportMenu
                      record={record}
                      label="导出"
                      className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10"
                    />
                    <button
                      onClick={() => handleRemove(record.id)}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      取消收藏
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
          ))}
        </div>
      )}
    </div>
  )
}
