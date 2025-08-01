
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Stethoscope, 
  Pill, 
  Syringe, 
  FileText,
  Settings,
  BarChart3,
  UserCheck,
  Database,
  Bell,
  Shield
} from 'lucide-react';

interface MedicalSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

const MedicalSidebar = ({ activeView, onViewChange, userRole }: MedicalSidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['admin', 'nurse', 'medical_officer', 'other_staff']
    },
    {
      id: 'students',
      label: 'Student Records',
      icon: Users,
      roles: ['admin', 'nurse', 'medical_officer']
    },
    {
      id: 'clinic',
      label: 'Clinic Visits',
      icon: Stethoscope,
      roles: ['admin', 'nurse', 'medical_officer']
    },
    {
      id: 'medications',
      label: 'Medication Inventory',
      icon: Pill,
      roles: ['admin', 'nurse', 'medical_officer']
    },
    {
      id: 'immunizations',
      label: 'Immunizations',
      icon: Syringe,
      roles: ['admin', 'nurse', 'medical_officer']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin', 'nurse', 'medical_officer']
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: UserCheck,
      roles: ['admin']
    },
    {
      id: 'bulk-upload',
      label: 'Data Import',
      icon: Database,
      roles: ['admin']
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      roles: ['admin', 'nurse', 'medical_officer']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole.toLowerCase())
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-10 px-3",
                isActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {userRole === 'admin' && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Administrator Access</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default MedicalSidebar;
