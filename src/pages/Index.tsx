
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
      
      // Quick profile fetch with shorter timeout
      console.log('Fetching profile...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        // Create fallback profile immediately on any error
        createFallbackProfile(user);
        return;
      }

      if (profile) {
        console.log('Profile found:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found, creating fallback profile...');
        createFallbackProfile(user);
      }
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
      // Create emergency fallback profile
      createFallbackProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const createFallbackProfile = (user: any) => {
    console.log('Creating fallback profile for immediate dashboard access');
    const fallbackProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role || 'other_staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUserProfile(fallbackProfile);
    
    // Try to create the actual profile in the background
    setTimeout(async () => {
      try {
        await supabase
          .from('profiles')
          .insert(fallbackProfile)
          .select()
          .single();
        console.log('Background profile creation successful');
      } catch (error) {
        console.log('Background profile creation failed, but fallback is working:', error);
      }
    }, 1000);
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
    return <LoadingSpinner message="Loading dashboard..." subMessage="Almost there!" />;
  }

  if (!session) {
    return <LoadingSpinner message="Redirecting to login..." subMessage="Just a moment..." />;
  }

  if (!userProfile) {
    return <LoadingSpinner message="Setting up profile..." subMessage="This will be quick!" />;
  }

  return (
    <Dashboard 
      userProfile={userProfile} 
      onLogout={handleLogout} 
    />
  );
};

export default Index;
