
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Auth from './Auth';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer profile fetching to avoid deadlocks
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 100);
      } else {
        setUserRole('');
        setLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Try to get existing profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      // If no profile exists, create one with default values
      if (!profile) {
        console.log('No profile found, creating default profile');
        const { data: user } = await supabase.auth.getUser();
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.user?.email || '',
            full_name: user.user?.user_metadata?.full_name || user.user?.email || '',
            role: 'nurse'
          })
          .select('role')
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Set default role even if creation fails
          setUserRole('nurse');
        } else {
          setUserRole(newProfile?.role || 'nurse');
        }
      } else {
        setUserRole(profile.role || 'nurse');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      // Set default role on any error
      setUserRole('nurse');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">School Health System</h2>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <Dashboard userRole={userRole} />;
};

export default Index;
