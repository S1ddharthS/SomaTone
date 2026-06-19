import React from 'react';
import { useAuth } from './hooks/useAuth.js';
import AuthGate from './components/AuthGate.jsx';
import Dashboard from './components/Dashboard.jsx';

/**
 * App — Root component.
 *
 * Routes between AuthGate (sign-in) and Dashboard based on auth state.
 * Handles loading state with a minimal branded spinner.
 */
export default function App() {
  const {
    user,
    profile,
    session,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  } = useAuth();

  /* Loading State */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-obsidian flex items-center justify-center">
        <div className="text-center animate-fade-in">
          {/* Logo */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border border-sage/20 animate-breathe" />
            <div className="absolute inset-3 rounded-full border border-sage/30 animate-breathe" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-sage/60" />
            </div>
          </div>

          {/* Wordmark */}
          <p className="text-body font-light tracking-[0.3em] text-text-muted">
            SOMATONE
          </p>
        </div>
      </div>
    );
  }

  /* Not Authenticated — Show AuthGate */
  if (!session || !user) {
    return (
      <AuthGate
        signInWithGoogle={signInWithGoogle}
        signInWithEmail={signInWithEmail}
        error={error}
      />
    );
  }

  /* Authenticated — Show Dashboard */
  return (
    <Dashboard
      user={user}
      profile={profile}
      onSignOut={signOut}
    />
  );
}
