
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
    <aside className="w-72 bg-card border-r border-border flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="icon-container bg-gradient-to-r from-primary to-accent">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">SHRMS</h1>
            <p className="text-sm text-muted-foreground">Health Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:from-primary/90 hover:to-accent/90" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isActive ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {item.label}
                  </p>
                  <p className={cn(
                    "text-xs truncate",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
      <div className="p-4 border-t border-border">
        <div className={cn(
          "card-professional p-4 border",
          isAdmin 
            ? "bg-destructive/5 border-destructive/20" 
            : "bg-primary/5 border-primary/20"
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isAdmin ? "bg-destructive/10" : "bg-primary/10"
            )}>
              <Shield className={cn(
                "w-4 h-4",
                isAdmin ? "text-destructive" : "text-primary"
              )} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Current Role
              </p>
              <p className={cn(
                "text-sm font-semibold",
                isAdmin ? "text-destructive" : "text-primary"
              )}>
                {isAdmin ? 'System Administrator' : 'School Nurse'}
              </p>
              {isAdmin && (
                <p className="text-xs text-destructive/80 mt-1">
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
