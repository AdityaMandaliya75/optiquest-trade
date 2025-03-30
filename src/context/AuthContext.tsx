
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(auth === 'true');
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // This would be replaced with a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth token
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/login');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
