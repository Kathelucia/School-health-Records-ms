
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (error) {
                console.error('Error fetching profile:', error);
                // Create a fallback profile if none exists
                const fallbackProfile = {
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.email || 'User',
                  role: 'other_staff'
                };
                setUserProfile(fallbackProfile);
              } else if (!profile) {
                console.log('No profile found, creating basic profile...');
                // Try to create profile via trigger or manually
                const basicProfile = {
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.email || 'User',
                  role: 'other_staff'
                };
                
                try {
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert(basicProfile)
                    .select()
                    .single();
                  
                  if (createError) {
                    console.error('Error creating profile:', createError);
                    setUserProfile(basicProfile);
                  } else {
                    setUserProfile(newProfile);
                  }
                } catch (insertError) {
                  console.error('Profile creation failed:', insertError);
                  setUserProfile(basicProfile);
                }
              } else {
                setUserProfile(profile);
              }
            } catch (err) {
              console.error('Profile fetch error:', err);
              const fallbackProfile = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email || 'User',
                role: 'other_staff'
              };
              setUserProfile(fallbackProfile);
            }
          }, 100);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Clean up any stored auth data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading SHRMS..." 
        subMessage="Initializing School Health Records Management System"
      />
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user && !userProfile) {
    return (
      <LoadingSpinner 
        message="Setting up your profile..." 
        subMessage="Please wait while we prepare your dashboard"
      />
    );
  }

  return <Dashboard userProfile={userProfile} onLogout={handleLogout} />;
};

export default Index;
