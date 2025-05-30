
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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (error) {
                console.error('Error fetching profile:', error);
                // Create profile if it doesn't exist
                if (error.code === 'PGRST116') {
                  console.log('Profile not found, creating new profile...');
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      email: session.user.email || '',
                      full_name: session.user.user_metadata?.full_name || session.user.email || '',
                      role: session.user.user_metadata?.role || 'other_staff',
                      phone_number: session.user.user_metadata?.phone_number,
                      employee_id: session.user.user_metadata?.employee_id,
                      department: session.user.user_metadata?.department
                    })
                    .select()
                    .single();
                  
                  if (createError) {
                    console.error('Error creating profile:', createError);
                  } else {
                    setUserProfile(newProfile);
                  }
                }
              } else if (profile) {
                setUserProfile(profile);
              }
            } catch (err) {
              console.error('Profile fetch error:', err);
            }
          }, 100);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
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
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Clear auth storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload anyway
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

  // Show login if no user
  if (!user) {
    return <LoginPage />;
  }

  // If user exists but no profile, show loading (profile might be fetching)
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
