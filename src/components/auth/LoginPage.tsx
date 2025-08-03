
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, UserPlus, LogIn, Eye, EyeOff, Stethoscope, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('nurse');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/');
    }
  };

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

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
      if (!fullName.trim()) {
        toast.error('Full name is required');
        return false;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }

      if (!role) {
        toast.error('Please select a role');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        cleanupAuthState();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          console.log('Signout error (expected):', err);
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            toast.error('This email is already registered. Please sign in instead.');
            setIsSignUp(false);
          } else if (error.message.includes('Invalid email')) {
            toast.error('Please enter a valid email address.');
          } else {
            toast.error(`Account creation failed: ${error.message}`);
          }
        } else if (data.user) {
          console.log('User created successfully:', data.user.id);
          
          // Insert profile data
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                user_id: data.user.id,
                email: email.trim(),
                full_name: fullName.trim(),
                user_role: role,
                role: role
              });
            
            if (profileError) {
              console.error('Profile creation error:', profileError);
            } else {
              console.log('Profile created successfully');
            }
          } catch (profileErr) {
            console.error('Profile creation failed:', profileErr);
          }

          toast.success('Account created successfully! Please check your email to verify your account.');
          setIsSignUp(false);
          // Clear form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
          setRole('nurse');
        }
      } else {
        cleanupAuthState();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          console.log('Signout error (expected):', err);
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error('Login error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please verify your email address before signing in.');
          } else {
            toast.error(`Sign in failed: ${error.message}`);
          }
        } else if (data.user) {
          console.log('User signed in successfully:', data.user.id);
          toast.success('Welcome! Loading your dashboard...');
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'nurse', label: 'School Nurse', icon: Heart, description: 'Manage student health records and clinic visits' },
    { value: 'admin', label: 'System Administrator', icon: Shield, description: 'Full system access and user management' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white">
        <CardHeader className="text-center space-y-4 pb-6 bg-white">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">SHRMS</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              School Health Records Management System
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="bg-white">
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-white border-gray-300"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white border-gray-300"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12 bg-white border-gray-300"
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 h-12 bg-white border-gray-300"
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

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-12 bg-white border-gray-300">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {roles.map((roleOption) => {
                        const Icon = roleOption.icon;
                        return (
                          <SelectItem key={roleOption.value} value={roleOption.value} className="hover:bg-gray-50">
                            <div className="flex items-start space-x-3 py-2">
                              <Icon className="w-5 h-5 mt-0.5 text-blue-600" />
                              <div>
                                <span className="font-semibold text-gray-900">{roleOption.label}</span>
                                <p className="text-xs text-gray-500 mt-1">{roleOption.description}</p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : isSignUp ? (
                <UserPlus className="w-5 h-5 mr-2" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
                setRole('nurse');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-500 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-3 h-3" />
              <p>Secure access for authorized school personnel only</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
