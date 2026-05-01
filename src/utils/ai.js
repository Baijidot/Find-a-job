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
} from './analysisSchemas'

// ==================== 配置管理 ====================

const CONFIG_KEY = 'jd_analyzer_config'

const DEFAULT_CONFIG = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 4096,
}

const DEFAULT_TIMEOUT_MS = 45000
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

// ==================== LLM 调用 ====================

/**
 * 统一 LLM 调用函数（OpenAI 协议）
 */
export async function callLLM(prompt, options = {}) {
  const config = getConfig()

  if (!config.apiKey) {
    throw new Error('请先在设置中配置 API Key')
  }

  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`

  const body = {
    model: options.model || config.model,
    messages: [
      {
        role: 'system',
        content: options.systemPrompt || '你是一位资深的职业分析师和 HR 专家，擅长深度解析职位描述（JD），揭示真实的工作内容、技能要求和隐藏信息。你的分析客观、深入、实用。请始终以 JSON 格式返回结果。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature ?? config.temperature,
    max_tokens: options.maxTokens ?? config.maxTokens,
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
        throw new Error('API 返回内容为空')
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
  const messageContent = payload?.choices?.[0]?.message?.content
  const outputText = payload?.output_text

  if (typeof messageContent === 'string') {
    return messageContent.trim()
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => {
        if (typeof item === 'string') return item
        return item?.text || item?.content || ''
      })
      .join('\n')
      .trim()
  }

  if (typeof outputText === 'string') {
    return outputText.trim()
  }

  return ''
}

function sanitizeJsonCandidate(text) {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, '\'')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\]])/g, '$1')
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

function extractJSON(text) {
  const candidates = [
    text,
    ...(text.match(/```(?:json)?\s*([\s\S]*?)```/gi) || []).map(block =>
      block.replace(/```(?:json)?/i, '').replace(/```$/, '').trim()
    ),
    ...findBalancedJsonCandidates(text),
  ]

  for (const candidate of candidates) {
    const sanitized = sanitizeJsonCandidate(candidate)
    const parsed = safeJsonParse(sanitized)
    if (parsed !== null) {
      return parsed
    }
  }

  throw new Error('无法解析 AI 返回的 JSON 数据，请重试')
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
  const parsed = extractJSON(raw)
  return validateParsedResult(parsed, options.validator)
}

// ==================== 1. 首页"快速扫描" ====================

/**
 * 定位：帮求职者快速判断"这个岗位值不值得投"
 * 视角：从求职者利益出发，揭示JD背后的真相
 */
export async function analyzeJD(jd) {
  const prompt = `你是一位经验丰富的求职顾问，请帮求职者快速判断这个岗位"值不值得投"。

重点分析：
1. 这个岗位的真实日常工作是什么（不是JD写的漂亮话，而是实际要干的活）
2. JD中没有明说但实际需要的能力和条件（隐藏门槛）
3. 有没有"坑"或风险信号（比如996、PUA、虚假薪资范围等）
4. 薪资范围在当前市场是否合理

请以如下 JSON 格式返回：
{
  "summary": "一句话总结：这个岗位值不值得投，为什么",
  "verdict": "推荐投递/谨慎考虑/不建议投递",
  "dailyReality": [
    "真实日常工作1：具体描述",
    "真实日常工作2：具体描述",
    "真实日常工作3：具体描述"
  ],
  "hiddenRequirements": [
    "隐藏要求1：具体描述",
    "隐藏要求2：具体描述"
  ],
  "redFlags": [
    "风险信号1：具体描述",
    "风险信号2：具体描述"
  ],
  "salaryInsight": [
    "薪资分析1：具体描述",
    "薪资分析2：具体描述"
  ]
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateAnalyzeJDResult })
}

/**
 * 首页技能分析（快速扫描版）
 * 定位：快速列出需要什么技能，按优先级排序
 */
