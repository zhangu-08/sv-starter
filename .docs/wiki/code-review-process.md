# Code review process

For agent reviewers, agent implementers, and humans — who may pick up any number of
findings, or none.

## Layout

```
.reviews/
  index.md              all rounds: round | scope | status | date
  0001/
    index.md            scope, verdict, findings table
    notes.md            verified-fine, fixed-during-review, known behaviour
    open/               one file per unfinished finding
      0001-02-login-rate-limiting.md
    closed/             one file per settled finding
      0001-01-fail-closed-route-protection.md
  0002/ ...
```

One folder per round, numbered `0001`, `0002`, … Never reuse a number.

`ls open/` is the work queue. `ls closed/` is what's already settled.

## Finding files

One finding, one file. Filename: `<id>-<kebab-title>.md`. Never renamed after creation.

```md
# 0001-06 — Short imperative title

**Severity:** blocker | should-fix | nit
**Status:** open
**Files:** `src/foo.ts:12`

What's wrong, in one or two sentences.

<evidence: code block, table, or measurement>

**Fix:** what to do.
**Verify:** the command or request that proves it.

## Log

### round 1 · implementer

Did X instead of the suggested Y because Z. `src/foo.ts:14`.

### round 1 · reviewer

Accepted. Verified: `pnpm check` 0 errors, 303 on POST.
```

`Severity` is set once and never changes. `Fix` must be actionable by someone who has read
nothing else.

## Finding IDs

`<round>-<nn>`, e.g. `0001-06`. Assigned once, never renumbered, never reused — even if a
finding is retracted. Commits, chat, and logs reference IDs.

## The loop

1. **Reviewer** writes `index.md`, `notes.md`, and one file per finding in `open/`.
2. **Implementer** fixes a finding, appends a `## Log` entry, sets `Status:` in the file and
   the row in `index.md` to `fixed` (or `rejected` to push back).
3. **Reviewer** verifies, appends a log entry, sets `accepted`, `rejected`, `wontfix`, or
   `retracted`.
4. On a terminal status, `mv` the file from `open/` to `closed/`.
5. Repeat per finding until `open/` is empty, then set the round to `closed` in
   `.reviews/index.md`.

A finding needing another look does **not** get a new file. It gets another log entry with
the next round number.

## Status vocabulary

| status      | meaning                                              | set by      | lives in  |
| ----------- | ---------------------------------------------------- | ----------- | --------- |
| `open`      | not started                                          | reviewer    | `open/`   |
| `fixed`     | implemented, awaiting verification                   | implementer | `open/`   |
| `rejected`  | implementer or reviewer disagrees; reason in the log | either      | `open/`   |
| `accepted`  | verified done                                        | reviewer    | `closed/` |
| `wontfix`   | correct as-is by design; reason in the log           | reviewer    | `closed/` |
| `retracted` | the finding itself was wrong; reason in the log      | reviewer    | `closed/` |

Terminal: `accepted`, `wontfix`, `retracted`. Only these move a file.

## Rules

- **Never edit a finding's body after publication.** Append to `## Log` instead. The body
  is what was found; the log is what was decided. Keeping them separable is the point.
- **`index.md` is the source of truth for status.** A finding must appear in exactly one of
  `open/` or `closed/` — check with `rg '^# 0001-06' .reviews/0001/`.
- **Read prior rounds' `closed/` and `notes.md` before opening a new round.** They hold the
  `wontfix` rulings, the retractions, and the deliberately-verified-fine list. Re-raising
  something settled there is the most expensive mistake available.
- Never edit a past log entry. Correct it in a new one.

## `notes.md`

Not findings, never close, no IDs. Three sections:

- **Fixed during review** — caught and fixed before publication.
- **Verified fine** — deliberately checked and correct, so nobody "fixes" or re-raises it.
- **Known behaviour** — true, understood, not fixable at this layer.

## Writing rules — enforced

- No preamble, no restating the task, no "as we discussed", no summary of the summary.
  Start with the claim.
- Findings: 3–10 lines of prose. If longer, the evidence is doing work the reader needs —
  keep the evidence, drop the prose around it.
- Prefer a code block, a table, or a command over a paragraph explaining one.
- State conclusions, not deliberation. "X is fail-open", not "I wondered whether X might
  be fail-open, and it turns out".
- No hedging stacks ("it's probably worth possibly considering").
- Cite `file:line` or a measured result. Unverified claims get marked `unverified`.
- Retractions: one line in the log, no post-mortem.
- `index.md` note column: one line, current state only, overwritten not appended.
