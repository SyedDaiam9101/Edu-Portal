import type { Options } from '@node-rs/argon2';
import { hash, verify } from '@node-rs/argon2';

const DEFAULT_OPTIONS: Options = {
  // @node-rs/argon2 uses a `const enum` for Algorithm, which doesn't play well with TS `isolatedModules`.
  // 2 corresponds to `Algorithm.Argon2id`.
  algorithm: 2 as unknown as NonNullable<Options['algorithm']>,
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(password: string) {
  return hash(password, DEFAULT_OPTIONS);
}

export async function verifyPassword(hashed: string, password: string) {
  return verify(hashed, password, DEFAULT_OPTIONS);
}