export async function analyzeSkills(jd) {
  const prompt = `请快速分析以下JD中所需的全部技能，按求职者需要掌握的优先级排序。

要求：
1. 提取所有技术技能和软技能
2. 按优先级分为5档：必须掌握、核心技能、重要技能、加分技能、了解即可
3. 每个技能用一句话说明为什么需要

请以如下 JSON 格式返回：
{
  "summary": "整体技能画像总结（2-3句话）",
  "skills": [
    {
      "name": "技能名称",
      "level": "必须掌握/核心技能/重要技能/加分技能/了解即可",
      "reason": "为什么需要这个技能（一句话）"
    }
  ]
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateAnalyzeSkillsResult })
}

/**
 * 首页行动计划（基于JD和技能分析）
 * 定位：如果决定投递，接下来该怎么做
 */
export async function generatePlan(jd, skills) {
  const skillsText = typeof skills === 'string'
    ? skills
    : JSON.stringify(skills, null, 2)

  const prompt = `基于以下JD和技能分析结果，为求职者生成一个"投递前准备计划"。

要求：
1. 分3个阶段：投递前准备（1周内）、面试准备（1个月内）、入职前提升（3个月内）
2. 每个阶段包含具体可执行的任务
3. 任务要具体、可衡量

请以如下 JSON 格式返回：
{
  "summary": "整体准备计划概述（2-3句话）",
  "phases": [
    {
      "title": "阶段名称",
      "timeline": "时间范围",
      "items": [
        {
          "title": "具体任务",
          "detail": "详细说明"
        }
      ]
    }
  ]
}

以下是职位描述：
---
${jd}
---

以下是技能分析结果：
---
${skillsText}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateGeneratePlanResult })
}

// ==================== 2. 洞察报告（宏观市场视角）====================

/**
 * 定位：从宏观市场角度分析这个岗位
 * 视角：行业趋势、市场供需、职业发展路径
 * 与首页的区别：首页关注"这个岗位本身"，洞察报告关注"这类岗位在市场中的位置"
 */
export async function generateInsight(jd) {
  const prompt = `你是一位资深的行业分析师和职业规划师。请从宏观市场角度深度分析以下JD所代表的岗位。

注意：不要重复分析"日常工作内容"或"技能要求"（这些是其他功能负责的），请聚焦于以下维度：

1. 市场趋势分析：
   - 这类岗位在当前市场的需求热度（上升/稳定/下降）
   - 薪资水平在行业中的位置（偏高/中等/偏低）
   - 未来2-3年的发展趋势

2. 行业对标：
   - 列出2-3个相似岗位（不同公司/行业）
   - 对比差异和优势

3. 职业发展路径：
   - 从这个岗位出发的3条可能发展路径
   - 每条路径的下一步建议和时间线

请以如下 JSON 格式返回：
{
  "summary": "整体市场洞察总结（2-3句话）",
  "trend": {
    "marketHeat": "高需求/中等需求/需求下降",
    "demandTrend": "需求趋势描述（1-2句话）",
    "salaryPosition": "薪资在行业中偏高/中等/偏低",
    "futureOutlook": "未来2-3年发展趋势（2-3句话）",
    "insights": [
      "趋势洞察1",
      "趋势洞察2",
      "趋势洞察3"
    ]
  },
  "benchmark": [
    {
      "role": "对标岗位名称",
      "company": "典型公司类型",
      "similarity": "相似度描述",
      "differences": "主要差异",
      "advantages": "该岗位相比对标岗位的优势"
    }
  ],
  "careerPaths": [
    {
      "direction": "发展方向名称",
      "description": "路径描述（2-3句话）",
      "nextStep": "下一步建议",
      "timeline": "建议时间线"
    }
  ]
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateInsightResult })
}

// ==================== 3. 技能提取（技术栈全景视角）====================

/**
 * 定位：从技术栈和技能图谱角度深度分析
 * 视角：技能分类、匹配度、学习路径、市场稀缺度
 * 与首页的区别：首页只是"列出技能"，这里是"技能全景地图"
 */
export async function extractSkillMap(jd) {
  const prompt = `你是一位技术招聘专家和技能评估师。请为以下JD构建一个完整的"技能全景地图"。

注意：不要简单列出技能（那是其他功能负责的），请从以下维度深度分析：

1. 技能分类（技术技能/软技能/工具技能），每个技能给出：
   - 匹配度（0-100，表示候选人需要掌握到什么程度）
   - 简要说明

2. 技能雷达图（6个核心维度，每个维度0-100分）：
   - 前端开发、后端能力、工程化、架构设计、团队协作、业务理解
   （根据实际岗位调整维度名称）

3. 学习路径推荐：
   - 如果候选人目前只满足60%的技能要求，推荐一个3个月的学习路径
   - 每个技能推荐具体的学习资源

请以如下 JSON 格式返回：
{
  "summary": "技能全景总结（2-3句话）",
  "radarDimensions": [
    {"name": "维度名称", "score": 85}
  ],
  "categories": [
    {
      "name": "技术技能",
      "icon": "💻",
      "skills": [
        {
          "name": "技能名称",
          "match": 90,
          "description": "简要说明",
          "resource": "推荐学习资源（具体书名/课程/文档）"
        }
      ]
    },
    {
      "name": "软技能",
      "icon": "🧠",
      "skills": [
        {"name": "技能名称", "match": 70, "description": "简要说明", "resource": "推荐资源"}
      ]
    },
    {
      "name": "工具技能",
      "icon": "🔧",
      "skills": [
        {"name": "技能名称", "match": 80, "description": "简要说明", "resource": "推荐资源"}
      ]
    }
  ],
  "learningPath": [
    {
      "phase": "第1个月：基础补强",
      "skills": ["需要学习的技能1", "技能2"],
      "resources": "推荐资源"
    }
  ]
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateSkillMapResult })
}

