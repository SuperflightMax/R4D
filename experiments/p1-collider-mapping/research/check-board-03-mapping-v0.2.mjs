import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const contractUrl = new URL("./board-03-mapping-v0.2.json", import.meta.url);
const overlayUrl = new URL("./goal-overlay-v0.2.svg", import.meta.url);
const contractText = await readFile(contractUrl, "utf8");
const contract = JSON.parse(contractText);

const W = contract.sources.sourceImage.widthPx;
const H = contract.sources.sourceImage.heightPx;
const EPS_FLAT = contract.requiredChecks.roundTripFlatMaxError;
const EPS_NORM = contract.requiredChecks.roundTripImageNormalizedMaxError;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalSha(value) {
  return sha256(JSON.stringify(value));
}

function forward([x, y]) {
  const u = (2 * x) / 1000 - 1;
  const z = y / 1000;
  const p = 0.5 + u * (0.275 + 0.14 * z);
  const q = 0.255 + 0.52 * z;
  return [p * W, q * H];
}

function inverse([xPx, yPx]) {
  const p = xPx / W;
  const q = yPx / H;
  const z = (q - 0.255) / 0.52;
  const u = (p - 0.5) / (0.275 + 0.14 * z);
  return [500 * (u + 1), 1000 * z];
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function normalized([xPx, yPx]) {
  return [xPx / W, yPx / H];
}

function ellipseValue([x, y], ellipse) {
  const angle = (ellipse.majorAxisAngleDeg * Math.PI) / 180;
  const dx = x - ellipse.centerPx[0];
  const dy = y - ellipse.centerPx[1];
  const alongMajor = dx * Math.cos(angle) + dy * Math.sin(angle);
  const alongMinor = -dx * Math.sin(angle) + dy * Math.cos(angle);
  return (
    (alongMajor / (ellipse.majorDiameterPx / 2)) ** 2 +
    (alongMinor / (ellipse.minorDiameterPx / 2)) ** 2
  );
}

function fmt(value) {
  return Number(value.toFixed(3));
}

function pointsAttribute(points) {
  return points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(" ");
}

function goalSamples(goal, count = contract.diagnosticRendering.circleSamples) {
  return Array.from({ length: count + 1 }, (_, index) => {
    const angle = (2 * Math.PI * index) / count;
    return forward([
      goal.centerFlat[0] + goal.radiusFlat * Math.cos(angle),
      goal.centerFlat[1] + goal.radiusFlat * Math.sin(angle),
    ]);
  });
}

assert.equal(contract.schema, "r4d.p1.board-03-mapping.v0.2");
assert.equal(contract.obstacles.length, 21);
assert.equal(contract.goals.length, 4);

const frozenGeometry = {
  start: contract.start,
  bounds: contract.bounds,
  obstacles: contract.obstacles,
};
const frozenGeometrySha = canonicalSha(frozenGeometry);
assert.equal(
  frozenGeometrySha,
  contract.g7Correction.frozenStartBoundsObstaclesCanonicalSha256,
  "start, bounds or obstacle data drifted from v0.1",
);

const lattice = [];
for (let y = 0; y <= 1150; y += 50) {
  for (let x = 0; x <= 1000; x += 50) lattice.push([x, y]);
}

for (const point of lattice) {
  const imagePoint = forward(point);
  assert.ok(distance(inverse(imagePoint), point) <= EPS_FLAT);
  assert.ok(
    distance(normalized(forward(inverse(imagePoint))), normalized(imagePoint)) <= EPS_NORM,
  );
}

for (const [index, flatCorner] of contract.transform.quadFlatClockwise.entries()) {
  const actual = normalized(forward(flatCorner));
  const expected = contract.transform.quadImageNormalizedClockwise[index];
  assert.ok(distance(actual, expected) <= contract.requiredChecks.cornerImageNormalizedMaxError);
  assert.ok(distance(normalized(forward(inverse(forward(flatCorner)))), expected) <= EPS_NORM);
}

for (const [index, flatCorner] of contract.transform.receiverApron.flatClockwise.entries()) {
  const actual = normalized(forward(flatCorner));
  const expected = contract.transform.receiverApron.imageNormalizedClockwise[index];
  assert.ok(distance(actual, expected) <= contract.requiredChecks.cornerImageNormalizedMaxError);
  assert.ok(distance(inverse(forward(flatCorner)), flatCorner) <= EPS_FLAT);
}

const obstacleIds = new Set();
for (const obstacle of contract.obstacles) {
  assert.ok(!obstacleIds.has(obstacle.id), `duplicate obstacle id: ${obstacle.id}`);
  obstacleIds.add(obstacle.id);

  const anchorBack = forward(obstacle.centerFlat);
  assert.ok(
    distance(anchorBack, obstacle.sourceAnchorPx) <=
      contract.requiredChecks.sourceAnchorPixelMaxErrorAfterRoundTrip,
    `${obstacle.id}: source anchor does not round-trip`,
  );

  assert.ok(distance(inverse(anchorBack), obstacle.centerFlat) <= EPS_FLAT);
  assert.ok(obstacle.centerFlat[0] >= 0 && obstacle.centerFlat[0] <= 1000);
  assert.ok(obstacle.centerFlat[1] >= 0 && obstacle.centerFlat[1] <= 1000);

  if (obstacle.shape === "circle") {
    assert.ok(obstacle.radiusFlat > 0);
    for (let i = 0; i < contract.diagnosticRendering.circleSamples; i += 1) {
      const angle = (2 * Math.PI * i) / contract.diagnosticRendering.circleSamples;
      const point = [
        obstacle.centerFlat[0] + obstacle.radiusFlat * Math.cos(angle),
        obstacle.centerFlat[1] + obstacle.radiusFlat * Math.sin(angle),
      ];
      assert.ok(distance(inverse(forward(point)), point) <= EPS_FLAT);
    }
  } else {
    assert.equal(obstacle.shape, "axisAlignedSegmentLoop");
    const [cx, cy] = obstacle.centerFlat;
    const [hx, hy] = obstacle.halfExtentsFlat;
    const vertices = [
      [cx - hx, cy - hy],
      [cx + hx, cy - hy],
      [cx + hx, cy + hy],
      [cx - hx, cy + hy],
    ];
    for (let edge = 0; edge < vertices.length; edge += 1) {
      const from = vertices[edge];
      const to = vertices[(edge + 1) % vertices.length];
      for (let sample = 0; sample <= contract.diagnosticRendering.segmentSamples; sample += 1) {
        const t = sample / contract.diagnosticRendering.segmentSamples;
        const point = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
        assert.ok(distance(inverse(forward(point)), point) <= EPS_FLAT);
      }
    }
  }
}

const nearSegments = contract.bounds
  .filter(({ id }) => id.startsWith("bound-near-"))
  .map(({ from, to }) => [from[0], to[0]])
  .sort((a, b) => a[0] - b[0]);
const receiverGaps = [];
for (let index = 0; index < nearSegments.length - 1; index += 1) {
  receiverGaps.push([nearSegments[index][1], nearSegments[index + 1][0]]);
}
assert.deepEqual(receiverGaps, [[25, 185], [255, 430], [575, 735], [815, 975]]);

const goalIds = new Set();
const containment = {};
for (const [index, goal] of contract.goals.entries()) {
  assert.ok(!goalIds.has(goal.id), `duplicate goal id: ${goal.id}`);
  goalIds.add(goal.id);
  assert.equal(goal.shape, "bucketCircle");
  assert.equal(goal.radiusFlat, 48);
  assert.ok(goal.centerFlat[0] >= receiverGaps[index][0]);
  assert.ok(goal.centerFlat[0] <= receiverGaps[index][1]);
  assert.ok(goal.centerFlat[1] - goal.radiusFlat > 1000);
  assert.ok(goal.centerFlat[1] + goal.radiusFlat < 1150);

  const centerBack = forward(goal.centerFlat);
  assert.ok(
    distance(centerBack, goal.visibleDarkOpening.centerPx) <=
      contract.requiredChecks.goalCenterPixelMaxErrorAfterRoundTrip,
    `${goal.id}: measured receiver center does not round-trip`,
  );
  assert.ok(distance(inverse(centerBack), goal.centerFlat) <= EPS_FLAT);

  const values = goalSamples(goal).map((point) => ellipseValue(point, goal.visibleDarkOpening));
  containment[goal.id] = Math.max(...values);
  assert.ok(
    containment[goal.id] <= contract.requiredChecks.goalProjectedContourInsideMeasuredEllipseMax,
    `${goal.id}: projected bucket circle leaves the measured dark opening`,
  );
}

const contractCanonicalSha = canonicalSha(contract);
const goalCanonicalSha = canonicalSha(contract.goals);
const quadPoints = contract.transform.quadFlatClockwise
  .map(forward)
  .concat([forward(contract.transform.quadFlatClockwise[0])]);
const apronPoints = contract.transform.receiverApron.flatClockwise
  .map(forward)
  .concat([forward(contract.transform.receiverApron.flatClockwise[0])]);

const overlayLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-contract-canonical-sha256="${contractCanonicalSha}" data-source-sha256="${contract.sources.sourceImage.sha256}">`,
  '  <style>.label{font:24px sans-serif;fill:#fff;stroke:#000;stroke-width:5;paint-order:stroke}.small{font-size:18px}.center{stroke:#00ff88;stroke-width:3}.measured{fill:none;stroke:#ffd166;stroke-width:4;stroke-dasharray:12 8}.bucket{fill:none;stroke:#00ff88;stroke-width:5}.quad{fill:none;stroke:#00e5ff;stroke-width:4}.apron{fill:none;stroke:#ff7a00;stroke-width:4;stroke-dasharray:16 10}</style>',
  `  <metadata>Transparent overlay only. Source image SHA-256 ${contract.sources.sourceImage.sha256}. Gold dashed: measured dark opening. Green: projected Millionko bucket-circle. Orange: explicit receiver apron.</metadata>`,
  `  <polyline class="quad" points="${pointsAttribute(quadPoints)}"/>`,
  `  <polyline class="apron" points="${pointsAttribute(apronPoints)}"/>`,
  '  <text class="label small" x="110" y="1338">receiver apron: flat y=1000..1150; not recovered camera space</text>',
];

for (const goal of contract.goals) {
  const ellipse = goal.visibleDarkOpening;
  const [cx, cy] = ellipse.centerPx;
  overlayLines.push(
    `  <ellipse class="measured" cx="${cx}" cy="${cy}" rx="${fmt(ellipse.majorDiameterPx / 2)}" ry="${fmt(ellipse.minorDiameterPx / 2)}" transform="rotate(${ellipse.majorAxisAngleDeg} ${cx} ${cy})"/>`,
    `  <polyline class="bucket" points="${pointsAttribute(goalSamples(goal))}"/>`,
    `  <line class="center" x1="${fmt(cx - 12)}" y1="${cy}" x2="${fmt(cx + 12)}" y2="${cy}"/>`,
    `  <line class="center" x1="${cx}" y1="${fmt(cy - 12)}" x2="${cx}" y2="${fmt(cy + 12)}"/>`,
    `  <text class="label" x="${fmt(cx - 48)}" y="${fmt(cy - 60)}">${goal.id}</text>`,
  );
}
overlayLines.push("</svg>", "");
const expectedOverlay = overlayLines.join("\n");

if (process.argv.includes("--write-overlay")) {
  await writeFile(overlayUrl, expectedOverlay, "utf8");
}
const actualOverlay = await readFile(overlayUrl, "utf8");
assert.equal(actualOverlay, expectedOverlay, "goal overlay is stale; regenerate with --write-overlay");

console.log(
  JSON.stringify(
    {
      status: "PASS",
      schema: contract.schema,
      canonicalContractSha256: contractCanonicalSha,
      frozenStartBoundsObstaclesCanonicalSha256: frozenGeometrySha,
      goalsCanonicalSha256: goalCanonicalSha,
      overlaySha256: sha256(actualOverlay),
      latticePoints: lattice.length,
      obstacles: contract.obstacles.length,
      goals: contract.goals.length,
      maxEllipseContainmentByGoal: containment,
    },
    null,
    2,
  ),
);
