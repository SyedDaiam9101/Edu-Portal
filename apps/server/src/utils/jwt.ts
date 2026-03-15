import crypto from 'node:crypto';

import { httpError } from './httpError';

type JwtPayload = Record<string, unknown>;

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64');
}

function timingSafeEqual(a: string, b: string) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function signJwtHS256(payload: JwtPayload, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerPart}.${payloadPart}`;
  const sig = crypto.createHmac('sha256', secret).update(signingInput).digest();
  const sigPart = base64UrlEncode(sig);
  return `${signingInput}.${sigPart}`;
}

export function verifyJwtHS256(token: string, secret: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw httpError(401, 'unauthorized', 'Invalid token');

  const [headerPart, payloadPart, signaturePart] = parts as [string, string, string];

  let headerJson: unknown;
  let payloadJson: unknown;
  try {
    headerJson = JSON.parse(base64UrlDecode(headerPart).toString('utf8'));
    payloadJson = JSON.parse(base64UrlDecode(payloadPart).toString('utf8'));
  } catch {
    throw httpError(401, 'unauthorized', 'Invalid token');
  }

  if (typeof headerJson !== 'object' || headerJson === null) {
    throw httpError(401, 'unauthorized', 'Invalid token');
  }
  const alg = (headerJson as { alg?: unknown }).alg;
  if (alg !== 'HS256') throw httpError(401, 'unauthorized', 'Unsupported token');

  const signingInput = `${headerPart}.${payloadPart}`;
  const expected = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(signingInput).digest(),
  );
  if (!timingSafeEqual(signaturePart, expected)) {
    throw httpError(401, 'unauthorized', 'Invalid token');
  }

  if (typeof payloadJson !== 'object' || payloadJson === null) {
    throw httpError(401, 'unauthorized', 'Invalid token');
  }

  const exp = (payloadJson as { exp?: unknown }).exp;
  if (typeof exp === 'number') {
    const now = Math.floor(Date.now() / 1000);
    if (now >= exp) throw httpError(401, 'unauthorized', 'Token expired');
  }

  return payloadJson as JwtPayload;
}