// ==================== 4. 角色拆解（组织行为视角）====================

/**
 * 定位：从组织架构和日常工作场景角度分析
 * 视角：这个人在团队中扮演什么角色、和谁协作、时间怎么分配
 * （这个功能已经很独特，保持不变）
 */
export async function breakdownRole(jd) {
  const prompt = `你是一位组织行为学专家和资深技术管理者。请深度拆解以下JD所描述的岗位角色。

分析维度：
1. 角色定位：这个岗位在团队中的真实角色是什么
2. 上下级关系：汇报给谁、管理谁、和谁平级协作
3. 核心职责占比：每项核心职责占工作时间的百分比（总和100%）
4. 协作对象：需要和哪些角色协作，协作频率如何
5. 日常时间分配：一天8小时大致怎么分配

请以如下 JSON 格式返回：
{
  "summary": "角色定位总结（2-3句话）",
  "rolePosition": {
    "title": "真实角色标题",
    "description": "角色描述（2-3句话）",
    "teamContext": "在团队中的上下文",
    "keyTraits": ["关键特质1", "关键特质2", "关键特质3"]
  },
  "hierarchy": {
    "reportsTo": {"title": "汇报对象", "description": "汇报关系描述"},
    "peers": [{"title": "平级角色", "description": "协作关系"}],
    "manages": {"title": "下属角色", "description": "管理关系"}
  },
  "responsibilities": [
    {"name": "职责名称", "percentage": 30, "description": "具体描述"}
  ],
  "collaborators": [
    {"role": "协作角色", "frequency": "频繁/定期/偶尔", "purpose": "协作目的"}
  ],
  "timeAllocation": [
    {"activity": "活动名称", "hours": 3, "percentage": 37.5, "description": "具体描述"}
  ]
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateRoleBreakdownResult })
}

// ==================== 5. 对比分析（决策视角）====================

/**
 * 定位：帮求职者在多个offer之间做选择
 * 视角：多维度量化对比 + 差异分析 + 最终推荐
 */
export async function compareJDs(jd1, jd2, title1, title2) {
  const prompt = `你是一位资深的职业顾问。请对比以下两个职位，帮求职者做出选择。

职位A：${title1 || '职位A'}
职位B：${title2 || '职位B'}

请从以下6个维度逐一对比：
1. 薪资待遇（范围、涨幅空间、福利）
2. 技能要求（难度、成长性）
3. 工作强度（加班情况、压力水平）
4. 发展空间（晋升路径、跳槽价值）
5. 团队规模（团队大小、技术氛围）
6. 技术栈（主流程度、前沿性）

然后：
- 给出整体相似度评分（0-100）
- 列出3-5个最大差异
- 给出明确推荐

请以如下 JSON 格式返回：
{
  "similarityScore": 65,
  "comparison": [
    {
      "dimension": "薪资待遇",
      "jd1": "职位A的薪资情况描述",
      "jd2": "职位B的薪资情况描述",
      "advantage": "A/B/持平"
    }
  ],
  "differences": [
    "差异1：具体描述",
    "差异2：具体描述"
  ],
  "recommendation": {
    "choice": "推荐选择A/B/各有优劣",
    "reason": "推荐理由（2-3句话）",
    "details": [
      "推荐理由详细说明1",
      "推荐理由详细说明2"
    ]
  }
}

--- 职位A ---
${jd1}

--- 职位B ---
${jd2}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateCompareResult })
}

// ==================== 6. 简历匹配分析（求职者视角）====================

