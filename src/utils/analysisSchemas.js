function invalid(field, message) {
  throw new Error(`${field} 字段无效：${message}`)
}

function asObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid(field, '需要是对象')
  }
  return value
}

function asString(value, field, { optional = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (optional) return ''
    invalid(field, '不能为空')
  }

  if (typeof value !== 'string') {
    invalid(field, '需要是字符串')
  }

  return value.trim()
}

function asNumber(value, field, { optional = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (optional) return null
    invalid(field, '不能为空')
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    invalid(field, '需要是数字')
  }

  return parsed
}

function asArray(value, field, mapper, { optional = false } = {}) {
  if (value === undefined || value === null) {
    if (optional) return []
    invalid(field, '不能为空')
  }

  if (!Array.isArray(value)) {
    invalid(field, '需要是数组')
  }

  return value.map((item, index) => mapper(item, `${field}[${index}]`))
}

function stringList(value, field) {
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n|[；;]|(?<!\d)[、]/)
      .map(item => item.trim())
      .filter(Boolean)
  }

  return asArray(value, field, (item, itemField) => asString(item, itemField), { optional: true })
}

export function validateAnalyzeJDResult(value) {
  const data = asObject(value, 'analyzeJD')
  return {
    summary: asString(data.summary, 'summary'),
    verdict: asString(data.verdict, 'verdict'),
    dailyReality: stringList(data.dailyReality, 'dailyReality'),
    hiddenRequirements: stringList(data.hiddenRequirements, 'hiddenRequirements'),
    redFlags: stringList(data.redFlags, 'redFlags'),
    salaryInsight: stringList(data.salaryInsight, 'salaryInsight'),
  }
}

export function validateAnalyzeSkillsResult(value) {
  const data = asObject(value, 'analyzeSkills')
  return {
    summary: asString(data.summary, 'summary'),
    skills: asArray(data.skills, 'skills', (item, field) => {
      const entry = asObject(item, field)
      return {
        name: asString(entry.name, `${field}.name`),
        level: asString(entry.level, `${field}.level`),
        reason: asString(entry.reason, `${field}.reason`),
      }
    }),
  }
}

export function validateGeneratePlanResult(value) {
  const data = asObject(value, 'generatePlan')
  return {
    summary: asString(data.summary, 'summary'),
    phases: asArray(data.phases, 'phases', (item, field) => {
      const entry = asObject(item, field)
      return {
        title: asString(entry.title, `${field}.title`),
        timeline: asString(entry.timeline, `${field}.timeline`),
        items: asArray(entry.items, `${field}.items`, (task, taskField) => {
          const taskEntry = asObject(task, taskField)
          return {
            title: asString(taskEntry.title, `${taskField}.title`),
            detail: asString(taskEntry.detail, `${taskField}.detail`),
          }
        }, { optional: true }),
      }
    }),
  }
}

export function validateInsightResult(value) {
  const data = asObject(value, 'generateInsight')
  return {
    summary: asString(data.summary, 'summary'),
    trend: data.trend ? {
      marketHeat: asString(data.trend.marketHeat, 'trend.marketHeat'),
      demandTrend: asString(data.trend.demandTrend, 'trend.demandTrend'),
      salaryPosition: asString(data.trend.salaryPosition, 'trend.salaryPosition'),
      futureOutlook: asString(data.trend.futureOutlook, 'trend.futureOutlook'),
      insights: stringList(data.trend.insights, 'trend.insights'),
    } : null,
    benchmark: asArray(data.benchmark, 'benchmark', (item, field) => {
      const entry = asObject(item, field)
      return {
        role: asString(entry.role, `${field}.role`),
        company: asString(entry.company, `${field}.company`, { optional: true }),
        similarity: asString(entry.similarity, `${field}.similarity`, { optional: true }),
        differences: asString(entry.differences, `${field}.differences`, { optional: true }),
        advantages: asString(entry.advantages, `${field}.advantages`, { optional: true }),
      }
    }, { optional: true }),
    careerPaths: asArray(data.careerPaths, 'careerPaths', (item, field) => {
      const entry = asObject(item, field)
      return {
        direction: asString(entry.direction, `${field}.direction`),
        description: asString(entry.description, `${field}.description`, { optional: true }),
        nextStep: asString(entry.nextStep, `${field}.nextStep`, { optional: true }),
        timeline: asString(entry.timeline, `${field}.timeline`, { optional: true }),
      }
    }, { optional: true }),
  }
}

