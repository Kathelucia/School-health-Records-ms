import { useState } from 'react';
import {
  Home,
  Users,
  Stethoscope,
  Syringe,
  Pill,
  FileText,
  Settings,
  Bell,
  BarChart3,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  isOpen: boolean;
}

const Sidebar = ({ activeTab, onTabChange, userRole, isOpen }: SidebarProps) => {
  const navigationItems = [
    { id: 'home', label: 'Dashboard', icon: Home, roles: ['nurse', 'clinical_officer', 'admin', 'other_staff'] },
    { id: 'students', label: 'Student Profiles', icon: Users, roles: ['nurse', 'clinical_officer', 'admin', 'other_staff'] },
    { id: 'clinic', label: 'Clinic Visits', icon: Stethoscope, roles: ['nurse', 'clinical_officer', 'admin'] },
    { id: 'immunizations', label: 'Immunizations', icon: Syringe, roles: ['nurse', 'clinical_officer', 'admin'] },
    { id: 'medication', label: 'Medication', icon: Pill, roles: ['nurse', 'clinical_officer', 'admin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['nurse', 'clinical_officer', 'admin', 'other_staff'] },
    { id: 'bulk-upload', label: 'Bulk Upload', icon: Upload, roles: ['admin'] },
    { id: 'audit', label: 'Audit Logs', icon: FileText, roles: ['admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['nurse', 'clinical_officer', 'admin', 'other_staff', 'it_support'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['nurse', 'clinical_officer', 'admin', 'other_staff', 'it_support'] },
    { id: 'contact-admin', label: 'Contact Admin', icon: Bell, roles: ['nurse', 'clinical_officer', 'other_staff', 'it_support'] },
  ];

  if (!isOpen) {
    return null;
  }

  // Ensure userRole has a fallback
  const currentUserRole = userRole || 'other_staff';

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4 w-60">
      <div className="px-6 py-2">
        <h1 className="text-lg font-semibold">School Health Center</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {navigationItems.map((item) => {
            if (!item.roles.includes(currentUserRole)) {
              return null;
            }
            return (
              <li key={item.id} className="mb-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-normal px-6 py-2 ${activeTab === item.id ? 'bg-gray-100' : ''}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
