
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import StudentProfiles from '../students/StudentProfiles';
import ClinicVisits from '../clinic/ClinicVisits';
import ImmunizationManagement from '../immunizations/ImmunizationManagement';
import MedicationInventory from '../medication/MedicationInventory';
import Reports from '../reports/Reports';
import NotificationCenter from '../notifications/NotificationCenter';
import AuditLogs from '../audit/AuditLogs';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchNotificationCount();
    
    // Check for medication alerts periodically
    const alertInterval = setInterval(checkMedicationAlerts, 300000); // 5 minutes
    checkMedicationAlerts(); // Run immediately
    
    return () => clearInterval(alertInterval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error loading user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      setUnreadNotifications(count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const checkMedicationAlerts = async () => {
    try {
      // Call the medication alert function
      await supabase.rpc('check_medication_alerts');
      // Refresh notification count after checking alerts
      fetchNotificationCount();
    } catch (error) {
      console.error('Error checking medication alerts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  const renderContent = () => {
    const userRole = userProfile?.role || '';

    switch (currentView) {
      case 'dashboard':
        return <DashboardHome userRole={userRole} />;
      case 'students':
        return <StudentProfiles userRole={userRole} />;
      case 'clinic':
        return <ClinicVisits userRole={userRole} />;
      case 'immunizations':
        return <ImmunizationManagement userRole={userRole} />;
      case 'medications':
        return <MedicationInventory userRole={userRole} />;
      case 'reports':
        return <Reports userRole={userRole} />;
      case 'notifications':
        return <NotificationCenter userRole={userRole} />;
      case 'audit':
        return <AuditLogs userRole={userRole} />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DashboardHome userRole={userRole} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        userRole={userProfile?.role || ''}
        unreadNotifications={unreadNotifications}
      />
      
      <div className="flex-1 flex flex-col md:ml-0">
        <Header 
          userProfile={userProfile}
          currentView={currentView}
        />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
