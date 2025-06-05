
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
      } else {
        setLoading(false);
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setupUserProfile = async (user: any) => {
    try {
      console.log('Setting up profile for user:', user.id);
      setLoading(true);
      
      // First try to fetch existing profile with retry logic
      let profile = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!profile && attempts < maxAttempts) {
        console.log(`Profile fetch attempt ${attempts + 1}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          if (error.code !== 'PGRST116') {
            break;
          }
        } else if (data) {
          profile = data;
          break;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (profile) {
        console.log('Profile found:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found, creating one...');
        
        // Create profile with better error handling
        const profileData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: user.user_metadata?.role || 'other_staff'
        };
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          
          // If creation failed, try one more fetch (might have been created by trigger)
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          if (retryProfile) {
            console.log('Profile found on retry:', retryProfile);
            setUserProfile(retryProfile);
          } else {
            // Create a temporary profile object for the session
            console.log('Using temporary profile');
            setUserProfile({
              id: user.id,
              email: user.email,
              full_name: user.email?.split('@')[0] || 'User',
              role: 'other_staff',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } else {
          console.log('Profile created successfully:', newProfile);
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in setupUserProfile:', error);
      // Create emergency fallback profile
      setUserProfile({
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'User',
        role: 'other_staff',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
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
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
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
