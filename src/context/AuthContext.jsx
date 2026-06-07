import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  generateRecoveryKey,
  parseRecoveryKey,
  deriveEncryptionKey,
  generateSalt,
  exportKey,
  importKey,
  bufferToBase64Public,
  base64ToBufferPublic,
  decrypt,
} from '../lib/crypto';
import { configure as configureSupabaseAdapter, reset as resetSupabaseAdapter } from '../storage/supabaseAdapter';

const AuthContext = createContext(null);

const SESSION_KEY_STORAGE = 'projecthub_session_key';
const SESSION_SALT_STORAGE = 'projecthub_session_salt';
const GUEST_STORAGE = 'projecthub_guest_mode';

// Read guest flag synchronously — no async work needed.
const readIsGuest = () => localStorage.getItem(GUEST_STORAGE) === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [salt, setSalt] = useState(null);
  // loading only stays true when there may be a valid session to restore.
  // Guest users get loading=false immediately; unknown users show the auth
  // page straight away and transition silently when getSession() resolves.
  const [loading, setLoading] = useState(!readIsGuest());
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [isGuest, setIsGuestState] = useState(readIsGuest);

  const isAuthenticated = !!user;
  const isUnlocked = !!cryptoKey;

  const restoreSessionKey = useCallback(async () => {
    const storedKey = sessionStorage.getItem(SESSION_KEY_STORAGE);
    const storedSalt = sessionStorage.getItem(SESSION_SALT_STORAGE);
    if (storedKey && storedSalt) {
      const restored = await importKey(storedKey);
      setCryptoKey(restored);
      setSalt(storedSalt);
      configureSupabaseAdapter(restored, storedSalt);
      return true;
    }
    return false;
  }, []);

  const checkVaultExists = useCallback(async (userId) => {
    const { data } = await supabase
      .from('user_vaults')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  }, []);

  useEffect(() => {
    // If already in guest mode, skip the Supabase session check entirely.
    if (readIsGuest()) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        localStorage.removeItem(GUEST_STORAGE);
        setIsGuestState(false);
        restoreSessionKey().then(async (restored) => {
          if (!restored) {
            const exists = await checkVaultExists(s.user.id);
            if (exists) {
              setNeedsUnlock(true);
            } else {
              setNeedsSetup(true);
            }
          }
          setLoading(false);
        });
      } else {
        // No session — auth page is already visible; just clear loading.
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setCryptoKey(null);
        setSalt(null);
        setNeedsSetup(false);
        setNeedsUnlock(false);
        sessionStorage.removeItem(SESSION_KEY_STORAGE);
        sessionStorage.removeItem(SESSION_SALT_STORAGE);
        resetSupabaseAdapter();
      }
      if (event === 'SIGNED_IN' && s?.user) {
        localStorage.removeItem(GUEST_STORAGE);
        setIsGuestState(false);
        (async () => {
          const restored = await restoreSessionKey();
          if (!restored) {
            const exists = await checkVaultExists(s.user.id);
            if (exists) {
              setNeedsUnlock(true);
            } else {
              setNeedsSetup(true);
            }
          }
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, [restoreSessionKey, checkVaultExists]);

  const signInWithEmail = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  };

  const signUpWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signInWithPassword = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_STORAGE, 'true');
    setIsGuestState(true);
    setLoading(false);
  };

  const exitGuestMode = () => {
    localStorage.removeItem(GUEST_STORAGE);
    setIsGuestState(false);
  };

  const setupRecoveryKey = async () => {
    const { display, raw } = generateRecoveryKey();
    const newSalt = generateSalt();
    const saltB64 = bufferToBase64Public(newSalt);
    const key = await deriveEncryptionKey(raw, newSalt);

    setCryptoKey(key);
    setSalt(saltB64);
    setNeedsSetup(false);

    const exported = await exportKey(key);
    sessionStorage.setItem(SESSION_KEY_STORAGE, exported);
    sessionStorage.setItem(SESSION_SALT_STORAGE, saltB64);
    configureSupabaseAdapter(key, saltB64);

    return display;
  };

  const unlockWithRecoveryKey = async (displayString) => {
    const raw = parseRecoveryKey(displayString);
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) throw new Error('Not authenticated');

    const { data: vault } = await supabase
      .from('user_vaults')
      .select('iv, salt, encrypted_blob')
      .eq('user_id', u.id)
      .maybeSingle();

    if (!vault) throw new Error('No vault found');

    const vaultSalt = base64ToBufferPublic(vault.salt);
    const key = await deriveEncryptionKey(raw, vaultSalt);

    await decrypt(vault.encrypted_blob, vault.iv, key);

    const saltB64 = vault.salt;
    setCryptoKey(key);
    setSalt(saltB64);
    setNeedsUnlock(false);

    const exported = await exportKey(key);
    sessionStorage.setItem(SESSION_KEY_STORAGE, exported);
    sessionStorage.setItem(SESSION_SALT_STORAGE, saltB64);
    configureSupabaseAdapter(key, saltB64);

    return true;
  };

  const dismissAuth = () => {
    setNeedsSetup(false);
    setNeedsUnlock(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      cryptoKey,
      salt,
      loading,
      isAuthenticated,
      isUnlocked,
      isGuest,
      needsSetup,
      needsUnlock,
      signInWithEmail,
      signUpWithEmail,
      signInWithPassword,
      signInWithGoogle,
      signOut,
      continueAsGuest,
      exitGuestMode,
      setupRecoveryKey,
      unlockWithRecoveryKey,
      dismissAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
