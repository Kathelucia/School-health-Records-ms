
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StudentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const StudentSearch = ({ searchTerm, onSearchChange }: StudentSearchProps) => {
  return (
    <Card className="mb-6 bg-white shadow-lg border-0">
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search students by name, ID, admission number, or form level..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Search across all student fields including names, student IDs, admission numbers, and class levels
        </p>
      </CardContent>
    </Card>
  );
};

export default StudentSearch;
