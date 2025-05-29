
import { Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

const LoadingSpinner = ({ 
  message = "Loading...", 
  subMessage = "Please wait" 
}: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-600">{subMessage}</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-4">🇰🇪 School Health Records Management System</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
