
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  Package, 
  Calendar,
  MapPin,
  TrendingDown,
  Edit,
  Eye
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setMedications(data || []);
      
      // Extract unique categories and locations
      const uniqueCategories = [...new Set(data?.map(med => med.category).filter(Boolean))];
      const uniqueLocations = [...new Set(data?.map(med => med.location).filter(Boolean))];
      
      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      toast.error('Error loading medications');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter((med: any) => {
    const matchesSearch = med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || med.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getStockStatus = (medication: any) => {
    const { quantity_in_stock, minimum_stock_level } = medication;
    if (quantity_in_stock === 0) return { status: 'out_of_stock', color: 'bg-red-100 text-red-800' };
    if (quantity_in_stock <= minimum_stock_level) return { status: 'low_stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'in_stock', color: 'bg-green-100 text-green-800' };
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-100 text-red-800' };
    if (daysUntilExpiry <= 30) return { status: 'expiring_soon', color: 'bg-orange-100 text-orange-800' };
    return { status: 'valid', color: 'bg-green-100 text-green-800' };
  };

  const lowStockMedications = medications.filter((med: any) => 
    med.quantity_in_stock <= med.minimum_stock_level
  );

  const expiredMedications = medications.filter((med: any) => {
    if (!med.expiry_date) return false;
    return new Date(med.expiry_date) < new Date();
  });

  const expiringSoonMedications = medications.filter((med: any) => {
    if (!med.expiry_date) return false;
    const today = new Date();
    const expiry = new Date(med.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  const handleAddMedication = () => {
    setEditingMedication(null);
    setShowForm(true);
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleViewDetails = (medication: any) => {
    setSelectedMedication(medication);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMedication(null);
  };

  const handleFormSave = () => {
    fetchMedications();
    setShowForm(false);
    setEditingMedication(null);
  };

  const MedicationCard = ({ medication }: { medication: any }) => {
    const stockStatus = getStockStatus(medication);
    const expiryStatus = getExpiryStatus(medication.expiry_date);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{medication.name}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(medication)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEditMedication(medication)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {medication.generic_name && (
            <p className="text-sm text-gray-600">{medication.generic_name}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stock:</span>
              <Badge className={stockStatus.color}>
                {medication.quantity_in_stock} units
              </Badge>
            </div>
            
            {medication.expiry_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires:</span>
                <Badge className={expiryStatus.color}>
                  {new Date(medication.expiry_date).toLocaleDateString()}
                </Badge>
              </div>
            )}
            
            {medication.category && (
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">{medication.category}</span>
              </div>
            )}
            
            {medication.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">{medication.location}</span>
              </div>
            )}
            
            {medication.batch_number && (
              <div className="text-xs text-gray-500">
                Batch: {medication.batch_number}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const canManageMedications = ['admin', 'nurse'].includes(userRole);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medication Inventory</h2>
          <p className="text-gray-600">Comprehensive pharmacy management system</p>
        </div>
        {canManageMedications && (
          <Button onClick={handleAddMedication}>
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Medications</p>
                <p className="text-2xl font-bold">{medications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockMedications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringSoonMedications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold">{expiredMedications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Medications ({medications.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({lowStockMedications.length + expiredMedications.length + expiringSoonMedications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedications.map((medication: any) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-6">
            {expiredMedications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Expired Medications ({expiredMedications.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiredMedications.map((medication: any) => (
                    <MedicationCard key={medication.id} medication={medication} />
                  ))}
                </div>
              </div>
            )}

            {expiringSoonMedications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Expiring Soon ({expiringSoonMedications.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiringSoonMedications.map((medication: any) => (
                    <MedicationCard key={medication.id} medication={medication} />
                  ))}
                </div>
              </div>
            )}

            {lowStockMedications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Low Stock ({lowStockMedications.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockMedications.map((medication: any) => (
                    <MedicationCard key={medication.id} medication={medication} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
        />
      )}
    </div>
  );
};

export default MedicationInventorySystem;
