/**
 * AI 工具函数 - OpenAI 协议调用
 * 支持配置自定义 API Key、Base URL 和模型
 *
 * 功能定位（6个独立分析维度，互不重叠）：
 * 1. analyzeJD      - 首页"快速扫描"：真实工作 + 隐藏要求 + 行动计划（值不值得投）
 * 2. generateInsight - 洞察报告：市场趋势 + 行业对标 + 职业路径（宏观视角）
 * 3. extractSkillMap - 技能提取：技术栈全景 + 学习路径 + 市场稀缺度（技能视角）
 * 4. breakdownRole   - 角色拆解：组织定位 + 职责占比 + 协作关系（组织视角）
 * 5. compareJDs      - 对比分析：多维度对比 + 差异分析 + 推荐（决策视角）
 */

import {
  validateAnalyzeJDResult,
  validateAnalyzeSkillsResult,
  validateGeneratePlanResult,
  validateInsightResult,
  validateSkillMapResult,
  validateRoleBreakdownResult,
  validateCompareResult,
  validateResumeMatchResult,
  validateInterviewPrepResult,
  validateMockInterviewResult,
  validateEvaluateAnswerResult,
  validateSkillGapResult,
  validateSalaryCredibilityResult,
  validateResumeTailorResult,
  validateCompanyResearchResult,
} from './analysisSchemas'

// ==================== 配置管理 ====================

const CONFIG_KEY = 'jd_analyzer_config'

const DEFAULT_CONFIG = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 16384,
}

const DEFAULT_TIMEOUT_MS = 90000
const DEFAULT_RETRY_TIMES = 2

export function getConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.warn('Failed to load config:', e)
  }
  return { ...DEFAULT_CONFIG }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch (e) {
    console.warn('Failed to save config:', e)
  }
}

// ==================== 输入截断 ====================

const MAX_INPUT_CHARS = 5000

function estimateTokens(text) {
  return Math.ceil(text.length / 1.5)
}

function truncateText(text, maxChars = MAX_INPUT_CHARS) {
  if (!text || text.length <= maxChars) return text
  const half = Math.floor(maxChars / 2)
  return text.slice(0, half) + '\n\n... (内容过长，中间部分已自动截断) ...\n\n' + text.slice(-half)
}

function truncatePrompt(prompt, maxChars = MAX_INPUT_CHARS) {
  if (!prompt || prompt.length <= maxChars) return prompt

  const parts = prompt.split(/(---)/g)
  const result = []
  let consumed = 0

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i]
    if (consumed + part.length > maxChars) {
      const remaining = maxChars - consumed - 100
      if (remaining > 200) {
        result.push(part.slice(0, Math.floor(remaining / 2)))
        result.push('\n\n... (内容过长已截断) ...\n\n')
        result.push(part.slice(-Math.floor(remaining / 2)))
      }
      break
    }
    result.push(part)
    consumed += part.length
  }

  return result.join('')
}

// ==================== LLM 调用 ====================

/**
 * 统一 LLM 调用函数（OpenAI 协议）
 */
