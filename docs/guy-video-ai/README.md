# Guy Video AI Studio

Four standalone agents for Claude Code and Codex, stored in this repository without changing the existing projects. Version 1.0 (2026-11-02).

1. `viral-ideas-strategist` -> concepts.json
2. `video-scriptwriter` -> storyboard.json
3. `image-to-video-director` -> animation_manifest.json
4. `video-post-editor` -> final_delivery.json

Claude Code: open this repository and ask to use a named agent from `.claude/agents/`.
Codex: open this repository and use a named agent from `.codex/agents/` if your Codex client supports custom agents, or invoke matching skill via `$viral-ideas-strategist`, `$video-scriptwriter`, `$image-to-video-director`, `$video-post-editor`.

Workflow: keep consistent project_id, validate each file, and pass to the next agent. Never assume tools or generation credits exist. Higgsfield requires explicit authorization per task. These are agent instructions, not licensed video-generation services.

Installation in the repository is project-scoped. It does not grant account-global installation across all Claude/Codex projects.