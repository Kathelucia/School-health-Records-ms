
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, UserPlus, LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp) {
      if (!fullName) {
        toast.error('Full name is required');
        return false;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      cleanupAuthState();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'other_staff'
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            toast.error('This email is already registered. Please sign in instead.');
            setIsSignUp(false);
          } else if (error.message.includes('Invalid email')) {
            toast.error('Please enter a valid email address.');
          } else {
            toast.error('Signup failed. Please try again.');
          }
        } else if (data.user) {
          if (data.user.email_confirmed_at) {
            toast.success('Account created! You can now sign in.');
            setIsSignUp(false);
          } else {
            setEmailSent(true);
            toast.success('Account created! Please check your email to verify your account.');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please verify your email address before signing in.');
          } else {
            toast.error('Sign in failed. Please try again.');
          }
        } else if (data.user) {
          toast.success('Welcome! Loading dashboard...');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a verification link to {email}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Please click the verification link in your email to activate your account.</p>
              <p className="mt-2">Didn't receive the email?</p>
            </div>
            <Button 
              onClick={handleResendVerification}
              variant="outline" 
              className="w-full"
            >
              Resend Verification Email
            </Button>
            <Button 
              onClick={() => setEmailSent(false)}
              variant="ghost" 
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-600 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-blue-600 rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-orange-600 rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-red-600 rounded-full"></div>
      </div>

      <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-white/95 animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center animate-scale-in">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">SHRMS</CardTitle>
            <CardDescription className="text-gray-600">
              School Health Records Management System
            </CardDescription>
            <div className="text-xs text-green-600 font-medium mt-2">
              🇰🇪 Kenya Secondary Schools
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-200 focus:scale-105"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 transition-all duration-200 focus:scale-105"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 transition-all duration-200 focus:scale-105"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : isSignUp ? (
                <UserPlus className="w-4 h-4 mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmailSent(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors duration-200"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-3 h-3" />
              <p>Secure access for authorized school personnel only</p>
            </div>
            <p className="text-green-600 font-medium">🇰🇪 Designed for Kenyan Secondary Schools</p>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="w-8 h-1 bg-green-600 rounded"></div>
              <div className="w-8 h-1 bg-blue-600 rounded"></div>
              <div className="w-8 h-1 bg-orange-600 rounded"></div>
              <div className="w-8 h-1 bg-red-600 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
