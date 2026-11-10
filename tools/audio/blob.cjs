'use strict';
// Called only by release.py upload --execute. Credentials stay in the process environment.
const fs = require('node:fs');
(async () => {
  const request = JSON.parse(fs.readFileSync(0, 'utf8'));
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw Error('BLOB_READ_WRITE_TOKEN is missing; connect the approved project store first');
  const store = token.split('_')[3];
  const host = String(request.expectedHost || '').toLowerCase();
  if (!store || host !== store.toLowerCase() + '.public.blob.vercel-storage.com') {
    throw Error('Blob credential/store hostname mismatch; refusing to upload to another store');
  }
  if (!/^audio\/v1\/[a-f0-9]{64}\.mp3$/.test(request.pathname)) throw Error('Invalid immutable audio pathname');
  const {put, head, BlobNotFoundError} = require('@vercel/blob');
  let result, reused = false;
  try { result = await head(request.pathname, {token}); }
  catch (error) { if (!(error instanceof BlobNotFoundError)) throw error; }
  if (result) {
    if (result.size !== fs.statSync(request.file).size || !/^audio\/mpeg(?:;|$)/i.test(result.contentType)) {
      throw Error('Existing Blob metadata mismatch; do not overwrite it');
    }
    reused = true;
  } else {
    result = await put(request.pathname, fs.readFileSync(request.file), {
      token, access:'public', addRandomSuffix:false, allowOverwrite:false,
      multipart:false, contentType:'audio/mpeg', cacheControlMaxAge:31536000,
    });
  }
  const url = new URL(result.url);
  if (url.protocol !== 'https:' || url.hostname !== host || url.pathname !== '/' + request.pathname) {
    throw Error('Unexpected Blob URL returned');
  }
  process.stdout.write(JSON.stringify({url:result.url,pathname:request.pathname,reused})+'\n');
})().catch(error => {
  // Do not print SDK request objects, headers or credentials.
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const message = String(error.message || error).split(token || '\0').join('[redacted]');
  console.error(message); process.exitCode = 1;
});
