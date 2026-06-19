import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * useAuth — React hook for Supabase authentication state management.
 *
 * Manages OAuth sign-in/sign-out, session persistence, profile fetching,
 * and auth state change listeners.
 *
 * @returns {{
 *   user: object|null,
 *   profile: object|null,
 *   session: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   signInWithGoogle: () => Promise<void>,
 *   signInWithGitHub: () => Promise<void>,
 *   signOut: () => Promise<void>,
 * }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileFetchedRef = useRef(false);

  /**
   * Fetch the user's profile from the profiles table with exponential backoff.
   */
  const fetchProfile = useCallback(async (userId, retryCount = 0) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116' && retryCount < 4) {
          /* Profile not yet created by trigger — wait with exponential backoff */
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          await fetchProfile(userId, retryCount + 1);
        } else if (fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile:', fetchError);
        }
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  /**
   * Initialize auth state and subscribe to changes.
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user && !profileFetchedRef.current) {
            profileFetchedRef.current = true;
            await fetchProfile(currentSession.user.id);
          }

          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          if (!profileFetchedRef.current || profile?.id !== newSession.user.id) {
            profileFetchedRef.current = true;
            await fetchProfile(newSession.user.id);
          }
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          profileFetchedRef.current = false;
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, profile?.id]);

  /**
   * Sign in with Google OAuth.
   */
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : undefined;

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (signInError) setError(signInError.message);
  }, []);

  /**
   * Sign in with Email Magic Link (OTP).
   */
  const signInWithEmail = useCallback(async (email) => {
    setError(null);
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : undefined;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (signInError) {
      setError(signInError.message);
      return false;
    }
    return true;
  }, []);

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }, []);

  return {
    user,
    profile,
    session,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  };
}
