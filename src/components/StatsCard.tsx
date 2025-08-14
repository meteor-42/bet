import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatItem {
  label: string;
  value: string;
  change?: string;
}

export const StatsCard = () => {
  const { user } = useAuth();
  const { stats, loading, error, refreshStats } = usePlayerStats();

  if (!user) {
    return (
      <Card className="p-6 border border-border">
        <div className="text-center text-muted-foreground">
          Войдите в систему для просмотра статистики
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Загрузка статистики...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border border-border">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Ошибка загрузки статистики</p>
          <Button variant="outline" size="sm" onClick={refreshStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  // Расчет количества дней с момента регистрации
  const calculateDaysSince = (dateString: string | undefined) => {
    if (!dateString) return 0;
    const registrationDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - registrationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statsItems: StatItem[] = [
    {
      label: "Очков",
      value: stats?.points?.toLocaleString() || "0",
    },
    { 
      label: "Точность",
      value: `${stats?.accuracy || 0}%`,
    },
    {
      label: "Верных",
      value: `${stats?.correct_predictions || 0}`,
    },
    {
      label: "Ставок",
      value: `${stats?.total_predictions || 0}`,
    },
    {
      label: "Место",
      value: stats?.rank_position ? `#${stats.rank_position}` : "—",
    }
  ];

  // Форматируем дату регистрации
  const registrationDate = stats?.created_at
    ? new Date(stats.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Неизвестно';

  const daysSinceRegistration = calculateDaysSince(stats?.created_at);

  return (
    <Card className="p-6 border border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-foreground">Статистика</h2>
            <p className="text-sm text-muted-foreground">Результаты ваших прогнозов</p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={refreshStats}
            className="flex-shrink-0"
            title="Обновить"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statsItems.map((stat, index) => (
            <div
              key={index}
              className="p-4 border border-border hover:bg-muted/30 transition-colors duration-200"
            >
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className="flex items-baseline justify-center space-x-2">
                  <p className="text-lg font-medium text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border border-border">
          <div className="text-sm text-center space-y-1">
            <p className="text-foreground">
              Вы зарегистрированы с {registrationDate}
            </p>
            <p className="text-muted-foreground">
              ({daysSinceRegistration} {daysSinceRegistration === 1 ? 'день' :
                daysSinceRegistration < 5 ? 'дня' : 'дней'})
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