export function validateSkillMapResult(value) {
  const data = asObject(value, 'extractSkillMap')
  return {
    summary: asString(data.summary, 'summary'),
    radarDimensions: asArray(data.radarDimensions, 'radarDimensions', (item, field) => {
      const entry = asObject(item, field)
      return {
        name: asString(entry.name, `${field}.name`),
        score: asNumber(entry.score, `${field}.score`),
      }
    }, { optional: true }),
    categories: asArray(data.categories, 'categories', (item, field) => {
      const entry = asObject(item, field)
      return {
        name: asString(entry.name, `${field}.name`),
        icon: asString(entry.icon, `${field}.icon`, { optional: true }),
        skills: asArray(entry.skills, `${field}.skills`, (skill, skillField) => {
          const skillEntry = asObject(skill, skillField)
          return {
            name: asString(skillEntry.name, `${skillField}.name`),
            match: asNumber(skillEntry.match, `${skillField}.match`),
            description: asString(skillEntry.description, `${skillField}.description`, { optional: true }),
            resource: asString(skillEntry.resource, `${skillField}.resource`, { optional: true }),
          }
        }, { optional: true }),
      }
    }, { optional: true }),
    learningPath: asArray(data.learningPath, 'learningPath', (item, field) => {
      const entry = asObject(item, field)
      return {
        phase: asString(entry.phase, `${field}.phase`),
        skills: stringList(entry.skills, `${field}.skills`),
        resources: asString(entry.resources, `${field}.resources`, { optional: true }),
      }
    }, { optional: true }),
  }
}

export function validateRoleBreakdownResult(value) {
  const data = asObject(value, 'breakdownRole')
  return {
    summary: asString(data.summary, 'summary'),
    rolePosition: data.rolePosition ? {
      title: asString(data.rolePosition.title, 'rolePosition.title'),
      description: asString(data.rolePosition.description, 'rolePosition.description', { optional: true }),
      teamContext: asString(data.rolePosition.teamContext, 'rolePosition.teamContext', { optional: true }),
      keyTraits: stringList(data.rolePosition.keyTraits, 'rolePosition.keyTraits'),
    } : null,
    hierarchy: data.hierarchy ? {
      reportsTo: data.hierarchy.reportsTo ? {
        title: asString(data.hierarchy.reportsTo.title, 'hierarchy.reportsTo.title'),
        description: asString(data.hierarchy.reportsTo.description, 'hierarchy.reportsTo.description', { optional: true }),
      } : null,
      peers: asArray(data.hierarchy.peers, 'hierarchy.peers', (item, field) => {
        const entry = asObject(item, field)
        return {
          title: asString(entry.title, `${field}.title`),
          description: asString(entry.description, `${field}.description`, { optional: true }),
        }
      }, { optional: true }),
      manages: data.hierarchy.manages ? {
        title: asString(data.hierarchy.manages.title, 'hierarchy.manages.title'),
        description: asString(data.hierarchy.manages.description, 'hierarchy.manages.description', { optional: true }),
      } : null,
    } : null,
    responsibilities: asArray(data.responsibilities, 'responsibilities', (item, field) => {
      const entry = asObject(item, field)
      return {
        name: asString(entry.name, `${field}.name`),
        percentage: asNumber(entry.percentage, `${field}.percentage`),
        description: asString(entry.description, `${field}.description`, { optional: true }),
      }
    }, { optional: true }),
    collaborators: asArray(data.collaborators, 'collaborators', (item, field) => {
      const entry = asObject(item, field)
      return {
        role: asString(entry.role, `${field}.role`),
        frequency: asString(entry.frequency, `${field}.frequency`, { optional: true }),
        purpose: asString(entry.purpose, `${field}.purpose`, { optional: true }),
      }
    }, { optional: true }),
    timeAllocation: asArray(data.timeAllocation, 'timeAllocation', (item, field) => {
      const entry = asObject(item, field)
      return {
        activity: asString(entry.activity, `${field}.activity`),
        hours: asNumber(entry.hours, `${field}.hours`, { optional: true }),
        percentage: asNumber(entry.percentage, `${field}.percentage`, { optional: true }),
        description: asString(entry.description, `${field}.description`, { optional: true }),
      }
    }, { optional: true }),
  }
}

