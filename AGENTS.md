# Repository Instructions

- Use Bun for package management and scripts.
- Prefer `bun install`, `bun run <script>`, and `bunx <tool>` over npm/npx/yarn/pnpm equivalents.
- Keep `bun.lock` as the committed lockfile; do not regenerate `package-lock.json`.
- When asked to reproduce a bug/error in a test, assert the intended/wanted behavior (not the current buggy behavior), even if the test fails until the fix is implemented.
- Preserve meaningful existing comments; only remove or rewrite comments when they are clearly obsolete, incorrect, or redundant after code changes.
