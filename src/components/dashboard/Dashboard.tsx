
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import StudentProfiles from '../students/StudentProfiles';
import ClinicVisits from '../clinic/ClinicVisits';
import MedicationInventory from '../medication/MedicationInventory';
import Reports from '../reports/Reports';

interface DashboardProps {
  userProfile: any;
  onLogout: () => void;
}

type ActiveView = 'home' | 'students' | 'visits' | 'medication' | 'reports';

const Dashboard = ({ userProfile, onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    const userRole = userProfile?.role || 'other_staff';
    
    switch (activeView) {
      case 'home':
        return <DashboardHome userRole={userRole} />;
      case 'students':
        return <StudentProfiles userRole={userRole} />;
      case 'visits':
        return <ClinicVisits userRole={userRole} />;
      case 'medication':
        return <MedicationInventory userRole={userRole} />;
      case 'reports':
        return <Reports userRole={userRole} />;
      default:
        return <DashboardHome userRole={userRole} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        userProfile={userProfile}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userProfile={userProfile}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
