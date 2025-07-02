
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Stethoscope, 
  Pill,
  Shield,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Student Profiles', href: '/students', icon: Users },
  { name: 'Clinic Visits', href: '/clinic', icon: Stethoscope },
  { name: 'Immunizations', href: '/immunizations', icon: Shield },
  { name: 'Medication Inventory', href: '/medications', icon: Pill },
  { name: 'Bulk Upload', href: '/upload', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  userRole: string;
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Filter navigation based on user role - both admin and nurse have same access now
  const filteredNavigation = navigation;

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">Health System</h1>
            <p className="text-sm text-gray-600">School Management</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Role</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {userRole === 'admin' ? 'School Administrator' : 'School Nurse'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
