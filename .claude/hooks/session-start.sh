#!/bin/bash
# SessionStart hook — keep Emil Kowalski's design/animation skills installed globally.
#
# Runs on every session, local and web. Once the skills are in place the hook
# exits on the first check, so the steady-state cost is a directory scan.
#
# The required set is read from the vendored copy rather than written out here,
# so refreshing that copy is all it takes for the hook to require and install a
# skill added upstream. A fresh container has nothing installed yet and so takes
# the npx path, which pulls whatever upstream currently ships — that may be more
# than the vendored copy, and is how new skills arrive on their own.
#
# Upstream: https://github.com/emilkowalski/skills

set -uo pipefail

GLOBAL_DIR="${HOME}/.claude/skills"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
VENDOR_DIR="${PROJECT_DIR}/.claude/vendor/emil-skills"

# With no vendored copy to read, one skill stands in to tell installed from not.
required() {
  if [ -d "${VENDOR_DIR}" ]; then
    find "${VENDOR_DIR}" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
  else
    echo emil-design-eng
  fi
}

missing() {
  local name
  while IFS= read -r name; do
    [ -e "${GLOBAL_DIR}/${name}" ] || echo "${name}"
  done < <(required)
}

[ -z "$(missing)" ] && exit 0

if command -v npx >/dev/null 2>&1; then
  npx -y "skills@1" add emilkowalski/skills --all -g -y >/dev/null 2>&1
fi

# Fallback: link the vendored copy. Works with no network, no registry, and no
# npx — which is the whole point of keeping it checked in.
if [ -n "$(missing)" ] && [ -d "${VENDOR_DIR}" ]; then
  mkdir -p "${GLOBAL_DIR}"
  for path in "${VENDOR_DIR}"/*/; do
    name="$(basename "${path}")"
    [ -e "${GLOBAL_DIR}/${name}" ] || ln -sfn "${path%/}" "${GLOBAL_DIR}/${name}"
  done
fi

# A missing design skill is never a reason to block the session.
gap="$(missing)"
if [ -z "${gap}" ]; then
  echo "Emil design skills ready ($(required | wc -l | tr -d ' ') required present in ${GLOBAL_DIR})"
else
  echo "Emil design skills missing: $(echo ${gap} | tr '\n' ' ')" >&2
fi

exit 0
