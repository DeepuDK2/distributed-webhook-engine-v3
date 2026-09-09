import crypto from 'crypto';

export function signPayload(payload: string, secret: string, timestamp: number): string {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  return `t=${timestamp},v1=${digest}`;
}

export function verifyHmacSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): boolean {
  try {
    const parts = signatureHeader.split(',');
    const timestampStr = parts.find((p) => p.startsWith('t='))?.slice(2);
    const signatureHex = parts.find((p) => p.startsWith('v1='))?.slice(3);

    if (!timestampStr || !signatureHex) return false;

    const timestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return false; // Replay attack protection
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf-8');
    const actualBuf = Buffer.from(signatureHex, 'utf-8');

    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}
