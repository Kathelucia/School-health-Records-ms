
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import StudentProfiles from '@/components/students/StudentProfiles';
import StaffProfiles from '@/components/staff/StaffProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import MedicationInventorySystem from '@/components/medication/MedicationInventorySystem';
import BulkUpload from '@/components/database/BulkUpload';
import Settings from '@/components/settings/Settings';
import InsuranceManagement from '@/components/insurance/InsuranceManagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardProps {
  userRole: string;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Force page refresh to ensure clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error('Error logging out: ' + error.message);
    }
  };

  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/students')) return 'students';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/clinic')) return 'clinic';
    if (path.startsWith('/immunizations')) return 'immunizations';
    if (path.startsWith('/medications')) return 'medication';
    if (path.startsWith('/insurance')) return 'insurance';
    if (path.startsWith('/upload')) return 'bulk-upload';
    if (path.startsWith('/settings')) return 'settings';
    return 'home';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          userProfile={userProfile}
          currentView={getCurrentView()}
          onLogout={handleLogout}
          onMenuClick={() => {}}
          isSidebarOpen={true}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 animate-fade-in">
          <Routes>
            <Route path="/" element={<DashboardHome userRole={userRole} />} />
            <Route path="/students" element={<StudentProfiles userRole={userRole} />} />
            <Route path="/staff" element={<StaffProfiles userRole={userRole} />} />
            <Route path="/clinic" element={<ClinicVisits userRole={userRole} />} />
            <Route path="/immunizations" element={<ImmunizationManagement userRole={userRole} />} />
            <Route path="/medications" element={<MedicationInventorySystem userRole={userRole} />} />
            <Route path="/insurance" element={<InsuranceManagement userRole={userRole} />} />
            <Route path="/upload" element={<BulkUpload userRole={userRole} />} />
            <Route path="/settings" element={<Settings userRole={userRole} onProfileUpdate={fetchUserProfile} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
