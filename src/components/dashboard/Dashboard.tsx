
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
import Reports from '@/components/reports/Reports';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardProps {
  userRole: string;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    if (userRole) {
      fetchUserProfile();
    }
  }, [userRole]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to get profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        // Create profile object with available data
        setUserProfile({
          id: user.id,
          email: profile?.email || user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
          role: profile?.role || userRole,
          phone_number: profile?.phone_number || '',
          employee_id: profile?.employee_id || '',
          department: profile?.department || '',
          created_at: profile?.created_at || user.created_at,
          updated_at: profile?.updated_at || user.updated_at
        });
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
    if (path === '/' || path === '') return 'home';
    if (path.includes('/students')) return 'students';
    if (path.includes('/staff')) return 'staff';
    if (path.includes('/clinic')) return 'clinic';
    if (path.includes('/immunizations')) return 'immunizations';
    if (path.includes('/medications')) return 'medication';
    if (path.includes('/insurance')) return 'insurance';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/upload')) return 'bulk-upload';
    if (path.includes('/settings')) return 'settings';
    return 'home';
  };

  // Don't render until we have a userRole
  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
            <Route path="/reports" element={<Reports userRole={userRole} />} />
            <Route path="/upload" element={<BulkUpload userRole={userRole} />} />
            <Route path="/settings" element={<Settings userRole={userRole} onProfileUpdate={fetchUserProfile} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
