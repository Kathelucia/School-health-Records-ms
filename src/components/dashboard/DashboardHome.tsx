
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react';

interface DashboardHomeProps {
  userRole: 'nurse' | 'admin';
}

const DashboardHome = ({ userRole }: DashboardHomeProps) => {
  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      icon: Users,
      trend: "+12 new this month",
      color: "text-blue-600"
    },
    {
      title: "Clinic Visits Today",
      value: "8",
      icon: Stethoscope,
      trend: "3 pending follow-ups",
      color: "text-green-600"
    },
    {
      title: "Active Medications",
      value: "156",
      icon: Pill,
      trend: "4 expiring soon",
      color: "text-purple-600"
    },
    {
      title: "Health Alerts",
      value: "3",
      icon: AlertTriangle,
      trend: "2 high priority",
      color: "text-red-600"
    }
  ];

  const recentActivities = [
    { time: "10:30 AM", student: "Emma Johnson", action: "Clinic visit - Headache", type: "visit" },
    { time: "9:45 AM", student: "Michael Chen", action: "Medication administered - Inhaler", type: "medication" },
    { time: "9:15 AM", student: "Sarah Williams", action: "Health profile updated", type: "profile" },
    { time: "8:30 AM", student: "David Brown", action: "Emergency contact called", type: "emergency" },
  ];

  const quickActions = [
    { label: "New Clinic Visit", icon: Plus, action: "visit" },
    { label: "Student Search", icon: Users, action: "search" },
    { label: "Medication Log", icon: Pill, action: "medication" },
    { label: "Emergency Contacts", icon: AlertTriangle, action: "emergency" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userRole === 'admin' ? 'Administrator' : 'Nurse'}
        </h2>
        <p className="text-gray-600">
          Here's an overview of today's health management activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used functions for efficient workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50"
                >
                  <action.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest clinic visits and health record updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500 mt-1 min-w-[60px]">
                    {activity.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.student}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'emergency' ? 'bg-red-500' :
                    activity.type === 'visit' ? 'bg-blue-500' :
                    activity.type === 'medication' ? 'bg-purple-500' : 'bg-green-500'
                  }`} />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Priority Health Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded border border-red-200">
              <p className="text-sm font-medium text-red-900">
                Jessica Martinez - Severe Allergy Alert
              </p>
              <p className="text-xs text-red-700">
                Anaphylaxis risk - Peanuts, Tree nuts. EpiPen available.
              </p>
            </div>
            <div className="p-3 bg-white rounded border border-orange-200">
              <p className="text-sm font-medium text-orange-900">
                Alex Thompson - Medication Expiry
              </p>
              <p className="text-xs text-orange-700">
                Inhaler expires in 3 days. Contact parent for replacement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
