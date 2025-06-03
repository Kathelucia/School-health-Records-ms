
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Users,
  Stethoscope,
  Pill,
  FileText,
  Bell,
  Settings,
  LogOut,
  Syringe,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userRole: string;
  unreadNotifications?: number;
}

const Sidebar = ({ 
  currentView, 
  onViewChange, 
  onLogout, 
  userRole,
  unreadNotifications = 0 
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'System overview and statistics'
    },
    {
      id: 'students',
      label: 'Student Profiles',
      icon: Users,
      description: 'Manage student health records'
    },
    {
      id: 'clinic',
      label: 'Clinic Visits',
      icon: Stethoscope,
      description: 'Log and track medical visits'
    },
    {
      id: 'immunizations',
      label: 'Immunizations',
      icon: Syringe,
      description: 'Vaccination tracking and compliance'
    },
    {
      id: 'medications',
      label: 'Medication Inventory',
      icon: Pill,
      description: 'Manage medication stock'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Health analytics and compliance reports'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'System alerts and updates',
      badge: unreadNotifications > 0 ? unreadNotifications : undefined
    }
  ];

  // Admin-only items
  if (userRole === 'admin') {
    menuItems.push({
      id: 'audit',
      label: 'Audit Logs',
      icon: Shield,
      description: 'System activity tracking'
    });
  }

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "md:relative fixed inset-y-0 left-0 z-40",
        collapsed && "md:w-16"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          {!collapsed ? (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Health Records</h1>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  collapsed && "px-3",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => onViewChange(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3 w-full">
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-75 mt-1">{item.description}</p>
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start p-3",
              collapsed && "px-3"
            )}
            onClick={() => onViewChange('settings')}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Settings</span>}
          </Button>
          
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start p-3 text-red-600 hover:text-red-700 hover:bg-red-50",
              collapsed && "px-3"
            )}
            onClick={onLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