export function validateCompareResult(value) {
  const data = asObject(value, 'compareJDs')
  return {
    similarityScore: asNumber(data.similarityScore, 'similarityScore'),
    comparison: asArray(data.comparison, 'comparison', (item, field) => {
      const entry = asObject(item, field)
      return {
        dimension: asString(entry.dimension, `${field}.dimension`),
        jd1: asString(entry.jd1, `${field}.jd1`),
        jd2: asString(entry.jd2, `${field}.jd2`),
        advantage: asString(entry.advantage, `${field}.advantage`),
      }
    }, { optional: true }),
    differences: stringList(data.differences, 'differences'),
    recommendation: data.recommendation ? {
      choice: asString(data.recommendation.choice, 'recommendation.choice'),
      reason: asString(data.recommendation.reason, 'recommendation.reason'),
      details: stringList(data.recommendation.details, 'recommendation.details'),
    } : null,
  }
}

export function validateResumeMatchResult(value) {
  const data = asObject(value, 'matchResume')
  return {
    summary: asString(data.summary, 'summary'),
    overallScore: asNumber(data.overallScore, 'overallScore'),
    scoreBreakdown: data.scoreBreakdown ? {
      skillMatch: asNumber(data.scoreBreakdown.skillMatch, 'scoreBreakdown.skillMatch', { optional: true }) ?? 0,
      experienceMatch: asNumber(data.scoreBreakdown.experienceMatch, 'scoreBreakdown.experienceMatch', { optional: true }) ?? 0,
      educationMatch: asNumber(data.scoreBreakdown.educationMatch, 'scoreBreakdown.educationMatch', { optional: true }) ?? 0,
      softSkillMatch: asNumber(data.scoreBreakdown.softSkillMatch, 'scoreBreakdown.softSkillMatch', { optional: true }) ?? 0,
      cultureFit: asNumber(data.scoreBreakdown.cultureFit, 'scoreBreakdown.cultureFit', { optional: true }) ?? 0,
    } : null,
    matchedStrengths: asArray(data.matchedStrengths, 'matchedStrengths', (item, field) => {
      const entry = asObject(item, field)
      return {
        category: asString(entry.category, `${field}.category`),
        item: asString(entry.item, `${field}.item`),
        detail: asString(entry.detail, `${field}.detail`, { optional: true }),
        confidence: asString(entry.confidence, `${field}.confidence`, { optional: true }),
      }
    }, { optional: true }),
    gaps: asArray(data.gaps, 'gaps', (item, field) => {
      const entry = asObject(item, field)
      return {
        category: asString(entry.category, `${field}.category`),
        item: asString(entry.item, `${field}.item`),
        severity: asString(entry.severity, `${field}.severity`, { optional: true }),
        suggestion: asString(entry.suggestion, `${field}.suggestion`, { optional: true }),
      }
    }, { optional: true }),
    resumeOptimization: asArray(data.resumeOptimization, 'resumeOptimization', (item, field) => {
      const entry = asObject(item, field)
      return {
        section: asString(entry.section, `${field}.section`),
        currentIssue: asString(entry.currentIssue, `${field}.currentIssue`, { optional: true }),
        suggestedFix: asString(entry.suggestedFix, `${field}.suggestedFix`, { optional: true }),
        example: asString(entry.example, `${field}.example`, { optional: true }),
      }
    }, { optional: true }),
    interviewFocus: asArray(data.interviewFocus, 'interviewFocus', (item, field) => {
      const entry = asObject(item, field)
      return {
        topic: asString(entry.topic, `${field}.topic`),
        reason: asString(entry.reason, `${field}.reason`, { optional: true }),
        preparation: asString(entry.preparation, `${field}.preparation`, { optional: true }),
      }
    }, { optional: true }),
    verdict: asString(data.verdict, 'verdict'),
  }
}

