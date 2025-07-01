
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import StudentProfiles from '@/components/students/StudentProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import MedicationInventory from '@/components/medication/MedicationInventory';
import AuditLogs from '@/components/audit/AuditLogs';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import Settings from '@/components/settings/Settings';
import BulkUpload from '@/components/database/BulkUpload';
import ReportDownloader from '@/components/reports/ReportDownloader';
import StaffManagement from '@/components/settings/StaffManagement';

interface DashboardProps {
  userProfile: any;
  onLogout: () => void;
}

const Dashboard = ({ userProfile, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome userRole={userProfile.role} onTabChange={handleTabChange} />;
      case 'students':
        return <StudentProfiles userRole={userProfile.role} />;
      case 'clinic':
        return <ClinicVisits userRole={userProfile.role} />;
      case 'immunizations':
        return <ImmunizationManagement userRole={userProfile.role} />;
      case 'medication':
        return <MedicationInventory userRole={userProfile.role} />;
      case 'reports':
        return <ReportDownloader userRole={userProfile.role} />;
      case 'bulk-upload':
        return <BulkUpload userRole={userProfile.role} />;
      case 'audit':
        return <AuditLogs userRole={userProfile.role} />;
      case 'notifications':
        return <NotificationCenter userRole={userProfile.role} />;
      case 'settings':
        return <Settings userProfile={userProfile} onProfileUpdate={() => {}} />;
      case 'staff-management':
        return <StaffManagement />;
      default:
        return <DashboardHome userRole={userProfile.role} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        isOpen={isSidebarOpen}
        userRole={userProfile.role}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          userProfile={userProfile} 
          onLogout={onLogout} 
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          currentView={activeTab}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
