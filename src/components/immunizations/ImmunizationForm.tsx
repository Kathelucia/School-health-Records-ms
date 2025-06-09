
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImmunizationFormProps {
  student?: any;
  onClose: () => void;
  onSave: () => void;
  requirements: any[];
}

const ImmunizationForm = ({ student, onClose, onSave, requirements }: ImmunizationFormProps) => {
  const [formData, setFormData] = useState({
    student_id: student?.id || '',
    vaccine_name: '',
    date_administered: new Date().toISOString().split('T')[0],
    administered_by: '',
    batch_number: '',
    next_dose_date: '',
    notes: ''
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentSearch, setShowStudentSearch] = useState(false);

  useEffect(() => {
    if (!student) {
      fetchStudents();
    } else {
      setSearchTerm(`${student.full_name} (${student.student_id})`);
    }
  }, [student]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, student_id, form_level')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id) {
      toast.error('Please select a student');
      return;
    }
    
    if (!formData.vaccine_name) {
      toast.error('Please select a vaccine');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('immunizations')
        .insert([{
          ...formData,
          next_dose_date: formData.next_dose_date || null
        }]);

      if (error) throw error;

      toast.success('Immunization record added successfully');
      onSave();
    } catch (error: any) {
      console.error('Error saving immunization:', error);
      toast.error('Error saving immunization record');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s: any) =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const commonVaccines = [
    'BCG',
    'DPT',
    'Polio',
    'MMR',
    'Hepatitis B',
    'Tetanus',
    'Meningitis',
    'Yellow Fever',
    'HPV',
    'Typhoid'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Immunization Record</DialogTitle>
          <DialogDescription>
            Record a new vaccination for a student
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!student && (
            <div className="space-y-2">
              <Label htmlFor="student_search">Select Student</Label>
              <div className="relative">
                <Input
                  id="student_search"
                  placeholder="Search for a student..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowStudentSearch(true);
                  }}
                  onFocus={() => setShowStudentSearch(true)}
                />
                {showStudentSearch && searchTerm && (
                  <Card className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto">
                    <CardContent className="p-2">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s: any) => (
                          <div
                            key={s.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                            onClick={() => {
                              setFormData({ ...formData, student_id: s.id });
                              setSearchTerm(`${s.full_name} (${s.student_id})`);
                              setShowStudentSearch(false);
                            }}
                          >
                            {s.full_name} - {s.student_id} ({s.form_level?.replace('_', ' ')})
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">No students found</div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vaccine_name">Vaccine Name</Label>
            <Select 
              value={formData.vaccine_name}
              onValueChange={(value) => setFormData({ ...formData, vaccine_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vaccine" />
              </SelectTrigger>
              <SelectContent>
                {commonVaccines.map((vaccine) => (
                  <SelectItem key={vaccine} value={vaccine}>
                    {vaccine}
                  </SelectItem>
                ))}
                {requirements.map((req: any) => (
                  <SelectItem key={req.id} value={req.vaccine_name}>
                    {req.vaccine_name} {req.is_mandatory && '(Required)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_administered">Date Administered</Label>
            <Input
              id="date_administered"
              type="date"
              value={formData.date_administered}
              onChange={(e) => setFormData({ ...formData, date_administered: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="administered_by">Administered By</Label>
            <Input
              id="administered_by"
              value={formData.administered_by}
              onChange={(e) => setFormData({ ...formData, administered_by: e.target.value })}
              placeholder="Name of healthcare provider"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number</Label>
            <Input
              id="batch_number"
              value={formData.batch_number}
              onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              placeholder="Vaccine batch number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_dose_date">Next Dose Date (if applicable)</Label>
            <Input
              id="next_dose_date"
              type="date"
              value={formData.next_dose_date}
              onChange={(e) => setFormData({ ...formData, next_dose_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or observations"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.student_id || !formData.vaccine_name}>
              {loading ? 'Saving...' : 'Save Immunization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImmunizationForm;