export async function callLLM(prompt, options = {}) {
  const config = getConfig()

  if (!config.apiKey) {
    throw new Error('请先在设置中配置 API Key')
  }

  const truncatedPrompt = truncatePrompt(prompt, options.maxInputChars ?? MAX_INPUT_CHARS)

  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`

  const body = {
    model: options.model || config.model,
    messages: [
      {
        role: 'system',
        content: options.systemPrompt || '你是一位资深的职业分析师和 HR 专家。请只返回纯 JSON 数据，不要包含任何解释文字。每条描述控制在1句话以内，保持简洁。',
      },
      {
        role: 'user',
        content: truncatedPrompt,
      },
    ],
    temperature: options.temperature ?? config.temperature,
    max_tokens: options.maxTokens ?? config.maxTokens,
  }

  if (options.responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' }
  }

  const maxRetries = options.retries ?? DEFAULT_RETRY_TIMES

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      const text = await response.text()
      const payload = safeJsonParse(text)

      if (!response.ok) {
        const message = payload?.error?.message || text || `API 请求失败 (${response.status})`
        if (shouldRetry(response.status) && attempt < maxRetries) {
          await sleep(getRetryDelay(attempt))
          continue
        }
        throw new Error(message)
      }

      const content = extractLLMContent(payload)
      if (!content) {
        throw new Error('API 返回内容为空，请检查模型配置或尝试更换模型')
      }

      return content
    } catch (error) {
      const timeoutError = error?.name === 'AbortError'
      const networkError = error instanceof TypeError

      if ((timeoutError || networkError) && attempt < maxRetries) {
        await sleep(getRetryDelay(attempt))
        continue
      }

      if (timeoutError) {
        throw new Error('AI 请求超时，请稍后重试或缩短输入内容')
      }

      throw error
    } finally {
      window.clearTimeout(timeout)
    }
  }

  throw new Error('AI 请求失败，请稍后重试')
}

// ==================== JSON 解析工具 ====================

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function shouldRetry(status) {
  return status === 408 || status === 429 || status >= 500
}

function getRetryDelay(attempt) {
  return Math.min(1500 * (attempt + 1), 4000)
}

function extractLLMContent(payload) {
  const message = payload?.choices?.[0]?.message
  const messageContent = message?.content
  const reasoningContent = message?.reasoning_content
  const outputText = payload?.output_text

  if (typeof messageContent === 'string' && messageContent.trim()) {
    return messageContent.trim()
  }

  if (Array.isArray(messageContent)) {
    const textParts = messageContent
      .filter((item) => {
        if (typeof item === 'string') return true
        return item?.type === 'text' || item?.text || item?.content
      })
      .map((item) => {
        if (typeof item === 'string') return item
        return item?.text || item?.content || ''
      })
    const joined = textParts.join('\n').trim()
    if (joined) return joined
  }

  if (typeof outputText === 'string' && outputText.trim()) {
    return outputText.trim()
  }

  if (typeof reasoningContent === 'string' && reasoningContent.trim()) {
    return reasoningContent.trim()
  }

  return ''
}

function sanitizeJsonCandidate(text) {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, '\'')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/[\u0000-\u001F]+/g, ' ')
    .replace(/:(\s*)(\d{2,})\.(\d+)/g, ':$1$2.$3')
    .trim()
}

function findBalancedJsonCandidates(text) {
  const candidates = []
  const stack = []
  let inString = false
  let escaped = false
  let start = -1

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{' || char === '[') {
      if (stack.length === 0) {
        start = i
      }
      stack.push(char)
      continue
    }

    if ((char === '}' || char === ']') && stack.length > 0) {
      const last = stack[stack.length - 1]
      const matched = (last === '{' && char === '}') || (last === '[' && char === ']')
      if (!matched) {
        stack.length = 0
        start = -1
        continue
      }

      stack.pop()

      if (stack.length === 0 && start >= 0) {
        candidates.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }

  return candidates.sort((a, b) => b.length - a.length)
}

function tryParseJson(text) {
  if (!text) return null
  const sanitized = sanitizeJsonCandidate(text)
  const parsed = safeJsonParse(sanitized)
  if (parsed !== null) return parsed

  const unescaped = sanitized
    .replace(/\\(?!["\\/bfnrtu])/g, '')
  return safeJsonParse(unescaped)
}



function repairTruncatedJSON(text) {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed.startsWith('{') || trimmed.endsWith('}')) return null

  let repaired = trimmed
  let inString = false
  let escaped = false
  const stack = []

  for (let i = 0; i < repaired.length; i += 1) {
    const char = repaired[i]
    if (escaped) { escaped = false; continue }
    if (char === '\\') { escaped = true; continue }
    if (char === '"') { inString = !inString; continue }
    if (inString) continue
    if (char === '{' || char === '[') {
      stack.push(char === '{' ? '}' : ']')
    } else if ((char === '}' || char === ']') && stack.length > 0) {
      stack.pop()
    }
  }

  if (inString) repaired += '"'
  repaired = repaired.replace(/,\s*$/, '')
  while (stack.length > 0) repaired += stack.pop()

  try {
    const parsed = safeJsonParse(sanitizeJsonCandidate(repaired))
    if (parsed !== null && typeof parsed === 'object') return parsed
  } catch (_) {}

  return null
}

function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('无法解析 AI 返回的 JSON 数据，请重试')
  }

  const trimmed = text.trim()

  const strategies = [
    () => tryParseJson(trimmed),
    () => {
      const firstBrace = trimmed.indexOf('{')
      const lastBrace = trimmed.lastIndexOf('}')
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        return tryParseJson(trimmed.slice(firstBrace, lastBrace + 1))
      }
      return null
    },
    () => {
      const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
      return match ? tryParseJson(match[1].trim()) : null
    },
    () => {
      const candidates = findBalancedJsonCandidates(trimmed)
      for (const c of candidates) {
        const p = tryParseJson(c)
        if (p !== null) return p
      }
      return null
    },
    () => {
      const stripped = trimmed
        .replace(/^[\s\S]*?\{/, '{')
        .replace(/\}[\s\S]*$/, '}')
      return tryParseJson(stripped)
    },
    () => {
      const match = trimmed.match(/\{[\s\S]*\}/)
      return match ? tryParseJson(match[0]) : null
    },
    () => repairTruncatedJSON(trimmed),
  ]

  for (const strategy of strategies) {
    try {
      const result = strategy()
      if (result !== null && typeof result === 'object') {
        return result
      }
    } catch (_) {
    }
  }

  const trimmedStart = trimmed.trimStart()
  if (trimmedStart.startsWith('{') && !trimmed.endsWith('}')) {
    throw new Error('AI 返回被截断（max_tokens 不足）。请增大 max_tokens 或缩短输入内容后重试')
  }

  throw new Error(`无法解析 AI 返回的 JSON 数据，请重试`)
}

function validateParsedResult(parsed, validator) {
  if (!validator) return parsed

  try {
    return validator(parsed)
  } catch (error) {
    throw new Error(`AI 返回数据格式异常：${error.message}`)
  }
}

async function callAndParse(prompt, options = {}) {
  const raw = await callLLM(prompt, options)
  try {
    const parsed = extractJSON(raw)
    return validateParsedResult(parsed, options.validator)
  } catch (parseError) {
    throw parseError
  }
}

// ==================== 1. 首页"快速扫描" ====================

/**
 * 定位：帮求职者快速判断"这个岗位值不值得投"
 * 视角：从求职者利益出发，揭示JD背后的真相
 */
export async function analyzeJD(jd) {
  const prompt = `作为求职顾问，判断这个岗位值不值得投。请只返回JSON，每个字段1-2句话，不要展开。

JSON格式（严格遵守）：
{
  "summary": "一句话总结",
  "verdict": "推荐投递/谨慎考虑/不建议投递",
  "dailyReality": ["日常1", "日常2", "日常3"],
  "hiddenRequirements": ["隐藏要求1", "隐藏要求2"],
  "redFlags": ["风险1", "风险2"],
  "salaryInsight": ["薪资分析1", "薪资分析2"]
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateAnalyzeJDResult })
}