/**
 * 定位：帮求职者分析简历与JD的匹配度
 * 视角：从候选人现有条件出发，量化匹配程度 + 找出差距 + 给出优化建议
 */
export async function matchResume(jd, resume) {
  const prompt = `你是一位资深的技术面试官和简历评估专家。请深度分析以下简历与目标岗位的匹配度。

分析要求：
1. 整体匹配度评分（0-100）
2. 匹配的优势（候选人已有的、岗位需要的）
3. 差距分析（岗位要求但候选人缺失或不足的）
4. 简历优化建议（如何在简历中更好地展示匹配度）
5. 面试准备重点（基于差距，面试中需要重点准备的方向）

请以如下 JSON 格式返回：
{
  "summary": "整体匹配度总结（2-3句话）",
  "overallScore": 75,
  "scoreBreakdown": {
    "skillMatch": 80,
    "experienceMatch": 70,
    "educationMatch": 90,
    "softSkillMatch": 75,
    "cultureFit": 65
  },
  "matchedStrengths": [
    {
      "category": "技能/经验/学历/软技能",
      "item": "具体匹配项",
      "detail": "匹配说明（1-2句话）",
      "confidence": "高/中/低"
    }
  ],
  "gaps": [
    {
      "category": "技能/经验/学历/软技能",
      "item": "具体缺失项",
      "severity": "关键缺失/重要缺失/轻微不足",
      "suggestion": "如何弥补（具体可执行的建议）"
    }
  ],
  "resumeOptimization": [
    {
      "section": "简历板块（如：项目经验/技能描述/自我评价）",
      "currentIssue": "当前问题",
      "suggestedFix": "优化建议",
      "example": "优化后的示例文本"
    }
  ],
  "interviewFocus": [
    {
      "topic": "面试重点话题",
      "reason": "为什么需要重点准备",
      "preparation": "如何准备（具体方向）"
    }
  ],
  "verdict": "强烈推荐投递/推荐投递/可以尝试/需要补强后再投/不太匹配"
}

--- 目标岗位 JD ---
${jd}

--- 候选人简历 ---
${resume}`

  return await callAndParse(prompt, { maxTokens: 6000, validator: validateResumeMatchResult })
}

// ==================== 7. 面试问题生成（面试准备视角）====================

/**
 * 定位：基于JD生成面试问题 + 搜索面经参考
 * 视角：面试官会问什么 + 真实面经参考 + 答题思路
 */
export async function generateInterviewQuestions(jd) {
  const prompt = `你是一位经验丰富的技术面试官，同时也是一位面试辅导专家。请基于以下JD生成全面的面试准备方案。

分析要求：
1. 按类别生成面试问题（技术基础、项目经验、系统设计、行为面试、开放性问题）
2. 每个问题给出难度、考察点、答题思路
3. 生成3-5个用于搜索真实面经的关键词（用于在小红书、牛客、知乎等平台搜索）
4. 推荐面试准备策略

请以如下 JSON 格式返回：
{
  "summary": "面试准备总结（2-3句话）",
  "questions": [
    {
      "category": "技术基础/项目经验/系统设计/行为面试/开放性问题",
      "question": "具体面试问题",
      "difficulty": "简单/中等/困难",
      "focus": "考察点（面试官想了解什么）",
      "answerTips": "答题思路和关键点（3-5个要点）",
      "commonMistakes": "常见错误/踩坑点",
      "followUp": "可能的追问方向"
    }
  ],
  "searchQueries": [
    {
      "keyword": "搜索关键词",
      "platform": "推荐平台（小红书/牛客/知乎/力扣/V2EX）",
      "reason": "为什么搜这个"
    }
  ],
  "preparationStrategy": [
    {
      "phase": "准备阶段（如：面试前1周/前3天/前一天）",
      "tasks": ["具体任务1", "具体任务2"],
      "tips": "该阶段的关键建议"
    }
  ],
  "redFlags": [
    "面试中需要注意避免的雷区1",
    "面试中需要注意避免的雷区2"
  ]
}

--- 目标岗位 JD ---
${jd}`

  return await callAndParse(prompt, { maxTokens: 6000, validator: validateInterviewPrepResult })
}

// ==================== 导出 ====================

// ==================== 7. AI模拟面试 ====================

