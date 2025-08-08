import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useBets } from "@/hooks/useBets";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const MyBets = () => {
  const { user } = useAuth();
  const { bets, isLoading } = useBets(user?.id);
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 5;

  const totalPoints = bets
    .filter(bet => bet.is_calculated)
    .reduce((sum, bet) => sum + (bet.points_earned || 0), 0);

  const totalPages = Math.ceil(bets.length / betsPerPage);
  const startIndex = (currentPage - 1) * betsPerPage;
  const currentBets = bets.slice(startIndex, startIndex + betsPerPage);

  const getStatusText = (bet: typeof bets[0]) => {
    if (!bet.is_calculated) return "Ожидание";
    if ((bet.points_earned || 0) === 3) return "Точный счет";
    if ((bet.points_earned || 0) === 1) return "Исход";
    return "Промах";
  };

  const getStatusVariant = (bet: typeof bets[0]) => {
    if (!bet.is_calculated) return "secondary";
    if ((bet.points_earned || 0) > 0) return "default";
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">У вас пока нет ставок</p>
        <p className="text-sm text-muted-foreground mt-2">Сделайте ставку на предстоящий матч!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b border-border">
        <p className="text-lg text-muted-foreground">
          Всего очков из ставок: <span className="font-medium text-foreground">{totalPoints}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Всего ставок: {bets.length} • Рассчитано: {bets.filter(b => b.is_calculated).length}
        </p>
      </div>

      <div className="space-y-4">
        {currentBets.map((bet) => (
          <Card key={bet.id} className="p-6 border border-border hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header with date/time and points badge */}
              <div className="flex items-start justify-between">
                <div className="text-sm text-muted-foreground font-medium">
                  {bet.match.match_date} • {bet.match.match_time}
                </div>
                <Badge
                  variant={getStatusVariant(bet)}
                  className="text-sm px-3 py-1"
                >
                  {bet.is_calculated
                    ? `${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0} очков`
                    : getStatusText(bet)
                  }
                </Badge>
              </div>

              {/* Team names and league */}
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  {bet.match.home_team} vs {bet.match.away_team}
                </h3>
                <p className="text-sm text-muted-foreground">{bet.match.league} • {bet.match.stage}</p>
              </div>

              {/* Prediction vs Result */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Мой прогноз
                  </div>
                  <div className="text-2xl font-bold text-foreground bg-muted/50 rounded-lg px-4 py-2 min-w-[80px]">
                    {bet.predicted_home_score}-{bet.predicted_away_score}
                  </div>
                </div>

                <div className="text-muted-foreground text-lg font-medium">
                  vs
                </div>

                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Результат
                  </div>
                  <div className="text-2xl font-bold text-foreground bg-muted rounded-lg px-4 py-2 min-w-[80px]">
                    {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null
                      ? `${bet.match.home_score}-${bet.match.away_score}`
                      : "—"
                    }
                  </div>
                </div>
              </div>

              {/* Match status */}
              <div className="text-center">
                <Badge variant={
                  bet.match.status === 'finished' ? 'default' :
                  bet.match.status === 'live' ? 'destructive' : 'secondary'
                }>
                  {bet.match.status === 'finished' ? 'Завершен' :
                   bet.match.status === 'live' ? 'Идет' : 'Ожидается'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
