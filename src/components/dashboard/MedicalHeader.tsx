
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User, LogOut, Shield, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MedicalHeaderProps {
  userRole: string;
  userProfile: any;
}

const MedicalHeader = ({ userRole, userProfile }: MedicalHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'nurse': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'clinical_officer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'nurse': return 'School Nurse';
      case 'clinical_officer': return 'Clinical Officer';
      default: return 'Medical Staff';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - System Branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SHRMS</h1>
              <p className="text-xs text-gray-600">School Health Records Management</p>
            </div>
          </div>
          
          {/* Current Date/Time */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Right Section - User Info & Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.full_name || 'Medical Staff'}
              </p>
              <Badge className={`text-xs ${getRoleBadgeColor(userRole)} border`}>
                {formatRole(userRole)}
              </Badge>
            </div>
          </div>

          {/* Sign Out */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Emergency Alert Bar (if needed) */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 hidden">
        <div className="flex items-center justify-center space-x-2 text-amber-800">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">System Maintenance Scheduled: Today 11:00 PM - 12:00 AM</span>
        </div>
      </div>
    </header>
  );
};

export default MedicalHeader;
