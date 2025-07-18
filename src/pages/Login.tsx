import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/ui/auth/LoginForm';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Mock authentication - replace with real authentication later
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      if (username === 'admin' && password === 'admin123') {
        toast({
          title: "خوش آمدید",
          description: "با موفقیت وارد سیستم شدید",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "خطا در ورود",
          description: "نام کاربری یا رمز عبور اشتباه است",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "مشکلی در اتصال به سرور رخ داده است",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
}