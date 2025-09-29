
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, UserPlus, LogIn, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    }
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!email.trim()) {
      validationErrors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        validationErrors.push('Please enter a valid email address');
      }
    }

    if (!password) {
      validationErrors.push('Password is required');
    } else if (password.length < 6) {
      validationErrors.push('Password must be at least 6 characters long');
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        validationErrors.push('Full name is required');
      }

      if (!confirmPassword) {
        validationErrors.push('Please confirm your password');
      } else if (password !== confirmPassword) {
        validationErrors.push('Passwords do not match');
      }

      if (!role) {
        validationErrors.push('Please select a role');
      }
    }

    return validationErrors;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      if (isSignUp) {
        console.log('Starting signup process for:', email);
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim(),
              role: role
            }
          }
        });

        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('User already registered')) {
            setErrors(['This email is already registered. Please sign in instead.']);
            setIsSignUp(false);
          } else if (error.message.includes('Unable to validate email address')) {
            setErrors(['Invalid email address format.']);
          } else if (error.message.includes('Password should be at least 6 characters')) {
            setErrors(['Password must be at least 6 characters long.']);
          } else {
            setErrors([error.message]);
          }
        } else if (data.user) {
          console.log('User created successfully:', data.user.id);
          if (data.user.email_confirmed_at) {
            // Email is already confirmed, user can sign in immediately
            toast.success('Account created successfully! You are now signed in.');
            navigate('/');
          } else {
            // Email confirmation required
            toast.success('Account created! Please check your email to verify your account before signing in.');
            setIsSignUp(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setFullName('');
          }
        }
      } else {
        console.log('Attempting sign in for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error('Login error:', error);
          if (error.message.includes('Invalid login credentials')) {
            setErrors(['Invalid email or password. Please check your credentials.']);
          } else if (error.message.includes('Email not confirmed')) {
            setErrors(['Please verify your email address before signing in. Check your email for a confirmation link.']);
          } else if (error.message.includes('Too many requests')) {
            setErrors(['Too many login attempts. Please wait a few minutes before trying again.']);
          } else {
            setErrors([error.message]);
          }
        } else if (data.user && data.session) {
          console.log('User signed in successfully:', data.user.id);
          toast.success('Welcome! Redirecting to dashboard...');
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrors(['Authentication failed. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { 
      value: 'nurse', 
      label: 'School Nurse', 
      icon: Heart, 
      description: 'Manage student health records, clinic visits, and medical care'
    },
    { 
      value: 'admin', 
      label: 'System Administrator', 
      icon: Shield, 
      description: 'Full system access, user management, and system configuration'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-background to-medical-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-professional border shadow-medical">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="icon-container bg-gradient-to-r from-primary to-accent mx-auto animate-pulse-glow">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">SHRMS</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              School Health Records Management System
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-professional h-12"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-professional h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-professional pr-10 h-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-professional pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                    Role *
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="input-professional h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      {roles.map((roleOption) => {
                        const Icon = roleOption.icon;
                        return (
                          <SelectItem key={roleOption.value} value={roleOption.value} className="hover:bg-muted/50">
                            <div className="flex items-start space-x-3 py-2">
                              <Icon className="w-5 h-5 mt-0.5 text-primary" />
                              <div>
                                <span className="font-semibold text-foreground">{roleOption.label}</span>
                                <p className="text-xs text-muted-foreground mt-1">{roleOption.description}</p>
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
              className="btn-primary w-full h-12 font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors([]);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFullName('');
                setRole('nurse');
              }}
              className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              disabled={loading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>

          {isSignUp && (
            <div className="text-xs text-muted-foreground text-center bg-muted/20 p-3 rounded-lg">
              <p className="font-medium mb-1">Note:</p>
              <p>After creating your account, you may need to verify your email address before you can sign in.</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center border-t border-border pt-4">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-3 h-3" />
              <p>Secure access for authorized school personnel only</p>
            </div>
            <p className="mt-2">🇰🇪 Kenyan School Health Management System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
