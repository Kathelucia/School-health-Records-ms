
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Auth from './Auth';
import Dashboard from '@/components/dashboard/Dashboard';
import DashboardHome from '@/components/dashboard/DashboardHome';
import StudentProfiles from '@/components/students/StudentProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import MedicationInventorySystem from '@/components/medication/MedicationInventorySystem';
import BulkUpload from '@/components/database/BulkUpload';
import Settings from '@/components/settings/Settings';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole('');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        toast.error('Error loading user profile');
      } else {
        setUserRole(data?.role || 'nurse');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Dashboard userRole={userRole}>
      <Routes>
        <Route path="/" element={<DashboardHome userRole={userRole} />} />
        <Route path="/students" element={<StudentProfiles userRole={userRole} />} />
        <Route path="/clinic" element={<ClinicVisits userRole={userRole} />} />
        <Route path="/immunizations" element={<ImmunizationManagement userRole={userRole} />} />
        <Route path="/medications" element={<MedicationInventorySystem userRole={userRole} />} />
        <Route path="/upload" element={<BulkUpload userRole={userRole} />} />
        <Route path="/settings" element={<Settings userRole={userRole} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Dashboard>
  );
};

export default Index;
