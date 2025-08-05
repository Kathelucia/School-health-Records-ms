
import Dashboard from '@/components/dashboard/Dashboard';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const [userRole, setUserRole] = useState('nurse');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user session...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setError('Failed to authenticate user');
        return;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        setUserRole('nurse'); // Default fallback
        return;
      }

      console.log('User authenticated:', user.id);
      console.log('Fetching user profile...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role, role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If no profile exists, create one
        if (profileError.code === 'PGRST116') {
          console.log('Creating new profile for user');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || 'Unknown User',
              email: user.email,
              user_role: 'nurse'
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            setError('Failed to create user profile');
          } else {
            setUserRole('nurse');
            toast.success('Profile created successfully');
          }
        } else {
          setError('Failed to load user profile');
        }
      } else if (profile) {
        console.log('Profile loaded:', profile);
        setUserRole(profile.user_role || profile.role || 'nurse');
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchUserRole:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SHRMS Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Please try refreshing the page or contact your administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <Dashboard userRole={userRole} />;
};

export default Index;
