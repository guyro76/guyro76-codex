#!/bin/bash
# SessionStart hook — keep Emil Kowalski's design/animation skills installed globally.
#
# Runs on every session, local and web. Once the skills are in place the hook
# exits on the first check, so the steady-state cost is a directory test.
#
# Upstream: https://github.com/emilkowalski/skills

set -uo pipefail

SKILL_NAMES=(
  animate animate-expo animation-vocabulary apple-design ask-sonner
  emil-design-eng find-animation-opportunities improve-animations
  pick-ui-library prototype review-animations write-swift
)

GLOBAL_DIR="${HOME}/.claude/skills"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
VENDOR_DIR="${PROJECT_DIR}/.claude/vendor/emil-skills"

installed() {
  local name
  for name in "${SKILL_NAMES[@]}"; do
    [ -e "${GLOBAL_DIR}/${name}" ] || return 1
  done
  return 0
}

installed && exit 0

# Preferred path: pull the current upstream release so the skills stay fresh.
if command -v npx >/dev/null 2>&1; then
  npx -y "skills@1" add emilkowalski/skills --all -g -y >/dev/null 2>&1
fi

# Fallback: link the copy vendored in this repo. Works with no network, no
# registry, and no npx — which is the whole point of keeping it checked in.
if ! installed; then
  mkdir -p "${GLOBAL_DIR}"
  for name in "${SKILL_NAMES[@]}"; do
    [ -e "${GLOBAL_DIR}/${name}" ] && continue
    [ -d "${VENDOR_DIR}/${name}" ] || continue
    ln -sfn "${VENDOR_DIR}/${name}" "${GLOBAL_DIR}/${name}"
  done
fi

# A missing design skill is never a reason to block the session.
installed \
  && echo "Emil design skills ready (${#SKILL_NAMES[@]} skills in ${GLOBAL_DIR})" \
  || echo "Emil design skills unavailable this session" >&2

exit 0
