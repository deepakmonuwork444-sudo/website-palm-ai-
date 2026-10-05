# Living palm pipeline: progress notes

- 2026-10-04 Pipeline moved from the approved sample (scratch samples3d/work: crop, matte, process, lines) into build.mjs + lib.mjs.
  Generalised: crop + rotation from manifest/scan landmarks, matte = colour-histogram classifier seeded by the scan outline
  (replaces the hero-a-only background colour key), depth/inflation scaled by palm width, wrist fade from the wrist landmark,
  line atlas packed as 512 x 3 bands, label anchors searched automatically (beside each real line, inside the palm, no overlaps).
- Regression: hero-palm-a rebuilt to scratch (not to public/; hero agent owns it) -> matches the approved look; 894 KB desktop / 721 KB phone.
- Payload trims: normal map computed at 1200 then stored 1024 q86 with crease high-pass blur 1.0 (was 436 KB, noisy);
  line progress zeroed outside the line band (field 127 KB -> smaller); crop ends just after the wrist fade.
- Matte upgrades after QA: guided-filter edge refinement (guide = colour axis separating hand/background), mild choke,
  unseen colours -> background, background model also learns darker "shadow" copies of itself (fixed hand-type-c's
  cast shadow on the white table showing in finger gaps). Wrist fade is pulled up when the matte ends early (hero-palm-b).
- Labels: palm = matte (eroded) below the knuckle line and above the wrist; landmark polygon only a preference; candidates
  beside the line (both sides, 3 gaps) or just past its ends; exhaustive non-overlap search; em size planned for the viewer's
  13 px phone / 16 px desktop minimum font.
- hero-palm-b: REJECTED (soft source, touching fingers -> stretched "fur" walls on +-18 deg rotation; clay look). hand-type-b skipped (same photo/hand as hero-palm-c).
- 2026-10-05 Quality gate done (shots in scratchpad/living-palms/<slug>/). PASSED: hero-palm-c (deep brown, 661 KB),
  hand-type-c (tan, 819 KB desktop / 559 KB phone), hand-type-d (fair, 560 / 467 KB). REJECTED: hero-palm-b (see above),
  hand-type-a (scanner line labels implausible on this photo, no room for fate label, sleeve fragment). hands.json written.
