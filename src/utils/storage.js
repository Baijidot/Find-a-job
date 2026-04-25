/**
 * localStorage 存储工具
 * 管理历史记录、收藏等持久化数据
 */

import { createRecordFingerprint, createResultModel, normalizeStoredRecord } from './resultModel'

const HISTORY_KEY = 'jd_analyzer_history'
const FAVORITES_KEY = 'jd_analyzer_favorites'

function readList(key) {
  try {
    const stored = localStorage.getItem(key)
    const list = stored ? JSON.parse(stored) : []
    return Array.isArray(list) ? list.map(normalizeStoredRecord).filter(Boolean) : []
  } catch {
    return []
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

function createStoredRecord(record, createdAt = new Date().toISOString()) {
  const resultModel = createResultModel(record.type, record.results)

  return {
    id: record.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    fingerprint: record.fingerprint || createRecordFingerprint({
      type: record.type,
      jdText: record.jdText,
      results: resultModel.raw,
    }),
    type: record.type || 'analyze',
    jdText: record.jdText || '',
    title: record.title || extractTitle(record.jdText),
    results: resultModel.raw,
    resultModel,
    createdAt: record.createdAt || createdAt,
  }
}

// ==================== 历史记录 ====================

export function getHistory() {
  return readList(HISTORY_KEY)
}

export function addHistory(record) {
  const history = getHistory()
  const newRecord = createStoredRecord(record)
  history.unshift(newRecord)
  // 最多保留 50 条
  if (history.length > 50) history.length = 50
  writeList(HISTORY_KEY, history)
  return newRecord
}

export function deleteHistory(id) {
  const history = getHistory().filter(h => h.id !== id)
  writeList(HISTORY_KEY, history)
  return history
}

export function clearHistory() {
  writeList(HISTORY_KEY, [])
  return []
}

// ==================== 收藏记录 ====================

export function getFavorites() {
  return readList(FAVORITES_KEY)
}

export function addFavorite(record) {
  const favorites = getFavorites()
  const newRecord = createStoredRecord(record)

  const existing = favorites.find(favorite => favorite.fingerprint === newRecord.fingerprint)
  if (existing) {
    return existing
  }

  favorites.unshift(newRecord)
  writeList(FAVORITES_KEY, favorites)
  return newRecord
}

export function removeFavorite(id) {
  const favorites = getFavorites().filter(f => f.id !== id)
  writeList(FAVORITES_KEY, favorites)
  return favorites
}

export function clearFavorites() {
  writeList(FAVORITES_KEY, [])
  return []
}

export function isFavorited(recordOrFingerprint) {
  const fingerprint = typeof recordOrFingerprint === 'string'
    ? recordOrFingerprint
    : createRecordFingerprint({
        type: recordOrFingerprint?.type,
        jdText: recordOrFingerprint?.jdText,
        results: recordOrFingerprint?.results,
      })

  return getFavorites().some(f => f.fingerprint === fingerprint)
}

// ==================== 工具函数 ====================

function extractTitle(jd) {
  if (!jd) return '未命名 JD'
  const lines = jd.trim().split('\n')
  // 尝试提取职位名称
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[:：]/g, '').trim()
    if (cleaned.includes('职位') || cleaned.includes('岗位') || cleaned.includes('名称')) {
      return cleaned.replace(/.*(职位|岗位|名称)\s*/, '').trim() || '未命名 JD'
    }
  }
  return lines[0].slice(0, 30) + (lines[0].length > 30 ? '...' : '')
}

export function formatDate(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
