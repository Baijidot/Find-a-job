export function createAnalysisPipeline(steps, options = {}) {
  const normalizedSteps = Array.isArray(steps) ? steps : []

  return async function runPipeline(input, setLoadingStep) {
    const context = {}

    for (const step of normalizedSteps) {
      const stepLabel = typeof step.label === 'function'
        ? step.label({ input, context })
        : step.label

      if (stepLabel) {
        setLoadingStep(stepLabel)
      }

      const value = await step.run({
        input,
        context,
      })

      const outputKey = step.outputKey || step.id
      if (outputKey) {
        context[outputKey] = value
      }
    }

    if (typeof options.mapResult === 'function') {
      return options.mapResult(context, input)
    }

    return context
  }
}
