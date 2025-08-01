
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const NotificationsPage = () => {
  const [userRole, setUserRole] = useState('nurse');

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.user_role || 'nurse');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  return <NotificationCenter userRole={userRole} />;
};

export default NotificationsPage;
