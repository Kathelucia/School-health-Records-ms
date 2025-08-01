
import Reports from '@/components/reports/Reports';
import ReportDownloader from '@/components/reports/ReportDownloader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReportsPage = () => {
  return (
    <div className="p-6">
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          <TabsTrigger value="downloads">Download Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics">
          <Reports userRole="nurse" />
        </TabsContent>
        
        <TabsContent value="downloads">
          <ReportDownloader userRole="nurse" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
