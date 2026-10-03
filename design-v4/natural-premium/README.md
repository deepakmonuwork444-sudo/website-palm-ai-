# Natural premium restyle (WEB-DEC-060, 2026-10-02): how to go back

`before/` holds each file as it was just before the restyle (path with `/` written as `_`).
To undo one part, copy that file back over its path. The 3D hero lighting values before the
change are written in the comment above the lights in `src/scripts/hero-3d-scene.ts`; the old
poster is in git history (`public/images/hero/hand-v1-*`). The AI-made guide palm is kept at
`design-v4/guide-assets/hero-palm.png` with its scan `hero-palm.scan.json`.
