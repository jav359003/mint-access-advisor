import { useMemo, useState } from 'react'
import {
  analyzePermissions,
  simulatePolicy,
} from './engine'
import { calls, DEMO_NOW, grants } from './data'
import type {
  AnalysisConfig,
  Recommendation,
  RecommendationAction,
} from './types'
import {
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  DownloadIcon,
  EvidenceIcon,
  GridIcon,
  LeafMark,
  MenuIcon,
  ShieldIcon,
  SlidersIcon,
} from './icons'

const config: AnalysisConfig = {
  observationDays: 30,
  minimumCallsToKeep: 3,
  protectRecentDays: 7,
}

const actionCopy: Record<RecommendationAction, string> = {
  keep: 'Keep',
  review: 'Review',
  remove: 'Remove',
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatLastUsed(recommendation: Recommendation) {
  const days = recommendation.stats.daysSinceLastUse
  if (days === null) return 'Not observed'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function exportReview(selected: Set<string>, recommendations: Recommendation[]) {
  const payload = {
    generatedAt: DEMO_NOW.toISOString(),
    evidenceWindowDays: config.observationDays,
    proposedRemovals: recommendations
      .filter((item) => selected.has(item.grant.id))
      .map((item) => ({
        server: item.grant.server,
        tool: item.grant.tool,
        recommendation: item.action,
        confidence: item.confidence,
        reason: item.reason,
      })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'mint-access-review.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const recommendations = useMemo(
    () => analyzePermissions(grants, calls, DEMO_NOW, config),
    [],
  )
  const [selectedId, setSelectedId] = useState(recommendations[0].grant.id)
  const [proposedRemovals, setProposedRemovals] = useState<Set<string>>(
    () =>
      new Set(
        recommendations
          .filter((item) => item.action === 'remove')
          .map((item) => item.grant.id),
      ),
  )

  const selected =
    recommendations.find((item) => item.grant.id === selectedId) ??
    recommendations[0]
  const simulation = useMemo(
    () =>
      simulatePolicy(
        calls,
        [...proposedRemovals],
        DEMO_NOW,
        config.observationDays,
      ),
    [proposedRemovals],
  )

  const removalCandidates = recommendations.filter(
    (item) => item.action === 'remove',
  ).length
  const reviewCandidates = recommendations.filter(
    (item) => item.action === 'review',
  ).length

  function toggleProposal(grantId: string) {
    setProposedRemovals((current) => {
      const next = new Set(current)
      if (next.has(grantId)) next.delete(grantId)
      else next.add(grantId)
      return next
    })
  }

  return (
    <div className="app-shell">
      <aside className={mobileNavOpen ? 'side-nav side-nav--open' : 'side-nav'}>
        <div className="brand-lockup">
          <span className="brand-mark"><LeafMark /></span>
          <span>Mint<span className="brand-muted">Access</span></span>
        </div>
        <button className="mobile-close" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><CloseIcon /></button>

        <nav aria-label="Primary">
          <a href="#overview" className="nav-item"><GridIcon /><span>Overview</span></a>
          <a href="#recommendations" className="nav-item nav-item--active" aria-current="page"><ShieldIcon /><span>Recommendations</span><span className="nav-count">{removalCandidates + reviewCandidates}</span></a>
          <a href="#simulator" className="nav-item"><SlidersIcon /><span>Policy simulator</span></a>
          <a href="#evidence" className="nav-item"><EvidenceIcon /><span>Evidence</span></a>
        </nav>

        <div className="side-note">
          <span className="concept-dot" />
          <div><strong>Independent concept</strong><span>Built from synthetic audit data</span></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main>
        <header className="top-bar">
          <button className="mobile-menu" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><MenuIcon /></button>
          <div className="breadcrumb"><span>Access review</span><ChevronIcon /><strong>Engineering bundle</strong></div>
          <div className="window-meta"><span className="live-dot" />30-day evidence window</div>
        </header>

        <section className="page-intro" id="overview">
          <div>
            <h1>Tighten access without breaking work.</h1>
            <p>Turn observed agent activity into explainable least-privilege recommendations, then replay the proposed policy against real workflows before anything changes.</p>
          </div>
          <button className="export-button" type="button" onClick={() => exportReview(proposedRemovals, recommendations)}><DownloadIcon />Export review</button>
        </section>

        <section className="outcome-strip" aria-label="Review summary">
          <div className="outcome-primary"><span className="outcome-number">{removalCandidates}</span><span><strong>safe removal candidates</strong><small>Unused throughout the evidence window</small></span></div>
          <div><span className="outcome-number">{reviewCandidates}</span><span><strong>need owner review</strong><small>Rare, recent, or policy-protected</small></span></div>
          <div><span className="outcome-number">{simulation.preservedPercent}%</span><span><strong>workflows preserved</strong><small>{simulation.impactedWorkflowIds.length === 0 ? 'No historical breakage detected' : `${simulation.impactedWorkflowIds.length} workflow impacted`}</small></span></div>
          <div><span className="outcome-number">{proposedRemovals.size}</span><span><strong>changes proposed</strong><small>Nothing is applied automatically</small></span></div>
        </section>

        <section className="review-workspace" id="recommendations">
          <div className="workspace-heading">
            <div><h2>Permission evidence</h2><p>Synthetic activity · Engineering role · {calls.length.toLocaleString()} tool calls</p></div>
            <div className="legend" aria-label="Recommendation legend"><span><i className="legend-dot legend-dot--remove" />Remove</span><span><i className="legend-dot legend-dot--review" />Review</span><span><i className="legend-dot legend-dot--keep" />Keep</span></div>
          </div>

          <div className="workspace-grid">
            <div className="permission-list" role="list" aria-label="Permission recommendations">
              <div className="permission-header" aria-hidden="true"><span>Tool permission</span><span>Usage</span><span>Decision</span><span>Proposal</span></div>
              {recommendations.map((item) => {
                const active = item.grant.id === selected.grant.id
                return (
                  <div
                    className={active ? 'permission-row permission-row--active' : 'permission-row'}
                    key={item.grant.id}
                    role="listitem"
                  >
                    <button className="permission-select" type="button" onClick={() => setSelectedId(item.grant.id)} aria-pressed={active}>
                      <span className="tool-cell"><span className="server-monogram">{item.grant.server.slice(0, 2)}</span><span><strong>{item.grant.displayName}</strong><small>{item.grant.server} · {item.grant.tool}</small></span></span>
                      <span className="usage-cell"><strong>{item.stats.callCount.toLocaleString()}</strong><small>{item.stats.workflowCount} workflows</small></span>
                      <span><span className={`decision decision--${item.action}`}><i />{actionCopy[item.action]}</span></span>
                    </button>
                    <span className="proposal-cell">
                      <label className="switch-control" aria-label={`Propose removing ${item.grant.displayName}`}>
                        <input type="checkbox" checked={proposedRemovals.has(item.grant.id)} onChange={() => toggleProposal(item.grant.id)} />
                        <span />
                      </label>
                    </span>
                  </div>
                )
              })}
            </div>

            <aside className="evidence-panel" id="evidence" aria-live="polite">
              <div className="evidence-topline"><span>{selected.grant.server}</span><span className={`risk-label risk-label--${selected.grant.risk}`}>{selected.grant.risk} access</span></div>
              <h2>{selected.grant.displayName}</h2>
              <code>{selected.grant.server.toLowerCase()}.{selected.grant.tool}</code>
              <p className="tool-description">{selected.grant.description}</p>

              <div className={`recommendation-callout recommendation-callout--${selected.action}`}>
                <span className="callout-icon"><CheckIcon /></span>
                <div><small>Recommendation</small><strong>{selected.reason}</strong><p>{selected.detail}</p></div>
              </div>

              <dl className="evidence-stats">
                <div><dt>Observed calls</dt><dd>{selected.stats.callCount.toLocaleString()}</dd></div>
                <div><dt>Last used</dt><dd>{formatLastUsed(selected)}</dd></div>
                <div><dt>Success rate</dt><dd>{selected.stats.callCount ? formatPercent(selected.stats.successRate) : '—'}</dd></div>
                <div><dt>Decision confidence</dt><dd>{formatPercent(selected.confidence)}</dd></div>
              </dl>

              <div className="explanation-block">
                <strong>Why the engine decided this</strong>
                <p>The rule evaluates usage count, recency, workflow breadth, and explicit policy exceptions. Risk controls review priority—it never replaces usage evidence.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className={simulation.impactedWorkflowIds.length ? 'simulation-bar simulation-bar--warning' : 'simulation-bar'} id="simulator">
          <div className="simulation-symbol"><ShieldIcon /></div>
          <div><small>Policy replay</small><strong>{simulation.impactedWorkflowIds.length ? `${simulation.impactedWorkflowIds.length} historical workflow would break` : 'Proposed changes preserve every observed workflow'}</strong><p>{simulation.blockedCalls.length} historical calls would be blocked across {simulation.historicalWorkflows} workflows.</p></div>
          <button type="button" onClick={() => setProposedRemovals(new Set(recommendations.filter((item) => item.action === 'remove').map((item) => item.grant.id)))}>Reset safe proposal</button>
        </section>
      </main>
    </div>
  )
}
