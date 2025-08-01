
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
  Activity,
  FileText,
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Medical Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Overview & quick stats'
  },
  { 
    name: 'Student Health Profiles', 
    href: '/students', 
    icon: Users,
    description: 'Medical records & profiles'
  },
  { 
    name: 'Staff Health Records', 
    href: '/staff', 
    icon: UserCheck,
    description: 'Employee health data'
  },
  { 
    name: 'Clinic Visits', 
    href: '/clinic', 
    icon: Stethoscope,
    description: 'Visit logs & treatments',
    priority: true
  },
  { 
    name: 'Immunization Records', 
    href: '/immunizations', 
    icon: Shield,
    description: 'Vaccination tracking'
  },
  { 
    name: 'Medication Inventory', 
    href: '/medications', 
    icon: Pill,
    description: 'Drug stock & dispensing'
  },
  { 
    name: 'Insurance Management', 
    href: '/insurance', 
    icon: CreditCard,
    description: 'NHIF/SHA coverage'
  },
  { 
    name: 'Health Reports', 
    href: '/reports', 
    icon: FileText,
    description: 'Analytics & compliance'
  },
  { 
    name: 'Data Import/Export', 
    href: '/upload', 
    icon: Upload,
    description: 'Bulk data operations'
  },
  { 
    name: 'System Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Configuration & security'
  },
];

interface MedicalSidebarProps {
  userRole: string;
}

const MedicalSidebar = ({ userRole }: MedicalSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm",
      collapsed ? "w-16" : "w-72"
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
                <h2 className="text-lg font-bold text-gray-900">Medical Center</h2>
                <p className="text-xs text-gray-600">Health Management Portal</p>
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

      {/* Quick Stats (when expanded) */}
      {!collapsed && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="font-semibold text-blue-600">24</div>
              <div className="text-gray-600">Today's Visits</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="font-semibold text-green-600">3</div>
              <div className="text-gray-600">Active Alerts</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {collapsed ? '' : 'Medical Operations'}
        </div>
        
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative",
                "hover:bg-blue-50 hover:scale-[1.02] hover:shadow-sm",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50",
                collapsed && "justify-center",
                "animate-slide-in-right"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                  !collapsed && "mr-3"
                )} />
                
                {!collapsed && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium transition-all duration-200">
                        {item.name}
                      </span>
                      {item.priority && (
                        <Badge className="bg-red-100 text-red-600 text-xs border-red-200 ml-2">
                          Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r"></div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-green-700">System Status: Online</p>
            </div>
            <p className="text-xs text-green-600 mt-1">All services operational</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalSidebar;
