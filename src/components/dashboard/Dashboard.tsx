
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import StudentProfiles from '@/components/students/StudentProfiles';
import ClinicVisits from '@/components/clinic/ClinicVisits';
import ImmunizationManagement from '@/components/immunizations/ImmunizationManagement';
import MedicationInventorySystem from '@/components/medication/MedicationInventorySystem';
import AuditLogs from '@/components/audit/AuditLogs';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import Settings from '@/components/settings/Settings';
import BulkUpload from '@/components/database/BulkUpload';
import ReportDownloader from '@/components/reports/ReportDownloader';
import StaffManagement from '@/components/settings/StaffManagement';

interface DashboardProps {
  children: React.ReactNode;
  userRole: string;
}

const Dashboard = ({ children, userRole }: DashboardProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