export async function generateMockInterview(jd) {
  const prompt = `你是一位资深技术面试官。请基于以下JD，生成一场模拟面试的问题列表。

要求：
1. 生成5个面试问题，覆盖不同考察维度
2. 每个问题包含：题目、考察维度、难度、参考答案要点、评分标准
3. 问题要有层次：从基础到深入，从技术到软技能
4. 每个问题附带一个"面试官追问"（如果候选人回答不够深入时的追问）

请以如下 JSON 格式返回：
{
  "summary": "这场面试的整体定位和考察重点（2-3句话）",
  "questions": [
    {
      "id": 1,
      "question": "面试问题",
      "category": "技术基础/项目经验/系统设计/行为面试/情景题",
      "difficulty": "简单/中等/困难",
      "expectedPoints": ["参考答案要点1", "要点2", "要点3"],
      "scoringGuide": "评分标准说明（1-2句话）",
      "followUp": "如果回答不够深入时的追问"
    }
  ]
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateMockInterviewResult })
}

export async function evaluateInterviewAnswer(question, answer, jdContext) {
  const prompt = `你是一位资深技术面试官。请评估候选人对以下面试问题的回答。

评估要求：
1. 给出0-100分的评分
2. 分析回答的优点和不足
3. 给出具体的改进建议
4. 如果回答不完整，补充参考答案

面试背景（JD）：
---
${jdContext}
---

面试问题：
${question}

候选人回答：
${answer}

请以如下 JSON 格式返回：
{
  "score": 75,
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"],
  "feedback": "综合评价（2-3句话）",
  "improvement": ["改进建议1", "改进建议2"],
  "referenceAnswer": "参考答案（如果候选人回答不完整则补充）"
}`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateEvaluateAnswerResult })
}

// ==================== 8. 技能差距热力图 ====================

export async function analyzeSkillGap(jd, mySkills) {
  const prompt = `你是一位技能评估专家。请对比以下JD要求和候选人的技能栈，分析差距。

分析要求：
1. 将JD要求的技能和候选人技能逐一对比
2. 每个技能给出匹配度（0-100）
3. 识别关键差距（匹配度低于50的技能）
4. 给出整体匹配度评分
5. 推荐弥补差距的学习路径

请以如下 JSON 格式返回：
{
  "summary": "整体技能匹配总结（2-3句话）",
  "overallMatch": 65,
  "skills": [
    {
      "name": "技能名称",
      "required": 85,
      "current": 60,
      "gap": 25,
      "category": "前端/后端/数据库/DevOps/软技能/工具",
      "importance": "关键/重要/加分项",
      "suggestion": "如何提升（具体建议）"
    }
  ],
  "criticalGaps": ["最需要补的关键技能1", "技能2"],
  "strengths": ["候选人明显优势的技能1", "技能2"],
  "learningPlan": [
    {
      "priority": 1,
      "skill": "技能名称",
      "timeline": "建议学习时间",
      "resources": "推荐学习资源"
    }
  ]
}

以下是职位描述：
---
${jd}
---

以下是候选人的技能栈：
---
${mySkills}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateSkillGapResult })
}

// ==================== 9. 薪资可信度检测 ====================

export async function checkSalaryCredibility(jd) {
  const prompt = `你是一位薪资分析专家。请分析以下JD中的薪资信息是否可信。

分析要求：
1. 提取JD中的薪资范围（如果有）
2. 判断薪资在当前市场是否合理
3. 给出"水分指数"（0-100，越高越不可信）
4. 分析可能存在的薪资陷阱（如：包含绩效/年终、税前税后差异等）
5. 给出谈判建议

请以如下 JSON 格式返回：
{
  "summary": "薪资可信度总结（2-3句话）",
  "extractedSalary": {
    "min": 15000,
    "max": 25000,
    "period": "月薪",
    "months": 14,
    "raw": "JD中薪资原文"
  },
  "credibilityScore": 75,
  "waterIndex": 25,
  "marketComparison": {
    "marketAvg": 20000,
    "marketRange": "15000-28000",
    "position": "偏低/合理/偏高",
    "analysis": "市场对比分析（2-3句话）"
  },
  "risks": [
    {
      "type": "薪资陷阱类型",
      "description": "具体描述",
      "severity": "高/中/低"
    }
  ],
  "negotiationTips": ["谈判建议1", "建议2", "建议3"],
  "verdict": "可信/基本可信/需谨慎/不可信"
}

以下是职位描述：
---
${jd}
---`

  return await callAndParse(prompt, { maxTokens: 4096, validator: validateSalaryCredibilityResult })
}

export { callAndParse }
