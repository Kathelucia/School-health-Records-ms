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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        setSession(session);
        // Create immediate fallback profile for fast access
        const profile = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'other_staff',
          employee_id: `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          department: 'Health Services',
          phone_number: session.user.user_metadata?.phone || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUserProfile(profile);
        setLoading(false);
        
        // Try to get/create real profile in background
        setTimeout(() => {
          setupUserProfile(session.user, profile);
        }, 100);
      } else {
        setSession(null);
        setUserProfile(null);
        setLoading(false);
        // Only redirect to auth if we're not already there
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    });

    // Check for existing session
    const checkSession = async () => {
      console.log('Checking existing session...');
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      console.log('Existing session:', existingSession?.user?.email || 'No session');
      
      if (!existingSession?.user) {
        setLoading(false);
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
      // If session exists, the auth state change listener will handle it
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const setupUserProfile = async (user: any, fallbackProfile: any) => {
    try {
      console.log('Setting up profile for user:', user.id);
      
      // Try to fetch existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Fetched profile:', profile);

      if (error && !error.message.includes('No rows')) {
        console.error('Profile fetch error:', error);
        return; // Keep using fallback
      }

      if (profile) {
        console.log('Profile found:', profile);
        // Ensure profile has all necessary fields
        const completeProfile = {
          ...profile,
          employee_id: profile.employee_id || `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          department: profile.department || 'Health Services',
          is_active: profile.is_active !== undefined ? profile.is_active : true
        };
        setUserProfile(completeProfile);
      } else {
        console.log('No profile found, creating one...');
        // Try to create profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([fallbackProfile])
          .select()
          .maybeSingle();

        if (insertError) {
          console.error('Profile creation error:', insertError);
          // Keep using fallback profile
        } else if (newProfile) {
          console.log('Profile created successfully:', newProfile);
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
      // Keep using fallback profile
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      setLoading(true);
      
      // Clean up auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
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

  useEffect(() => {
    if (!session?.user) return;
    // Subscribe to changes on the current user's profile
    const channel = supabase.channel('profile-realtime-' + session.user.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => {
          console.log('Realtime profile change detected:', payload);
          // Refetch the user profile when it changes
          setupUserProfile(session.user, userProfile);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user]);

  // Debug log for userProfile before rendering Dashboard
  useEffect(() => {
    console.log('Rendering Dashboard with userProfile:', userProfile);
  }, [userProfile]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." subMessage="Setting up your session..." />;
  }

  if (!session || !userProfile) {
    return <LoadingSpinner message="Redirecting to login..." subMessage="Just a moment..." />;
  }

  return (
    <Dashboard 
      userProfile={userProfile} 
      onLogout={handleLogout} 
    />
  );
};

export default Index;
