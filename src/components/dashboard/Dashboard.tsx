
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MedicalHeader from './MedicalHeader';
import MedicalSidebar from './MedicalSidebar';
import DashboardHome from './DashboardHome';
import StudentProfiles from '@/components/students/StudentProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import MedicationInventorySystem from '@/components/medication/MedicationInventorySystem';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import InsuranceManagement from '@/components/insurance/InsuranceManagement';
import Reports from '@/components/reports/Reports';
import ReportDownloader from '@/components/reports/ReportDownloader';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import Settings from '@/components/settings/Settings';
import StaffManagement from '@/components/settings/StaffManagement';
import ContactAdmin from '@/components/settings/ContactAdmin';
import StaffProfiles from '@/components/staff/StaffProfiles';
import BulkUpload from '@/components/database/BulkUpload';
import AuditLogs from '@/components/audit/AuditLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardProps {
  userRole: string;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);

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
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome userRole={userRole} onNavigate={handleNavigate} />;
      
      case 'students':
        return <StudentProfiles userRole={userRole} />;
      
      case 'clinic':
        return <ClinicVisits userRole={userRole} />;
      
      case 'medications':
        return <MedicationInventorySystem userRole={userRole} />;
      
      case 'immunizations':
        return <ImmunizationManagement userRole={userRole} />;
      
      case 'insurance':
        return <InsuranceManagement userRole={userRole} />;
      
      case 'staff':
        return <StaffProfiles userRole={userRole} />;
      
      case 'reports':
        return (
          <div className="p-6">
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
                <TabsTrigger value="downloads">Download Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics">
                <Reports userRole={userRole} />
              </TabsContent>
              
              <TabsContent value="downloads">
                <ReportDownloader userRole={userRole} />
              </TabsContent>
            </Tabs>
          </div>
        );
      
      case 'notifications':
        return <NotificationCenter userRole={userRole} />;
      
      case 'bulk-upload':
        return <BulkUpload userRole={userRole} />;
      
      case 'audit':
        return <AuditLogs userRole={userRole} />;
      
      case 'settings':
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
      
      default:
        return <DashboardHome userRole={userRole} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MedicalHeader userRole={userRole} userProfile={userProfile} />
      <div className="flex">
        <MedicalSidebar 
          userRole={userRole} 
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
