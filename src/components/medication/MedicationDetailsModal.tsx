
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, Calendar, MapPin, Activity, DollarSign, TrendingUp } from 'lucide-react';

interface MedicationDetailsModalProps {
  medication: any;
  onClose: () => void;
}

const MedicationDetailsModal = ({ medication, onClose }: MedicationDetailsModalProps) => {
  const [dispensingHistory, setDispensingHistory] = useState([]);

  useEffect(() => {
    fetchDispensingHistory();
  }, [medication.id]);

  const fetchDispensingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_dispensing_log')
        .select(`
          *,
          students(full_name, student_id),
          profiles(full_name)
        `)
        .eq('medication_id', medication.id)
        .order('dispensed_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setDispensingHistory(data);
      }
    } catch (error) {
      console.error('Error fetching dispensing history:', error);
    }
  };

  const getStockStatus = () => {
    const { quantity_in_stock, minimum_stock_level } = medication;
    if (quantity_in_stock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity_in_stock <= minimum_stock_level) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getExpiryStatus = () => {
    if (!medication.expiry_date) return { status: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const expiry = new Date(medication.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: 'bg-red-100 text-red-800' };
    if (daysUntilExpiry <= 30) return { status: 'Expiring Soon', color: 'bg-orange-100 text-orange-800' };
    return { status: 'Valid', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus();
  const expiryStatus = getExpiryStatus();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{medication.name}</span>
            <div className="flex gap-2">
              <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
              <Badge className={expiryStatus.color}>{expiryStatus.status}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medication.generic_name && (
                <div>
                  <span className="font-medium">Generic Name: </span>
                  <span>{medication.generic_name}</span>
                </div>
              )}
              {medication.category && (
                <div>
                  <span className="font-medium">Category: </span>
                  <span>{medication.category}</span>
                </div>
              )}
              {medication.dosage && (
                <div>
                  <span className="font-medium">Dosage: </span>
                  <span>{medication.dosage}</span>
                </div>
              )}
              {medication.form && (
                <div>
                  <span className="font-medium">Form: </span>
                  <span>{medication.form}</span>
                </div>
              )}
              {medication.manufacturer && (
                <div>
                  <span className="font-medium">Manufacturer: </span>
                  <span>{medication.manufacturer}</span>
                </div>
              )}
              {medication.supplier && (
                <div>
                  <span className="font-medium">Supplier: </span>
                  <span>{medication.supplier}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Stock & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Current Stock: </span>
                <span className="text-lg font-bold">{medication.quantity_in_stock} units</span>
              </div>
              <div>
                <span className="font-medium">Minimum Level: </span>
                <span>{medication.minimum_stock_level} units</span>
              </div>
              {medication.location && (
                <div>
                  <span className="font-medium">Location: </span>
                  <span>{medication.location}</span>
                </div>
              )}
              {medication.batch_number && (
                <div>
                  <span className="font-medium">Batch Number: </span>
                  <span>{medication.batch_number}</span>
                </div>
              )}
              {medication.expiry_date && (
                <div>
                  <span className="font-medium">Expiry Date: </span>
                  <span>{new Date(medication.expiry_date).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial & Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial & Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medication.unit_cost && (
                <div>
                  <span className="font-medium">Unit Cost: </span>
                  <span>KES {medication.unit_cost}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Total Value: </span>
                <span className="text-lg font-bold">
                  KES {(medication.quantity_in_stock * (medication.unit_cost || 0)).toFixed(2)}
                </span>
              </div>
              {medication.monthly_usage && (
                <div>
                  <span className="font-medium">Monthly Usage: </span>
                  <span>{medication.monthly_usage} units</span>
                </div>
              )}
              {medication.monthly_usage && medication.quantity_in_stock && (
                <div>
                  <span className="font-medium">Stock Duration: </span>
                  <span>{Math.floor(medication.quantity_in_stock / medication.monthly_usage)} months</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Dispensing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Dispensing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dispensingHistory.length > 0 ? (
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {dispensingHistory.map((record: any) => (
                    <div key={record.id} className="border-b pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{record.students?.full_name}</p>
                          <p className="text-sm text-gray-600">{record.students?.student_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{record.quantity_dispensed} units</p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.dispensed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {record.dosage_instructions && (
                        <p className="text-sm text-gray-600 mt-1">{record.dosage_instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No dispensing history available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationDetailsModal;
