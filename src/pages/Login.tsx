import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Users, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayersCount } from '@/hooks/usePlayersCount';
import { useBetsCount } from '@/hooks/useBetsCount';

// Получение версии из package.json
const VERSION = "1.0.0";

export const Login = () => {
  const { login, isLoading, user } = useAuth();
  const { playersCount, loading: playersLoading } = usePlayersCount();
  const { betsCount, loading: betsLoading } = useBetsCount();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Если пользователь уже авторизован, перенаправляем на главную
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      return;
    }

    setIsSubmitting(true);
    const success = await login(credentials);

    if (success) {
      // Перенаправление произойдет автоматически через Navigate выше
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border border-border">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto">
              <div className="w-6 h-6 bg-primary-foreground rounded-sm"></div>
            </div>
            <h1 className="text-2xl font-medium text-foreground">Футбольные прогнозы</h1>
            <p className="text-sm text-muted-foreground">
              Войдите в систему для участия
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Введите E-mail"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !credentials.email || !credentials.password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </form>

          {/* Stats & Registration */}
         <div className="pt-4 border-t border-border">
            <div className="text-center space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    Зарегистрировано:{' '}
                    {playersLoading ? (
                      <span className="inline-block w-8 h-4 bg-muted rounded animate-pulse"></span>
                    ) : (
                      <span className="font-medium text-foreground">{playersCount}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>
                    Ставок принято:{' '}
                    {betsLoading ? (
                      <span className="inline-block w-8 h-4 bg-muted rounded animate-pulse"></span>
                    ) : (
                      <span className="font-medium text-foreground">{betsCount}</span>
                    )}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Регистрация — в телеграме{' '}
                <a
                  href="https://t.me/fabiocapello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  @fabiocapello
                </a>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Версия {VERSION}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