/**
 * 首页技能分析（快速扫描版）
 * 定位：快速列出需要什么技能，按优先级排序
 */
export async function analyzeSkills(jd) {
  const prompt = `分析JD所需技能，按优先级排序。只返回JSON，每条1句话。

JSON格式：
{
  "summary": "技能画像总结（1句话）",
  "skills": [
    {"name": "技能名", "level": "必须掌握/核心技能/重要技能/加分技能/了解即可", "reason": "为什么需要（1句话）"}
  ]
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateAnalyzeSkillsResult })
}

/**
 * 首页行动计划（基于JD和技能分析）
 * 定位：如果决定投递，接下来该怎么做
 */
export async function generatePlan(jd, skills) {
  const skillsText = typeof skills === 'string'
    ? truncateText(skills, 2000)
    : truncateText(JSON.stringify(skills, null, 0), 2000)

  const prompt = `基于JD和技能分析，生成投递准备计划。只返回JSON，每条1句话，每阶段最多3个任务。

JSON格式：
{
  "summary": "准备计划概述（1句话）",
  "phases": [
    {
      "title": "投递前准备",
      "timeline": "1周内",
      "items": [{"title": "任务", "detail": "说明（1句话）"}]
    },
    {
      "title": "面试准备",
      "timeline": "1个月内",
      "items": [{"title": "任务", "detail": "说明（1句话）"}]
    },
    {
      "title": "入职前提升",
      "timeline": "3个月内",
      "items": [{"title": "任务", "detail": "说明（1句话）"}]
    }
  ]
}

JD：
---\n${jd}\n---

技能分析：
---\n${skillsText}\n---`

  return await callAndParse(prompt, { validator: validateGeneratePlanResult })
}

// ==================== 2. 洞察报告（宏观市场视角）====================

/**
 * 定位：从宏观市场角度分析这个岗位
 * 视角：行业趋势、市场供需、职业发展路径
 * 与首页的区别：首页关注"这个岗位本身"，洞察报告关注"这类岗位在市场中的位置"
 */
export async function generateInsight(jd) {
  const prompt = `从宏观市场角度分析这个岗位。只返回JSON，每条1句话。

JSON格式：
{
  "summary": "市场洞察总结（1句话）",
  "trend": {
    "marketHeat": "高需求/中等需求/需求下降",
    "demandTrend": "趋势描述（1句话）",
    "salaryPosition": "偏高/中等/偏低",
    "futureOutlook": "未来趋势（1句话）",
    "insights": ["洞察1", "洞察2"]
  },
  "benchmark": [
    {"role": "对标岗位", "company": "典型公司", "similarity": "相似度", "differences": "差异", "advantages": "优势"}
  ],
  "careerPaths": [
    {"direction": "方向", "description": "描述（1句话）", "nextStep": "下一步", "timeline": "时间线"}
  ]
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateInsightResult })
}

