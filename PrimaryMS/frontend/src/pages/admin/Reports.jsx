import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  FiFileText, FiDownload, FiPrinter, FiRefreshCw,
  FiUsers, FiUserCheck, FiAlertCircle, FiDollarSign,
  FiBarChart2, FiCalendar, FiFilter,
} from 'react-icons/fi'
import { reportService } from '../../services/reportService.js'
import { classService }  from '../../services/classService.js'
import Loading from '../../components/common/Loading.jsx'
import Button  from '../../components/common/Button.jsx'
import './Reports.css'

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n) => Number(n ?? 0).toLocaleString()
const pct = (part, total) => total ? `${Math.round((part / total) * 100)}%` : '0%'
const today = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const TABS = [
  { id: 'summary',    label: 'Summary',    icon: <FiBarChart2 /> },
  { id: 'attendance', label: 'Attendance', icon: <FiCalendar  /> },
  { id: 'scores',     label: 'Scores',     icon: <FiFileText  /> },
]

/* ═══════════════════════════════════════════════════ */
export default function Reports() {
  const [tab, setTab]         = useState('summary')
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Summary
  const [summary, setSummary] = useState(null)

  // Attendance
  const [attFilters, setAttFilters] = useState({ class_id: '', date_from: '', date_to: '' })
  const [attReport,  setAttReport]  = useState(null)

  // Scores
  const [scoreFilters, setScoreFilters] = useState({ class_id: '' })
  const [scoreReport,  setScoreReport]  = useState(null)

  const printRef = useRef(null)

  /* load classes once */
  useEffect(() => { classService.getAll().then(setClasses).catch(() => {}) }, [])

  /* auto-load summary on mount */
  useEffect(() => { if (tab === 'summary') loadSummary() }, [])

  /* ── loaders ── */
  const loadSummary = async () => {
    setLoading(true); setError('')
    try { setSummary(await reportService.getSummary()) }
    catch { setError('Failed to load summary report.') }
    finally { setLoading(false) }
  }

  const loadAttendance = async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (attFilters.class_id)  params.class_id  = attFilters.class_id
      if (attFilters.date_from) params.date_from = attFilters.date_from
      if (attFilters.date_to)   params.date_to   = attFilters.date_to
      setAttReport(await reportService.getAttendanceReport(params))
    } catch { setError('Failed to load attendance report.') }
    finally { setLoading(false) }
  }

  const loadScores = async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (scoreFilters.class_id) params.class_id = scoreFilters.class_id
      setScoreReport(await reportService.getScoreReport(params))
    } catch { setError('Failed to load scores report.') }
    finally { setLoading(false) }
  }

  const handleTabChange = (id) => {
    setTab(id); setError('')
    if (id === 'summary') loadSummary()
  }

  /* ── Excel export ── */
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    if (tab === 'summary' && summary) {
      const data = [
        ['PrimaryMS — Summary Report', '', today()],
        [],
        ['Metric', 'Value'],
        ['Total Students',        summary.total_students],
        ['Total Teachers',        summary.total_teachers],
        ['Total Parents',         summary.total_parents],
        ['Total Classes',         summary.total_classes],
        ['Total Subjects',        summary.total_subjects],
        [],
        ['Attendance — Today'],
        ['Present',  summary.attendance_today_present],
        ['Absent',   summary.attendance_today_absent],
        [],
        ['Fees'],
        ['Unpaid Total ($)', summary.fees_unpaid_total.toFixed(2)],
        ['Overdue Count',    summary.fees_overdue_count],
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Summary')
    }

    if (tab === 'attendance' && attReport) {
      const data = [
        ['PrimaryMS — Attendance Report', '', today()],
        ['Period:', `${attReport.date_from || 'All time'} – ${attReport.date_to || 'Now'}`],
        [],
        ['Status', 'Count', '% of Total'],
        ...attReport.breakdown.map(b => [
          b.status.charAt(0).toUpperCase() + b.status.slice(1),
          b.count,
          pct(b.count, attReport.total_records),
        ]),
        [],
        ['Total Records', attReport.total_records],
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Attendance')
    }

    if (tab === 'scores' && scoreReport) {
      const data = [
        ['PrimaryMS — Scores Report', '', today()],
        ['Overall Average:', `${scoreReport.overall_average}%`],
        [],
        ['Subject', 'Avg Score', 'Out of', 'Avg %', 'Records'],
        ...scoreReport.subjects.map(s => [
          s.subject_name,
          s.average_score,
          s.max_possible,
          `${Math.round((s.average_score / s.max_possible) * 100)}%`,
          s.count,
        ]),
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Scores')
    }

    XLSX.writeFile(wb, `PrimaryMS_${tab}_report_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  /* ── Print ── */
  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PrimaryMS Report — ${tab}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 32px; font-size: 13px; }
          h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; color: #1e293b; }
          .rpt-meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
          .stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px; }
          .stat-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
          .stat-value { font-size: 22px; font-weight: 700; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; }
          td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
          tr:last-child td { border-bottom: none; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .badge-green  { background: #dcfce7; color: #166534; }
          .badge-red    { background: #fee2e2; color: #991b1b; }
          .badge-yellow { background: #fef9c3; color: #854d0e; }
          .badge-blue   { background: #dbeafe; color: #1e40af; }
          .section-title { font-size: 14px; font-weight: 600; color: #334155; margin: 20px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 4px; }
          .progress-fill { height: 100%; border-radius: 3px; background: #4f46e5; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.focus(); win.print(); win.close() }, 400)
  }

  /* ── Print content builders ── */
  const renderPrintSummary = () => {
    if (!summary) return null
    const present = summary.attendance_today_present
    const absent  = summary.attendance_today_absent
    const total   = present + absent
    return (
      <div>
        <h1>📊 PrimaryMS — Summary Report</h1>
        <p className="rpt-meta">Generated: {today()}</p>
        <div className="stat-grid">
          {[
            ['Students',  summary.total_students,  '#4f46e5'],
            ['Teachers',  summary.total_teachers,  '#0891b2'],
            ['Parents',   summary.total_parents,   '#059669'],
            ['Classes',   summary.total_classes,   '#d97706'],
            ['Subjects',  summary.total_subjects,  '#7c3aed'],
          ].map(([label, val, color]) => (
            <div className="stat-box" key={label}>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
        <div className="section-title">Today's Attendance</div>
        <table>
          <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
          <tbody>
            <tr><td>Present</td><td>{present}</td><td>{pct(present, total)}</td></tr>
            <tr><td>Absent</td> <td>{absent}</td> <td>{pct(absent,  total)}</td></tr>
          </tbody>
        </table>
        <div className="section-title">Fee Overview</div>
        <table>
          <thead><tr><th>Metric</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Unpaid Total</td><td>${summary.fees_unpaid_total.toFixed(2)}</td></tr>
            <tr><td>Overdue Count</td><td>{summary.fees_overdue_count}</td></tr>
          </tbody>
        </table>
      </div>
    )
  }

  const renderPrintAttendance = () => {
    if (!attReport) return null
    return (
      <div>
        <h1>📅 PrimaryMS — Attendance Report</h1>
        <p className="rpt-meta">Period: {attReport.date_from || 'All time'} – {attReport.date_to || 'Now'} · Generated: {today()}</p>
        <table>
          <thead><tr><th>Status</th><th>Count</th><th>% of Total</th></tr></thead>
          <tbody>
            {attReport.breakdown.map(b => (
              <tr key={b.status}>
                <td style={{ textTransform: 'capitalize' }}>{b.status}</td>
                <td>{b.count}</td>
                <td>{pct(b.count, attReport.total_records)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700 }}><td>Total</td><td>{attReport.total_records}</td><td>100%</td></tr>
          </tbody>
        </table>
      </div>
    )
  }

  const renderPrintScores = () => {
    if (!scoreReport) return null
    return (
      <div>
        <h1>📝 PrimaryMS — Scores Report</h1>
        <p className="rpt-meta">Overall Average: {scoreReport.overall_average}% · Generated: {today()}</p>
        <table>
          <thead><tr><th>Subject</th><th>Avg Score</th><th>Out of</th><th>Avg %</th><th>Records</th></tr></thead>
          <tbody>
            {scoreReport.subjects.map(s => (
              <tr key={s.subject_id}>
                <td>{s.subject_name}</td>
                <td>{s.average_score}</td>
                <td>{s.max_possible}</td>
                <td>{Math.round((s.average_score / s.max_possible) * 100)}%</td>
                <td>{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const canExport =
    (tab === 'summary'    && summary)    ||
    (tab === 'attendance' && attReport)  ||
    (tab === 'scores'     && scoreReport)

  /* ════════════════════════════════════════════════ */
  return (
    <div className="rpt-page">

      {/* Hidden print container */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {tab === 'summary'    && renderPrintSummary()}
          {tab === 'attendance' && renderPrintAttendance()}
          {tab === 'scores'     && renderPrintScores()}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="rpt-header">
        <div>
          <h1 className="rpt-title">Reports &amp; Analytics</h1>
          <p className="rpt-sub">Generate, export, and print school reports</p>
        </div>
        <div className="rpt-header__actions">
          <Button
            variant="secondary" size="sm"
            onClick={exportToExcel}
            disabled={!canExport}
            title="Export to Excel"
          >
            <FiDownload /> Export Excel
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={handlePrint}
            disabled={!canExport}
            title="Print report"
          >
            <FiPrinter /> Print
          </Button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="rpt-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`rpt-tab${tab === t.id ? ' rpt-tab--active' : ''}`}
            onClick={() => handleTabChange(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && <div className="rpt-error"><FiAlertCircle /> {error}</div>}

      {/* ════ SUMMARY TAB ════ */}
      {tab === 'summary' && (
        <div className="rpt-section">
          <div className="rpt-section__toolbar">
            <span className="rpt-section__title">School Overview · {today()}</span>
            <Button variant="ghost" size="sm" onClick={loadSummary}><FiRefreshCw /> Refresh</Button>
          </div>

          {loading ? <Loading text="Loading summary…" /> : summary && (
            <>
              {/* KPI cards */}
              <div className="rpt-kpi-grid">
                {[
                  { label: 'Students',  value: summary.total_students,  icon: <FiUsers />,     color: 'indigo' },
                  { label: 'Teachers',  value: summary.total_teachers,  icon: <FiUserCheck />, color: 'cyan'   },
                  { label: 'Parents',   value: summary.total_parents,   icon: <FiUsers />,     color: 'green'  },
                  { label: 'Classes',   value: summary.total_classes,   icon: <FiFileText />,  color: 'amber'  },
                  { label: 'Subjects',  value: summary.total_subjects,  icon: <FiBarChart2 />, color: 'violet' },
                ].map(k => (
                  <div key={k.label} className={`rpt-kpi rpt-kpi--${k.color}`}>
                    <div className="rpt-kpi__icon">{k.icon}</div>
                    <div className="rpt-kpi__body">
                      <div className="rpt-kpi__value">{fmt(k.value)}</div>
                      <div className="rpt-kpi__label">{k.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance + Fees row */}
              <div className="rpt-row">
                {/* Today attendance */}
                <div className="rpt-card">
                  <div className="rpt-card__head"><FiCalendar /> Today's Attendance</div>
                  <div className="rpt-att-summary">
                    {(() => {
                      const p = summary.attendance_today_present
                      const a = summary.attendance_today_absent
                      const total = p + a
                      return (
                        <>
                          <div className="rpt-att-ring">
                            <svg viewBox="0 0 80 80" width="120" height="120">
                              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                              <circle
                                cx="40" cy="40" r="32" fill="none"
                                stroke="var(--color-success)" strokeWidth="10"
                                strokeDasharray={`${total ? (p/total)*201 : 0} 201`}
                                strokeDashoffset="50" strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 0.6s ease' }}
                              />
                              <text x="40" y="45" textAnchor="middle" fontSize="14" fontWeight="700" fill="#f1f5f9">
                                {total ? pct(p, total) : '—'}
                              </text>
                            </svg>
                          </div>
                          <div className="rpt-att-stats">
                            <div className="rpt-att-stat rpt-att-stat--present">
                              <span className="dot dot--green" />
                              <div><strong>{fmt(p)}</strong><span>Present</span></div>
                            </div>
                            <div className="rpt-att-stat rpt-att-stat--absent">
                              <span className="dot dot--red" />
                              <div><strong>{fmt(a)}</strong><span>Absent</span></div>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Fee overview */}
                <div className="rpt-card">
                  <div className="rpt-card__head"><FiDollarSign /> Fee Overview</div>
                  <div className="rpt-fee-grid">
                    <div className="rpt-fee-box rpt-fee-box--danger">
                      <div className="rpt-fee-box__label">Unpaid Total</div>
                      <div className="rpt-fee-box__value">${summary.fees_unpaid_total.toFixed(2)}</div>
                    </div>
                    <div className="rpt-fee-box rpt-fee-box--warning">
                      <div className="rpt-fee-box__label">Overdue Fees</div>
                      <div className="rpt-fee-box__value">{fmt(summary.fees_overdue_count)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════ ATTENDANCE TAB ════ */}
      {tab === 'attendance' && (
        <div className="rpt-section">
          {/* Filters */}
          <div className="rpt-filters">
            <select
              className="rpt-select"
              value={attFilters.class_id}
              onChange={e => setAttFilters(p => ({ ...p, class_id: e.target.value }))}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="rpt-date-label">
              From
              <input type="date" className="rpt-date"
                value={attFilters.date_from}
                onChange={e => setAttFilters(p => ({ ...p, date_from: e.target.value }))}
              />
            </label>
            <label className="rpt-date-label">
              To
              <input type="date" className="rpt-date"
                value={attFilters.date_to}
                onChange={e => setAttFilters(p => ({ ...p, date_to: e.target.value }))}
              />
            </label>
            <Button size="sm" onClick={loadAttendance}><FiFilter /> Generate</Button>
          </div>

          {loading ? <Loading text="Loading attendance report…" /> :
           attReport ? (
            <>
              <div className="rpt-meta-bar">
                Period: <strong>{attReport.date_from || 'All time'}</strong> → <strong>{attReport.date_to || 'Now'}</strong>
                &nbsp;·&nbsp; Total records: <strong>{fmt(attReport.total_records)}</strong>
              </div>

              {/* Breakdown bars */}
              <div className="rpt-card">
                <div className="rpt-card__head"><FiBarChart2 /> Attendance Breakdown</div>
                <div className="rpt-bar-list">
                  {attReport.breakdown.map(b => {
                    const pctVal = attReport.total_records ? (b.count / attReport.total_records) * 100 : 0
                    const colorMap = { present: 'green', absent: 'red', late: 'amber', excused: 'blue' }
                    const col = colorMap[b.status] || 'indigo'
                    return (
                      <div key={b.status} className="rpt-bar-item">
                        <div className="rpt-bar-meta">
                          <span className={`rpt-bar-label rpt-bar-label--${col}`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                          <span className="rpt-bar-count">{fmt(b.count)} <small>({pct(b.count, attReport.total_records)})</small></span>
                        </div>
                        <div className="rpt-bar-track">
                          <div className={`rpt-bar-fill rpt-bar-fill--${col}`} style={{ width: `${pctVal}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="rpt-table-wrap">
                <table className="rpt-table">
                  <thead>
                    <tr><th>#</th><th>Status</th><th>Count</th><th>Percentage</th></tr>
                  </thead>
                  <tbody>
                    {attReport.breakdown.map((b, i) => {
                      const colorMap = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' }
                      return (
                        <tr key={b.status}>
                          <td>{i + 1}</td>
                          <td>
                            <span className={`badge badge--${colorMap[b.status] || 'default'}`}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </td>
                          <td><strong>{fmt(b.count)}</strong></td>
                          <td>
                            <div className="rpt-inline-bar">
                              <div className="rpt-inline-fill" style={{ width: pct(b.count, attReport.total_records) }} />
                              <span>{pct(b.count, attReport.total_records)}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="rpt-table__total">
                      <td colSpan={2}><strong>Total</strong></td>
                      <td><strong>{fmt(attReport.total_records)}</strong></td>
                      <td><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rpt-empty">
              <span>📅</span>
              <p>Select filters above and click <strong>Generate</strong> to load attendance data.</p>
            </div>
          )}
        </div>
      )}

      {/* ════ SCORES TAB ════ */}
      {tab === 'scores' && (
        <div className="rpt-section">
          <div className="rpt-filters">
            <select
              className="rpt-select"
              value={scoreFilters.class_id}
              onChange={e => setScoreFilters(p => ({ ...p, class_id: e.target.value }))}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button size="sm" onClick={loadScores}><FiFilter /> Generate</Button>
          </div>

          {loading ? <Loading text="Loading scores report…" /> :
           scoreReport ? (
            <>
              {/* Overall badge */}
              <div className="rpt-overall">
                <div className="rpt-overall__circle" style={{
                  background: `conic-gradient(var(--color-primary) ${scoreReport.overall_average * 3.6}deg, rgba(255,255,255,0.06) 0deg)`
                }}>
                  <div className="rpt-overall__inner">
                    <span className="rpt-overall__pct">{scoreReport.overall_average}%</span>
                    <span className="rpt-overall__sub">Overall Avg</span>
                  </div>
                </div>
                <div className="rpt-overall__stats">
                  <div className="rpt-overall__stat">
                    <strong>{scoreReport.subjects.length}</strong> Subjects
                  </div>
                  <div className="rpt-overall__stat">
                    <strong>{scoreReport.subjects.reduce((a, s) => a + s.count, 0)}</strong> Total Records
                  </div>
                </div>
              </div>

              {/* Per-subject bars */}
              <div className="rpt-card">
                <div className="rpt-card__head"><FiBarChart2 /> Performance by Subject</div>
                <div className="rpt-bar-list">
                  {scoreReport.subjects.map(s => {
                    const pctVal = s.max_possible ? (s.average_score / s.max_possible) * 100 : 0
                    return (
                      <div key={s.subject_id} className="rpt-bar-item">
                        <div className="rpt-bar-meta">
                          <span className="rpt-bar-subject">{s.subject_name}</span>
                          <span className="rpt-bar-count">{s.average_score} / {s.max_possible} <small>({Math.round(pctVal)}%)</small></span>
                        </div>
                        <div className="rpt-bar-track">
                          <div
                            className="rpt-bar-fill rpt-bar-fill--score"
                            style={{ width: `${Math.min(pctVal, 100)}%`,
                              background: pctVal >= 75
                                ? 'var(--color-success)'
                                : pctVal >= 50
                                ? 'var(--color-warning)'
                                : 'var(--color-danger)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="rpt-table-wrap">
                <table className="rpt-table">
                  <thead>
                    <tr><th>#</th><th>Subject</th><th>Avg Score</th><th>Out of</th><th>Avg %</th><th>Records</th></tr>
                  </thead>
                  <tbody>
                    {scoreReport.subjects.map((s, i) => {
                      const pctVal = s.max_possible ? Math.round((s.average_score / s.max_possible) * 100) : 0
                      return (
                        <tr key={s.subject_id}>
                          <td>{i + 1}</td>
                          <td><strong>{s.subject_name}</strong></td>
                          <td>{s.average_score}</td>
                          <td>{s.max_possible}</td>
                          <td>
                            <span className={`badge badge--${pctVal >= 75 ? 'success' : pctVal >= 50 ? 'warning' : 'danger'}`}>
                              {pctVal}%
                            </span>
                          </td>
                          <td>{fmt(s.count)}</td>
                        </tr>
                      )
                    })}
                    <tr className="rpt-table__total">
                      <td colSpan={4}><strong>Overall Average</strong></td>
                      <td><strong>{scoreReport.overall_average}%</strong></td>
                      <td><strong>{scoreReport.subjects.reduce((a, s) => a + s.count, 0)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rpt-empty">
              <span>📝</span>
              <p>Select a class filter and click <strong>Generate</strong> to load score data.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
