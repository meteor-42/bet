import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  correct: number;
  total: number;
  streak: number;
}

const mockData: LeaderboardEntry[] = [
  { rank: 1, name: "Alex Chen", points: 2456, correct: 45, total: 60, streak: 8 },
  { rank: 2, name: "Maria Lopez", points: 2234, correct: 42, total: 58, streak: 5 },
  { rank: 3, name: "John Smith", points: 2156, correct: 40, total: 56, streak: 3 },
  { rank: 4, name: "Emma Wilson", points: 1998, correct: 38, total: 55, streak: 7 },
  { rank: 5, name: "David Brown", points: 1887, correct: 36, total: 53, streak: 2 },
];

export const Leaderboard = () => {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "font-bold text-foreground";
      case 2:
        return "font-semibold text-foreground";
      case 3:
        return "font-semibold text-foreground";
      default:
        return "font-medium text-foreground";
    }
  };

  return (
    <Card className="p-6 border border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-foreground">Таблица лидеров</h2>
          <p className="text-sm text-muted-foreground">Лучшие игроки сезона</p>
        </div>

        <div className="space-y-2">
          {mockData.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between p-4 border border-border hover:bg-muted/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <span className={`text-lg w-8 ${getRankStyle(entry.rank)}`}>
                  #{entry.rank}
                </span>
                
                <div>
                  <h3 className="font-medium text-foreground">{entry.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {entry.correct}/{entry.total} верных
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">очков</div>
                </div>
                
                {entry.streak > 0 && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Target size={12} className="text-muted-foreground" />
                    {entry.streak}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Ваша позиция: <span className="font-medium text-foreground">#12</span> из 1,247 игроков
          </p>
        </div>
      </div>
    </Card>
  );
};