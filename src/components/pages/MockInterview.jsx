import { useState, useCallback } from 'react'
import { generateMockInterview, evaluateInterviewAnswer } from '../../utils/ai'

const SAMPLE_JD = `职位名称：高级前端工程师

岗位职责：
1. 负责公司核心产品的前端架构设计与开发，使用 React/Vue 等主流框架
2. 参与产品需求评审，与产品经理、设计师紧密协作，提供技术方案
3. 优化前端性能，提升用户体验，确保页面加载速度和交互流畅度
4. 建立前端工程化体系，包括组件库、CI/CD 流程、代码规范等
5. 指导初中级工程师，进行 Code Review，推动团队技术成长

任职要求：
1. 5年以上前端开发经验，3年以上 React 开发经验
2. 精通 JavaScript/TypeScript，熟悉 ES6+ 特性
3. 熟悉 React 生态（Redux、React Router、Next.js 等）
4. 了解 Node.js，有 SSR/SSG 经验优先
5. 熟悉前端工程化工具（Webpack、Vite、Rollup 等）
6. 有大型项目架构经验，熟悉微前端架构优先
7. 良好的沟通能力和团队协作精神

薪资范围：30K-50K · 14薪`

const STAGE = {
  INPUT: 'input',
  INTERVIEW: 'interview',
  RESULT: 'result',
}

const DIFFICULTY_COLORS = {
  '简单': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  '中等': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '困难': 'bg-red-500/10 text-red-400 border-red-500/20',
}

const CATEGORY_ICONS = {
  '技术基础': '💻',
  '项目经验': '📋',
  '系统设计': '🏗️',
  '行为面试': '💬',
  '情景题': '🎯',
}

function ScoreRing({ score }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="44" cy="44" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-xl font-bold text-white">{score}</span>
    </div>
  )
}

