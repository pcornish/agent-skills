#!/usr/bin/env bash
#
# Test agent-manager against this repository's discovery document without
# publishing to GitHub.
#
# This repository is consumed as a *git remote*: agent-manager looks for
# `.agents/discovery.json` at the repository root (via the GitHub Contents API
# for github.com/GHES remotes, or a shallow clone for other hosts). It does not
# fetch the document over an HTTP base — that path (`/.well-known/agents/
# discovery.json`) only applies to HTTP base-URL sources.
#
# The closest local equivalent to the git-remote path is a *local directory
# source*: point the CLI at this repository's path on disk and it will read
# `.agents/discovery.json` directly.
#
# Usage:
#   scripts/serve.sh
#
# Then point the CLI at the repository directory:
#   npx -y @ai-agent-manager/cli@latest "$(git rev-parse --show-toplevel)"

set -euo pipefail

#######################################
# Print an error message to STDERR and exit non-zero.
# Arguments:
#   Message to print.
# Outputs:
#   Writes the message to STDERR.
#######################################
err() {
  echo "Error: $*" >&2
  exit 1
}

main() {
  # Resolve the repository root (parent of this script's directory) so the
  # script works regardless of the current working directory.
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local repo_root
  repo_root="$(cd "${script_dir}/.." && pwd)"

  if ! command -v npx >/dev/null 2>&1; then
    err "npx not found. Install Node.js (https://nodejs.org) and try again."
  fi

  local discovery="${repo_root}/.agents/discovery.json"
  [[ -f "${discovery}" ]] || err "discovery document not found at ${discovery}"

  echo "Discovery document: ${discovery}"
  echo
  echo "Test agent-manager against this repository as a local directory source:"
  echo "  npx -y @ai-agent-manager/cli@latest \"${repo_root}\""
  echo
  echo "Or against a pushed branch as a git remote:"
  echo "  npx -y @ai-agent-manager/cli@latest govuk-one-login/agent-skills"
}

main "$@"
