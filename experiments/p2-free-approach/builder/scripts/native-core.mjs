import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { verifyCore } from './pins.mjs';

// Node 24 strips types in memory. Redirect only this pinned package's authored
// .js specifiers to its .ts files; the read-only private checkout stays untouched.
export async function loadCore(coreRoot) {
  const coreSrc = verifyCore(coreRoot);
  const prefix = pathToFileURL(coreSrc + path.sep).href;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (context.parentURL?.startsWith(prefix) && /^\.\.?\/.+\.js$/.test(specifier)) {
        return { url: new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL).href, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
  });
  return import(pathToFileURL(path.join(coreSrc, 'index.ts')).href);
}
