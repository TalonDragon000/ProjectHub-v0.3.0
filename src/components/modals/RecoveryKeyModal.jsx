import React, { useState, useEffect } from 'react';
import { Shield, Copy, Check, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RecoveryKeyModal({ onComplete }) {
  const { setupRecoveryKey } = useAuth();
  const [recoveryKey, setRecoveryKey] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupRecoveryKey().then((key) => {
      setRecoveryKey(key);
      setLoading(false);
    });
  }, [setupRecoveryKey]);

  const handleContinue = () => {
    if (acknowledged && onComplete) onComplete();
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-base/98 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-tertiary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Generating your encryption key...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-base/98 backdrop-blur-md z-50 flex flex-col p-6 animate-in fade-in-0 duration-200">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-tertiary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-tertiary" />
          </div>
          <h2 className="text-xl font-bold text-primary">Your Recovery Key</h2>
        </div>

        <div className="bg-raised border border-subtle rounded-2xl p-5 mb-5">
          <p className="font-mono text-sm text-primary leading-relaxed tracking-wide break-all select-all">
            {recoveryKey}
          </p>
        </div>

        <div className="bg-warning/8 border border-warning/20 rounded-xl p-4 mb-6">
          <div className="flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs text-primary font-semibold">Write this down or save it in your password manager.</p>
              <p className="text-xs text-muted leading-relaxed">
                This key encrypts all your data. It will only be shown once. If you lose this key, your data cannot be recovered -- not by you, not by us, not by anyone.
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-strong accent-accent-tertiary"
          />
          <span className="text-sm text-muted leading-snug">
            I have saved my recovery key somewhere safe
          </span>
        </label>

        <button
          onClick={handleContinue}
          disabled={!acknowledged}
          className="w-full bg-accent-tertiary text-inverted font-bold py-4 rounded-2xl shadow-tertiary transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
