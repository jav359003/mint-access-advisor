import type { ToolCall, ToolGrant } from './types'

export const DEMO_NOW = new Date('2026-10-07T16:00:00-04:00')

export const grants: ToolGrant[] = [
  {
    id: 'github-read-repository',
    server: 'GitHub',
    tool: 'read_repository',
    displayName: 'Read repository',
    description: 'Read files, commits, branches, and repository metadata.',
    risk: 'read',
    role: 'Engineering',
  },
  {
    id: 'github-search-code',
    server: 'GitHub',
    tool: 'search_code',
    displayName: 'Search code',
    description: 'Search source code across repositories available to the role.',
    risk: 'read',
    role: 'Engineering',
  },
  {
    id: 'github-create-pr',
    server: 'GitHub',
    tool: 'create_pull_request',
    displayName: 'Create pull requests',
    description: 'Open a pull request against an approved repository.',
    risk: 'write',
    role: 'Engineering',
  },
  {
    id: 'github-merge-pr',
    server: 'GitHub',
    tool: 'merge_pull_request',
    displayName: 'Merge pull requests',
    description: 'Merge an approved pull request into its target branch.',
    risk: 'destructive',
    role: 'Engineering',
  },
  {
    id: 'github-delete-repository',
    server: 'GitHub',
    tool: 'delete_repository',
    displayName: 'Delete repositories',
    description: 'Permanently delete a repository and its associated resources.',
    risk: 'destructive',
    role: 'Engineering',
  },
  {
    id: 'slack-read-history',
    server: 'Slack',
    tool: 'read_channel_history',
    displayName: 'Read channel history',
    description: 'Read messages from channels available to the connected identity.',
    risk: 'sensitive',
    role: 'Engineering',
  },
  {
    id: 'slack-send-message',
    server: 'Slack',
    tool: 'send_message',
    displayName: 'Send messages',
    description: 'Post a message into an approved Slack channel.',
    risk: 'write',
    role: 'Engineering',
  },
  {
    id: 'linear-search-issues',
    server: 'Linear',
    tool: 'search_issues',
    displayName: 'Search issues',
    description: 'Search issues, projects, and comments.',
    risk: 'read',
    role: 'Engineering',
  },
  {
    id: 'linear-update-issue',
    server: 'Linear',
    tool: 'update_issue',
    displayName: 'Update issues',
    description: 'Change issue state, assignment, or description.',
    risk: 'write',
    role: 'Engineering',
  },
  {
    id: 'notion-search',
    server: 'Notion',
    tool: 'search_workspace',
    displayName: 'Search workspace',
    description: 'Search pages and databases across the connected workspace.',
    risk: 'sensitive',
    role: 'Engineering',
  },
  {
    id: 'snowflake-run-query',
    server: 'Snowflake',
    tool: 'run_query',
    displayName: 'Run warehouse queries',
    description: 'Execute read-only SQL against approved warehouse schemas.',
    risk: 'sensitive',
    role: 'Engineering',
  },
  {
    id: 'pagerduty-create-incident',
    server: 'PagerDuty',
    tool: 'create_incident',
    displayName: 'Create incidents',
    description: 'Open an incident during a production emergency.',
    risk: 'write',
    role: 'Engineering',
    protectedReason:
      'Break-glass access. Required by the incident-response policy even when the tool is rarely used.',
  },
]

type CallRecipe = {
  grantId: string
  count: number
  newestDaysAgo: number
  workflows: string[]
  successEvery?: number
  durationBase?: number
}

const recipes: CallRecipe[] = [
  { grantId: 'github-read-repository', count: 284, newestDaysAgo: 0, workflows: ['code-review', 'incident-triage', 'release-prep', 'dependency-audit'], durationBase: 180 },
  { grantId: 'github-search-code', count: 162, newestDaysAgo: 0, workflows: ['code-review', 'incident-triage', 'dependency-audit'], durationBase: 240 },
  { grantId: 'github-create-pr', count: 36, newestDaysAgo: 1, workflows: ['dependency-audit', 'release-prep'], durationBase: 420 },
  { grantId: 'github-merge-pr', count: 1, newestDaysAgo: 3, workflows: ['release-prep'], durationBase: 670 },
  { grantId: 'slack-read-history', count: 74, newestDaysAgo: 0, workflows: ['incident-triage', 'support-handoff'], durationBase: 210 },
  { grantId: 'slack-send-message', count: 2, newestDaysAgo: 4, workflows: ['support-handoff'], durationBase: 310 },
  { grantId: 'linear-search-issues', count: 95, newestDaysAgo: 0, workflows: ['code-review', 'release-prep', 'support-handoff'], durationBase: 190 },
  { grantId: 'linear-update-issue', count: 18, newestDaysAgo: 2, workflows: ['release-prep', 'support-handoff'], durationBase: 340 },
  { grantId: 'snowflake-run-query', count: 22, newestDaysAgo: 1, workflows: ['usage-analysis'], durationBase: 880, successEvery: 9 },
]

function buildCalls(recipe: CallRecipe): ToolCall[] {
  return Array.from({ length: recipe.count }, (_, index) => {
    const daysAgo = Math.min(29, recipe.newestDaysAgo + (index % 17))
    const timestamp = new Date(DEMO_NOW.getTime() - daysAgo * 86_400_000 - (index % 8) * 3_600_000)
    const workflowId = recipe.workflows[index % recipe.workflows.length]
    return {
      id: `${recipe.grantId}-${index + 1}`,
      grantId: recipe.grantId,
      timestamp: timestamp.toISOString(),
      succeeded: recipe.successEvery ? (index + 1) % recipe.successEvery !== 0 : true,
      sessionId: `${workflowId}-session-${(index % 7) + 1}`,
      workflowId,
      userId: `engineer-${(index % 4) + 1}`,
      agentId: index % 3 === 0 ? 'release-agent' : 'engineering-copilot',
      durationMs: (recipe.durationBase ?? 200) + (index % 5) * 37,
    }
  })
}

export const calls: ToolCall[] = recipes.flatMap(buildCalls)
