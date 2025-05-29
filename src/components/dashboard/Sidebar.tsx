
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
  userRole: 'nurse' | 'admin';
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ activeView, setActiveView, userRole, collapsed, setCollapsed }: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Student Profiles', icon: Users },
    { id: 'visits', label: 'Clinic Visits', icon: Stethoscope },
    { id: 'medication', label: 'Medication', icon: Pill },
    { id: 'reports', label: 'Reports', icon: FileText, adminOnly: true },
  ];

  const visibleItems = menuItems.filter(item => !item.adminOnly || userRole === 'admin');

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
              <span className="font-bold text-gray-900">SHRMS</span>
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
          <div className="text-xs text-gray-500 uppercase tracking-wide">Role</div>
          <div className="mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            {userRole === 'admin' ? 'Administrator' : 'Nurse'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
