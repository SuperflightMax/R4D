import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const runtime = 'E:/R4D/perspective/p6-runtime/builder';
// The previous runtime/site and baseline snapshot are frozen for independent TQA.
export const site = path.join(runtime,'candidates','integration-02','site');
export const coreCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
export const coreTree = '008d16a80a26bb77d562a45218b01da09b0d9ff0';