export function validateMockInterviewResult(value) {
  const data = asObject(value, 'mockInterview')
  return {
    summary: asString(data.summary, 'summary'),
    questions: asArray(data.questions, 'questions', (item, field) => {
      const entry = asObject(item, field)
      return {
        id: asNumber(entry.id, `${field}.id`),
        question: asString(entry.question, `${field}.question`),
        category: asString(entry.category, `${field}.category`),
        difficulty: asString(entry.difficulty, `${field}.difficulty`),
        expectedPoints: stringList(entry.expectedPoints, `${field}.expectedPoints`),
        scoringGuide: asString(entry.scoringGuide, `${field}.scoringGuide`),
        followUp: asString(entry.followUp, `${field}.followUp`, { optional: true }),
      }
    }),
  }
}

export function validateEvaluateAnswerResult(value) {
  const data = asObject(value, 'evaluateAnswer')
  return {
    score: asNumber(data.score, 'score'),
    strengths: stringList(data.strengths, 'strengths'),
    weaknesses: stringList(data.weaknesses, 'weaknesses'),
    feedback: asString(data.feedback, 'feedback'),
    improvement: stringList(data.improvement, 'improvement'),
    referenceAnswer: asString(data.referenceAnswer, 'referenceAnswer', { optional: true }),
  }
}

export function validateSkillGapResult(value) {
  const data = asObject(value, 'skillGap')
  return {
    summary: asString(data.summary, 'summary'),
    overallMatch: asNumber(data.overallMatch, 'overallMatch'),
    skills: asArray(data.skills, 'skills', (item, field) => {
      const entry = asObject(item, field)
      return {
        name: asString(entry.name, `${field}.name`),
        required: asNumber(entry.required, `${field}.required`),
        current: asNumber(entry.current, `${field}.current`),
        gap: asNumber(entry.gap, `${field}.gap`),
        category: asString(entry.category, `${field}.category`),
        importance: asString(entry.importance, `${field}.importance`),
        suggestion: asString(entry.suggestion, `${field}.suggestion`, { optional: true }),
      }
    }),
    criticalGaps: stringList(data.criticalGaps, 'criticalGaps'),
    strengths: stringList(data.strengths, 'strengths'),
    learningPlan: asArray(data.learningPlan, 'learningPlan', (item, field) => {
      const entry = asObject(item, field)
      return {
        priority: asNumber(entry.priority, `${field}.priority`),
        skill: asString(entry.skill, `${field}.skill`),
        timeline: asString(entry.timeline, `${field}.timeline`, { optional: true }),
        resources: asString(entry.resources, `${field}.resources`, { optional: true }),
      }
    }, { optional: true }),
  }
}

