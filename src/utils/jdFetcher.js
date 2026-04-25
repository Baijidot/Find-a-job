/**
 * JD 爬取工具 v3 — Jina Reader 渲染引擎
 *
 * 核心方案：Jina Reader API (r.jina.ai)
 * - 免费、无需API Key
 * - 服务端无头浏览器渲染，真正执行JavaScript
 * - 返回干净的 Markdown/纯文本
 * - 支持几乎所有网站（包括SPA）
 *
 * 降级策略：
 * 2. CORS代理 + __NEXT_DATA__/JSON-LD/meta提取
 */

// ==================== 进度回调 ====================
let _progressCallback = null

export function setProgressCallback(cb) {
  _progressCallback = cb
}

function reportProgress(message) {
  _progressCallback?.(message)
}

// ==================== 工具函数 ====================

function cleanText(text) {
  return text
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'").replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n').replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{3,}/g, '\n').replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style, noscript, meta, link, svg').forEach(el => el.remove())
  let text = doc.body?.textContent || doc.documentElement?.textContent || ''
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * 从渲染后的文本中智能提取JD内容
 */
function extractJDFromRenderedText(text) {
  if (!text || text.length < 50) return null

  // JD关键词匹配
  const jdKeywords = [
    '岗位职责', '职位描述', '工作职责', '工作内容', 'Job Description',
    '任职要求', '任职资格', '岗位要求', '职位要求', 'Requirements',
    '加分项', '优先条件', 'Preferred', '薪资', '薪酬', '待遇', 'Salary',
    '工作地点', '办公地点', 'Location', '经验要求', '学历要求',
    'Qualifications', 'Responsibilities', 'What you', 'About the',
  ]

  const lowerText = text.toLowerCase()
  const matched = jdKeywords.filter(kw => lowerText.includes(kw.toLowerCase()))

  // 至少匹配2个关键词
  if (matched.length < 2) return null

  // 找JD起始位置
  const startPatterns = [
    /岗位职责/i, /职位描述/i, /工作职责/i, /工作内容/i, /job\s*description/i,
    /岗位说明/i, /关于这个职位/i, /你将会/i, /我们正在寻找/i, /we are looking/i,
    /about this role/i, /about the role/i, /what you'll do/i, /what you will do/i,
    /responsibilities/i, /qualifications/i,
  ]

  let startIdx = 0
  for (const p of startPatterns) {
    const m = text.search(p)
    if (m > 0 && (startIdx === 0 || m < startIdx)) startIdx = Math.max(0, m - 30)
  }

  // 找JD结束位置
  const endPatterns = [
    /查看更多/i, /展开全部/i, /分享岗位/i, /举报/i,
    /相关推荐/i, /相似职位/i, /猜你喜欢/i, /为您推荐/i,
    /查看公司/i, /公司介绍/i, /扫码关注/i, /关注公众号/i,
    /apply now/i, /submit your application/i, /share this job/i,
    /see more jobs/i, /similar jobs/i, /recommended jobs/i,
  ]

  let endIdx = text.length
  for (const p of endPatterns) {
    const m = text.search(p)
    if (m > startIdx + 100 && m < endIdx) endIdx = m
  }

  let jdText = text.slice(startIdx, endIdx).trim()
  if (jdText.length < 100) jdText = text.trim()

  jdText = cleanText(jdText)
  return jdText.length >= 50 ? jdText : null
}

// ==================== 站点识别 ====================

export function detectSiteName(url) {
  const lowerUrl = url.toLowerCase()
  const sites = [
    { pattern: 'bytedance.com', name: '字节跳动', icon: '🔵' },
    { pattern: 'zhipin.com', name: 'Boss直聘', icon: '🟢' },
    { pattern: 'lagou.com', name: '拉勾', icon: '🟡' },
    { pattern: 'linkedin.com', name: 'LinkedIn', icon: '🔷' },
    { pattern: 'liepin.com', name: '猎聘', icon: '🟠' },
    { pattern: '51job.com', name: '前程无忧', icon: '🔴' },
    { pattern: 'zhaopin.com', name: '智联招聘', icon: '🟣' },
    { pattern: 'nowcoder.com', name: '牛客网', icon: '🟤' },
    { pattern: 'campus', name: '校招', icon: '🎓' },
    { pattern: 'talent', name: '招聘', icon: '💼' },
  ]
  for (const site of sites) {
    if (lowerUrl.includes(site.pattern)) return site
  }
  return { name: '招聘网站', icon: '🌐' }
}

// ==================== 策略1: Jina Reader API（主策略）====================

