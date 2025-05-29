
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle,
  Search,
  Calendar
} from 'lucide-react';

interface ClinicVisitsProps {
  userRole: 'nurse' | 'admin';
}

const ClinicVisits = ({ userRole }: ClinicVisitsProps) => {
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const visits = [
    {
      id: 1,
      student: "Emma Johnson",
      grade: "Grade 8",
      time: "10:30 AM",
      date: "2024-01-18",
      symptoms: "Headache, nausea",
      diagnosis: "Tension headache",
      treatment: "Rest, acetaminophen",
      status: "completed",
      nurse: "Nurse Smith",
      followUp: false
    },
    {
      id: 2,
      student: "Michael Chen",
      grade: "Grade 10",
      time: "9:45 AM",
      date: "2024-01-18",
      symptoms: "Difficulty breathing",
      diagnosis: "Asthma episode",
      treatment: "Inhaler administered",
      status: "completed",
      nurse: "Nurse Smith",
      followUp: true
    },
    {
      id: 3,
      student: "Sarah Williams",
      grade: "Grade 7",
      time: "11:15 AM",
      date: "2024-01-18",
      symptoms: "Stomach ache",
      diagnosis: "Pending assessment",
      treatment: "Under observation",
      status: "in-progress",
      nurse: "Nurse Smith",
      followUp: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'follow-up': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (showNewVisit) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowNewVisit(false)}>
            ← Back to Visits
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>New Clinic Visit</CardTitle>
            <CardDescription>Record a new student visit to the clinic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student Name</Label>
                <Input id="student" placeholder="Search for student..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" defaultValue={new Date().toLocaleTimeString('en-US', {hour12: false}).slice(0,5)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea id="symptoms" placeholder="Describe the student's symptoms..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment/Diagnosis</Label>
              <Textarea id="assessment" placeholder="Your medical assessment..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment Provided</Label>
              <Textarea id="treatment" placeholder="Treatment administered or recommended..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="disposition">Disposition</Label>
                <select id="disposition" className="w-full p-2 border rounded">
                  <option>Returned to class</option>
                  <option>Sent home</option>
                  <option>Parent contacted</option>
                  <option>Emergency services called</option>
                  <option>Under observation</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUp">Follow-up Required?</Label>
                <select id="followUp" className="w-full p-2 border rounded">
                  <option>No</option>
                  <option>Yes - Same day</option>
                  <option>Yes - Next day</option>
                  <option>Yes - Weekly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowNewVisit(false)}>
                Cancel
              </Button>
              <Button>
                Save Visit Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Visits</h2>
          <p className="text-gray-600">Track and manage student clinic visits</p>
        </div>
        <Button onClick={() => setShowNewVisit(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Visit
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            <select className="p-2 border rounded">
              <option>All Status</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Follow-up Required</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1</div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-gray-500">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {visits.map((visit) => (
          <Card key={visit.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{visit.student}</h3>
                      <Badge variant="outline">{visit.grade}</Badge>
                      <Badge className={getStatusColor(visit.status)}>
                        {getStatusIcon(visit.status)}
                        <span className="ml-1 capitalize">{visit.status.replace('-', ' ')}</span>
                      </Badge>
                      {visit.followUp && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Follow-up
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">
                          <strong>Symptoms:</strong> {visit.symptoms}
                        </p>
                        <p className="text-gray-600">
                          <strong>Diagnosis:</strong> {visit.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          <strong>Treatment:</strong> {visit.treatment}
                        </p>
                        <p className="text-gray-600">
                          <strong>Nurse:</strong> {visit.nurse}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {visit.date}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {visit.time}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClinicVisits;
