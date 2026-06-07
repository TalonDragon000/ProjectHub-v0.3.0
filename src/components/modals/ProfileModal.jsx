import React, { useState } from 'react';
import { X, User, Shield, Cloud, CloudOff, LogOut, KeyRound, Copy, Check, TriangleAlert as AlertTriangle, ChevronRight, Loader as Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-faint uppercase tracking-widest font-bold px-1">{label}</p>
      <div className="bg-surface border border-subtle rounded-2xl overflow-hidden divide-y divide-subtle">
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, sublabel, action, danger, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors disabled:opacity-40
        ${danger ? 'hover:bg-priority-high/5 active:bg-priority-high/10' : 'hover:bg-raised active:bg-overlay'}`}
    >
      {Icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${danger ? 'bg-priority-high/10' : 'bg-raised'}`}>
          <Icon className={`w-4 h-4 ${danger ? 'text-priority-high' : 'text-muted'}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-priority-high' : 'text-primary'}`}>{label}</p>
        {sublabel && <p className="text-xs text-faint mt-0.5 leading-snug">{sublabel}</p>}
      </div>
      {action && <span className="text-xs text-faint shrink-0">{action}</span>}
      {!action && onClick && !danger && <ChevronRight className="w-3.5 h-3.5 text-faint shrink-0" />}
    </button>
  );
}

function RecoveryKeyPanel({ onClose }) {
  const { setupRecoveryKey } = useAuth();
  const [step, setStep] = useState('warning'); // 'warning' | 'loading' | 'key'
  const [recoveryKey, setRecoveryKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleReveal = async () => {
    setStep('loading');
    const key = await setupRecoveryKey();
    setRecoveryKey(key);
    setStep('key');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-base z-10 flex flex-col p-6 animate-in slide-in-from-right-4">
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button onClick={onClose} className="text-muted hover:text-primary transition-colors p-1 -ml-1">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-primary">Recovery Key</h3>
      </div>

      {step === 'warning' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-warning/8 border border-warning/25 rounded-2xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">This key decrypts all your data.</p>
                <p className="text-xs text-muted leading-relaxed">
                  Your data is encrypted end-to-end. The recovery key is the only way to decrypt it
                  on a new device if your session expires. Store it in a password manager.
                  If you lose it, your encrypted data cannot be recovered by anyone.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-strong accent-accent-tertiary"
            />
            <span className="text-sm text-muted leading-snug">
              I understand this key will only be shown once. I will store it safely.
            </span>
          </label>

          <button
            onClick={handleReveal}
            disabled={!acknowledged}
            className="w-full bg-accent-tertiary text-inverted font-bold py-3.5 rounded-xl shadow-tertiary transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            Reveal Recovery Key
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-7 h-7 text-accent-tertiary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Generating your encryption key...</p>
          </div>
        </div>
      )}

      {step === 'key' && (
        <div className="flex-1 flex flex-col">
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Copy this key and store it in your password manager. This is the only time it will be shown.
          </p>

          <div className="bg-raised border border-subtle rounded-2xl p-4 mb-4 relative">
            <p className="font-mono text-sm text-primary leading-relaxed tracking-wide break-all select-all">
              {recoveryKey}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-default hover:border-strong text-primary font-semibold py-3.5 rounded-xl transition-all active:scale-95 text-sm mb-3"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>

          <button
            onClick={onClose}
            className="w-full text-sm text-muted hover:text-primary transition-colors py-2"
          >
            I've saved it — done
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfileModal() {
  const { profileOpen, setProfileOpen } = useApp();
  const {
    user, isAuthenticated, isUnlocked, isGuest,
    signOut, exitGuestMode,
  } = useAuth();
  const [showRecovery, setShowRecovery] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!profileOpen) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setProfileOpen(false);
    setSigningOut(false);
  };

  const handleExitGuest = () => {
    exitGuestMode();
    setProfileOpen(false);
  };

  return (
    <div className="absolute inset-0 bg-base/95 backdrop-blur-md z-40 flex flex-col animate-in slide-in-from-top-4">
      {showRecovery && (
        <RecoveryKeyPanel onClose={() => setShowRecovery(false)} />
      )}

      <div className="flex justify-between items-center p-6 pt-8 border-b border-subtle">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <User className="w-5 h-5 text-accent-tertiary" /> Profile &amp; Security
        </h2>
        <button
          onClick={() => setProfileOpen(false)}
          className="text-muted p-2 hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">

        {/* Account section */}
        <Section label="Account">
          {isAuthenticated ? (
            <>
              <Row
                icon={User}
                label={user?.email || 'Signed in'}
                sublabel="Your account email"
                disabled
              />
              <Row
                icon={isUnlocked ? Cloud : CloudOff}
                label={isUnlocked ? 'Encrypted sync active' : 'Sync locked'}
                sublabel={isUnlocked ? 'Your data is end-to-end encrypted.' : 'Use your recovery key to unlock sync.'}
                disabled
              />
            </>
          ) : (
            <Row
              icon={User}
              label="Guest mode"
              sublabel="Data is local only. Sign in to back up across devices."
              disabled
            />
          )}
        </Section>

        {/* Security section — authenticated users only */}
        {isAuthenticated && (
          <Section label="Security">
            <Row
              icon={Shield}
              label="Recovery Key"
              sublabel="One-time display. Store in a password manager."
              onClick={() => setShowRecovery(true)}
            />
          </Section>
        )}

        {/* Guest upgrade prompt */}
        {isGuest && (
          <Section label="Back up your data">
            <Row
              icon={Cloud}
              label="Create an account"
              sublabel="Your local data will be securely encrypted and synced."
              onClick={handleExitGuest}
            />
          </Section>
        )}

        {/* Sign out / exit guest */}
        <Section label="Session">
          {isAuthenticated ? (
            <Row
              icon={LogOut}
              label={signingOut ? 'Signing out...' : 'Sign Out'}
              danger
              onClick={handleSignOut}
              disabled={signingOut}
            />
          ) : (
            <Row
              icon={LogOut}
              label="Exit guest mode"
              sublabel="Return to the sign-in screen."
              danger
              onClick={handleExitGuest}
            />
          )}
        </Section>

      </div>
    </div>
  );
}
