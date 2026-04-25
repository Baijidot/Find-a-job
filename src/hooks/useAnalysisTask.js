import { useCallback, useMemo, useState } from 'react'
import { addHistory } from '../utils/storage'
import { createAnalysisPipeline } from '../utils/analysisPipeline'

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}

export default function useAnalysisTask({
  type,
  runAnalysis,
  pipelineSteps,
  mapResult,
  createHistoryRecord,
  fallbackErrorMessage,
}) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState('')

  const pipelineRunner = useMemo(() => {
    if (!Array.isArray(pipelineSteps) || pipelineSteps.length === 0) {
      return null
    }

    return createAnalysisPipeline(pipelineSteps, { mapResult })
  }, [mapResult, pipelineSteps])

  const execute = useCallback(async (input) => {
    const runner = runAnalysis || pipelineRunner

    if (typeof runner !== 'function') {
      throw new Error('未配置分析执行器')
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setLoadingStep('')

    try {
      const output = await runner(input, setLoadingStep)
      setResult(output)

      if (createHistoryRecord) {
        addHistory({
          type,
          ...createHistoryRecord(input, output),
          results: output,
        })
      }

      return output
    } catch (err) {
      setError(getErrorMessage(err, fallbackErrorMessage))
      return null
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }, [createHistoryRecord, fallbackErrorMessage, pipelineRunner, runAnalysis, type])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
    setLoadingStep('')
  }, [])

  return {
    result,
    setResult,
    loading,
    error,
    setError,
    loadingStep,
    execute,
    reset,
  }
}
