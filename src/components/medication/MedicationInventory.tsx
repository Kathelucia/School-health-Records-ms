
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Plus, 
  AlertTriangle, 
  Search,
  Calendar,
  Package,
  TrendingDown
} from 'lucide-react';

interface MedicationInventoryProps {
  userRole: 'nurse' | 'admin';
}

const MedicationInventory = ({ userRole }: MedicationInventoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const medications = [
    {
      id: 1,
      name: "Acetaminophen 325mg",
      category: "Pain Relief",
      currentStock: 48,
      minimumStock: 20,
      expiryDate: "2025-03-15",
      location: "Cabinet A-1",
      lastRestocked: "2024-01-10",
      monthlyUsage: 12,
      status: "good"
    },
    {
      id: 2,
      name: "Albuterol Inhaler",
      category: "Respiratory",
      currentStock: 3,
      minimumStock: 5,
      expiryDate: "2024-08-20",
      location: "Refrigerator",
      lastRestocked: "2023-12-15",
      monthlyUsage: 8,
      status: "low"
    },
    {
      id: 3,
      name: "EpiPen Auto-Injector",
      category: "Emergency",
      currentStock: 2,
      minimumStock: 3,
      expiryDate: "2024-06-30",
      location: "Emergency Kit",
      lastRestocked: "2023-11-20",
      monthlyUsage: 0,
      status: "critical"
    },
    {
      id: 4,
      name: "Ibuprofen 200mg",
      category: "Pain Relief",
      currentStock: 36,
      minimumStock: 25,
      expiryDate: "2025-01-10",
      location: "Cabinet A-2",
      lastRestocked: "2024-01-05",
      monthlyUsage: 15,
      status: "good"
    },
    {
      id: 5,
      name: "Antiseptic Wipes",
      category: "First Aid",
      currentStock: 8,
      minimumStock: 15,
      expiryDate: "2024-12-31",
      location: "Cabinet B-1",
      lastRestocked: "2023-12-20",
      monthlyUsage: 25,
      status: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum * 0.5) return 'critical';
    if (current <= minimum) return 'low';
    return 'good';
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90; // Expiring within 90 days
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: medications.length,
    lowStock: medications.filter(m => getStockStatus(m.currentStock, m.minimumStock) !== 'good').length,
    expiringSoon: medications.filter(m => isExpiringSoon(m.expiryDate)).length,
    critical: medications.filter(m => getStockStatus(m.currentStock, m.minimumStock) === 'critical').length
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medication Inventory</h2>
          <p className="text-gray-600">Manage clinic medication stock and track usage</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-gray-500">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            <p className="text-xs text-gray-500">Within 90 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-gray-500">Immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search medications by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {stats.critical > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Critical Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medications
                .filter(m => getStockStatus(m.currentStock, m.minimumStock) === 'critical')
                .map(med => (
                  <div key={med.id} className="p-3 bg-white rounded border border-red-200">
                    <p className="font-medium text-red-900">{med.name}</p>
                    <p className="text-sm text-red-700">
                      Only {med.currentStock} remaining • Minimum: {med.minimumStock}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMedications.map((medication) => {
          const stockStatus = getStockStatus(medication.currentStock, medication.minimumStock);
          const expiringSoon = isExpiringSoon(medication.expiryDate);
          
          return (
            <Card key={medication.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-blue-600" />
                      {medication.name}
                    </CardTitle>
                    <CardDescription>{medication.category}</CardDescription>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={getStatusColor(stockStatus)}>
                      {stockStatus.toUpperCase()}
                    </Badge>
                    {expiringSoon && (
                      <Badge className="bg-orange-100 text-orange-800">
                        EXPIRING
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Stock</p>
                      <p className="font-semibold text-lg">
                        {medication.currentStock}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          (min: {medication.minimumStock})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium">{medication.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Expiry Date</p>
                      <p className={`font-medium ${expiringSoon ? 'text-orange-600' : ''}`}>
                        {new Date(medication.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Usage</p>
                      <p className="font-medium">{medication.monthlyUsage} units</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Last restocked: {new Date(medication.lastRestocked).toLocaleDateString()}
                    </p>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button size="sm">
                        Restock
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MedicationInventory;
