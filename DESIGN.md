# Mint Access Advisor — Design System

## Direction

An evidence-first operations console extending MintMCP's public visual language: warm white surfaces, black typography and controls, thin neutral rules, and bright lime reserved for selected or safe states. The interface avoids decorative dashboard chrome. One shared workspace connects recommendations, evidence, and policy replay.

## Mode

Operate. The interface optimizes for scanning, comparing, inspecting evidence, and making a reversible proposal.

## Layout

- Desktop: 226px persistent navigation and a fluid main workspace.
- Compact desktop: 76px icon navigation.
- Mobile: off-canvas navigation, stacked summary outcomes, condensed permission rows.
- Main content keeps 34px desktop page gutters and 18px mobile gutters.
- The evidence workspace uses a permission list beside one detail panel; the detail panel is omitted on narrow screens rather than squeezed into an unreadable column.

## Color tokens

- Ink: `#151713`
- Muted text: `#6e7169`
- Hairline: `#dedfd9`
- Strong line: `#c7c9c0`
- Paper: `#ffffff`
- Ground: `#f3f4f0`
- Mint lime: `#c9fb70`
- Soft lime: `#eafdcc`
- Positive green: `#77a832`
- Review amber: `#f0b64a`
- Removal red: `#d75a4a`

Lime communicates selection, safety, or governed readiness. Red and amber always appear with text labels; color is never the only state indicator.

## Typography

- Manrope Variable for interface and editorial copy.
- System monospace only for exact tool identifiers.
- Display heading: weight 400, tracking `-0.04em`, responsive 34–58px.
- Operational labels: 9–12px with restrained uppercase tracking where a machine-like category needs distinction.
- All changing counts use tabular numerals.

## Components

### Navigation

White rail with quiet gray links. The active page uses soft lime and a black count capsule.

### Outcome strip

A single bordered row rather than independent metric cards. The safe-removal result owns the only large lime field in the first viewport.

### Permission row

Each row contains a server monogram, human label, exact tool identifier, usage evidence, recommendation, and independent proposal switch. Selection and proposal are separate keyboard controls.

### Evidence panel

Explains one recommendation through its risk class, human description, rule result, usage statistics, confidence, and a plain-language explanation of the algorithm.

### Policy replay bar

Dark anchored footer region summarizing the consequence of the current proposal. It changes to warm brown when historical workflows would break. The reset action restores only the engine's zero-breakage removal candidates.

## Interaction

- Selecting a permission updates the evidence panel immediately.
- Proposal switches recompute policy replay synchronously.
- Removing a previously used tool names the resulting workflow impact.
- Reset returns to unused-tool removals only.
- Export downloads a transparent JSON review record; it does not apply a policy.
- Motion is limited to navigation, switch, and hover state transitions and respects reduced-motion preferences.

## Accessibility

- Native buttons, links, labels, and checkboxes are used throughout.
- Selection and proposal controls are not nested.
- Keyboard focus uses a high-contrast green ring.
- All recommendation states pair color with text.
- The mobile navigation has a scrim and explicit close control.
- The interface remains usable without animation.
