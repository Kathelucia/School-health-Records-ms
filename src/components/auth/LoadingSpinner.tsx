
import { Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

const LoadingSpinner = ({ 
  message = "Loading...", 
  subMessage = "This should be quick" 
}: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-green-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-600 text-sm">{subMessage}</p>
        <div className="mt-3 flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-3">🇰🇪 School Health Records Management System</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
