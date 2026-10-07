export type PermissionRisk = 'read' | 'write' | 'sensitive' | 'destructive'
export type RecommendationAction = 'keep' | 'review' | 'remove'

export interface ToolGrant {
  id: string
  server: string
  tool: string
  displayName: string
  description: string
  risk: PermissionRisk
  role: string
  protectedReason?: string
}

export interface ToolCall {
  id: string
  grantId: string
  timestamp: string
  succeeded: boolean
  sessionId: string
  workflowId: string
  userId: string
  agentId: string
  durationMs: number
}

export interface AnalysisConfig {
  observationDays: number
  minimumCallsToKeep: number
  protectRecentDays: number
}

export interface ToolStats {
  callCount: number
  successRate: number
  workflowCount: number
  userCount: number
  averageDurationMs: number
  lastUsedAt: string | null
  daysSinceLastUse: number | null
  sessionIds: string[]
  workflowIds: string[]
}

export interface Recommendation {
  grant: ToolGrant
  action: RecommendationAction
  confidence: number
  priority: number
  reason: string
  detail: string
  stats: ToolStats
}

export interface SimulationResult {
  selectedGrantIds: string[]
  blockedCalls: ToolCall[]
  impactedSessionIds: string[]
  impactedWorkflowIds: string[]
  historicalWorkflows: number
  preservedPercent: number
}
