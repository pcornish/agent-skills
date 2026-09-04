# agent-skills

Shared Agent Skill configuration and assets.

This repository publishes an [Agent Manager](https://github.com/ai-agent-manager/agent-manager)
**discovery document** so that teams can install our shared agent skills into their
coding assistant (Claude Code, Kiro, OpenCode etc.) quickly.

## Consuming these skills with Agent Manager

Agent Manager consumes this repository as a **git remote**. When pointed at a git
remote — a GitHub `owner/repo` shorthand, a GitHub HTTPS URL, or a `*.git` URL — it
looks for a discovery document at `.agents/discovery.json` in the repository root. This
repository serves its discovery document from:

```
.agents/discovery.json
```

Point Agent Manager at this repository as a git remote — it reads
`.agents/discovery.json` from the repo root automatically (via the GitHub Contents API,
so no clone is needed for github.com):

```bash
npx -y @ai-agent-manager/cli@latest govuk-one-login/agent-skills
```

This resolves the discovery document, presents the available skills across all declared
sources, and lets you choose which to install and where. Branch, tag, and commit pins are
supported via `/tree/`, for example:

```bash
npx -y @ai-agent-manager/cli@latest \
  https://github.com/govuk-one-login/agent-skills/tree/main
```

### Headless install (CI)

Skip the interactive menu with a config file listing the tool(s), scope, and skills to
install:

```yaml
# .github/ai-skills.yml
tools: kiro          # one or more: claude-code | kiro | ...
scope: repo          # repo (default) | system
skills:
  - mocks
```

```bash
npx -y @ai-agent-manager/cli@latest \
  govuk-one-login/agent-skills \
  --config .github/ai-skills.yml
```

**GitHub Actions example:**

```yaml
- name: Install agent skills
  run: |
    npx -y @ai-agent-manager/cli@latest \
      govuk-one-login/agent-skills \
      --config .github/ai-skills.yml
```

> [!NOTE]
> Fetching `.agents/discovery.json` from a private repository (or to raise the GitHub API
> rate limit) uses `GITHUB_TOKEN` when it is set, the same as private skill installs.

## Sources in the discovery document

The discovery document aggregates skills from several repositories. Each is declared as a
`git` source, which Agent Manager clones and scans for skills in the Claude Code plugin
marketplace layout (`skills/<skill-name>/SKILL.md` at the repository root).

| Source | Repository | Notes |
|--------|------------|-------|
| `agent-skills` | [govuk-one-login/agent-skills](https://github.com/govuk-one-login/agent-skills) | This repository. Skills under `skills/`. |
| `gds-ai-superpowers` | [govuk-one-login/gds-ai-superpowers](https://github.com/govuk-one-login/gds-ai-superpowers) | Skills under `skills/` in the marketplace layout. |
| `dependabot-pr-review` | [govuk-one-login/ai-sandbox](https://github.com/govuk-one-login/ai-sandbox) | See caveat below. |
| `frontend-skills` | [govuk-one-login/frontend-skills](https://github.com/govuk-one-login/frontend-skills) | Repository to be created (URL is a placeholder). |

### Caveats

- **`dependabot-pr-review`** currently lives at `.kiro/skills/dependabot-pr-review/SKILL.md`
  in the `ai-sandbox` repository, **not** under a top-level `skills/` directory. Agent
  Manager's `git` source scanner only discovers skills in the marketplace layout
  (`skills/<skill-name>/SKILL.md`), so this skill will not be found until it is moved (or
  copied) to `skills/dependabot-pr-review/` in a repository, or repackaged as an
  `artefact` source. Update the source entry in
  [`.agents/discovery.json`](.agents/discovery.json) once its
  final location is known.
- **`frontend-skills`** does not exist yet. The `url` in the discovery document is a
  placeholder — update it when the repository is created.

## Adding a skill to this repository

Place each skill in its own directory under `skills/`, following the Claude Code plugin
marketplace layout:

```
skills/
  mocks/
    SKILL.md
```

Each skill must have a `SKILL.md` file. Agent Manager discovers skills by scanning for
these files, so no change to the discovery document is needed when adding a new skill to
this repository.

> [!TIP]
> See the [Agent Skills specification](https://agentskills.io/specification) for full details.

---

## Developing and testing the discovery document

### Test locally for agent-manager

This repository is consumed as a **git remote**, so Agent Manager reads
`.agents/discovery.json` from the repository root rather than over an HTTP base. The
closest local equivalent is a **local directory source** — point the CLI at this
repository's path on disk:

```bash
scripts/serve.sh   # prints the commands below for this checkout
```

```bash
npx -y @ai-agent-manager/cli@latest "$(git rev-parse --show-toplevel)"
```

Alternatively, once your changes are pushed to a branch, test against the git remote
directly (with an optional `/tree/<branch>` pin):

```bash
npx -y @ai-agent-manager/cli@latest \
  https://github.com/govuk-one-login/agent-skills/tree/<branch>
```

### Validate the discovery document

The discovery document is validated against a vendored copy of the Agent Manager schema
([`schemas/discovery.schema.json`](schemas/discovery.schema.json)):

```bash
npm install     # first time only
npm run validate
```

This checks that `.agents/discovery.json` is well-formed JSON, conforms to the
schema (JSON Schema 2020-12), and has no duplicate source names. The same check runs in CI
on every push and pull request via
[`.github/workflows/validate-discovery.yml`](.github/workflows/validate-discovery.yml).

The vendored schema is a copy of
[`src/discovery/schema.json`](https://github.com/ai-agent-manager/agent-manager/blob/main/src/discovery/schema.json)
from the Agent Manager repository — refresh it if the upstream schema changes.

