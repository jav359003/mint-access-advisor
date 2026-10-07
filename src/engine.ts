import type {
  AnalysisConfig,
  PermissionRisk,
  Recommendation,
  SimulationResult,
  ToolCall,
  ToolGrant,
  ToolStats,
} from './types'

const DAY_MS = 24 * 60 * 60 * 1000

const riskWeight: Record<PermissionRisk, number> = {
  read: 1,
  write: 2,
  sensitive: 4,
  destructive: 5,
}

export function callsInsideWindow(
  calls: ToolCall[],
  now: Date,
  observationDays: number,
): ToolCall[] {
  const cutoff = now.getTime() - observationDays * DAY_MS
  return calls.filter((call) => {
    const time = new Date(call.timestamp).getTime()
    return time >= cutoff && time <= now.getTime()
  })
}

export function aggregateToolStats(calls: ToolCall[], now: Date): ToolStats {
  if (calls.length === 0) {
    return {
      callCount: 0,
      successRate: 0,
      workflowCount: 0,
      userCount: 0,
      averageDurationMs: 0,
      lastUsedAt: null,
      daysSinceLastUse: null,
      sessionIds: [],
      workflowIds: [],
    }
  }

  const sorted = [...calls].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  const successes = calls.filter((call) => call.succeeded).length
  const workflowIds = [...new Set(calls.map((call) => call.workflowId))]
  const sessionIds = [...new Set(calls.map((call) => call.sessionId))]
  const userIds = new Set(calls.map((call) => call.userId))
  const averageDurationMs = Math.round(
    calls.reduce((sum, call) => sum + call.durationMs, 0) / calls.length,
  )
  const lastUsedAt = sorted[0].timestamp
  const daysSinceLastUse = Math.max(
    0,
    Math.floor((now.getTime() - new Date(lastUsedAt).getTime()) / DAY_MS),
  )

  return {
    callCount: calls.length,
    successRate: successes / calls.length,
    workflowCount: workflowIds.length,
    userCount: userIds.size,
    averageDurationMs,
    lastUsedAt,
    daysSinceLastUse,
    sessionIds,
    workflowIds,
  }
}

export function recommendGrant(
  grant: ToolGrant,
  stats: ToolStats,
  config: AnalysisConfig,
): Recommendation {
  if (grant.protectedReason) {
    return {
      grant,
      action: 'keep',
      confidence: 1,
      priority: 0,
      reason: 'Protected operational capability',
      detail: grant.protectedReason,
      stats,
    }
  }

  if (stats.callCount === 0) {
    const confidence = Math.min(0.97, 0.72 + config.observationDays / 180)
    return {
      grant,
      action: 'remove',
      confidence,
      priority: Math.round(confidence * riskWeight[grant.risk] * 20),
      reason: 'No observed dependency',
      detail: `Granted to this role, but unused during the ${config.observationDays}-day evidence window.`,
      stats,
    }
  }

  const recentlyUsed =
    stats.daysSinceLastUse !== null &&
    stats.daysSinceLastUse <= config.protectRecentDays

  if (stats.callCount < config.minimumCallsToKeep) {
    const detail = recentlyUsed
      ? `Used recently, but only ${stats.callCount} ${stats.callCount === 1 ? 'time' : 'times'}. Validate the workflow owner before changing access.`
      : `Only ${stats.callCount} observed calls and no recent evidence that the role still depends on it.`
    return {
      grant,
      action: 'review',
      confidence: recentlyUsed ? 0.63 : 0.77,
      priority: Math.round((recentlyUsed ? 0.63 : 0.77) * riskWeight[grant.risk] * 12),
      reason: recentlyUsed ? 'Rare but recently used' : 'Weak usage evidence',
      detail,
      stats,
    }
  }

  const breadth = Math.min(1, stats.workflowCount / 4)
  const confidence = Math.min(0.99, 0.78 + breadth * 0.16)
  return {
    grant,
    action: 'keep',
    confidence,
    priority: 0,
    reason: 'Repeated workflow dependency',
    detail: `${stats.callCount} calls across ${stats.workflowCount} workflows provide strong evidence that this role needs the tool.`,
    stats,
  }
}

export function analyzePermissions(
  grants: ToolGrant[],
  calls: ToolCall[],
  now: Date,
  config: AnalysisConfig,
): Recommendation[] {
  const windowCalls = callsInsideWindow(calls, now, config.observationDays)

  return grants
    .map((grant) => {
      const grantCalls = windowCalls.filter((call) => call.grantId === grant.id)
      return recommendGrant(grant, aggregateToolStats(grantCalls, now), config)
    })
    .sort((a, b) => {
      const actionOrder = { remove: 0, review: 1, keep: 2 }
      if (actionOrder[a.action] !== actionOrder[b.action]) {
        return actionOrder[a.action] - actionOrder[b.action]
      }
      return b.priority - a.priority || a.grant.displayName.localeCompare(b.grant.displayName)
    })
}

export function simulatePolicy(
  calls: ToolCall[],
  selectedGrantIds: string[],
  now: Date,
  observationDays: number,
): SimulationResult {
  const windowCalls = callsInsideWindow(calls, now, observationDays)
  const selected = new Set(selectedGrantIds)
  const blockedCalls = windowCalls.filter((call) => selected.has(call.grantId))
  const impactedSessionIds = [...new Set(blockedCalls.map((call) => call.sessionId))]
  const impactedWorkflowIds = [...new Set(blockedCalls.map((call) => call.workflowId))]
  const historicalWorkflows = new Set(windowCalls.map((call) => call.workflowId)).size
  const preservedPercent = historicalWorkflows
    ? Math.round(
        ((historicalWorkflows - impactedWorkflowIds.length) / historicalWorkflows) * 100,
      )
    : 100

  return {
    selectedGrantIds,
    blockedCalls,
    impactedSessionIds,
    impactedWorkflowIds,
    historicalWorkflows,
    preservedPercent,
  }
}
