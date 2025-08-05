import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MedicalHeader from './MedicalHeader';
import MedicalSidebar from './MedicalSidebar';
import DashboardHome from './DashboardHome';
import StudentProfiles from '@/components/students/StudentProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import MedicationInventorySystem from '@/components/medication/MedicationInventorySystem';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import InsuranceManagement from '@/components/insurance/InsuranceManagement';
import Reports from '@/components/reports/Reports';
import ReportDownloader from '@/components/reports/ReportDownloader';
import HealthAnalyticsDashboard from '@/components/reports/HealthAnalyticsDashboard';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import Settings from '@/components/settings/Settings';
import StaffManagement from '@/components/settings/StaffManagement';
import ContactAdmin from '@/components/settings/ContactAdmin';
import StaffProfiles from '@/components/staff/StaffProfiles';
import BulkUpload from '@/components/database/BulkUpload';
import AuditLogs from '@/components/audit/AuditLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield } from 'lucide-react';

interface DashboardProps {
  userRole: string;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Fetching profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load user profile. Please try refreshing the page.');
        } else {
          console.log('Profile loaded:', profile);
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    const isAdmin = userRole === 'admin' || userProfile?.user_role === 'admin';

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to SHRMS Dashboard
              </h1>
              <p className="text-gray-600">
                School Health Records Management System - 
                {isAdmin ? ' Administrator Access' : ' School Nurse Access'}
              </p>
              {isAdmin && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-semibold">Administrator Privileges Active</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    You have full system access including staff management and system settings.
                  </p>
                </div>
              )}
            </div>
            <DashboardHome userRole={userRole} onNavigate={handleNavigate} />
          </div>
        );
      
      case 'students':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Student Records</h1>
              <p className="text-gray-600">Manage student profiles and health information</p>
            </div>
            <StudentProfiles userRole={userRole} />
          </div>
        );
      
      case 'clinic':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Clinic Visits</h1>
              <p className="text-gray-600">Record and manage student clinic visits</p>
            </div>
            <ClinicVisits userRole={userRole} />
          </div>
        );
      
      case 'medications':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Medication Inventory</h1>
              <p className="text-gray-600">Manage medication stock and dispensing</p>
            </div>
            <MedicationInventorySystem userRole={userRole} />
          </div>
        );
      
      case 'immunizations':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Immunization Management</h1>
              <p className="text-gray-600">Track student vaccinations and compliance</p>
            </div>
            <ImmunizationManagement userRole={userRole} />
          </div>
        );
      
      case 'insurance':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Insurance Management</h1>
              <p className="text-gray-600">Manage NHIF/SHA insurance records</p>
            </div>
            <InsuranceManagement userRole={userRole} />
          </div>
        );
      
      case 'staff':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Staff Profiles</h1>
              <p className="text-gray-600">Manage school staff information</p>
            </div>
            <StaffProfiles userRole={userRole} />
          </div>
        );
      
      case 'reports':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive health analytics and reporting</p>
            </div>
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analytics">Health Analytics</TabsTrigger>
                <TabsTrigger value="reports">Standard Reports</TabsTrigger>
                <TabsTrigger value="downloads">Export Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics">
                <HealthAnalyticsDashboard userRole={userRole} />
              </TabsContent>
              
              <TabsContent value="reports">
                <Reports userRole={userRole} />
              </TabsContent>
              
              <TabsContent value="downloads">
                <ReportDownloader userRole={userRole} />
              </TabsContent>
            </Tabs>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">View system notifications and alerts</p>
            </div>
            <NotificationCenter userRole={userRole} />
          </div>
        );
      
      case 'bulk-upload':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Bulk Data Upload</h1>
              <p className="text-gray-600">Import data from CSV files</p>
            </div>
            <BulkUpload userRole={userRole} />
          </div>
        );
      
      case 'audit':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-gray-600">System activity and change logs</p>
            </div>
            <AuditLogs userRole={userRole} />
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage system and profile settings</p>
            </div>
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                {isAdmin && <TabsTrigger value="staff">Staff Management</TabsTrigger>}
                <TabsTrigger value="contact">Contact Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Settings userRole={userRole} onProfileUpdate={fetchUserProfile} />
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="staff">
                  <StaffManagement />
                </TabsContent>
              )}
              
              <TabsContent value="contact">
                <ContactAdmin userProfile={userProfile} />
              </TabsContent>
            </Tabs>
          </div>
        );
      
      default:
        return (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Not Found</CardTitle>
                <CardDescription>The requested page could not be found.</CardDescription>
              </CardHeader>
              <CardContent>
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Return to Dashboard
                </button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MedicalHeader userRole={userRole} userProfile={userProfile} />
      <div className="flex">
        <MedicalSidebar 
          userRole={userRole} 
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
