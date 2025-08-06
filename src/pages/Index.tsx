
import Dashboard from '@/components/dashboard/Dashboard';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [userRole, setUserRole] = useState('nurse');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to defer profile fetch and prevent auth state blocking
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 100);
        } else {
          setLoading(false);
          setError(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: User) => {
    if (!user?.id) {
      console.error('No user ID provided');
      setError('Invalid user session');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user profile for:', user.id);
      
      // First check if user has admin role in metadata
      const userMetadataRole = user.user_metadata?.role;
      console.log('User metadata role:', userMetadataRole);
      
      // Try to fetch profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role, role, full_name, email')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // If profile doesn't exist, create one with role from user metadata
        if (profileError.code === 'PGRST116') {
          console.log('Creating new profile for user with role:', userMetadataRole || 'nurse');
          
          const defaultRole = userMetadataRole === 'admin' ? 'admin' : 'nurse';
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
              email: user.email || '',
              user_role: defaultRole,
              role: defaultRole
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            setError('Failed to create user profile. Please contact your administrator.');
          } else {
            console.log('Profile created successfully with role:', defaultRole);
            setUserRole(defaultRole);
            toast.success('Welcome! Your profile has been set up.');
          }
        } else {
          console.error('Profile fetch error:', profileError);
          setError('Unable to load your profile. Please try refreshing.');
        }
      } else if (profile) {
        console.log('Profile loaded:', profile);
        // Use user_role first, then fallback to role, then user metadata, then default to nurse
        const role = profile.user_role || profile.role || userMetadataRole || 'nurse';
        setUserRole(role);
        console.log('User role set to:', role);
      } else {
        // No profile exists, create default one using metadata role
        console.log('No profile found, creating default profile');
        const defaultRole = userMetadataRole === 'admin' ? 'admin' : 'nurse';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
            email: user.email || '',
            user_role: defaultRole,
            role: defaultRole
          });
        
        if (insertError) {
          console.error('Error creating default profile:', insertError);
          setError('Failed to create user profile. Please contact your administrator.');
        } else {
          console.log('Default profile created successfully with role:', defaultRole);
          setUserRole(defaultRole);
          toast.success('Welcome! Your profile has been set up.');
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchUserProfile:', error);
      setError('An unexpected error occurred. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (user) {
      fetchUserProfile(user);
    } else {
      // Try to get session again
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setError('No active session found. Please log in again.');
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">SHRMS</h1>
          <p className="text-gray-600">Loading School Health Records Management System...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">System Error</h1>
            </div>
            
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col space-y-3">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/auth'}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700">
                If this problem persists, please contact your system administrator 
                or check your internet connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard userRole={userRole} />;
};

export default Index;
