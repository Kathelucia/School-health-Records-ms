
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import Dashboard from '@/components/dashboard/Dashboard';
import { toast } from 'sonner';

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
      
      if (initialSession?.user) {
        setSession(initialSession);
        await setupUserProfile(initialSession.user);
      } else {
        setLoading(false);
        // Redirect to auth page if no session
        window.location.href = '/auth';
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        setSession(session);
        await setupUserProfile(session.user);
      } else {
        setSession(null);
        setUserProfile(null);
        setLoading(false);
        // Redirect to auth page if no session
        window.location.href = '/auth';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setupUserProfile = async (user: any) => {
    try {
      console.log('Setting up profile for user:', user.id);
      
      // First, try a quick profile fetch with timeout
      console.log('Fetching profile...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      try {
        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Profile fetch error:', error);
          throw error;
        }

        if (profile) {
          console.log('Profile found:', profile);
          setUserProfile(profile);
        } else {
          console.log('No profile found, creating new profile...');
          await createNewProfile(user);
        }
      } catch (fetchError) {
        console.error('Profile fetch failed:', fetchError);
        // If fetch fails, create fallback profile
        await createNewProfile(user);
      }
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
      // Create emergency fallback profile
      createFallbackProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = async (user: any) => {
    try {
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'other_staff',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating new profile:', newProfile);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to create profile:', error);
      createFallbackProfile(user);
    }
  };

  const createFallbackProfile = (user: any) => {
    console.log('Creating fallback profile');
    const fallbackProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role || 'other_staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUserProfile(fallbackProfile);
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUserProfile(null);
      console.log('User logged out successfully');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Setting up your profile..." subMessage="This will be quick!" />;
  }

  if (!session) {
    return <LoadingSpinner message="Redirecting to login..." subMessage="Just a moment..." />;
  }

  if (!userProfile) {
    return <LoadingSpinner message="Almost ready..." subMessage="Finalizing your account..." />;
  }

  return (
    <Dashboard 
      userProfile={userProfile} 
      onLogout={handleLogout} 
    />
  );
};

export default Index;
