# BudCast Operations Agent Floor Design

## Decision

Build **BudCast Operations** as an owner-facing command center inside Mission Control. The first module is the **Agent Floor**: a cinematic Ops War Room that visualizes Codex Manager dispatching work to named subagents around a command table.

This is intentionally a fun, game-like dashboard, not a raw telemetry console. The underlying data is curated and manually editable so the screen stays useful even when the environment does not expose perfect real-time subagent telemetry.

## Approved Direction

- Product name: **BudCast Operations**
- First module: **Agent Floor**
- Visual direction: **Ops War Room**
- Centerpiece: **Command Table**
- Characters: both name and role, for example `Sagan · Quality Auditor`
- Scope: live floor plus mission history/replay
- Data mode: curated JSON rendered with animated UI
- Control mode: read dashboard plus manual override editor

## Routes

- `/mission-control/operations`
  - Main cinematic dashboard.
- `/mission-control/operations/edit`
  - Manual editor for curated operations data.

These routes sit under Mission Control instead of becoming customer-facing product surfaces.

## Data Source

Create a local curated data file:

```text
ops/agent-floor.json
```

The file should support both current build operations and future company operations. It must not be hard-coded only to coding agents.

### Data Shape

The JSON should include:

- `title`: display name for the dashboard.
- `mode`: current room mode, initially `agent_floor`.
- `manager`: the central operator, initially Codex Manager.
- `operators`: named agents or departments around the table.
- `activeMission`: the current mission being dispatched or reviewed.
- `missions`: recent and historical missions.
- `metrics`: curated efficiency, quality, and velocity values.
- `blockers`: current operational risks.
- `departments`: future-ready non-coding groups.

Mission categories must support:

- `build`: coding, reviews, QA, simulator checks.
- `operations`: launch readiness, store prep, compliance, account setup.
- `marketing`: content calendar, brand assets, campaign copy.
- `business`: partnerships, creator recruiting, sales pipeline.
- `support`: bugs, customer issues, follow-ups.

Mission status values should include:

- `queued`
- `assigned`
- `working`
- `reviewing`
- `needs_fix`
- `verified`
- `complete`
- `blocked`

Operator role examples:

- `Manager`
- `Builder`
- `Spec Reviewer`
- `Quality Auditor`
- `QA Scout`
- `iOS Runner`
- `Operations Lead`
- `Marketing Operator`
- `Business Scout`

Model choice fields should include:

- `modelLabel`: human-readable model choice.
- `reasoningLevel`: low, medium, high, or xhigh.
- `choiceRationale`: why that model/reasoning level was efficient for the task.
- `qualityGate`: spec review, code review, QA, build, or manual approval.

## Main Dashboard

The dashboard should feel like a premium cinematic command center while preserving fast readability.

### Header

Show:

- `BudCast Operations`
- Current module: `Agent Floor`
- A short subtitle explaining that the manager dispatches work to subagents and departments.
- High-level status chips:
  - Efficiency
  - Quality gates
  - Active missions
  - Blockers

### Command Table

The command table dominates the center.

Center operator:

- Codex Manager
- Current action, such as assigning, reviewing, integrating, or verifying.

Around the table:

- Active operators with name plus role.
- Each operator card shows current task, mission status, and quality-gate state.
- Cards should visually pulse or glow when active.
- Operators can be current subagents in v1 and business/marketing/operations departments in future modules.

### Current Mission Rail

Right-side or adjacent rail showing:

- Active mission title.
- Mission category.
- Assigned operator.
- Model/reasoning choice.
- Efficiency rationale.
- Current gate.
- Blocker or next action.

### Mission Log

Bottom rail showing recent missions in replay form.

Each row/card should show:

- Mission title.
- Category.
- Assigned operator.
- Status.
- Model choice.
- Review result.
- Whether a fix was required.
- Verification evidence.

The mission log should make the subagents’ value visible: what they reviewed, what they caught, and how the work improved.

### Manual Override

Provide a clear path to edit:

- Current mission.
- Operators.
- Statuses.
- Mission history.
- Model choice and rationale.
- Efficiency/quality metrics.
- Blockers.

Manual edits are expected and valid. The UI should not pretend these values are fully automated.

## Editor

The editor at `/mission-control/operations/edit` should follow the existing Mission Control editor pattern:

- Load the raw JSON.
- Validate JSON before saving.
- Save back into `ops/agent-floor.json`.
- Show the config path and last saved time.
- Provide a clear link back to the operations dashboard.

The first implementation uses a raw JSON editor. A structured form is explicitly outside v1 and can be reconsidered after the data model stabilizes.

## Animation And Game Feel

Use restrained animation:

- Command table ambient glow.
- Active operator pulse.
- Mission cards sliding or fading into the log.
- Status transitions with subtle motion.
- No noisy arcade effects.

The experience should feel cinematic and premium, not childish. The visual tone should align with the existing Dark Premium Moody design system.

## Truthfulness Rules

The dashboard may be curated, but it must not be misleading.

Required copy or affordance:

- Indicate that the Agent Floor is a curated operations view.
- Distinguish verified build evidence from manually entered notes.
- Do not claim real-time telemetry unless the value is actually live.

Acceptable:

- “Curated live floor”
- “Last updated”
- “Manual override”
- “Verified by typecheck”

Avoid:

- Claiming a subagent is actively running if it is only historical.
- Claiming a model was used if it was not recorded.
- Claiming a build passed without command evidence.

## Future Expansion

BudCast Operations should eventually support non-coding company work:

- App Store and Play Store prep.
- Compliance and cannabis-adjacent copy review.
- Marketing/content calendar.
- Brand partnership outreach.
- Creator recruiting.
- Support and bug triage.

The v1 implementation should not build all these modules, but the data model and labels should leave room for them.

## Non-Goals For V1

- No new backend tables.
- No Supabase schema changes.
- No external automation service.
- No real-time WebSocket telemetry.
- No AI-generated avatars required.
- No complex drag-and-drop editor.
- No replacement for the existing Mission Control dashboard.

## Testing

Verification should include:

- `npm run typecheck -w @budcast/web`
- `npm run build:web`
- Load `/mission-control/operations`.
- Load `/mission-control/operations/edit`.
- Edit the JSON and confirm the dashboard reflects the change.
- Confirm invalid JSON cannot be saved silently.
- Confirm the dashboard still works if there are no active missions.

## Success Criteria

The feature is successful when:

- The user can open a cinematic BudCast Operations dashboard locally.
- The screen clearly shows Codex Manager and named subagents around a command table.
- Live/current missions and historical mission logs are both visible.
- Model choice and quality-gate rationale are visible.
- The user can manually override the curated data.
- The route feels like a premium game-screen layer on top of real operations, not a generic admin table.
