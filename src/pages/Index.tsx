
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
        await setupUserProfile(initialSession.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      setSession(session);
      
      if (session?.user) {
        await setupUserProfile(session.user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setupUserProfile = async (user: any) => {
    try {
      console.log('Setting up profile for user:', user.id);
      
      // First try to fetch existing profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
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
        console.log('No profile found, creating one...');
        // Create profile manually if trigger didn't work
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role: user.user_metadata?.role || 'other_staff'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // If creation failed, try fetching again (might have been created by trigger)
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          if (retryProfile) {
            setUserProfile(retryProfile);
          }
        } else {
          console.log('Profile created:', newProfile);
          setUserProfile(newProfile);
        }
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
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
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
