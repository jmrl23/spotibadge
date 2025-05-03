import { randomBytes } from 'node:crypto';

export function generate(length: number = 12): string {
  const bytes = randomBytes(Math.ceil(length / 2));
  return bytes.toString('hex').slice(0, length);
}