/**
 * Jina Reader API — 免费无头浏览器渲染服务
 * URL格式: https://r.jina.ai/{target_url}
 * 特点:
 * - 服务端渲染JavaScript，返回Markdown
 * - 免费、无需API Key（有速率限制但够用）
 * - 支持几乎所有网站
 */
async function fetchViaJinaReader(url) {
  reportProgress('正在通过渲染引擎获取页面（Jina Reader）...')

  const jinaUrl = `https://r.jina.ai/${url}`

  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/plain, text/markdown, application/json',
      'X-Return-Format': 'text',
      'X-No-Cache': 'true',
    },
    signal: AbortSignal.timeout(30000), // 30s超时（渲染需要时间）
  })

  if (!response.ok) {
    // Jina 返回错误
    const errorText = await response.text().catch(() => '')
    throw new Error(`Jina Reader 返回 ${response.status}: ${errorText.slice(0, 200)}`)
  }

  const contentType = response.headers.get('content-type') || ''

  let text = ''

  if (contentType.includes('application/json')) {
    // JSON格式响应
    try {
      const json = await response.json()
      text = json.data?.content || json.content || json.text || JSON.stringify(json)
    } catch {
      text = await response.text()
    }
  } else {
    // Markdown/纯文本响应
    text = await response.text()
  }

  if (!text || text.length < 50) {
    throw new Error('Jina Reader 返回内容为空')
  }

  // 从渲染后的文本中提取JD
  const jdText = extractJDFromRenderedText(text)

  if (jdText) {
    return jdText
  }

  // 如果关键词匹配失败，但文本足够长，尝试返回全文（可能是纯Markdown格式的JD）
  if (text.length > 200) {
    // 清理Markdown格式
    const cleaned = text
      .replace(/^#+\s+/gm, '')    // 去掉标题标记
      .replace(/\*\*/g, '')       // 去掉粗体
      .replace(/\*/g, '')         // 去掉斜体
      .replace(/!\[.*?\]\(.*?\)/g, '') // 去掉图片
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接保留文字
      .replace(/^[-*]\s+/gm, '• ') // 列表标记统一
      .trim()

    if (cleaned.length > 100) {
      return cleaned
    }
  }

  throw new Error('未能从渲染内容中提取到JD')
}

// ==================== 策略2: CORS代理 + 结构化数据提取 ====================

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
]

async function fetchWithCorsProxy(url, timeout = 15000) {
  for (const makeProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxyUrl(url)
      const response = await fetch(proxyUrl, {
        headers: { 'Accept': 'text/html,application/json,*/*' },
        signal: AbortSignal.timeout(timeout),
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        const text = await response.text()

        if (contentType.includes('application/json')) {
          try {
            const json = JSON.parse(text)
            return json.contents || json.data || text
          } catch { return text }
        }
        return text
      }
    } catch { continue }
  }
  return null
}

function extractJsonLd(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent)
      if (data.description && data.description.length > 50) return cleanText(data.description)
    } catch { /* ignore */ }
  }
  return null
}

function extractMetaDescription(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const meta = doc.querySelector('meta[name="description"]') || doc.querySelector('meta[property="og:description"]')
  if (meta) {
    const content = meta.getAttribute('content')
    if (content && content.length > 30) return content.trim()
  }
  return null
}

function deepSearch(obj, targetKeys, depth = 0) {
  if (depth > 8 || !obj || typeof obj !== 'object') return null
  for (const key of targetKeys) {
    if (obj[key] && typeof obj[key] === 'string' && obj[key].length > 30) return obj[key]
  }
  for (const val of Object.values(obj)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = deepSearch(val, targetKeys, depth + 1)
      if (found) return found
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object') {
          const found = deepSearch(item, targetKeys, depth + 1)
          if (found) return found
        }
      }
    }
  }
  return null
}

