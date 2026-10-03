# src/lib/reading/palm — copied app code (do not edit)

Written by `scripts/sync-palm-lib.mjs` on 2026-09-30.

- App repo: `palm-ai-new--feat-m1-foundation`
- App commit: `fbc2232d837f` **plus uncommitted changes in 7 copied file(s)** (the copies are the working tree, not the commit)
- Files: 56 (2 web shims)

Each copy starts with a 3-line header (source path + commit, "do not edit", `@ts-nocheck`); the
sha256 below is of the app's file WITHOUT that header. `tests/unit/reading-palm.test.ts` checks it.

| File (under the app's `src/`) | sha256 of the app file | bytes |
|---|---|---|
| `components/deep-report/access.ts` | 409ac04cd8e4af4cb0075d39099778fa405b4819caad5ebe8ddee64934e9dbd2 | 5041 |
| `features/deep-report/normalise.ts` | d011813fae958989f099f469597fbbcb8c3f12e9679eb94d62d0199664ebc2ee | 27457 |
| `features/deep-report/types.ts` | f12616b0113b9117c71bc8824670efbb37a1d664ebedf24d4ecb37d6ab319f0e | 4641 |
| `features/knowledge/corpus-rules.ts` | 2a648b4c03c5792e722c939ca4f48936880eb8cbe38b848325a3423d9da5abd1 | 138435 |
| `features/knowledge/engine.ts` | 14e969aa24626fdfde580b9aea227b3f49ef952dd0fcd35f773fa9a7a519692c | 12382 |
| `features/knowledge/hand-role.ts` | fd03798c96d1bc4bc532ddd14fe1ca05ac01ae65e80d3f4a41b53e2274156d42 | 5717 |
| `features/knowledge/line-notes.ts` | 116606ef71bf7bbfdee65d35bcff08c82348208277bfab89a8b620e9d4f78790 | 1987 |
| `features/knowledge/rule-set-version.ts` | dcefa998f3193791c5195027e353d5cbb920c71cd1bfdf1e2b06b05c189c6e12 | 265 |
| `features/knowledge/rules.ts` | 7fc2ca24e9fb301fa3aa4c55adca77e9f9f178974154b4192a1c592c21137af6 | 1577 |
| `features/knowledge/seed-rules.ts` | 2f5691201464eef7cc0690737eb1c84d385bc8b93b523fb91c05243c793e5841 | 13079 |
| `features/knowledge/sources.ts` | eef430ab0677aceb8626683e1afd7f4251d3ea97f0540aae8f5f33e3af8fa2f5 | 5994 |
| `features/knowledge/synthesis/cluster.ts` | 70ff28930f3e91688299423f218138840925687ee7aa49a992ad1cfd209a62be | 4790 |
| `features/knowledge/synthesis/conflicts.ts` | 813ea45f91d236201c79f77cec1f5415d5b98a88def25253884c320cb722ce92 | 4506 |
| `features/knowledge/synthesis/constants.ts` | ef64d9e8c8e863f2d700eeda2b8248d3b76c23784c318dd69bbb02796afca50e | 11220 |
| `features/knowledge/synthesis/dedupe.ts` | da10724faa8fe4fc0ebd3ffc684a5f8954c20bf91088a34fd8e4e9dbdc60e091 | 1168 |
| `features/knowledge/synthesis/gate.ts` | f11036aede9b143246ecc7ac01a367389522fb15c53e0a769044900acc2a94a6 | 4379 |
| `features/knowledge/synthesis/index.ts` | 8e818bb43db61506fda41383a5aaf4897aec8e7f9cf73f26ff81e27c59d1e893 | 13946 |
| `features/knowledge/synthesis/modules.ts` | 669ef78b809ff225cbd4a0ea11ba26e41dcba10a7675ef6b12a7262d47ea5cb9 | 30104 |
| `features/knowledge/synthesis/rank.ts` | 9668b1eb1465fdee4321a97f7f3cea880c618bf353206f7700ddb884fd1f6c2f | 5078 |
| `features/knowledge/synthesis/story.ts` | 77d7a863772279250ae864da21fbe3d2e7ebeae488df01b331904e79bf5c7a6b | 3902 |
| `features/knowledge/synthesis/tensions.ts` | 221401aaa03f61bda4d67a7fe5a78982b59eb32adb6c004d83920f5ff40efe80 | 1053 |
| `features/knowledge/synthesis/types.ts` | e24a31a73c30014ed1c39665681f1bce9b8fb817b91395a81a4e43fa8153404a | 7264 |
| `features/knowledge/trait-content.ts` | 39825353d29072ebaa075f87fa2b9f59e67da27ac7502620d9e9fb48e8ae9e5f | 103076 |
| `features/knowledge/traits.ts` | 10efea3adf34c7330e2097e5c7bba31698f2fcf149e69d9fe4bbe885f2eefc0d | 14972 |
| `features/knowledge/types.ts` | 1e2f1d6ad2e02c003e43bd358855e1250065ce22bd3bb27d4e7fcec314dc447c | 6662 |
| `features/lines/band-config.ts` | 8c07a18344e54ec7b870ca7775577932ba446d77f6ef789898817af9ec7925bb | 2411 |
| `features/lines/bands.ts` | e49671cc4b1d8daec5af04de854248ecbc36097aa6ac0b370f11ddd9e485d780 | 8934 |
| `features/lines/client.ts` | 7259211ca05923a82f310ff7ea31d648c323da232cfc84cb56dbfb063fa77b85 | 18799 |
| `features/lines/derived.ts` | ec53376c6abd706c7996ec00bb68a9a6df53a2fde40ec59e40f89a0c3e3643a7 | 31716 |
| `features/lines/live-scan.ts` | 7f920666257a784b7839307cf7a28a8b1edde6847d092a9c61faf8ab4dca78d4 | 22658 |
| `features/lines/merge.ts` | edff5e5f8e9a77fd4ac1d812c152286b36ed6219d890c41195f243c0ad6fafaa | 20897 |
| `features/lines/side-labels.ts` | e19dcf80d3b869e72b6b3190b2dea736511d0a8ddbd83a7f0e5a4ab238b9738d | 3588 |
| `features/lines/truth.ts` | 47bd012464b3a40be99d8b048a4219338e8d4f2f785b7f086a11b1ed87cc6e14 | 4080 |
| `features/lines/types.ts` | 6a6d0eb429c1563c01d6437d7f2cf72b2dcfc6df40982ee3e954702a1aa15c7e | 5195 |
| `features/observation/dominance.ts` | 3b89d27f9501aa8fbcda5df3a99b3be2da850c62543b64b76b5d2bba9c63d825 | 1247 |
| `features/observation/schema.ts` | b7dee66ec8376a9e8e95a4ebef18963466cb368e7f1dc6dba6095bd1d1a2a16d | 13641 |
| `features/observation/taxonomy.ts` | 4644601812dae830c6523e082a1034f4a7305685602028f1d67ffd4624429f04 | 3373 |
| `features/quality/gate.ts` | web shim | — |
| `features/quality/metrics.ts` | b8d5abc9af7866b7f7adcf089b17341c07eab66b8405a5bac6586d733f14d970 | 5835 |
| `features/quality/verdict.ts` | 261a5d04aab50d3cc8f4e8bc172b577bbd2df8d22081d528199a652282191b05 | 7211 |
| `features/reading/access.ts` | 91ff1d8f76cf3856214de4f7c7640e4fd3636123ab25f8eac83ed1827edc014a | 13968 |
| `features/reading/basis.ts` | 81f60fa68e1052016114ca001ebb55967544bca137d38fb351a42c9b448e666b | 8848 |
| `features/reading/books.ts` | c2d059b1345b7ba0a11218331f3a40764d9ad7d44f87e053a9d12ac34ebfa7a5 | 12104 |
| `features/reading/humanise.ts` | e5e26ba6f22712a931433f1f5f1bcaea5f9c45a9f9adb5a05fc5b95139bcdaca | 18533 |
| `features/reading/localise.ts` | 0eb0e203552062620ede9f626a2abaae1f1c76ac983c1717abd8ef5a2af44c59 | 3917 |
| `features/reading/photo-cache.ts` | 723f245dbe2670ad601d97a6199d1d6c2b17b8cdf275d661e67ec6f7703c5d77 | 3293 |
| `features/reading/pipeline.ts` | f11eeb87419994ca5154aa574fc401a303335785ffd90c8df54650423c0c2c00 | 22920 |
| `features/reading/report-sections.ts` | 1ae0f6e4f824312fea8c02260c3c42e5c33202193c8a87afc1c013a2a8a37827 | 13012 |
| `features/reading/writer.ts` | e9f578072a8cc34c0c6386bec8dc61a804a8d510806c47567de4e257281ebbd2 | 9659 |
| `features/report-v2/build.ts` | d72961ee51be1b086d803e5cb54e71e58e9b1460b3394f7cee20ee7802ca64fe | 29370 |
| `features/report-v2/contract.ts` | 11cf61101b90c972181d6a19fc5fc13049b405fb76a4bce7444c80a850901cd4 | 6439 |
| `features/vision/normalise.ts` | 207601c06b646606e4a475f095f1b26edb853cb55ef93cd622d95968796e64a4 | 15380 |
| `features/vision/partial.ts` | 8c07b2890fbbcf669d33fabe18777feecaae95a59c8f0046e5f644df01ccb0db | 2437 |
| `features/vision/prompt.ts` | c965078c599b42a9df341a2f9077332170c9d1a868ed0fb653386c7ca215f2b6 | 6147 |
| `features/vision/provider.ts` | 3874b27ae839dbba8b256aa7c9e27cb90384ed06001c7de7ff20fb9b3b78bb4b | 14420 |
| `i18n/index.ts` | web shim | — |
