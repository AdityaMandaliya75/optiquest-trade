
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, UserPlus, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real application, this would make an API call to authenticate
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth token in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      toast({
        title: "Login successful",
        description: "Welcome back to TradeSim",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real application, this would make an API call to register
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your details and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">TradeSim</CardTitle>
          <CardDescription>
            Paper Trading Platform for the Indian Market
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" className="px-0 text-xs font-normal h-auto">
                      Forgot password?
                    </Button>
                  </div>
                  <Input id="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">Logging in...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Log in <LogIn className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="email@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">Registering...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Register <UserPlus className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center text-sm text-muted-foreground p-4">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => navigate('/dashboard')}
            >
              Continue as Guest <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