async function fetchViaCorsAndExtract(url) {
  reportProgress('正在通过CORS代理获取页面结构化数据...')

  const html = await fetchWithCorsProxy(url)
  if (!html || html.length < 200) return null

  // 1. 尝试 __NEXT_DATA__（Next.js SSR）
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1])
      const props = data?.props?.pageProps || data?.props?.initialProps
      const found = deepSearch(props || data, [
        'job_description', 'description', 'content', 'responsibilities',
        'job_content', 'jobDesc', 'postDescription', 'jobInfo',
        'positionDetail', 'jobDetail', 'detail',
      ])
      if (found && found.length > 30) return cleanText(found)
    } catch { /* ignore */ }
  }

  // 2. 尝试 window.__INITIAL_STATE__（Boss直聘等）
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})\s*;?\s*<\/script>/)
  if (stateMatch) {
    try {
      const data = JSON.parse(stateMatch[1])
      const found = deepSearch(data, ['jobInfo', 'jobDetail', 'jobDesc', 'postDescription', 'description', 'content'])
      if (found && typeof found === 'string' && found.length > 30) return cleanText(found)
      if (found && typeof found === 'object') {
        const desc = found.jobDesc || found.postDescription || found.description || found.content || ''
        if (desc.length > 30) return cleanText(desc)
      }
    } catch { /* ignore */ }
  }

  // 3. JSON-LD
  const jsonLd = extractJsonLd(html)
  if (jsonLd) return jsonLd

  // 4. Meta description
  const metaDesc = extractMetaDescription(html)
  if (metaDesc && metaDesc.length > 80) return metaDesc

  // 5. CSS选择器提取
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const selectors = [
    '.job-sec', '.job-detail', '.text-fold', '.job-card-wrapper',
    '[class*="job-detail"]', '[class*="job-content"]', '[class*="job-desc"]',
    '.info-desc', '.job-info-text', '.job-sec-text',
    '.job-detail', '.job_bt', '.job-description', '#job_detail',
    '.show-more-less-html', '.description__text', '[class*="description"]',
  ]

  for (const sel of selectors) {
    const el = doc.querySelector(sel)
    if (el) {
      const text = el.textContent?.trim()
      if (text && text.length > 50) {
        return text.replace(/\s+/g, ' ').replace(/([。！？])/g, '$1\n').trim()
      }
    }
  }

  // 6. 全文提取
  const text = htmlToText(html)
  return extractJDFromRenderedText(text)
}

// ==================== 策略3: 通过CORS代理调用Jina Reader ====================

/**
 * 有些网络环境下无法直接访问 r.jina.ai
 * 通过CORS代理中转调用Jina Reader
 */
async function fetchViaJinaReaderProxy(url) {
  reportProgress('正在通过代理渲染页面...')

  const jinaUrl = `https://r.jina.ai/${url}`
  const html = await fetchWithCorsProxy(jinaUrl, 30000)

  if (!html || html.length < 50) return null

  // Jina返回的可能是Markdown或纯文本
  const jdText = extractJDFromRenderedText(html)
  if (jdText) return jdText

  // 清理Markdown后返回
  if (html.length > 200) {
    const cleaned = html
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[-*]\s+/gm, '• ')
      .trim()
    if (cleaned.length > 100) return cleaned
  }

  return null
}

// ==================== 主函数 ====================

/**
 * 从URL爬取JD（多策略自动降级）
 * @param {string} url - 招聘链接
 * @returns {Promise<{success: boolean, jdText?: string, error?: string, site?: object, strategy?: string}>}
 */
export async function fetchJDFromUrl(url) {
  if (!url || !url.trim()) {
    return { success: false, error: '请输入有效的招聘链接' }
  }

  const trimmedUrl = url.trim()
  const fullUrl = trimmedUrl.match(/^https?:\/\//) ? trimmedUrl : `https://${trimmedUrl}`

  try { new URL(fullUrl) } catch {
    return { success: false, error: '链接格式不正确，请检查后重试' }
  }

  const site = detectSiteName(fullUrl)

  // ===== 策略1: Jina Reader 直连（无头浏览器渲染）=====
  try {
    reportProgress(`正在渲染 ${site.name} 页面...`)
    const result = await fetchViaJinaReader(fullUrl)
    if (result && result.length >= 50) {
      return { success: true, jdText: result, site, strategy: 'Jina渲染引擎' }
    }
  } catch (err) {
    console.warn('策略1(Jina Reader直连)失败:', err.message)
  }

  // ===== 策略2: 通过CORS代理调用Jina Reader =====
  try {
    reportProgress('正在通过代理渲染页面...')
    const result = await fetchViaJinaReaderProxy(fullUrl)
    if (result && result.length >= 50) {
      return { success: true, jdText: result, site, strategy: '代理渲染引擎' }
    }
  } catch (err) {
    console.warn('策略2(Jina Reader代理)失败:', err.message)
  }

  // ===== 策略3: CORS代理 + 结构化数据提取 =====
  try {
    const result = await fetchViaCorsAndExtract(fullUrl)
    if (result && result.length >= 50) {
      return { success: true, jdText: result, site, strategy: '结构化数据提取' }
    }
  } catch (err) {
    console.warn('策略3(CORS+提取)失败:', err.message)
  }

  // 所有策略都失败
  return {
    success: false,
    error: `已尝试3种策略均未能提取到JD内容。可能原因：\n1. 该页面需要登录才能查看\n2. 当前网络环境受限\n\n建议：直接在浏览器中打开链接，复制JD文本粘贴到输入框中。`,
    site,
  }
}
