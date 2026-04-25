import { createMarkdownReport, formatStructuredValue, normalizeStoredRecord } from './resultModel'

function sanitizeFilenamePart(value) {
  return (value || 'report')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 30)
}

export function buildReportFilename(record) {
  const title = sanitizeFilenamePart(record?.title || 'analysis-report')
  return `${title}-${Date.now()}`
}

function escapeHtml(value) {
  return `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getSectionHtml(section) {
  return `
    <section class="section-card">
      <h2>${escapeHtml(section.title)}</h2>
      <pre>${escapeHtml(formatStructuredValue(section.data))}</pre>
    </section>
  `
}

export function createHtmlReport(record) {
  const normalizedRecord = normalizeStoredRecord(record)
  const { title, type, jdText, createdAt, resultModel } = normalizedRecord
  const sections = (resultModel?.sections || []).map(getSectionHtml).join('\n')
  const fallback = !sections && resultModel?.raw
    ? `
      <section class="section-card">
        <h2>原始结果</h2>
        <pre>${escapeHtml(JSON.stringify(resultModel.raw, null, 2))}</pre>
      </section>
    `
    : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || '分析报告')}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.65;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    .hero, .section-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }
    .hero {
      padding: 28px;
      margin-bottom: 20px;
    }
    .hero h1 {
      margin: 0 0 10px;
      font-size: 30px;
    }
    .meta {
      color: #475569;
      font-size: 14px;
      margin: 6px 0;
    }
    .jd-block {
      margin-top: 18px;
      background: #f8fafc;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      padding: 16px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .section-card {
      padding: 22px;
      margin-bottom: 16px;
    }
    .section-card h2 {
      margin: 0 0 12px;
      font-size: 20px;
    }
    .section-card pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: inherit;
      font-size: 15px;
      color: #334155;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .hero, .section-card {
        box-shadow: none;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <h1>${escapeHtml(title || '分析报告')}</h1>
      <div class="meta">类型：${escapeHtml(type || 'analyze')}</div>
      <div class="meta">生成时间：${escapeHtml(createdAt ? new Date(createdAt).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'))}</div>
      ${jdText ? `<div class="jd-block">${escapeHtml(jdText)}</div>` : ''}
    </header>
    ${sections || fallback}
  </div>
</body>
</html>`
}

export function downloadMarkdownReport(record) {
  const normalizedRecord = normalizeStoredRecord(record)
  const content = createMarkdownReport(normalizedRecord)
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${buildReportFilename(normalizedRecord)}.md`
  link.click()

  URL.revokeObjectURL(url)
}

export function downloadHtmlReport(record) {
  const normalizedRecord = normalizeStoredRecord(record)
  const html = createHtmlReport(normalizedRecord)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${buildReportFilename(normalizedRecord)}.html`
  link.click()

  URL.revokeObjectURL(url)
}

export function exportReportToPdf(record) {
  const normalizedRecord = normalizeStoredRecord(record)
  const html = createHtmlReport(normalizedRecord)
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')

  if (!printWindow) {
    throw new Error('浏览器拦截了 PDF 导出窗口，请允许弹窗后重试')
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  const triggerPrint = () => {
    printWindow.focus()
    printWindow.print()
  }

  printWindow.addEventListener('afterprint', () => {
    printWindow.close()
  }, { once: true })

  if (printWindow.document.readyState === 'complete') {
    window.setTimeout(triggerPrint, 100)
    return
  }

  printWindow.addEventListener('load', () => {
    window.setTimeout(triggerPrint, 100)
  }, { once: true })
}