// ==================== 3. 技能提取（技术栈全景视角）====================

/**
 * 定位：从技术栈和技能图谱角度深度分析
 * 视角：技能分类、匹配度、学习路径、市场稀缺度
 * 与首页的区别：首页只是"列出技能"，这里是"技能全景地图"
 */
export async function extractSkillMap(jd) {
  const prompt = `为JD构建技能全景地图。只返回JSON，每条1句话，每类最多5个技能。

JSON格式：
{
  "summary": "技能全景总结（1句话）",
  "radarDimensions": [
    {"name": "维度名", "score": 85}
  ],
  "categories": [
    {
      "name": "技术技能",
      "icon": "💻",
      "skills": [{"name": "技能名", "match": 90, "description": "说明", "resource": "推荐资源"}]
    },
    {
      "name": "软技能",
      "icon": "🧠",
      "skills": [{"name": "技能名", "match": 70, "description": "说明", "resource": "推荐资源"}]
    },
    {
      "name": "工具技能",
      "icon": "🔧",
      "skills": [{"name": "技能名", "match": 80, "description": "说明", "resource": "推荐资源"}]
    }
  ],
  "learningPath": [
    {"phase": "第1月：基础补强", "skills": ["技能1", "技能2"], "resources": "推荐资源"}
  ]
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateSkillMapResult })
}

// ==================== 4. 角色拆解（组织行为视角）====================

/**
 * 定位：从组织架构和日常工作场景角度分析
 * 视角：这个人在团队中扮演什么角色、和谁协作、时间怎么分配
 * （这个功能已经很独特，保持不变）
 */
export async function breakdownRole(jd) {
  const prompt = `拆解JD岗位在组织中的角色。只返回JSON，每条1句话。

JSON格式：
{
  "summary": "角色定位总结（1句话）",
  "rolePosition": {
    "title": "真实角色标题",
    "description": "描述（1句话）",
    "teamContext": "团队上下文",
    "keyTraits": ["特质1", "特质2"]
  },
  "hierarchy": {
    "reportsTo": {"title": "汇报对象", "description": "描述"},
    "peers": [{"title": "平级角色", "description": "协作关系"}],
    "manages": {"title": "下属角色", "description": "管理关系"}
  },
  "responsibilities": [
    {"name": "职责名", "percentage": 30, "description": "描述"}
  ],
  "collaborators": [
    {"role": "协作角色", "frequency": "频繁/定期/偶尔", "purpose": "目的"}
  ],
  "timeAllocation": [
    {"activity": "活动", "hours": 3, "percentage": 37.5, "description": "描述"}
  ]
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateRoleBreakdownResult })
}

// ==================== 5. 对比分析（决策视角）====================

/**
 * 定位：帮求职者在多个offer之间做选择
 * 视角：多维度量化对比 + 差异分析 + 最终推荐
 */
export async function compareJDs(jd1, jd2, title1, title2) {
  const t1 = truncateText(jd1, 2000)
  const t2 = truncateText(jd2, 2000)
  const prompt = `对比两个职位。只返回JSON，每条1句话。

职位A：${title1 || '职位A'}
职位B：${title2 || '职位B'}

JSON格式：
{
  "similarityScore": 65,
  "comparison": [
    {"dimension": "薪资待遇", "jd1": "A的情况", "jd2": "B的情况", "advantage": "A/B/持平"}
  ],
  "differences": ["差异1", "差异2"],
  "recommendation": {
    "choice": "推荐A/B/各有优劣",
    "reason": "理由（1句话）",
    "details": ["理由1", "理由2"]
  }
}

--- 职位A ---
${t1}

--- 职位B ---
${t2}
---`

  return await callAndParse(prompt, { validator: validateCompareResult })
}

