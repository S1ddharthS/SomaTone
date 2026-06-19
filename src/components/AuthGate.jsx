import React, { useState } from 'react';
import { Waves, Shield, Hand, Mic, ArrowRight } from 'lucide-react';

/**
 * AuthGate — Premium editorial OAuth sign-in page.
 *
 * Full-bleed immersive layout with animated radial gradients,
 * tracking-wide typography, and elegant OAuth buttons.
 * No generic card/modal — a bespoke, cinematic experience.
 */
export default function AuthGate({ signInWithGoogle, signInWithEmail, error }) {
  const [isLoading, setIsLoading] = useState(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleEmail = async () => {
    if (!email.trim()) return;
    setIsLoading('email');
    const success = await signInWithEmail(email);
    if (success) {
      setEmailSent(true);
      setEmail('');
    }
    setIsLoading(null);
  };

  const handleGoogle = async () => {
    setIsLoading('google');
    await signInWithGoogle();
    setIsLoading(null);
  };

  return (
    <div className="fixed inset-0 bg-obsidian flex items-center justify-center overflow-hidden" id="auth-gate">
      {/* Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full animate-breathe"
          style={{
            top: '-20%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(124, 154, 130, 0.06) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-breathe"
          style={{
            bottom: '-15%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(212, 168, 71, 0.04) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-breathe"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(155, 142, 196, 0.03) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Logo Mark */}
        <div className="flex justify-center mb-12 opacity-0 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border border-sage/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-sage/50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-sage/80" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full animate-pulse-ring border border-sage/20" />
          </div>
        </div>

        {/* Wordmark */}
        <div className="text-center mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-display-sm font-extralight tracking-wider text-text-primary">
            SomaTone
          </h1>
        </div>

        {/* Tagline */}
        <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-body text-text-muted font-light tracking-wide">
            Feel. Hear. Regulate.
          </p>
        </div>

        {/* Feature Callouts */}
        <div className="space-y-3 mb-12">
          {[
            { icon: Waves, text: 'Adaptive soundscapes tuned to your mood', delay: '0.25s' },
            { icon: Shield, text: 'Real-time emotion sensing via facial analysis', delay: '0.35s' },
            { icon: Hand, text: 'Gesture-controlled sonic modulation', delay: '0.45s' },
            { icon: Mic, text: 'Voice-driven mental health check-ins', delay: '0.55s' },
          ].map(({ icon: Icon, text, delay }) => (
            <div
              key={text}
              className="flex items-center gap-4 opacity-0 animate-slide-up"
              style={{ animationDelay: delay }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-text-muted" strokeWidth={1.5} />
              </div>
              <span className="text-body-sm text-text-secondary font-light">{text}</span>
            </div>
          ))}
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 opacity-0 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          {/* Email Magic Link */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmail();
            }}
            className="mb-4 space-y-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-body-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-white/[0.1] transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading !== null || !email.trim()}
              className="oauth-btn group w-full justify-center"
              id="auth-email-btn"
            >
              <span>Continue with Email</span>
              {isLoading === 'email' ? (
                <div className="ml-2 w-4 h-4 border-2 border-text-muted/30 border-t-text-primary rounded-full animate-spin" />
              ) : (
                <ArrowRight size={14} className="ml-2 text-text-muted group-hover:text-text-secondary transition-colors" />
              )}
            </button>
            {emailSent && (
              <p className="text-body-sm text-sage mt-2 text-center animate-fade-in">
                Magic link sent! Check your email.
              </p>
            )}
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.04]"></div>
            </div>
            <div className="relative flex justify-center text-label">
              <span className="px-2 bg-obsidian text-text-muted/50">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading !== null}
            className="oauth-btn group w-full"
            id="auth-google-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
            {isLoading === 'google' ? (
              <div className="ml-auto w-4 h-4 border-2 border-text-muted/30 border-t-text-primary rounded-full animate-spin" />
            ) : (
              <ArrowRight size={14} className="ml-auto text-text-muted group-hover:text-text-secondary transition-colors" />
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose/10 border border-rose/20 text-body-sm text-rose animate-fade-in">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center opacity-0 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-system text-text-muted">
            YOUR DATA STAYS PRIVATE · END-TO-END ENCRYPTED
          </p>
        </div>
      </div>
    </div>
  );
}
