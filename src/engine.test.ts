import { describe, expect, it } from 'vitest'
import {
  aggregateToolStats,
  analyzePermissions,
  callsInsideWindow,
  recommendGrant,
  simulatePolicy,
} from './engine'
import type { AnalysisConfig, ToolCall, ToolGrant } from './types'

const now = new Date('2026-10-07T16:00:00-04:00')
const config: AnalysisConfig = {
  observationDays: 30,
  minimumCallsToKeep: 3,
  protectRecentDays: 7,
}

const grant: ToolGrant = {
  id: 'github-delete',
  server: 'GitHub',
  tool: 'delete_repository',
  displayName: 'Delete repository',
  description: 'Delete a repository.',
  risk: 'destructive',
  role: 'Engineering',
}

function call(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    id: 'call-1',
    grantId: grant.id,
    timestamp: '2026-10-06T16:00:00-04:00',
    succeeded: true,
    sessionId: 'session-1',
    workflowId: 'release',
    userId: 'user-1',
    agentId: 'agent-1',
    durationMs: 120,
    ...overrides,
  }
}

describe('least-privilege engine', () => {
  it('keeps only calls inside the observation window', () => {
    const calls = [
      call(),
      call({ id: 'old', timestamp: '2026-08-01T16:00:00-04:00' }),
    ]
    expect(callsInsideWindow(calls, now, 30).map((item) => item.id)).toEqual([
      'call-1',
    ])
  })

  it('aggregates usage without double-counting workflows', () => {
    const stats = aggregateToolStats(
      [call(), call({ id: 'call-2', succeeded: false })],
      now,
    )
    expect(stats.callCount).toBe(2)
    expect(stats.workflowCount).toBe(1)
    expect(stats.successRate).toBe(0.5)
    expect(stats.daysSinceLastUse).toBe(1)
  })

  it('recommends removing an unused destructive permission', () => {
    const recommendation = recommendGrant(
      grant,
      aggregateToolStats([], now),
      config,
    )
    expect(recommendation.action).toBe('remove')
    expect(recommendation.priority).toBeGreaterThan(50)
  })

  it('protects explicit break-glass permissions', () => {
    const recommendation = recommendGrant(
      { ...grant, protectedReason: 'Required for incident response.' },
      aggregateToolStats([], now),
      config,
    )
    expect(recommendation.action).toBe('keep')
    expect(recommendation.reason).toContain('Protected')
  })

  it('marks rare recent use for human review', () => {
    const recommendation = recommendGrant(
      grant,
      aggregateToolStats([call()], now),
      config,
    )
    expect(recommendation.action).toBe('review')
    expect(recommendation.reason).toBe('Rare but recently used')
  })

  it('sorts removals before reviews and keeps', () => {
    const grants = [
      grant,
      { ...grant, id: 'read', tool: 'read_repository', displayName: 'Read', risk: 'read' as const },
    ]
    const readCalls = [0, 1, 2].map((index) =>
      call({ id: `read-${index}`, grantId: 'read' }),
    )
    const results = analyzePermissions(grants, readCalls, now, config)
    expect(results.map((item) => item.action)).toEqual(['remove', 'keep'])
  })

  it('reports exactly which workflows a proposed removal breaks', () => {
    const result = simulatePolicy(
      [call(), call({ id: 'call-2', workflowId: 'support' })],
      [grant.id],
      now,
      30,
    )
    expect(result.blockedCalls).toHaveLength(2)
    expect(result.impactedWorkflowIds).toEqual(['release', 'support'])
    expect(result.preservedPercent).toBe(0)
  })
})
