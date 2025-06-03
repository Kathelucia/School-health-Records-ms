
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StudentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const StudentSearch = ({ searchTerm, onSearchChange }: StudentSearchProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search students by name, ID, admission number, or form level..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentSearch;
