
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  userProfile: any;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header = ({ userProfile, onLogout, onToggleSidebar }: HeaderProps) => {
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Health Records Management
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-KE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {userProfile?.full_name || 'User'}
          </div>
          <div className="text-xs text-gray-500">
            {getRoleDisplayName(userProfile?.role)} • {userProfile?.employee_id || 'N/A'}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
