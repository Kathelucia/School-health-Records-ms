import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    role: 'nurse' 
  });
  const [debugProfileOpen, setDebugProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in (fallback: check localStorage)
    const checkUser = async () => {
      let loggedIn = false;
      try {
        if (typeof window !== 'undefined') {
          // Supabase v1/v2: check for access token
          const keys = Object.keys(localStorage);
          loggedIn = keys.some(k => k.includes('supabase.auth.token') || k.includes('sb-'));
        }
      } catch {}
      if (loggedIn) {
        window.location.href = '/';
      }
    };
    checkUser();
  }, []);

  const cleanupAuthState = () => {
    // Clean up any existing auth state
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      cleanupAuthState();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim(),
        password: loginData.password,
      });
      if (error) {
        if (error.message && error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else {
          toast.error(error.message || 'Login failed.');
        }
        setIsLoading(false);
        return;
      }
      if (data.user) {
        toast.success('Login successful! Redirecting...');
        setTimeout(() => { window.location.href = '/'; }, 500);
      }
    } catch (error: any) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (signupData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }
      if (!signupData.fullName.trim()) {
        toast.error('Full name is required');
        setIsLoading(false);
        return;
      }
      cleanupAuthState();
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim(),
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName.trim(),
            role: signupData.role
          }
        }
      });
      if (error) {
        if (error.message && error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message || 'Signup failed.');
        }
        setIsLoading(false);
        return;
      }
      if (data.user) {
        toast.success('Account created! You can now sign in.');
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        if (loginTab) loginTab.click();
        setLoginData({ ...loginData, email: signupData.email });
      }
    } catch (error: any) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug profile fetch
  const handleDebugProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    setProfile(null);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      setProfile(data.user);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to fetch profile');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">School Health Records</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="nurse@school.edu"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register as a medical staff member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      placeholder="Dr. Jane Smith"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="jane.smith@school.edu"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-role">Role</Label>
                    <select
                      id="signup-role"
                      value={signupData.role}
                      onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    >
                      <option value="nurse">School Nurse</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="Create a strong password"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>For demo purposes, you can create an account with any valid email.</p>
          <p>Admin accounts have full access to all features.</p>
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setDebugProfileOpen(true);
              handleDebugProfile();
            }}
          >
            Debug Profile
          </Button>
        </div>
        <Dialog open={debugProfileOpen} onOpenChange={setDebugProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Current User Profile</DialogTitle>
              <DialogDescription>
                {profileLoading && <span>Loading...</span>}
                {profileError && <span className="text-red-500">{profileError}</span>}
                {profile && (
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto mt-2">{JSON.stringify(profile, null, 2)}</pre>
                )}
                {!profileLoading && !profile && !profileError && <span>No user logged in.</span>}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;
