'use strict';
// Called only by release.py upload --execute for Cloudflare R2 (*.r2.dev).
// Credentials stay in environment or local Wrangler OAuth config; never printed or written to repo.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

function loadWranglerToken() {
  const candidates = [
    path.join(os.homedir(), 'Library/Preferences/.wrangler/config/default.toml'),
    path.join(os.homedir(), '.config/.wrangler/config/default.toml'),
    path.join(os.homedir(), '.wrangler/config/default.toml'),
  ];
  const readToml = () => {
    const file = candidates.find(p => fs.existsSync(p));
    if (!file) return null;
    const raw = fs.readFileSync(file, 'utf8');
    const token = (/oauth_token\s*=\s*"([^"]+)"/.exec(raw) || [])[1];
    const exp = (/expiration_time\s*=\s*"([^"]+)"/.exec(raw) || [])[1];
    return {token, exp: exp ? Date.parse(exp) : 0};
  };
  let info = readToml();
  if (info && info.exp && info.exp - Date.now() < 120_000) {
    try { execFileSync('npx', ['--yes', 'wrangler', 'whoami'], {stdio: 'ignore', timeout: 30_000}); } catch {}
    info = readToml();
  }
  return info?.token || '';
}

(async () => {
  const request = JSON.parse(fs.readFileSync(0, 'utf8'));
  const host = String(request.expectedHost || '').toLowerCase();
  const bucket = String(request.bucket || '');
  if (!/^pub-[a-f0-9]+\.r2\.dev$/.test(host)) {
    throw Error('Invalid approved R2 public hostname');
  }
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw Error('Invalid approved R2 bucket name');
  }
  const token = process.env.CLOUDFLARE_API_TOKEN || loadWranglerToken();
  if (!token) {
    throw Error('Cloudflare R2 credentials missing; run npx wrangler login or set CLOUDFLARE_API_TOKEN');
  }
  const redact = s => {
    let out = String(s || '');
    if (token) out = out.split(token).join('[redacted]');
    if (accountId) out = out.split(accountId).join('[redacted-account]');
    return out;
  };
  let accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
  try {
    const apiBase = process.env.R2_API_BASE || 'https://api.cloudflare.com/client/v4';
    const authHeaders = {Authorization: `Bearer ${token}`};
    if (!accountId) {
      const acctsRes = await fetch(`${apiBase}/accounts`, {headers: authHeaders});
      const accts = await acctsRes.json();
      if (!acctsRes.ok || !accts?.success || !accts.result?.length) {
        throw Error('Unable to resolve Cloudflare account for R2 upload');
      }
      accountId = accts.result[0].id;
    }
    const domRes = await fetch(`${apiBase}/accounts/${accountId}/r2/buckets/${bucket}/domains/managed`, {headers: authHeaders});
    const dom = await domRes.json();
    if (!domRes.ok || !dom?.success || !dom.result?.enabled || String(dom.result.domain || '').toLowerCase() !== host) {
      throw Error('R2 bucket/domain mismatch; refusing to upload to another bucket');
    }

    const items = Array.isArray(request.items) ? request.items : [{
      audioHash: request.audioHash || '',
      file: request.file,
      pathname: request.pathname,
    }];
    for (const item of items) {
      if (!/^audio\/v1\/[a-f0-9]{64}\.mp3$/.test(String(item.pathname || ''))) {
        throw Error('Invalid immutable audio pathname');
      }
    }

    const publicOrigin = process.env.R2_PUBLIC_ORIGIN || `https://${host}`;
    const concurrency = Math.max(1, Math.min(8, Number(request.concurrency) || 6));
    let cursor = 0, failure = null;

    async function uploadOne(item) {
      const stat = fs.statSync(item.file);
      const publicUrl = `${publicOrigin}/${item.pathname}`;
      const headRes = await fetch(publicUrl, {method: 'HEAD', headers: {'User-Agent': 'atlas-audio-release/1.0'}});
      if (headRes.status === 200) {
        const remoteSize = Number(headRes.headers.get('content-length'));
        const remoteType = headRes.headers.get('content-type') || '';
        if (remoteSize !== stat.size || !/^audio\/mpeg(?:;|$)/i.test(remoteType)) {
          throw Error('Existing R2 metadata mismatch; do not overwrite it');
        }
        process.stdout.write(JSON.stringify({
          audioHash: item.audioHash, url: `https://${host}/${item.pathname}`, pathname: item.pathname, bytes: stat.size, reused: true,
        }) + '\n');
        return;
      }
      if (headRes.status !== 404) {
        throw Error(`Unexpected R2 HEAD status ${headRes.status} for ${item.pathname}`);
      }
      const body = fs.readFileSync(item.file);
      const putRes = await fetch(`${apiBase}/accounts/${accountId}/r2/buckets/${bucket}/objects/${item.pathname}`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        body,
      });
      const putJson = await putRes.json().catch(() => null);
      if (!putRes.ok || !putJson?.success) {
        throw Error(`R2 PUT failed (${putRes.status}) for ${item.pathname}`);
      }
      process.stdout.write(JSON.stringify({
        audioHash: item.audioHash, url: `https://${host}/${item.pathname}`, pathname: item.pathname, bytes: stat.size, reused: false,
      }) + '\n');
    }

    async function worker() {
      while (!failure) {
        const idx = cursor++;
        if (idx >= items.length) return;
        try {
          await uploadOne(items[idx]);
        } catch (err) {
          failure = err;
          return;
        }
      }
    }
    await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, () => worker()));
    if (failure) throw failure;
  } catch (err) {
    throw Error(redact(err.message || err));
  }
})().catch(error => {
  const token = process.env.CLOUDFLARE_API_TOKEN || '';
  const msg = String(error.message || error).split(token || '\0').join('[redacted]');
  console.error(msg);
  process.exitCode = 1;
});
