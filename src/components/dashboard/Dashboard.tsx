
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import existing components
import StudentProfiles from '@/components/students/StudentProfiles';
import StaffProfiles from '@/components/staff/StaffProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import MedicationInventorySystem from '@/components/medication/MedicationInventorySystem';
import InsuranceManagement from '@/components/insurance/InsuranceManagement';
import Reports from '@/components/reports/Reports';
import BulkUpload from '@/components/database/BulkUpload';
import Settings from '@/components/settings/Settings';

// Import new medical-focused components
import MedicalHeader from './MedicalHeader';
import MedicalSidebar from './MedicalSidebar';
import MedicalDashboard from './MedicalDashboard';

interface DashboardProps {
  userRole: string;
}

const Dashboard = ({ userRole: propUserRole }: DashboardProps) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(propUserRole || 'nurse');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Update activeView based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') {
      setActiveView('dashboard');
    } else if (path.includes('/students')) {
      setActiveView('students');
    } else if (path.includes('/clinic')) {
      setActiveView('clinic');
    } else if (path.includes('/medications')) {
      setActiveView('medications');
    } else if (path.includes('/immunizations')) {
      setActiveView('immunizations');
    } else if (path.includes('/reports')) {
      setActiveView('reports');
    } else if (path.includes('/staff')) {
      setActiveView('staff');
    } else if (path.includes('/upload')) {
      setActiveView('bulk-upload');
    } else if (path.includes('/settings')) {
      setActiveView('settings');
    } else if (path.includes('/notifications')) {
      setActiveView('notifications');
    }
  }, [location.pathname]);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    
    // Navigate to the corresponding route
    switch (view) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'students':
        navigate('/dashboard/students');
        break;
      case 'clinic':
        navigate('/dashboard/clinic');
        break;
      case 'medications':
        navigate('/dashboard/medications');
        break;
      case 'immunizations':
        navigate('/dashboard/immunizations');
        break;
      case 'reports':
        navigate('/dashboard/reports');
        break;
      case 'staff':
        navigate('/dashboard/staff');
        break;
      case 'bulk-upload':
        navigate('/dashboard/upload');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      case 'notifications':
        // For now, just set active view without navigation
        break;
      default:
        navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetchUserProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile();
        } else {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (propUserRole) {
      setUserRole(propUserRole);
    }
  }, [propUserRole]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          toast.error('Error loading user profile');
        } else if (profile) {
          setUserProfile(profile);
          setUserRole(profile.user_role || profile.role || propUserRole || 'nurse');
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Medical System</h2>
          <p className="text-gray-600">Initializing health records management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <MedicalSidebar 
        userRole={userRole} 
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      
      <div className="flex-1 flex flex-col">
        <MedicalHeader userRole={userRole} userProfile={userProfile} />
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<MedicalDashboard userRole={userRole} />} />
            <Route path="/students/*" element={<StudentProfiles userRole={userRole} />} />
            <Route path="/staff/*" element={<StaffProfiles userRole={userRole} />} />
            <Route path="/clinic/*" element={<ClinicVisits userRole={userRole} />} />
            <Route path="/immunizations/*" element={<ImmunizationManagement userRole={userRole} />} />
            <Route path="/medications/*" element={<MedicationInventorySystem userRole={userRole} />} />
            <Route path="/insurance/*" element={<InsuranceManagement userRole={userRole} />} />
            <Route path="/reports/*" element={<Reports userRole={userRole} />} />
            <Route path="/upload/*" element={<BulkUpload userRole={userRole} />} />
            <Route path="/settings/*" element={<Settings userRole={userRole} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
