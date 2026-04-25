function sortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys(value[key])
        return acc
      }, {})
  }

  return value
}

function stableStringify(value) {
  return JSON.stringify(sortObjectKeys(value))
}

function hashString(text) {
  let hash = 0

  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

function normalizeSection(kind, title, data) {
  return data ? { kind, title, data } : null
}

function asTextSection(kind, title, value) {
  if (value === null || value === undefined || value === '') return null
  return normalizeSection(kind, title, value)
}

function buildAnalyzeSections(raw) {
  const jobReality = raw?.jobReality || raw?.reality || null
  const skills = raw?.skills || null
  const plan = raw?.plan || null

  return [
    normalizeSection('jobReality', '岗位真相', jobReality),
    normalizeSection('skills', '技能要求', skills),
    normalizeSection('plan', '行动计划', plan),
  ]
}

function buildInsightSections(raw) {
  return [
    asTextSection('summary', '结论摘要', raw?.summary),
    normalizeSection('trend', '市场趋势', raw?.trend),
    normalizeSection('benchmark', '行业对标', raw?.benchmark),
    normalizeSection('careerPaths', '职业路径', raw?.careerPaths),
  ]
}

function buildSkillSections(raw) {
  return [
    asTextSection('summary', '结论摘要', raw?.summary),
    normalizeSection('radar', '技能雷达', raw?.radarDimensions),
    normalizeSection('categories', '技能分类', raw?.categories),
    normalizeSection('learningPath', '学习路径', raw?.learningPath),
  ]
}

function buildRoleSections(raw) {
  return [
    asTextSection('summary', '结论摘要', raw?.summary),
    normalizeSection('rolePosition', '角色定位', raw?.rolePosition),
    normalizeSection('hierarchy', '组织关系', raw?.hierarchy),
    normalizeSection('responsibilities', '职责占比', raw?.responsibilities),
    normalizeSection('collaborators', '协作对象', raw?.collaborators),
    normalizeSection('timeAllocation', '时间分配', raw?.timeAllocation),
  ]
}

function buildCompareSections(raw) {
  return [
    asTextSection('similarityScore', '相似度评分', raw?.similarityScore),
    normalizeSection('comparison', '维度对比', raw?.comparison),
    normalizeSection('differences', '核心差异', raw?.differences),
    normalizeSection('recommendation', '推荐结论', raw?.recommendation),
  ]
}

function buildResumeSections(raw) {
  return [
    asTextSection('summary', '结论摘要', raw?.summary),
    asTextSection('overallScore', '整体匹配度', raw?.overallScore),
    normalizeSection('scoreBreakdown', '评分拆解', raw?.scoreBreakdown),
    normalizeSection('matchedStrengths', '匹配优势', raw?.matchedStrengths),
    normalizeSection('gaps', '能力差距', raw?.gaps),
    normalizeSection('resumeOptimization', '简历优化', raw?.resumeOptimization),
    normalizeSection('interviewFocus', '面试重点', raw?.interviewFocus),
    asTextSection('verdict', '投递建议', raw?.verdict),
  ]
}

function buildInterviewSections(raw) {
  return [
    asTextSection('summary', '结论摘要', raw?.summary),
    normalizeSection('questions', '模拟问题', raw?.questions),
    normalizeSection('searchQueries', '面经搜索词', raw?.searchQueries),
    normalizeSection('preparationStrategy', '准备策略', raw?.preparationStrategy),
    normalizeSection('redFlags', '注意雷区', raw?.redFlags),
  ]
}

function buildSections(type, raw) {
  switch (type) {
    case 'analyze':
      return buildAnalyzeSections(raw)
    case 'insight':
      return buildInsightSections(raw)
    case 'skills':
      return buildSkillSections(raw)
    case 'roles':
      return buildRoleSections(raw)
    case 'compare':
      return buildCompareSections(raw)
    case 'resume':
      return buildResumeSections(raw)
    case 'interview':
      return buildInterviewSections(raw)
    default:
      return []
  }
}

export function createResultModel(type, results) {
  const normalizedType = type || 'analyze'
  const raw = results || null
  const sections = buildSections(normalizedType, raw).filter(Boolean)

  return {
    version: 1,
    type: normalizedType,
    raw,
    sections,
  }
}

export function normalizeStoredRecord(record) {
  if (!record) return null

  const resultModel = record.resultModel || createResultModel(record.type, record.results)

  return {
    ...record,
    resultModel,
    results: resultModel.raw,
  }
}

export function createRecordFingerprint({ type, jdText, results }) {
  return hashString(stableStringify({
    type: type || 'analyze',
    jdText: jdText || '',
    results: results || null,
  }))
}

export function formatStructuredValue(value, depth = 0) {
  const indent = '  '.repeat(depth)
  const childIndent = '  '.repeat(depth + 1)

  if (value === null || value === undefined || value === '') {
    return ''
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const rendered = formatStructuredValue(item, depth + 1)
        if (!rendered) return null
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return `${indent}- ${rendered}`
        }
        return `${indent}-\n${rendered}`
      })
      .filter(Boolean)
      .join('\n')
  }

  return Object.entries(value)
    .map(([key, item]) => {
      const rendered = formatStructuredValue(item, depth + 1)
      if (!rendered) return null
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        return `${indent}- ${key}: ${rendered}`
      }
      return `${indent}- ${key}:\n${childIndent}${rendered.replace(/\n/g, `\n${childIndent}`)}`
    })
    .filter(Boolean)
    .join('\n')
}

export function createMarkdownReport(record) {
  const normalizedRecord = normalizeStoredRecord(record)
  const { title, jdText, createdAt, resultModel, type } = normalizedRecord

  const header = [
    `# ${title || '分析报告'}`,
    '',
    `- 类型: ${type || 'analyze'}`,
    createdAt ? `- 生成时间: ${new Date(createdAt).toLocaleString('zh-CN')}` : null,
    '',
  ].filter(Boolean)

  const jdBlock = jdText
    ? [
        '## 原始 JD',
        '',
        '```text',
        jdText,
        '```',
        '',
      ]
    : []

  const sectionBlocks = (resultModel?.sections || []).flatMap((section) => {
    const body = formatStructuredValue(section.data)
    if (!body) return []

    return [
      `## ${section.title}`,
      '',
      body,
      '',
    ]
  })

  const fallbackBlock = sectionBlocks.length === 0 && resultModel?.raw
    ? [
        '## 原始结果',
        '',
        '```json',
        JSON.stringify(resultModel.raw, null, 2),
        '```',
        '',
      ]
    : []

  return [...header, ...jdBlock, ...sectionBlocks, ...fallbackBlock].join('\n').trim()
}
