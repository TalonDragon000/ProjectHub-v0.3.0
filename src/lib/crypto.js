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

export function generateRecoveryKey() {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const encoded = toBase32(raw);
  const groups = [];
  for (let i = 0; i < encoded.length; i += 4) {
    groups.push(encoded.slice(i, i + 4));
  }
  const display = groups.slice(0, 13).join('-');
  return { display, raw };
}

export function parseRecoveryKey(displayString) {
  const cleaned = displayString.replace(/[-\s]/g, '');
  return fromBase32(cleaned);
}

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(12));
}

export async function deriveEncryptionKey(rawKeyBytes, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    rawKeyBytes,
    'HKDF',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: new TextEncoder().encode('projecthub-vault') },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext, cryptoKey) {
  const iv = generateIV();
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoded
  );
  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv),
  };
}

export async function decrypt(ciphertextB64, ivB64, cryptoKey) {
  const cipherBuffer = base64ToBuffer(ciphertextB64);
  const iv = base64ToBuffer(ivB64);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    cipherBuffer
  );
  return new TextDecoder().decode(decrypted);
}

export async function exportKey(cryptoKey) {
  const raw = await crypto.subtle.exportKey('raw', cryptoKey);
  return bufferToBase64(raw);
}

export async function importKey(base64Key) {
  const raw = base64ToBuffer(base64Key);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function bufferToBase64Public(buffer) {
  return bufferToBase64(buffer);
}

export function base64ToBufferPublic(base64) {
  return new Uint8Array(base64ToBuffer(base64));
}
