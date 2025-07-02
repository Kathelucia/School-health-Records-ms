
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bug, User, Database, RefreshCw } from 'lucide-react';

const ProfileDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // Get user role
      const { data: role, error: roleError } = await supabase
        .rpc('get_user_role');

      // Test database permissions
      const { data: studentsTest, error: studentsError } = await supabase
        .from('students')
        .select('count(*)')
        .limit(1);

      const { data: medicationsTest, error: medicationsError } = await supabase
        .from('medications')
        .select('count(*)')
        .limit(1);

      const { data: clinicVisitsTest, error: clinicVisitsError } = await supabase
        .from('clinic_visits')
        .select('count(*)')
        .limit(1);

      setDebugInfo({
        user: {
          data: user,
          error: userError
        },
        profile: {
          data: profile,
          error: profileError
        },
        role: {
          data: role,
          error: roleError
        },
        permissions: {
          students: {
            data: studentsTest,
            error: studentsError
          },
          medications: {
            data: medicationsTest,
            error: medicationsError
          },
          clinicVisits: {
            data: clinicVisitsTest,
            error: clinicVisitsError
          }
        },
        timestamp: new Date().toISOString()
      });

      toast.success('Debug information collected successfully');
    } catch (error: any) {
      console.error('Debug error:', error);
      toast.error('Error running debug check: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (hasError: boolean, hasData: boolean) => {
    if (hasError) return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    if (hasData) return <Badge className="bg-green-100 text-green-800">OK</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">No Data</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="w-5 h-5 mr-2" />
          Profile & Permissions Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDebugCheck} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Debug Check...
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 mr-2" />
              Run Debug Check
            </>
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Last check: {new Date(debugInfo.timestamp).toLocaleString()}
            </div>

            {/* User Authentication */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    User Authentication
                  </span>
                  {getStatusBadge(!!debugInfo.user.error, !!debugInfo.user.data)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.user.error ? (
                  <div className="text-red-600 text-sm">
                    Error: {debugInfo.user.error.message}
                  </div>
                ) : debugInfo.user.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {debugInfo.user.data.id}</div>
                    <div><strong>Email:</strong> {debugInfo.user.data.email}</div>
                    <div><strong>Email Confirmed:</strong> {debugInfo.user.data.email_confirmed_at ? 'Yes' : 'No'}</div>
                    <div><strong>Created:</strong> {new Date(debugInfo.user.data.created_at).toLocaleString()}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No user data</div>
                )}
              </CardContent>
            </Card>

            {/* User Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    User Profile
                  </span>
                  {getStatusBadge(!!debugInfo.profile.error, !!debugInfo.profile.data)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.profile.error ? (
                  <div className="text-red-600 text-sm">
                    Error: {debugInfo.profile.error.message}
                  </div>
                ) : debugInfo.profile.data ? (
                  <div className="space-y-2 text-sm">
                    <div><strong>Full Name:</strong> {debugInfo.profile.data.full_name}</div>
                    <div><strong>Email:</strong> {debugInfo.profile.data.email}</div>
                    <div><strong>Role:</strong> {debugInfo.profile.data.role}</div>
                    <div><strong>Department:</strong> {debugInfo.profile.data.department || 'Not set'}</div>
                    <div><strong>Employee ID:</strong> {debugInfo.profile.data.employee_id || 'Not set'}</div>
                    <div><strong>Active:</strong> {debugInfo.profile.data.is_active ? 'Yes' : 'No'}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No profile data</div>
                )}
              </CardContent>
            </Card>

            {/* User Role Function */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Role Function</span>
                  {getStatusBadge(!!debugInfo.role.error, !!debugInfo.role.data)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.role.error ? (
                  <div className="text-red-600 text-sm">
                    Error: {debugInfo.role.error.message}
                  </div>
                ) : (
                  <div className="text-sm">
                    <strong>Current Role:</strong> {debugInfo.role.data || 'No role'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Permissions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Database Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Students Table</span>
                  {getStatusBadge(!!debugInfo.permissions.students.error, !!debugInfo.permissions.students.data)}
                  {debugInfo.permissions.students.error && (
                    <div className="text-xs text-red-600 ml-2">
                      {debugInfo.permissions.students.error.message}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Medications Table</span>
                  {getStatusBadge(!!debugInfo.permissions.medications.error, !!debugInfo.permissions.medications.data)}
                  {debugInfo.permissions.medications.error && (
                    <div className="text-xs text-red-600 ml-2">
                      {debugInfo.permissions.medications.error.message}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Clinic Visits Table</span>
                  {getStatusBadge(!!debugInfo.permissions.clinicVisits.error, !!debugInfo.permissions.clinicVisits.data)}
                  {debugInfo.permissions.clinicVisits.error && (
                    <div className="text-xs text-red-600 ml-2">
                      {debugInfo.permissions.clinicVisits.error.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileDebugger;
