import { supabase } from '../lib/supabase';
import { encrypt, decrypt, deriveEncryptionKey, generateSalt, bufferToBase64Public, base64ToBufferPublic } from '../lib/crypto';
import { compress, decompress } from '../lib/compress';

let cachedCryptoKey = null;
let cachedSalt = null;

export function configure(cryptoKey, saltBase64) {
  cachedCryptoKey = cryptoKey;
  cachedSalt = saltBase64;
}

export function reset() {
  cachedCryptoKey = null;
  cachedSalt = null;
}

async function fetchVault() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_vaults')
    .select('encrypted_blob, iv, salt, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function decryptVault(vault) {
  if (!vault || !cachedCryptoKey) return null;

  const plaintext = await decrypt(vault.encrypted_blob, vault.iv, cachedCryptoKey);
  const decompressed = await decompress(base64ToBufferPublic(plaintext));
  return JSON.parse(decompressed);
}

async function encryptAndSave(payload) {
  if (!cachedCryptoKey) throw new Error('No encryption key available');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const json = JSON.stringify(payload);
  const compressed = await compress(json);
  const compressedB64 = bufferToBase64Public(compressed);
  const { ciphertext, iv } = await encrypt(compressedB64, cachedCryptoKey);

  const { error } = await supabase
    .from('user_vaults')
    .upsert({
      user_id: user.id,
      encrypted_blob: ciphertext,
      iv,
      salt: cachedSalt,
      version: 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

async function getFullState() {
  const vault = await fetchVault();
  if (!vault) return { projects: [], tasks: [] };
  const decrypted = await decryptVault(vault);
  return decrypted || { projects: [], tasks: [] };
}

export const supabaseAdapter = {
  async getProjects() {
    const state = await getFullState();
    return state.projects || [];
  },

  async saveProjects(projects) {
    const state = await getFullState();
    state.projects = projects;
    await encryptAndSave(state);
  },

  async getTasks() {
    const state = await getFullState();
    return state.tasks || [];
  },

  async saveTasks(tasks) {
    const state = await getFullState();
    state.tasks = tasks;
    await encryptAndSave(state);
  },

  async getUpdatedAt() {
    const vault = await fetchVault();
    return vault ? vault.updated_at : null;
  },

  async saveFullState(projects, tasks) {
    await encryptAndSave({ projects, tasks });
  },
};
