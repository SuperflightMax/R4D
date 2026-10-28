import { createHash } from 'node:crypto';

export const PINNED_PIXI_SHA256 = 'a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef';
const PIXI_URI_DRIVE_INDEX = 135846;
const PIXI_URI_CONTEXT_OFFSET = 45;
const PIXI_URI_CONTEXT = "ocol(r){de(r),r=this.toPosix(r);const t=/^file:\\/\\/\\//.exec(r);if(t)return t[0];const e=/^[^/:]+:\\/{0,2}/.exec(r);return e?e[0]:\"\"},toAbsolu";
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export function scanBrowserText(relative, bytes) {
  const text = bytes.toString('utf8');
  const violations = [];
  const exceptions = [];
  const sdkFile = relative === 'vendor/pixi.js';
  const sdkPinned = sdkFile && hash(bytes) === PINNED_PIXI_SHA256;
  if (sdkFile && !sdkPinned) violations.push({ kind:'pinned-sdk-integrity-mismatch', index:0 });
  for (const [kind, pattern] of [
    ['source-map-reference', /sourceMappingURL/g],
    ['private-checkout-reference', /millionko-source/gi],
    ['private-sim-source-reference', /packages[\\/]sim-core[\\/]src/gi],
  ]) {
    for (const match of text.matchAll(pattern)) violations.push({ kind, index:match.index });
  }
  // A literal HTTP(S) scheme delimiter is not a drive prefix. Only those three
  // delimiter characters are classified here; paths elsewhere in a URL still scan.
  const httpDelimiters = new Set([...text.matchAll(/https?:\/\//gi)].map(m => m.index + m[0].length - 4));
  for (const match of text.matchAll(/[A-Z]:[\\/]/gi)) {
    if (httpDelimiters.has(match.index) && match[0].endsWith('/')) continue;
    // This is the only SDK false-positive exception: one exact three-character
    // span, exact surrounding context, exact normalized SDK bytes and output path.
    if (sdkPinned && match.index === PIXI_URI_DRIVE_INDEX &&
        text.slice(match.index-PIXI_URI_CONTEXT_OFFSET, match.index-PIXI_URI_CONTEXT_OFFSET+PIXI_URI_CONTEXT.length) === PIXI_URI_CONTEXT) {
      exceptions.push({ kind:'pinned-pixi-uri-regex', start:match.index, end:match.index+match[0].length });
      continue;
    }
    violations.push({ kind:'absolute-drive-path', index:match.index });
  }
  return { violations, exceptions };
}
