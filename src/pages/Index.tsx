
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
          // Defer profile handling to avoid blocking auth state change
          setTimeout(async () => {
            try {
              console.log('Fetching profile for user:', session.user.id);
              
              // First try to fetch existing profile
              const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (fetchError) {
                console.error('Error fetching profile:', fetchError);
              }
              
              if (!profile) {
                console.log('No profile found, creating one...');
                // Create profile if it doesn't exist
                const newProfile = {
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  role: 'other_staff' as const
                };
                
                const { data: createdProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert(newProfile)
                  .select()
                  .single();
                
                if (createError) {
                  console.error('Error creating profile:', createError);
                  // Use fallback profile if database insert fails
                  setUserProfile(newProfile);
                } else {
                  console.log('Profile created successfully:', createdProfile);
                  setUserProfile(createdProfile);
                }
              } else {
                console.log('Profile found:', profile);
                setUserProfile(profile);
              }
            } catch (err) {
              console.error('Profile handling error:', err);
              // Create fallback profile
              const fallbackProfile = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: 'other_staff' as const
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
      console.log('Logging out user...');
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      await supabase.auth.signOut({ scope: 'global' });
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
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