export default function MockInterview() {
  const [stage, setStage] = useState(STAGE.INPUT)
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [evaluating, setEvaluating] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const handleStart = useCallback(async () => {
    if (!jdText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await generateMockInterview(jdText)
      setQuestions(result.questions)
      setCurrentIndex(0)
      setAnswers({})
      setEvaluations({})
      setStage(STAGE.INTERVIEW)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [jdText])

  const handleSubmitAnswer = useCallback(async () => {
    const currentQuestion = questions[currentIndex]
    const answer = answers[currentIndex] || ''
    if (!answer.trim()) return

    setEvaluating(true)
    setError(null)
    try {
      const evaluation = await evaluateInterviewAnswer(
        currentQuestion.question,
        answer,
        jdText
      )
      setEvaluations(prev => ({ ...prev, [currentIndex]: evaluation }))
    } catch (e) {
      setError(e.message)
    } finally {
      setEvaluating(false)
    }
  }, [questions, currentIndex, answers, jdText])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowFollowUp(false)
    } else {
      setStage(STAGE.RESULT)
    }
  }, [currentIndex, questions.length])

  const handleAnswerChange = useCallback((value) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: value }))
  }, [currentIndex])

  const handleTrySample = useCallback(() => {
    setJdText(SAMPLE_JD)
    setError(null)
  }, [])

  const handleReset = useCallback(() => {
    setStage(STAGE.INPUT)
    setQuestions([])
    setCurrentIndex(0)
    setAnswers({})
    setEvaluations({})
    setError(null)
  }, [])

  const overallScore = questions.length > 0
    ? Math.round(
        Object.values(evaluations).reduce((sum, e) => sum + e.score, 0) / questions.length
      )
    : 0

  if (stage === STAGE.INPUT) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">AI模拟面试</h2>
          <p className="text-slate-400">基于JD生成面试问题，模拟真实面试场景，AI实时点评打分</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-300">粘贴职位描述（JD）</h3>
            <button
              onClick={handleTrySample}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              试用示例JD
            </button>
          </div>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="在此粘贴招聘JD..."
            rows={12}
            className="w-full bg-navy-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!jdText.trim() || loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-pink-400 transition-all"
        >
          {loading ? '正在生成面试问题...' : '开始模拟面试'}
        </button>
      </div>
    )
  }

  if (stage === STAGE.INTERVIEW) {
    const currentQuestion = questions[currentIndex]
    const evaluation = evaluations[currentIndex]
    const isAnswered = !!evaluation

    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">AI模拟面试</h2>
            <p className="text-sm text-slate-500">
              第 {currentIndex + 1} / {questions.length} 题
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            结束面试
          </button>
        </div>

        <div className="w-full bg-white/[0.02] rounded-full h-1.5 mb-8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">{CATEGORY_ICONS[currentQuestion.category] || '📝'}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[currentQuestion.difficulty] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-slate-500">{currentQuestion.category}</span>
          </div>

          <h3 className="text-lg font-medium text-white mb-4">{currentQuestion.question}</h3>

          {!isAnswered && (
            <>
              <textarea
                value={answers[currentIndex] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="输入你的回答..."
                rows={6}
                disabled={evaluating}
                className="w-full bg-navy-900/50 border border-white/5 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors mb-4"
              />

              {!showFollowUp && (
                <button
                  onClick={() => setShowFollowUp(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors mb-3"
                >
                  查看面试官追问 →
                </button>
              )}

              {showFollowUp && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-xs text-amber-400/80 font-medium mb-1">面试官追问：</p>
                  <p className="text-sm text-amber-300">{currentQuestion.followUp}</p>
                </div>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={!answers[currentIndex]?.trim() || evaluating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-pink-400 transition-all"
              >
                {evaluating ? 'AI正在评估...' : '提交回答'}
              </button>
            </>
          )}

          {isAnswered && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-navy-900/50 border border-white/5">
                <p className="text-xs text-slate-500 mb-2">你的回答：</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{answers[currentIndex]}</p>
              </div>

              <div className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <ScoreRing score={evaluation.score} />
                <div className="flex-1">
                  <p className="text-sm text-slate-300 mb-3">{evaluation.feedback}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-emerald-400 font-medium mb-1.5">优点</p>
                      {evaluation.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-slate-400 mb-1">+ {s}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-amber-400 font-medium mb-1.5">待改进</p>
                      {evaluation.weaknesses.map((w, i) => (
                        <p key={i} className="text-xs text-slate-400 mb-1">- {w}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {evaluation.improvement.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <p className="text-xs text-indigo-400 font-medium mb-2">改进建议</p>
                  {evaluation.improvement.map((tip, i) => (
                    <p key={i} className="text-xs text-slate-400 mb-1">{i + 1}. {tip}</p>
                  ))}
                </div>
              )}

              {evaluation.referenceAnswer && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs text-emerald-400 font-medium mb-2">参考答案</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{evaluation.referenceAnswer}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
              >
                {currentIndex < questions.length - 1 ? '下一题' : '查看面试总结'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">面试总结</h2>
        <p className="text-slate-400">模拟面试已完成，以下是你的表现评估</p>
      </div>

      <div className="flex justify-center mb-8">
        <ScoreRing score={overallScore} />
      </div>

      <p className="text-center text-slate-400 mb-10">
        {overallScore >= 80 ? '表现优秀，面试准备充分！' :
         overallScore >= 60 ? '表现良好，部分问题需要加强。' :
         '需要更多准备，建议针对薄弱环节重点练习。'}
      </p>

      <div className="space-y-4 mb-8">
        {questions.map((q, i) => {
          const eval_ = evaluations[i]
          return (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">Q{i + 1}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-white">{q.question}</p>
                </div>
                {eval_ && (
                  <span className={`text-sm font-bold ml-4 ${eval_.score >= 80 ? 'text-emerald-400' : eval_.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {eval_.score}分
                  </span>
                )}
              </div>
              {eval_ && (
                <p className="text-xs text-slate-500">{eval_.feedback}</p>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleReset}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium text-sm hover:from-indigo-400 hover:to-pink-400 transition-all"
      >
        再来一场面试
      </button>
    </div>
  )
}
