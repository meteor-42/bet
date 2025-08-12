import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, type AuthUser, type LoginCredentials } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Проверяем, является ли пользователь админом
  const isAdmin = user?.role === 'admin';

  // Проверяем сохраненную сессию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Функция входа
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('email', credentials.email)
        .eq('password', credentials.password)
        .single();

      if (error || !data) {
        toast({
          title: "Ошибка входа",
          description: "Неверный email или пароль",
          variant: "destructive"
        });
        return false;
      }

      const authUser: AuthUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        points: data.points,
        correct_predictions: data.correct_predictions,
        total_predictions: data.total_predictions,
        rank_position: data.rank_position
      };

      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      toast({
        title: "Успешный вход",
        description: `Добро пожаловать, ${data.name}!`
      });

      return true;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы"
    });
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
