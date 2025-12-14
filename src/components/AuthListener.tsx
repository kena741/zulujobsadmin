'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser, setUser } from '@/features/auth/authSlice';
import { supabase } from '@/lib/supabase';

export default function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Fetch current user on mount
    dispatch(fetchCurrentUser());

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || null,
          avatar: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at,
        }));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}
