
import { User } from 'lucide-react';

interface StudentEmptyStateProps {
  searchTerm: string;
}

const StudentEmptyState = ({ searchTerm }: StudentEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
      <p className="text-gray-600">
        {searchTerm ? 'Try adjusting your search terms' : 'No students have been added yet'}
      </p>
    </div>
  );
};

export default StudentEmptyState;
