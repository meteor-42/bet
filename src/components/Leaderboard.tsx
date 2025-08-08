import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Medal, Award } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export const Leaderboard = () => {
  const { leaderboard, loading } = useLeaderboard();

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border border-border">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Загрузка лидерборда...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-foreground">Таблица лидеров</h2>
          <p className="text-sm text-muted-foreground">Лучшие игроки сезона</p>
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.player.id}
              className="flex items-center justify-between p-4 border border-border hover:bg-muted/30 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-12">
                  {getRankIcon(entry.player.rank_position)}
                  <span className={`text-lg ${getRankStyle(entry.player.rank_position)}`}>
                    #{entry.player.rank_position}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">{entry.player.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {entry.player.correct_predictions}/{entry.player.total_predictions} верных • {entry.accuracy}% точность
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    {entry.player.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">очков</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Всего игроков: <span className="font-medium text-foreground">{leaderboard.length}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Обновлено: {new Date().toLocaleString('ru-RU')}
          </p>
        </div>
      </div>
    </Card>
  );
};
