
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BulkUpload from '@/components/database/BulkUpload';

const BulkUploadPage = () => {
  const [userRole, setUserRole] = useState('nurse');
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <BulkUpload userRole={userRole} />;
};

export default BulkUploadPage;
