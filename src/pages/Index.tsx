
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Get initial session
    const getInitialSession = async () => {
      console.log('Checking existing session...');
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log('Initial session check:', initialSession?.user?.email || 'No session');
      setSession(initialSession);
      
      if (initialSession?.user) {
        await setupUserProfile(initialSession.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      setSession(session);
      
      if (session?.user) {
        await setupUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setupUserProfile = async (userId: string) => {
    try {
      console.log('Setting up profile for user:', userId);
      
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile fetch result:', { profile, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (profile) {
        console.log('Profile found:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found, should be created by trigger');
        // The profile should be created by the database trigger
        // Let's try fetching again after a short delay
        setTimeout(async () => {
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (retryProfile) {
            setUserProfile(retryProfile);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUserProfile(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      userProfile={userProfile} 
      onLogout={handleLogout} 
    />
  );
};

export default Index;
