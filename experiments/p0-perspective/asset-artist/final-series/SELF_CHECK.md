# P0 final-series component self-check

- PASS: four independent plate/master/shadow sets; 12/12 prepared SHA-256 unique and zero forbidden L1 hashes.
- PASS: four plates are `1536×1536` and fully opaque; four masters/shadows have transparent padding and zero nontransparent edge pixels.
- PASS: master/shadow canvas and anchor match within every set; anchors use the frozen base-center definition.
- PASS: `check-cross-series.mjs --integration-dir` accepts all four actual manifests.
- PASS: no shared F-source, crop/recolor/reskin reuse, hidden reroll, board composite, family placement, overlay or global redraw.
- PASS: all 11 image_gen invocations, tool IDs, prompts, inputs, hashes, defects and correction grounds are recorded; the frozen-QA F1 correction was exactly one invocation.
- OPEN Builder/QA responsibility: test exact visual quad/seam registration and fit of each unique master at frozen p/q/scales during deterministic assembly. No camera was selected or transformed after generation.