export function validateSalaryCredibilityResult(value) {
  const data = asObject(value, 'salaryCredibility')
  return {
    summary: asString(data.summary, 'summary'),
    extractedSalary: data.extractedSalary ? {
      min: asNumber(data.extractedSalary.min, 'extractedSalary.min', { optional: true }),
      max: asNumber(data.extractedSalary.max, 'extractedSalary.max', { optional: true }),
      period: asString(data.extractedSalary.period, 'extractedSalary.period', { optional: true }),
      months: asNumber(data.extractedSalary.months, 'extractedSalary.months', { optional: true }),
      raw: asString(data.extractedSalary.raw, 'extractedSalary.raw', { optional: true }),
    } : null,
    credibilityScore: asNumber(data.credibilityScore, 'credibilityScore'),
    waterIndex: asNumber(data.waterIndex, 'waterIndex'),
    marketComparison: data.marketComparison ? {
      marketAvg: asNumber(data.marketComparison.marketAvg, 'marketComparison.marketAvg', { optional: true }),
      marketRange: asString(data.marketComparison.marketRange, 'marketComparison.marketRange', { optional: true }),
      position: asString(data.marketComparison.position, 'marketComparison.position', { optional: true }),
      analysis: asString(data.marketComparison.analysis, 'marketComparison.analysis', { optional: true }),
    } : null,
    risks: asArray(data.risks, 'risks', (item, field) => {
      const entry = asObject(item, field)
      return {
        type: asString(entry.type, `${field}.type`),
        description: asString(entry.description, `${field}.description`),
        severity: asString(entry.severity, `${field}.severity`),
      }
    }, { optional: true }),
    negotiationTips: stringList(data.negotiationTips, 'negotiationTips'),
    verdict: asString(data.verdict, 'verdict'),
  }
}

export function validateInterviewPrepResult(value) {
  const data = asObject(value, 'generateInterviewQuestions')
  return {
    summary: asString(data.summary, 'summary'),
    questions: asArray(data.questions, 'questions', (item, field) => {
      const entry = asObject(item, field)
      return {
        category: asString(entry.category, `${field}.category`),
        question: asString(entry.question, `${field}.question`),
        difficulty: asString(entry.difficulty, `${field}.difficulty`, { optional: true }),
        focus: asString(entry.focus, `${field}.focus`, { optional: true }),
        answerTips: stringList(entry.answerTips, `${field}.answerTips`),
        commonMistakes: asString(entry.commonMistakes, `${field}.commonMistakes`, { optional: true }),
        followUp: asString(entry.followUp, `${field}.followUp`, { optional: true }),
      }
    }, { optional: true }),
    searchQueries: asArray(data.searchQueries, 'searchQueries', (item, field) => {
      const entry = asObject(item, field)
      return {
        keyword: asString(entry.keyword, `${field}.keyword`),
        platform: asString(entry.platform, `${field}.platform`, { optional: true }),
        reason: asString(entry.reason, `${field}.reason`, { optional: true }),
      }
    }, { optional: true }),
    preparationStrategy: asArray(data.preparationStrategy, 'preparationStrategy', (item, field) => {
      const entry = asObject(item, field)
      return {
        phase: asString(entry.phase, `${field}.phase`),
        tasks: stringList(entry.tasks, `${field}.tasks`),
        tips: asString(entry.tips, `${field}.tips`, { optional: true }),
      }
    }, { optional: true }),
    redFlags: stringList(data.redFlags, 'redFlags'),
  }
}

export function validateResumeTailorResult(value) {
  const data = asObject(value, 'resumeTailor')
  return {
    summary: asString(data.summary, 'summary'),
    keywordStrategy: data.keywordStrategy ? {
      jdKeywords: stringList(data.keywordStrategy.jdKeywords, 'keywordStrategy.jdKeywords'),
      howToEmbed: asString(data.keywordStrategy.howToEmbed, 'keywordStrategy.howToEmbed'),
    } : null,
    sections: asArray(data.sections, 'sections', (item, field) => {
      const entry = asObject(item, field)
      return {
        section: asString(entry.section, `${field}.section`),
        original: asString(entry.original, `${field}.original`, { optional: true }),
        issue: asString(entry.issue, `${field}.issue`, { optional: true }),
        optimized: asString(entry.optimized, `${field}.optimized`),
        reason: asString(entry.reason, `${field}.reason`, { optional: true }),
      }
    }),
    highlightStrategy: data.highlightStrategy ? {
      emphasize: stringList(data.highlightStrategy.emphasize, 'highlightStrategy.emphasize'),
      downplay: stringList(data.highlightStrategy.downplay, 'highlightStrategy.downplay'),
    } : null,
    tailoringTips: stringList(data.tailoringTips, 'tailoringTips'),
    finalResume: asString(data.finalResume, 'finalResume'),
  }
}
