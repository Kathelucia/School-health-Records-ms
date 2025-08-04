
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
  Shield,
  Activity
} from 'lucide-react';

interface MedicalSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

const MedicalSidebar = ({ activeView, onViewChange, userRole }: MedicalSidebarProps) => {
  const isAdmin = userRole === 'admin';
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: Home,
      roles: ['admin', 'nurse'],
      description: 'Main dashboard and statistics'
    },
    {
      id: 'students',
      label: 'Student Records',
      icon: Users,
      roles: ['admin', 'nurse'],
      description: 'Manage student profiles'
    },
    {
      id: 'clinic',
      label: 'Clinic Visits',
      icon: Stethoscope,
      roles: ['admin', 'nurse'],
      description: 'Record clinic visits'
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: Pill,
      roles: ['admin', 'nurse'],
      description: 'Medication inventory'
    },
    {
      id: 'immunizations',
      label: 'Immunizations',
      icon: Syringe,
      roles: ['admin', 'nurse'],
      description: 'Vaccination tracking'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin', 'nurse'],
      description: 'Health reports and data'
    },
    {
      id: 'staff',
      label: 'Staff Profiles',
      icon: UserCheck,
      roles: ['admin', 'nurse'],
      description: 'Staff management'
    },
    {
      id: 'bulk-upload',
      label: 'Bulk Data Upload',
      icon: Database,
      roles: ['admin', 'nurse'],
      description: 'Import CSV data'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      roles: ['admin', 'nurse'],
      description: 'System alerts'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['admin', 'nurse'],
      description: 'System configuration'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SHRMS</h1>
            <p className="text-sm text-gray-500">Health Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Navigation
          </h2>
        </div>
        
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-12 px-4 mb-1 transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md hover:from-blue-700 hover:to-green-700" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isActive ? "text-white" : "text-gray-900"
                  )}>
                    {item.label}
                  </p>
                  <p className={cn(
                    "text-xs truncate",
                    isActive ? "text-blue-100" : "text-gray-500"
                  )}>
                    {item.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="p-4 border-t border-gray-100">
        <div className={cn(
          "rounded-lg p-4 border",
          isAdmin 
            ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200" 
            : "bg-gradient-to-r from-blue-50 to-green-50 border-blue-200"
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isAdmin ? "bg-red-100" : "bg-blue-100"
            )}>
              <Shield className={cn(
                "w-4 h-4",
                isAdmin ? "text-red-600" : "text-blue-600"
              )} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Current Role
              </p>
              <p className={cn(
                "text-sm font-semibold",
                isAdmin ? "text-red-800" : "text-blue-800"
              )}>
                {isAdmin ? 'System Administrator' : 'School Nurse'}
              </p>
              {isAdmin && (
                <p className="text-xs text-red-600 mt-1">
                  Full system access
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MedicalSidebar;
