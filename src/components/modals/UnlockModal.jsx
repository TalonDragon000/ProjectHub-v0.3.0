import React, { useState } from 'react';
import { KeyRound, CircleAlert as AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UnlockModal({ onUnlocked, onDismiss }) {
  const { unlockWithRecoveryKey } = useAuth();
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!keyInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      await unlockWithRecoveryKey(keyInput.trim());
      if (onUnlocked) onUnlocked();
    } catch (err) {
      setError('Invalid recovery key. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <div className="absolute inset-0 bg-base/98 backdrop-blur-md z-50 flex flex-col p-6 animate-in fade-in-0 duration-200">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent-tertiary/15 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-accent-tertiary" />
          </div>
          <h2 className="text-xl font-bold text-primary">Unlock Your Data</h2>
        </div>

        <p className="text-sm text-muted mb-6 leading-relaxed">
          Enter your recovery key to decrypt and sync your data on this device.
        </p>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="XXXX-XXXX-XXXX-XXXX-..."
            className="w-full bg-raised border border-subtle rounded-xl px-4 py-3.5 font-mono text-sm text-primary placeholder:text-faint focus:outline-none focus:border-accent-tertiary focus:ring-1 focus:ring-accent-tertiary/30 transition-colors"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />

          {error && (
            <div className="flex items-center gap-2 text-error">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleUnlock}
          disabled={loading || !keyInput.trim()}
          className="w-full bg-accent-tertiary text-inverted font-bold py-4 rounded-2xl shadow-tertiary transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 mb-3"
        >
          {loading ? 'Decrypting...' : 'Unlock'}
        </button>

        <button
          onClick={onDismiss}
          className="w-full flex items-center justify-center gap-2 text-sm text-muted hover:text-primary py-3 rounded-xl transition-colors"
        >
          <WifiOff className="w-3.5 h-3.5" />
          Use offline only
        </button>
      </div>
    </div>
  );
}
