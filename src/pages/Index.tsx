
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
      setSession(initialSession);
      
      if (initialSession?.user) {
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
      setSession(session);
      
      if (session?.user) {
        await setupUserProfile(session.user);
      } else {
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
      setLoading(true);
      
      // Simple profile fetch with quick fallback
      console.log('Fetching profile...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        // Create emergency fallback profile
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: user.user_metadata?.role || 'other_staff',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUserProfile(fallbackProfile);
        toast.error('Profile not found. Using temporary profile.');
        return;
      }

      if (profile) {
        console.log('Profile found:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found, this should not happen with the trigger');
        // Create emergency fallback profile
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: user.user_metadata?.role || 'other_staff',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUserProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
      // Create emergency fallback profile to prevent blocking
      setUserProfile({
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'User',
        role: 'other_staff',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      toast.error('Error loading profile. Using temporary profile.');
    } finally {
      setLoading(false);
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
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <LoadingSpinner message="Redirecting to login..." />;
  }

  if (!userProfile) {
    return <LoadingSpinner message="Setting up your profile..." />;
  }

  return (
    <Dashboard 
      userProfile={userProfile} 
      onLogout={handleLogout} 
    />
  );
};

export default Index;
