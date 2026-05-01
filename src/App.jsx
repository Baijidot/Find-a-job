import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import HeroSection from './components/HeroSection'
import InputSection from './components/InputSection'
import FeatureGrid from './components/FeatureGrid'
import ResultPanel from './components/ResultPanel'
import LoadingOverlay from './components/LoadingOverlay'
import SettingsModal from './components/SettingsModal'
import InsightReport from './components/pages/InsightReport'
import SkillExtract from './components/pages/SkillExtract'
import RoleBreakdown from './components/pages/RoleBreakdown'
import CompareAnalysis from './components/pages/CompareAnalysis'
import ResumeMatch from './components/pages/ResumeMatch'
import InterviewPrep from './components/pages/InterviewPrep'
import MockInterview from './components/pages/MockInterview'
import SkillGap from './components/pages/SkillGap'
import SalaryCheck from './components/pages/SalaryCheck'
import Favorites from './components/pages/Favorites'
import History from './components/pages/History'
import HelpFeedback from './components/pages/HelpFeedback'
import { analyzeJD, analyzeSkills, generatePlan } from './utils/ai'
import useAnalysisTask from './hooks/useAnalysisTask'

const SAMPLE_JD = `职位名称：高级前端工程师

岗位职责：
1. 负责公司核心产品的前端架构设计与开发，使用 React/Vue 等主流框架
2. 参与产品需求评审，与产品经理、设计师紧密协作，提供技术方案
3. 优化前端性能，提升用户体验，确保页面加载速度和交互流畅度
4. 建立前端工程化体系，包括组件库、CI/CD 流程、代码规范等
5. 指导初中级工程师，进行 Code Review，推动团队技术成长
6. 跟踪前端技术发展趋势，引入新技术解决业务问题

任职要求：
1. 5年以上前端开发经验，3年以上 React 开发经验
2. 精通 JavaScript/TypeScript，熟悉 ES6+ 特性
3. 熟悉 React 生态（Redux、React Router、Next.js 等）
4. 了解 Node.js，有 SSR/SSG 经验优先
5. 熟悉前端工程化工具（Webpack、Vite、Rollup 等）
6. 有大型项目架构经验，熟悉微前端架构优先
7. 良好的沟通能力和团队协作精神
8. 有性能优化经验，熟悉 Lighthouse 等性能指标

加分项：
- 有开源项目贡献经验
- 有技术博客或分享经验
- 熟悉移动端开发（React Native/Flutter）
- 有 AI/ML 前端应用经验

薪资范围：30K-50K · 14薪
工作地点：北京·海淀区
团队规模：前端团队15人`

const HOMEPAGE_ANALYSIS_STEPS = [
  {
    id: 'jobReality',
    outputKey: 'jobReality',
    label: '正在解析职位描述...',
    run: ({ input }) => analyzeJD(input.jd),
  },
  {
    id: 'skills',
    outputKey: 'skills',
    label: '正在分析技能要求...',
    run: ({ input }) => analyzeSkills(input.jd),
  },
  {
    id: 'plan',
    outputKey: 'plan',
    label: '正在生成行动计划...',
    run: ({ input, context }) => generatePlan(input.jd, context.skills),
  },
]

export default function App() {
  const [jdText, setJdText] = useState('')
  const [activeNav, setActiveNav] = useState('analyze')
  const [showSettings, setShowSettings] = useState(false)

  const {
    result: results,
    loading,
    error,
    setError,
    loadingStep,
    execute,
    reset,
  } = useAnalysisTask({
    type: 'analyze',
    fallbackErrorMessage: '分析失败，请检查API配置后重试',
    pipelineSteps: HOMEPAGE_ANALYSIS_STEPS,
    mapResult: ({ jobReality, skills, plan }) => ({
      jobReality,
      skills,
      plan,
    }),
    createHistoryRecord: ({ jd }, output) => ({
      jdText: jd,
      title: 'JD 分析报告',
      results: output,
    }),
  })

  const handleAnalyze = useCallback(async () => {
    if (!jdText.trim()) return
    const analysisResults = await execute({ jd: jdText })
    if (analysisResults) {
      setActiveNav('results')
    }
  }, [execute, jdText])

  const handleTrySample = useCallback(() => {
    setJdText(SAMPLE_JD)
    setError(null)
  }, [setError])

  const handleBack = useCallback(() => {
    reset()
    setActiveNav('analyze')
  }, [reset])

  const handleNavChange = useCallback((id) => {
    // 切换到其他页面时清除分析结果
    if (id !== 'results' && id !== 'analyze') {
      reset()
    }
    if (id === 'analyze') {
      reset()
    }
    setActiveNav(id)
  }, [reset])

  // 渲染主内容区
  const renderContent = () => {
    // 分析结果页
    if (activeNav === 'results' && results) {
      return (
        <div className="max-w-5xl mx-auto px-8 py-12">
          <ResultPanel results={results} jdText={jdText} onBack={handleBack} />
        </div>
      )
    }

    // 各功能页面
    switch (activeNav) {
      case 'resume':
        return <ResumeMatch />
      case 'interview':
        return <InterviewPrep />
      case 'mockInterview':
        return <MockInterview />
      case 'skillGap':
        return <SkillGap />
      case 'salaryCheck':
        return <SalaryCheck />
      case 'insights':
        return <InsightReport />
      case 'skills':
        return <SkillExtract />
      case 'roles':
        return <RoleBreakdown />
      case 'compare':
        return <CompareAnalysis />
      case 'favorites':
        return <Favorites />
      case 'history':
        return <History />
      case 'help':
        return <HelpFeedback />
      default:
        // 首页 - 分析JD
        return (
          <div className="max-w-4xl mx-auto px-8 py-12">
            <HeroSection />
            <InputSection
              jdText={jdText}
              onTextChange={setJdText}
              onAnalyze={handleAnalyze}
              onTrySample={handleTrySample}
              loading={loading}
              error={error}
            />
            <FeatureGrid />
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onSettingsClick={() => setShowSettings(true)}
        onBack={results ? handleBack : undefined}
      />

      <main className="flex-1 overflow-y-auto">
        {loading && <LoadingOverlay step={loadingStep} />}
        {renderContent()}
      </main>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
