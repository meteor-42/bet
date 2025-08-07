import { Card } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string;
  change?: string;
}

export const StatsCard = () => {
  const stats: StatItem[] = [
    {
      label: "Всего очков",
      value: "1,234",
    },
    {
      label: "Точность",
      value: "72%",
    },
    {
      label: "Верных ставок",
      value: "45/60",
    },
    {
      label: "Место",
      value: "#12",
    }
  ];

  return (
    <Card className="p-6 border border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-foreground">Cтатистика</h2>
          <p className="text-sm text-muted-foreground">Результаты ваших прогнозов</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
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
          <p className="text-sm text-foreground text-center">
            Вы зарегистрированы с 15 дек 2024
          </p>
        </div>
      </div>
    </Card>
  );
};