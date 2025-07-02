
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MedicationFormProps {
  medication?: any;
  onClose: () => void;
  onSave: () => void;
}

const MedicationForm = ({ medication, onClose, onSave }: MedicationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category: '',
    location: '',
    dosage: '',
    form: '',
    manufacturer: '',
    supplier: '',
    batch_number: '',
    expiry_date: '',
    quantity_in_stock: 0,
    minimum_stock_level: 10,
    unit_cost: 0,
    monthly_usage: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '',
        generic_name: medication.generic_name || '',
        category: medication.category || '',
        location: medication.location || '',
        dosage: medication.dosage || '',
        form: medication.form || '',
        manufacturer: medication.manufacturer || '',
        supplier: medication.supplier || '',
        batch_number: medication.batch_number || '',
        expiry_date: medication.expiry_date || '',
        quantity_in_stock: medication.quantity_in_stock || 0,
        minimum_stock_level: medication.minimum_stock_level || 10,
        unit_cost: medication.unit_cost || 0,
        monthly_usage: medication.monthly_usage || 0
      });
    }
  }, [medication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (medication) {
        const { error } = await supabase
          .from('medications')
          .update(formData)
          .eq('id', medication.id);
        
        if (error) throw error;
        toast.success('Medication updated successfully');
      } else {
        const { error } = await supabase
          .from('medications')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Medication added successfully');
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast.error('Error saving medication: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Antibiotics',
    'Analgesics',
    'Antipyretics',
    'Antacids',
    'Vitamins',
    'Antiseptics',
    'First Aid',
    'Chronic Care',
    'Emergency',
    'Other'
  ];

  const locations = [
    'Main Pharmacy',
    'Clinic Cabinet',
    'Emergency Kit',
    'Refrigerated Storage',
    'Controlled Substances',
    'First Aid Station'
  ];

  const medicationForms = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Cream',
    'Ointment',
    'Drops',
    'Spray',
    'Inhaler'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {medication ? 'Edit Medication' : 'Add New Medication'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Medication Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="generic_name">Generic Name</Label>
              <Input
                id="generic_name"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Storage Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>

            <div>
              <Label htmlFor="form">Form</Label>
              <Select value={formData.form} onValueChange={(value) => setFormData({ ...formData, form: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {medicationForms.map(form => (
                    <SelectItem key={form} value={form}>{form}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="quantity_in_stock">Quantity in Stock</Label>
              <Input
                id="quantity_in_stock"
                type="number"
                min="0"
                value={formData.quantity_in_stock}
                onChange={(e) => setFormData({ ...formData, quantity_in_stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
              <Input
                id="minimum_stock_level"
                type="number"
                min="0"
                value={formData.minimum_stock_level}
                onChange={(e) => setFormData({ ...formData, minimum_stock_level: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="unit_cost">Unit Cost (KES)</Label>
              <Input
                id="unit_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="monthly_usage">Average Monthly Usage</Label>
              <Input
                id="monthly_usage"
                type="number"
                min="0"
                value={formData.monthly_usage}
                onChange={(e) => setFormData({ ...formData, monthly_usage: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : medication ? 'Update' : 'Add'} Medication
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationForm;
