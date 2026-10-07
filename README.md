# Mint Access Advisor

An independent product concept that turns synthetic agent audit logs into explainable least-privilege recommendations. It is designed as a possible extension to MintMCP's existing agent monitoring and tool-level controls; it is not an official MintMCP product.

## What the demo proves

1. An administrator can see which granted tools have real workflow evidence.
2. Every recommendation has a deterministic, inspectable explanation.
3. Proposed removals are replayed against historical workflows before anything changes.
4. Break-glass and policy-protected access stays visible instead of being removed merely because it is rare.
5. The system recommends changes but never applies them automatically.

## Read the code in this order

1. `src/types.ts` — the domain vocabulary: grants, calls, usage statistics, recommendations, and simulation results.
2. `src/data.ts` — synthetic MintMCP-style permissions and audit events. No private customer data is used.
3. `src/engine.ts` — the complete deterministic analysis pipeline.
4. `src/engine.test.ts` — executable examples covering the important safety rules.
5. `src/App.tsx` — React state connecting engine output to the review and policy-replay interface.

## Analysis pipeline

```text
Tool grants + audit calls
          ↓
Filter to evidence window
          ↓
Aggregate count, recency, workflow breadth, users, success rate
          ↓
Keep / review / remove recommendation
          ↓
Human selects a proposed permission set
          ↓
Replay historical calls and report affected workflows
```

The recommendation engine is intentionally deterministic. An LLM is not appropriate for the access decision itself because administrators need reproducible behavior and an exact explanation. A future model could summarize evidence, but it should not silently decide whether access remains available.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run typecheck
npm run build
```

## Public-demo constraints

- All identities, workflows, usage events, and permissions are synthetic.
- No MintMCP API access is required.
- No policy is changed by the demo.
- The interface clearly labels itself as an independent concept.
