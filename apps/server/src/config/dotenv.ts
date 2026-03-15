import fs from 'node:fs';
import path from 'node:path';

import { parse } from 'dotenv';

function fileExists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readEnvFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return parse(raw);
}

function applyEnv(
  vars: Record<string, string>,
  options: { allowOverrideKeys: Set<string>; originalKeys: Set<string>; writtenKeys: Set<string> },
) {
  for (const [key, value] of Object.entries(vars)) {
    if (options.originalKeys.has(key)) continue;

    const hasKey = Object.prototype.hasOwnProperty.call(process.env, key);
    if (!hasKey || options.allowOverrideKeys.has(key)) {
      process.env[key] = value;
      options.writtenKeys.add(key);
    }
  }
}

export function loadDotenv() {
  const originalKeys = new Set(Object.keys(process.env));
  const writtenKeys = new Set<string>();

  const cwd = process.cwd();
  const repoRoot = path.resolve(cwd, '../..');

  const candidateFiles = [
    path.join(repoRoot, '.env'),
    path.join(repoRoot, '.env.local'),
    path.join(cwd, '.env'),
    path.join(cwd, '.env.local'),
  ];

  for (const filePath of candidateFiles) {
    if (!fileExists(filePath)) continue;
    const vars = readEnvFile(filePath);
    applyEnv(vars, { allowOverrideKeys: writtenKeys, originalKeys, writtenKeys });
  }
}
