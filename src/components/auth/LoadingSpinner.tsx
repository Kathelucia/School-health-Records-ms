
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="icon-container bg-gradient-to-r from-primary to-accent animate-pulse-glow mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-foreground border-t-transparent"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground animate-pulse" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">{message}</h2>
        <p className="text-muted-foreground text-sm">{subMessage}</p>
        <div className="mt-3 flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">🇰🇪 School Health Records Management System</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
