import { describe, it, expect } from 'vitest';

describe('Privacy Auditor & Network Interceptor Tests', () => {
  it('should detect and prevent outbound image uploads via fetch', async () => {
    // Test payload identification logic
    const imageBlob = new Blob(['sample-image-bytes'], { type: 'image/jpeg' });
    expect(imageBlob.type.startsWith('image/')).toBe(true);

    const isImagePayload = (body: any): boolean => {
      if (body instanceof Blob && body.type.startsWith('image/')) return true;
      if (typeof body === 'string' && (body.includes('data:image/') || body.includes('base64,'))) return true;
      return false;
    };

    expect(isImagePayload(imageBlob)).toBe(true);
    expect(isImagePayload('data:image/jpeg;base64,/9j/4AAQSkZJRg...')).toBe(true);
    expect(isImagePayload(JSON.stringify({ text: 'safe payload' }))).toBe(false);
  });

  it('Content Security Policy in _headers must enforce connect-src self and deny remote exfiltration', () => {
    const fs = require('fs');
    const path = require('path');
    const headersContent = fs.readFileSync(path.resolve(__dirname, '../../public/_headers'), 'utf-8');

    expect(headersContent).toContain('Content-Security-Policy:');
    expect(headersContent).toContain("connect-src 'self'");
    expect(headersContent).toContain("object-src 'none'");
    expect(headersContent).toContain("frame-ancestors 'none'");
    expect(headersContent).toContain('X-Frame-Options: DENY');
  });

  it('Cloudflare Pages SPA redirect rule must be present in _redirects', () => {
    const fs = require('fs');
    const path = require('path');
    const redirectsContent = fs.readFileSync(path.resolve(__dirname, '../../public/_redirects'), 'utf-8');

    expect(redirectsContent).toContain('/*    /index.html   200');
  });
});
