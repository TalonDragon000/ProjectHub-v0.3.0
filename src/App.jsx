import React, { lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './views/AuthPage.jsx';

// AppShell (and everything it imports: AppContext, all components, all
// modals, crypto, compress, etc.) only downloads after the user is
// authenticated or has chosen guest mode.
const AppShell = lazy(() => import('./AppShell.jsx'));

export default function App() {
  const { isAuthenticated, isGuest, loading, continueAsGuest } = useAuth();

  // loading=true only when there may be an existing session to restore
  // (i.e. not a known guest). Show the auth page immediately in all
  // unauthenticated states — it will transition automatically when
  // getSession() resolves to a valid session.
  if (!isAuthenticated && !isGuest) {
    return <AuthPage onGuest={continueAsGuest} />;
  }

  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto h-screen bg-base flex items-center justify-center font-sans">
        <div className="text-center">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-tertiary-alt to-accent-primary mb-4">
            Project Hub
          </h1>
          <div className="w-6 h-6 border-2 border-accent-tertiary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    }>
      <AppShell />
    </Suspense>
  );
}
