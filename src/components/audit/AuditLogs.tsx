
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditLogsProps {
  userRole: string;
}

const AuditLogs = ({ userRole }: AuditLogsProps) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAuditLogs();
    }
  }, [userRole]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter, tableFilter]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error('Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter((log: any) =>
        log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter((log: any) => log.action === actionFilter);
    }

    if (tableFilter !== 'all') {
      filtered = filtered.filter((log: any) => log.table_name === tableFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatJsonDiff = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return null;
    
    if (oldValues && newValues) {
      const changes = [];
      const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
      
      for (const key of allKeys) {
        if (oldValues[key] !== newValues[key]) {
          changes.push(`${key}: "${oldValues[key]}" → "${newValues[key]}"`);
        }
      }
      
      return changes.length > 0 ? changes.join(', ') : 'No changes detected';
    }
    
    return oldValues ? 'Record deleted' : 'New record created';
  };

  // Only admins can view audit logs
  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-gray-600">Track all system activities and data changes</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by user, table, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="INSERT">Insert</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="clinic_visits">Clinic Visits</SelectItem>
                <SelectItem value="medication_dispensing">Medication Dispensing</SelectItem>
                <SelectItem value="immunizations">Immunizations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading audit logs...</div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log: any) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {log.profiles?.full_name || 'System'}
                      </CardTitle>
                      <CardDescription>
                        {log.profiles?.email || 'system@school.edu'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <Badge variant="outline">
                      {log.table_name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  
                  {log.record_id && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Record ID:</span>
                      <span className="ml-1 text-gray-600 font-mono">{log.record_id}</span>
                    </div>
                  )}
                  
                  {(log.old_values || log.new_values) && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Changes:</span>
                      <p className="text-gray-600 mt-1 break-words">
                        {formatJsonDiff(log.old_values, log.new_values)}
                      </p>
                    </div>
                  )}
                  
                  {log.ip_address && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">IP Address:</span>
                      <span className="ml-1 text-gray-600 font-mono">{log.ip_address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-gray-600">
            {searchTerm || actionFilter !== 'all' || tableFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No activities have been logged yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
