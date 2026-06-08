/**
 * E2E Encryption & Recovery Key Test
 *
 * Tests the full crypto roundtrip used by the vault:
 *   generate key -> encode to display string -> parse -> derive -> encrypt -> decrypt
 *
 * Offline (no credentials required):
 *   node scripts/test-account-recovery.mjs
 *
 * Live vault (tests against your actual vault in Supabase):
 *   node --env-file=.env scripts/test-account-recovery.mjs \
 *     TEST_EMAIL=you@example.com TEST_PASSWORD=yourpassword TEST_RECOVERY_KEY="XXXX-XXXX-..."
 *
 * Or export them first:
 *   export TEST_EMAIL=you@example.com
 *   export TEST_PASSWORD=yourpassword
 *   export TEST_RECOVERY_KEY="XXXX-XXXX-XXXX-..."
 *   node --env-file=.env scripts/test-account-recovery.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ─── Inline crypto primitives (mirrors src/lib/crypto.js exactly) ────────────

const BASE32_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function toBase32(bytes) {
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    result += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  return result;
}

function fromBase32(str) {
  let bits = '';
  for (const c of str) {
    const idx = BASE32_ALPHABET.indexOf(c.toUpperCase());
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

function generateRecoveryKey() {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const encoded = toBase32(raw);
  const groups = [];
  for (let i = 0; i < encoded.length; i += 4) groups.push(encoded.slice(i, i + 4));
  const display = groups.slice(0, 13).join('-');
  return { display, raw };
}

function parseRecoveryKey(displayString) {
  const cleaned = displayString.replace(/[-\s]/g, '');
  return fromBase32(cleaned);
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function deriveEncryptionKey(rawKeyBytes, salt) {
  const keyMaterial = await crypto.subtle.importKey('raw', rawKeyBytes, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: new TextEncoder().encode('projecthub-vault') },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(plaintext, cryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);
  return { ciphertext: bufToB64(cipherBuffer), iv: bufToB64(iv) };
}

async function decryptData(ciphertextB64, ivB64, cryptoKey) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBuf(ivB64) },
    cryptoKey,
    b64ToBuf(ciphertextB64)
  );
  return new TextDecoder().decode(decrypted);
}

function bufToB64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return Buffer.from(binary, 'binary').toString('base64');
}

function b64ToBuf(base64) {
  const binary = Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function b64ToBytes(base64) {
  return new Uint8Array(b64ToBuf(base64));
}

// ─── Inline compress/decompress (mirrors src/lib/compress.js exactly) ─────────

async function compress(string) {
  const encoder = new TextEncoder();
  const stream = new Blob([encoder.encode(string)])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const compressed = await new Response(stream).arrayBuffer();
  return new Uint8Array(compressed);
}

async function decompress(uint8Array) {
  const stream = new Blob([uint8Array])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(label) {
  console.log(`  \x1b[32m[PASS]\x1b[0m ${label}`);
  passed++;
}

function fail(label, detail = '') {
  console.log(`  \x1b[31m[FAIL]\x1b[0m ${label}${detail ? ': ' + detail : ''}`);
  failed++;
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// ─── Offline Tests ────────────────────────────────────────────────────────────

async function runOfflineTests() {
  section('1. Base32 Encode/Decode Roundtrip');

  const original = crypto.getRandomValues(new Uint8Array(32));
  const encoded = toBase32(original);
  const decoded = fromBase32(encoded);

  if (decoded.length === 32) {
    pass(`fromBase32 returns exactly 32 bytes (got ${decoded.length})`);
  } else {
    fail(`byte count mismatch`, `expected 32, got ${decoded.length}`);
  }

  if (bytesEqual(original, decoded)) {
    pass('decoded bytes match original exactly');
  } else {
    fail('decoded bytes do not match original');
    console.log('    original:', Array.from(original).slice(0, 8).join(','), '...');
    console.log('    decoded: ', Array.from(decoded).slice(0, 8).join(','), '...');
  }

  section('2. Recovery Key Generate/Parse Roundtrip');

  const { display, raw } = generateRecoveryKey();
  const groups = display.split('-');

  if (groups.length === 13) {
    pass(`display key has 13 groups (got ${groups.length}): ${display}`);
  } else {
    fail(`expected 13 groups, got ${groups.length}`);
  }

  const parsed = parseRecoveryKey(display);

  if (parsed.length === 32) {
    pass(`parseRecoveryKey returns 32 bytes`);
  } else {
    fail(`parseRecoveryKey byte count wrong`, `expected 32, got ${parsed.length}`);
  }

  if (bytesEqual(raw, parsed)) {
    pass('parsed bytes match original raw bytes exactly');
  } else {
    fail('parsed bytes do not match raw — key roundtrip is LOSSY');
    console.log('    raw:    ', Array.from(raw).slice(0, 8).join(','), '...');
    console.log('    parsed: ', Array.from(parsed).slice(0, 8).join(','), '...');
  }

  section('3. Case & Formatting Tolerance');

  const lowercase = display.toLowerCase();
  const parsedLower = parseRecoveryKey(lowercase);
  if (bytesEqual(raw, parsedLower)) {
    pass('lowercase input parses correctly');
  } else {
    fail('lowercase input produces different bytes');
  }

  const noHyphens = display.replace(/-/g, '');
  const parsedNoHyphens = parseRecoveryKey(noHyphens);
  if (bytesEqual(raw, parsedNoHyphens)) {
    pass('input without hyphens parses correctly');
  } else {
    fail('input without hyphens produces different bytes');
  }

  const withSpaces = display.replace(/-/g, ' ');
  const parsedSpaces = parseRecoveryKey(withSpaces);
  if (bytesEqual(raw, parsedSpaces)) {
    pass('input with spaces instead of hyphens parses correctly');
  } else {
    fail('input with spaces produces different bytes');
  }

  section('4. HKDF Key Derivation');

  const salt = generateSalt();
  const key1 = await deriveEncryptionKey(raw, salt);
  const key2 = await deriveEncryptionKey(parsed, salt);

  const exported1 = await crypto.subtle.exportKey('raw', key1);
  const exported2 = await crypto.subtle.exportKey('raw', key2);

  if (bytesEqual(new Uint8Array(exported1), new Uint8Array(exported2))) {
    pass('two derivations from the same bytes + salt produce identical keys');
  } else {
    fail('derivations diverge — key derivation is non-deterministic or bytes differ');
  }

  const saltB64 = bufToB64(salt);
  const saltRoundtrip = b64ToBytes(saltB64);
  if (bytesEqual(salt, saltRoundtrip)) {
    pass('salt base64 roundtrip is lossless');
  } else {
    fail('salt base64 roundtrip is LOSSY — stored salt would be corrupted');
  }

  section('5. Full Encrypt/Decrypt Roundtrip (mirrors vault write/read)');

  const payload = JSON.stringify({ projects: [{ id: 'test-1', name: 'Test Project' }], tasks: [] });

  const compressed = await compress(payload);
  const compressedB64 = bufToB64(compressed);
  const { ciphertext, iv } = await encryptData(compressedB64, key1);

  pass(`encrypted blob length: ${ciphertext.length} chars`);

  const decryptedB64 = await decryptData(ciphertext, iv, key1);
  const decompressed = await decompress(b64ToBytes(decryptedB64));

  if (decompressed === payload) {
    pass('decrypt + decompress returns original payload exactly');
  } else {
    fail('decrypted payload does not match original');
  }

  section('6. Wrong Key Rejection');

  const wrongKey = await deriveEncryptionKey(crypto.getRandomValues(new Uint8Array(32)), salt);
  try {
    await decryptData(ciphertext, iv, wrongKey);
    fail('wrong key should have thrown but did not — AES-GCM authentication failed silently');
  } catch {
    pass('wrong key correctly throws OperationError (AES-GCM auth tag mismatch)');
  }

  section('7. UnlockModal Input Simulation');

  const trimmed = `  ${display}  `;
  const parsedTrimmed = parseRecoveryKey(trimmed.trim());
  if (bytesEqual(raw, parsedTrimmed)) {
    pass('leading/trailing whitespace trimmed correctly (matches UnlockModal .trim())');
  } else {
    fail('trimmed input produces different bytes');
  }

  // Simulate a user replacing one valid character with an invalid one ('0' not in alphabet)
  // This removes one valid character from the stream, reducing output to 31 bytes
  const chars = display.replace(/[-\s]/g, '');
  const corrupted = chars.slice(0, 4) + '0' + chars.slice(5); // replace char at index 4 with '0'
  const parsedBad = parseRecoveryKey(corrupted);
  if (parsedBad.length !== 32) {
    pass(`corrupted key (replaced valid char with '0') produces ${parsedBad.length} bytes — short key will fail derive/decrypt`);
  } else if (!bytesEqual(raw, parsedBad)) {
    pass('corrupted key produces different bytes — will correctly fail decryption');
  } else {
    fail('corrupted key produced the same bytes as the original (unexpected)');
  }
}

// ─── Live Vault Test ──────────────────────────────────────────────────────────

async function runLiveVaultTest(supabaseUrl, anonKey, email, password, recoveryKeyInput) {
  section('8. Live Vault Decryption');

  const supabase = createClient(supabaseUrl, anonKey);

  console.log(`  Signing in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    fail('sign-in failed', authError.message);
    return;
  }
  pass(`signed in — user id: ${authData.user.id}`);

  const { data: vault, error: vaultError } = await supabase
    .from('user_vaults')
    .select('iv, salt, encrypted_blob, updated_at')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (vaultError) {
    fail('vault fetch error', vaultError.message);
    return;
  }
  if (!vault) {
    fail('no vault row found for this user — setup was never completed');
    return;
  }
  pass(`vault found — updated_at: ${vault.updated_at}, blob: ${vault.encrypted_blob.length} chars`);

  console.log(`  IV length (chars):   ${vault.iv.length}  (expect 16)`);
  console.log(`  Salt length (chars): ${vault.salt.length}  (expect 24)`);

  const raw = parseRecoveryKey(recoveryKeyInput.trim());
  if (raw.length === 32) {
    pass(`recovery key parsed to ${raw.length} bytes`);
  } else {
    fail(`recovery key parsed to wrong byte count`, `got ${raw.length}, expected 32`);
    return;
  }

  const vaultSalt = b64ToBytes(vault.salt);
  if (vaultSalt.length === 16) {
    pass(`vault salt decoded to ${vaultSalt.length} bytes`);
  } else {
    fail(`vault salt decoded to wrong byte count`, `got ${vaultSalt.length}, expected 16`);
    return;
  }

  let key;
  try {
    key = await deriveEncryptionKey(raw, vaultSalt);
    pass('key derivation succeeded');
  } catch (e) {
    fail('key derivation threw', e.message);
    return;
  }

  let decryptedB64;
  try {
    decryptedB64 = await decryptData(vault.encrypted_blob, vault.iv, key);
    pass('AES-GCM decryption succeeded');
  } catch (e) {
    fail('AES-GCM decryption threw OperationError — recovery key does not match this vault\'s encryption key');
    console.log('\n  Possible causes:');
    console.log('   - The key shown during setup was not the one used to encrypt the vault');
    console.log('     (the premature-unmount bug may have let a NEW key be generated after display)');
    console.log('   - The vault was re-encrypted with a different key after setup');
    console.log('   - The key was entered with a typo or missing characters');
    return;
  }

  let decompressed;
  try {
    decompressed = await decompress(b64ToBytes(decryptedB64));
    pass('gzip decompression succeeded');
  } catch (e) {
    fail('decompression threw', e.message);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(decompressed);
    pass(`vault JSON parsed — projects: ${parsed.projects?.length ?? '?'}, tasks: ${parsed.tasks?.length ?? '?'}`);
  } catch (e) {
    fail('JSON.parse threw — decrypted content is not valid JSON', e.message);
  }

  await supabase.auth.signOut();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const env = process.env;
const supabaseUrl = env.VITE_SUPABASE_URL;
const anonKey    = env.VITE_SUPABASE_ANON_KEY;
const email      = env.TEST_EMAIL;
const password   = env.TEST_PASSWORD;
const recoveryKey = env.TEST_RECOVERY_KEY;

console.log('\x1b[1m=== ProjectHub E2E Encryption & Recovery Test ===\x1b[0m');

await runOfflineTests();

if (email && password && recoveryKey) {
  if (!supabaseUrl || !anonKey) {
    console.log('\n\x1b[33m[SKIP] Live vault test: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set\x1b[0m');
    console.log('       Run with: node --env-file=.env scripts/test-account-recovery.mjs');
  } else {
    await runLiveVaultTest(supabaseUrl, anonKey, email, password, recoveryKey);
  }
} else {
  console.log('\n\x1b[33m[SKIP] Live vault test — set TEST_EMAIL, TEST_PASSWORD, and TEST_RECOVERY_KEY to run it\x1b[0m');
}

console.log(`\n${'─'.repeat(50)}`);
if (failed === 0) {
  console.log(`\x1b[32m\x1b[1mAll ${passed} tests passed.\x1b[0m`);
} else {
  console.log(`\x1b[31m\x1b[1m${failed} test(s) failed, ${passed} passed.\x1b[0m`);
}
console.log('');

// ─── Browser DevTools Snippet ─────────────────────────────────────────────────

console.log('\x1b[2m--- Browser DevTools Snippet ---');
console.log('Paste the following into your browser console while signed into the app:');
console.log('');
console.log(`(async () => {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  // grab the key already stored in sessionStorage by the running app
  const exportedKey = sessionStorage.getItem('projecthub_crypto_key');
  const saltB64     = sessionStorage.getItem('projecthub_salt');
  if (!exportedKey) { console.error('[DIAG] No session key found — vault is locked or not set up'); return; }
  console.log('[DIAG] Session key present:', exportedKey.length, 'chars');
  console.log('[DIAG] Session salt present:', saltB64?.length, 'chars');

  const { data: { user } } = await window.__supabase?.auth.getUser()
    ?? { data: { user: null } };
  if (!user) { console.error('[DIAG] Not signed in'); return; }
  console.log('[DIAG] Signed in as:', user.id);

  const { data: vault } = await window.__supabase
    .from('user_vaults').select('iv,salt,encrypted_blob').eq('user_id', user.id).maybeSingle();
  if (!vault) { console.error('[DIAG] No vault in database'); return; }
  console.log('[DIAG] Vault found — blob:', vault.encrypted_blob.length, 'chars');
  console.log('[DIAG] Vault salt matches session salt:', vault.salt === saltB64);
  console.log('[DIAG] vault.salt  :', vault.salt);
  console.log('[DIAG] session salt:', saltB64);
})()\x1b[0m`);
