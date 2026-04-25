import JobRealityCard from './JobRealityCard'
import SkillsCard from './SkillsCard'
import PlanCard from './PlanCard'
import { formatStructuredValue, normalizeStoredRecord } from '../utils/resultModel'

function RawResult({ data }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <pre className="text-sm text-slate-400 whitespace-pre-wrap break-words">
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

function GenericSectionCard({ title, data }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
      <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
      <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words leading-7 font-sans">
        {formatStructuredValue(data)}
      </pre>
    </div>
  )
}

export default function AnalysisRecordContent({ record }) {
  const normalizedRecord = normalizeStoredRecord(record)
  const sections = normalizedRecord?.resultModel?.sections || []

  if (sections.length === 0) {
    return <RawResult data={normalizedRecord?.resultModel?.raw} />
  }

  return (
    <>
      {sections.map((section) => {
        if (section.kind === 'jobReality') {
          return <JobRealityCard key={section.kind} data={section.data} />
        }

        if (section.kind === 'skills') {
          return <SkillsCard key={section.kind} data={section.data} />
        }

        if (section.kind === 'plan') {
          return <PlanCard key={section.kind} data={section.data} />
        }

        return <GenericSectionCard key={section.kind} title={section.title} data={section.data} />
      })}
    </>
  )
}
