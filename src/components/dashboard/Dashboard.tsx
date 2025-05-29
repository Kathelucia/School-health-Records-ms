
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
    switch (activeView) {
      case 'home':
        return <DashboardHome userProfile={userProfile} />;
      case 'students':
        return <StudentProfiles userProfile={userProfile} />;
      case 'visits':
        return <ClinicVisits userProfile={userProfile} />;
      case 'medication':
        return <MedicationInventory userProfile={userProfile} />;
      case 'reports':
        return <Reports userProfile={userProfile} />;
      default:
        return <DashboardHome userProfile={userProfile} />;
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
