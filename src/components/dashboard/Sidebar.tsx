
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  UserCheck,
  Stethoscope, 
  Pill,
  Shield,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Student Profiles', href: '/students', icon: Users },
  { name: 'Staff Profiles', href: '/staff', icon: UserCheck },
  { name: 'Clinic Visits', href: '/clinic', icon: Stethoscope },
  { name: 'Immunizations', href: '/immunizations', icon: Shield },
  { name: 'Medication Inventory', href: '/medications', icon: Pill },
  { name: 'Insurance (NHIF/SHA)', href: '/insurance', icon: CreditCard },
  { name: 'Bulk Upload', href: '/upload', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  userRole: string;
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Health System</h1>
                <p className="text-xs text-gray-600">School Management</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-3 rounded-lg transition-all duration-200 group",
                "hover:bg-gray-50 hover:scale-105 hover:shadow-sm",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center",
                "animate-slide-in-right"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                !collapsed && "mr-3"
              )} />
              {!collapsed && (
                <span className="text-sm font-medium transition-all duration-200">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Current Role</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                userRole === 'admin' ? 'bg-purple-500' : 'bg-green-500'
              )}></div>
              <p className="text-sm font-semibold text-gray-900">
                {userRole === 'admin' ? 'School Administrator' : 'School Nurse'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
