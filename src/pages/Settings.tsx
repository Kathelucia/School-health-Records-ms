
import Settings from '@/components/settings/Settings';
import StaffManagement from '@/components/settings/StaffManagement';
import ContactAdmin from '@/components/settings/ContactAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const [userRole, setUserRole] = useState('nurse');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.user_role || 'nurse');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="p-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          {isAdmin && <TabsTrigger value="staff">Staff Management</TabsTrigger>}
          <TabsTrigger value="contact">Contact Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Settings userRole={userRole} onProfileUpdate={fetchUserProfile} />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="staff">
            <StaffManagement />
          </TabsContent>
        )}
        
        <TabsContent value="contact">
          <ContactAdmin userProfile={userProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
