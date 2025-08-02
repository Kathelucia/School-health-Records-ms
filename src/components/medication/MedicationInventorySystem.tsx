
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Package,
  TrendingDown,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MedicationForm from './MedicationForm';
import MedicationDetailsModal from './MedicationDetailsModal';

interface MedicationInventorySystemProps {
  userRole: string;
}

const MedicationInventorySystem = ({ userRole }: MedicationInventorySystemProps) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [editingMedication, setEditingMedication] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchMedications();
    fetchStats();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name');

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      toast.error('Error loading medications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await supabase
        .from('medications')
        .select('*');

      if (data) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const stats = {
          total: data.length,
          lowStock: data.filter(med => med.quantity_in_stock <= med.minimum_stock_level).length,
          expiringSoon: data.filter(med => 
            med.expiry_date && new Date(med.expiry_date) <= thirtyDaysFromNow
          ).length,
          totalValue: data.reduce((sum, med) => sum + (med.quantity_in_stock * (med.unit_cost || 0)), 0)
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddMedication = () => {
    setEditingMedication(null);
    setShowForm(true);
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMedication(null);
  };

  const handleFormSave = () => {
    fetchMedications();
    fetchStats();
    setShowForm(false);
    setEditingMedication(null);
  };

  const getStockStatus = (medication: any) => {
    if (medication.quantity_in_stock <= 0) return 'out-of-stock';
    if (medication.quantity_in_stock <= medication.minimum_stock_level) return 'low-stock';
    return 'in-stock';
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return 'no-expiry';
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);

    if (expiry <= now) return 'expired';
    if (expiry <= thirtyDays) return 'expiring-soon';
    return 'valid';
  };

  const canManageMedications = ['admin', 'nurse'].includes(userRole);

  const renderMedicationCard = (medication: any) => {
    const stockStatus = getStockStatus(medication);
    const expiryStatus = getExpiryStatus(medication.expiry_date);

    return (
      <Card key={medication.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6" onClick={() => setSelectedMedication(medication)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                <p className="text-sm text-gray-600">{medication.generic_name}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <Badge 
                variant={stockStatus === 'in-stock' ? 'default' : 'destructive'}
                className={
                  stockStatus === 'in-stock' ? 'bg-green-100 text-green-800' :
                  stockStatus === 'low-stock' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }
              >
                {stockStatus === 'in-stock' ? 'In Stock' :
                 stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
              </Badge>
              {expiryStatus === 'expiring-soon' && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Expiring Soon
                </Badge>
              )}
              {expiryStatus === 'expired' && (
                <Badge variant="destructive">
                  Expired
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock:</span>
              <span className="font-medium">{medication.quantity_in_stock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dosage:</span>
              <span className="font-medium">{medication.dosage || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Form:</span>
              <span className="font-medium">{medication.form || 'N/A'}</span>
            </div>
            {medication.expiry_date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expiry:</span>
                <span className="font-medium">
                  {new Date(medication.expiry_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {canManageMedications && (
            <div className="mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditMedication(medication);
                }}
                className="w-full"
              >
                Edit Medication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                Medication Inventory
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive medication tracking and management system
              </p>
            </div>
            {canManageMedications && (
              <Button 
                onClick={handleAddMedication}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Medication
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Medications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Expiring Soon</p>
                    <p className="text-2xl font-bold text-red-600">{stats.expiringSoon}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Inventory Value</p>
                    <p className="text-2xl font-bold text-green-600">KES {stats.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="all">All Medications</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medications.map(renderMedicationCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="low-stock">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications
                .filter(med => getStockStatus(med) === 'low-stock' || getStockStatus(med) === 'out-of-stock')
                .map(renderMedicationCard)}
            </div>
          </TabsContent>

          <TabsContent value="expiring">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications
                .filter(med => {
                  const status = getExpiryStatus(med.expiry_date);
                  return status === 'expiring-soon' || status === 'expired';
                })
                .map(renderMedicationCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showForm && (
          <MedicationForm
            medication={editingMedication}
            onClose={handleFormClose}
            onSave={handleFormSave}
          />
        )}

        {selectedMedication && (
          <MedicationDetailsModal
            medication={selectedMedication}
            onClose={() => setSelectedMedication(null)}
            onEdit={() => {
              setEditingMedication(selectedMedication);
              setSelectedMedication(null);
              setShowForm(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MedicationInventorySystem;