// ==================== 6. 简历匹配分析（求职者视角）====================

/**
 * 定位：帮求职者分析简历与JD的匹配度
 * 视角：从候选人现有条件出发，量化匹配程度 + 找出差距 + 给出优化建议
 */
export async function matchResume(jd, resume) {
  const tResume = truncateText(resume, 2000)
  const prompt = `分析简历与JD的匹配度。只返回JSON，每条1句话，每类最多3项。

JSON格式：
{
  "summary": "匹配度总结（1句话）",
  "overallScore": 75,
  "scoreBreakdown": {"skillMatch": 80, "experienceMatch": 70, "educationMatch": 90, "softSkillMatch": 75, "cultureFit": 65},
  "matchedStrengths": [
    {"category": "技能/经验/学历/软技能", "item": "匹配项", "detail": "说明", "confidence": "高/中/低"}
  ],
  "gaps": [
    {"category": "技能/经验/学历/软技能", "item": "缺失项", "severity": "关键缺失/重要缺失/轻微不足", "suggestion": "如何弥补"}
  ],
  "resumeOptimization": [
    {"section": "简历板块", "currentIssue": "问题", "suggestedFix": "建议", "example": "优化示例"}
  ],
  "interviewFocus": [
    {"topic": "重点话题", "reason": "原因", "preparation": "如何准备"}
  ],
  "verdict": "强烈推荐投递/推荐投递/可以尝试/需要补强后再投/不太匹配"
}

--- 目标JD ---
${jd}

--- 简历 ---
${tResume}`

  return await callAndParse(prompt, { maxTokens: 16384, validator: validateResumeMatchResult })
}

// ==================== 7. 面试问题生成（面试准备视角）====================

/**
 * 定位：基于JD生成面试问题 + 搜索面经参考
 * 视角：面试官会问什么 + 真实面经参考 + 答题思路
 */
export async function generateInterviewQuestions(jd) {
  const prompt = `基于JD生成面试准备方案。只返回JSON，每条1句话，问题最多5个。

JSON格式：
{
  "summary": "面试准备总结（1句话）",
  "questions": [
    {"category": "技术基础/项目经验/系统设计/行为面试/开放性问题", "question": "问题", "difficulty": "简单/中等/困难", "focus": "考察点", "answerTips": "答题思路", "commonMistakes": "常见错误", "followUp": "追问方向"}
  ],
  "searchQueries": [
    {"keyword": "搜索关键词", "platform": "推荐平台", "reason": "为什么搜"}
  ],
  "preparationStrategy": [
    {"phase": "准备阶段", "tasks": ["任务1", "任务2"], "tips": "建议"}
  ],
  "redFlags": ["雷区1", "雷区2"]
}

--- JD ---
${jd}`

  return await callAndParse(prompt, { maxTokens: 16384, validator: validateInterviewPrepResult })
}

// ==================== 导出 ====================

// ==================== 7. AI模拟面试 ====================

