
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Stethoscope, 
  Pill, 
  FileText, 
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: 'home' | 'students' | 'visits' | 'medication' | 'reports') => void;
  userProfile: any;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ activeView, setActiveView, userProfile, collapsed, setCollapsed }: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { 
      id: 'students', 
      label: 'Student Profiles', 
      icon: Users,
      medicalOnly: true 
    },
    { 
      id: 'visits', 
      label: 'Clinic Visits', 
      icon: Stethoscope,
      medicalOnly: true 
    },
    { 
      id: 'medication', 
      label: 'Medication', 
      icon: Pill,
      medicalOnly: true 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      adminOnly: true 
    },
  ];

  const isMedicalStaff = ['nurse', 'clinical_officer', 'admin'].includes(userProfile?.role);
  const isAdmin = userProfile?.role === 'admin';

  const visibleItems = menuItems.filter(item => {
    if (item.medicalOnly && !isMedicalStaff) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'clinical_officer': return 'bg-blue-100 text-blue-800';
      case 'it_support': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'other_staff': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'nurse': return 'Nurse';
      case 'clinical_officer': return 'Clinical Officer';
      case 'it_support': return 'IT Support';
      case 'admin': return 'Administrator';
      case 'other_staff': return 'Staff';
      default: return 'User';
    }
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-blue-600" />
              <div>
                <span className="font-bold text-gray-900 text-sm">SHRMS</span>
                <div className="text-xs text-gray-500">🇰🇪 Kenya</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              collapsed && "px-2",
              activeView === item.id && "bg-blue-600 text-white hover:bg-blue-700"
            )}
            onClick={() => setActiveView(item.id as any)}
          >
            <item.icon className={cn("w-4 h-4", !collapsed && "mr-2")} />
            {!collapsed && item.label}
          </Button>
        ))}
      </nav>

      {/* User Role Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Role</div>
          <div className={cn(
            "px-2 py-1 rounded text-sm font-medium",
            getRoleColor(userProfile?.role || 'other_staff')
          )}>
            {getRoleDisplayName(userProfile?.role || 'other_staff')}
          </div>
          {userProfile?.department && (
            <div className="text-xs text-gray-500 mt-1">
              {userProfile.department}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
