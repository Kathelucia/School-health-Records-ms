
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  userProfile: any;
  currentView: string;
  onLogout: () => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ userProfile, currentView, onLogout, onMenuClick, isSidebarOpen }: HeaderProps) => {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'nurse': return 'School Nurse';
      case 'clinical_officer': return 'Clinical Officer';
      case 'it_support': return 'IT Support';
      case 'admin': return 'System Administrator';
      case 'other_staff': return 'Staff Member';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'clinical_officer': return 'bg-blue-100 text-blue-800';
      case 'it_support': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'other_staff': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPageTitle = (view: string) => {
    switch (view) {
      case 'home': return 'Dashboard Overview';
      case 'students': return 'Student Health Profiles';
      case 'clinic': return 'Clinic Visit Management';
      case 'immunizations': return 'Immunization Records';
      case 'medication': return 'Medication Inventory';
      case 'reports': return 'Health Reports & Analytics';
      case 'notifications': return 'System Notifications';
      case 'audit': return 'Audit Trail';
      case 'settings': return 'System Settings';
      case 'bulk-upload': return 'Bulk Data Upload';
      default: return 'Health Records Management';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle(currentView)}
          </h1>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-KE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <span className="text-xs text-green-600">🇰🇪</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-gray-100 transition-colors duration-200"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-900">
                {userProfile?.full_name || 'User'}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(userProfile?.role)}`}>
                {getRoleDisplayName(userProfile?.role)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              ID: {userProfile?.employee_id || 'N/A'} • {userProfile?.department || 'General'}
            </div>
          </div>
          
          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