export async function generateMockInterview(jd) {
  const prompt = `基于JD生成模拟面试问题。只返回JSON，每条1句话，5个问题。

JSON格式：
{
  "summary": "面试定位（1句话）",
  "questions": [
    {"id": 1, "question": "问题", "category": "技术基础/项目经验/系统设计/行为面试/情景题", "difficulty": "简单/中等/困难", "expectedPoints": ["要点1", "要点2"], "scoringGuide": "评分标准", "followUp": "追问"}
  ]
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateMockInterviewResult })
}

export async function evaluateInterviewAnswer(question, answer, jdContext) {
  const tCtx = truncateText(jdContext, 2000)
  const prompt = `评估面试回答。只返回JSON，每条1句话。

JD背景：
---\n${tCtx}\n---

问题：${question}

回答：${answer}

JSON格式：
{
  "score": 75,
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"],
  "feedback": "综合评价（1句话）",
  "improvement": ["建议1", "建议2"],
  "referenceAnswer": "参考答案"
}`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateEvaluateAnswerResult })
}

// ==================== 8. 技能差距热力图 ====================

export async function analyzeSkillGap(jd, mySkills) {
  const tSkills = truncateText(mySkills, 2000)
  const prompt = `对比JD要求和候选人技能，分析差距。只返回JSON，每条1句话，技能最多8个。

JSON格式：
{
  "summary": "技能匹配总结（1句话）",
  "overallMatch": 65,
  "skills": [
    {"name": "技能名", "required": 85, "current": 60, "gap": 25, "category": "前端/后端/数据库/DevOps/软技能/工具", "importance": "关键/重要/加分项", "suggestion": "如何提升"}
  ],
  "criticalGaps": ["关键差距1", "差距2"],
  "strengths": ["优势1", "优势2"],
  "learningPlan": [
    {"priority": 1, "skill": "技能名", "timeline": "学习时间", "resources": "推荐资源"}
  ]
}

JD：
---\n${jd}\n---

技能栈：
---\n${tSkills}\n---`

  return await callAndParse(prompt, { validator: validateSkillGapResult })
}

// ==================== 9. 薪资可信度检测 ====================

export async function checkSalaryCredibility(jd) {
  const prompt = `分析JD薪资信息是否可信。只返回JSON，每条1句话。注意：数据非实时，仅供参考。

JSON格式：
{
  "summary": "薪资可信度总结（1句话）",
  "extractedSalary": {"min": 15000, "max": 25000, "period": "月薪", "months": 14, "raw": "原文"},
  "credibilityScore": 75,
  "waterIndex": 25,
  "marketComparison": {"marketAvg": 20000, "marketRange": "15000-28000", "position": "偏低/合理/偏高", "analysis": "分析（1句话）"},
  "risks": [{"type": "陷阱类型", "description": "描述", "severity": "高/中/低"}],
  "negotiationTips": ["建议1", "建议2"],
  "verdict": "可信/基本可信/需谨慎/不可信"
}

JD：
---\n${jd}\n---`

  return await callAndParse(prompt, { validator: validateSalaryCredibilityResult })
}

export { callAndParse }

// ==================== 10. 简历定制优化 ====================

export async function generateResumeTailor(jd, resume, companyInfo) {
  const tResume = truncateText(resume, 2000)
  const tCompany = truncateText(companyInfo, 1000)
  const prompt = `根据JD定制简历。只返回JSON，每条1句话，sections最多4项。

JSON格式：
{
  "summary": "优化方向（1句话）",
  "keywordStrategy": {"jdKeywords": ["关键词1", "关键词2"], "howToEmbed": "如何融入（1句话）"},
  "sections": [
    {"section": "板块名", "original": "原文摘要", "issue": "问题", "optimized": "优化版", "reason": "原因"}
  ],
  "highlightStrategy": {"emphasize": ["突出1", "突出2"], "downplay": ["弱化1"]},
  "tailoringTips": ["建议1", "建议2"],
  "finalResume": "整合后的完整简历"
}

JD：
---\n${jd}\n---

简历：
---\n${tResume}\n---

公司信息：
---\n${tCompany || '未提供，请根据JD推断'}\n---`

  return await callAndParse(prompt, { validator: validateResumeTailorResult })
}

// ==================== 11. 公司调研 ====================

export async function researchCompany(companyName, jd) {
  const prompt = `调研公司信息。只返回JSON，每条1句话。注意：基于训练数据，非实时，信息不足请标注。

JSON格式：
{
  "companyName": "公司全称",
  "industry": "行业",
  "stage": "创业期/成长期/成熟期/上市企业",
  "scale": "规模",
  "teamInference": {"techStack": "技术栈", "teamSize": "团队规模", "culture": "文化", "workStyle": "工作方式"},
  "reputation": {"employeeReview": "员工评价（1句话）", "interviewFeedback": "面试反馈（1句话）", "industryReputation": "行业声誉（1句话）", "pros": ["优点1", "优点2"], "cons": ["缺点1"]},
  "risks": [{"type": "风险类型", "description": "描述", "severity": "高/中/低"}],
  "salaryReference": "薪资参考范围",
  "verdict": "值得去/可以考虑/需谨慎/不建议",
  "verdictReason": "理由（1句话）",
  "summary": "调研总结（1句话）"
}

公司：${companyName}

JD：
---\n${jd || '未提供JD'}\n---`

  return await callAndParse(prompt, { validator: validateCompanyResearchResult })
}
