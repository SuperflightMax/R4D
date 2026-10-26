import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const contract = JSON.parse(
  await readFile(new URL("./board-03-mapping-v0.1.json", import.meta.url), "utf8"),
);

const W = contract.sources.sourceImage.widthPx;
const H = contract.sources.sourceImage.heightPx;
const EPS_FLAT = contract.requiredChecks.roundTripFlatMaxError;
const EPS_NORM = contract.requiredChecks.roundTripImageNormalizedMaxError;

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

const lattice = [];
for (let y = 0; y <= 1000; y += 50) {
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

const ids = new Set();
for (const obstacle of contract.obstacles) {
  assert.ok(!ids.has(obstacle.id), `duplicate obstacle id: ${obstacle.id}`);
  ids.add(obstacle.id);

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
  .map(({ from, to }) => [from[0], to[0]]);
const goalIntervals = contract.goals.map(({ rectFlat }) => rectFlat.x);
const partition = [...nearSegments.map((x) => ({ kind: "wall", x })), ...goalIntervals.map((x) => ({ kind: "goal", x }))]
  .sort((a, b) => a.x[0] - b.x[0]);

assert.equal(partition[0].x[0], 0);
assert.equal(partition.at(-1).x[1], 1000);
for (let i = 1; i < partition.length; i += 1) {
  assert.equal(partition[i - 1].x[1], partition[i].x[0], "near boundary partition has a gap or overlap");
  assert.notEqual(partition[i - 1].kind, partition[i].kind, "wall and goal intervals must alternate");
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      schema: contract.schema,
      latticePoints: lattice.length,
      obstacles: contract.obstacles.length,
      circles: contract.obstacles.filter(({ shape }) => shape === "circle").length,
      segmentLoops: contract.obstacles.filter(({ shape }) => shape === "axisAlignedSegmentLoop").length,
      goals: contract.goals.length,
      bounds: contract.bounds.length,
    },
    null,
    2,
  ),
);
