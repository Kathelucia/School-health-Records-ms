
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Dashboard from "@/components/dashboard/Dashboard";
import LoadingSpinner from "@/components/auth/LoadingSpinner";

const Index = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("nurse");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole("nurse");
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_role, role')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
      }

      const role = profile?.user_role || profile?.role || 'nurse';
      setUserRole(role);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If no user is authenticated, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated, show the dashboard
  return <Dashboard userRole={userRole} />;
};

export default Index;
