# Mint Access Advisor

## Platform

Responsive React and TypeScript web application suitable for Vercel.

## Purpose

Mint Access Advisor is an independent concept showing how agent audit logs could become explainable least-privilege recommendations. It complements MintMCP's public monitoring and tool-control capabilities; it is not an official MintMCP product.

## Primary user

An enterprise security, IT, or platform administrator responsible for governing which MCP tools each human role or autonomous agent may use.

## Core task

The administrator reviews evidence for every granted tool, chooses proposed removals, and replays that proposal against historical workflows before approving any policy change.

## Product principles

1. Evidence before recommendation.
2. Risk changes review priority, never the evidence itself.
3. Rare access is not automatically unnecessary access.
4. Break-glass capabilities require explicit policy treatment.
5. Recommendations never mutate permissions automatically.
6. Every decision must be reproducible and explainable.

## Demo constraints

- All identities, calls, permissions, and workflows are synthetic.
- The initial engine is deterministic and contains no model calls.
- The demo has no MintMCP API access and cannot change real policies.
- Any future integration should consume normalized audit events through a provider boundary.
