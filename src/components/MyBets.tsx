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
import { Separator } from "@/components/ui/separator";

export const MyBets = () => {
  const { user } = useAuth();
  const { bets, isLoading } = useBets(user?.id);
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 10;

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
      {/* Header summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-medium text-foreground">Мои ставки</h3>
          <p className="text-sm text-muted-foreground">Всего: {bets.length} • Рассчитано: {bets.filter(b => b.is_calculated).length}</p>
        </div>
        <div className="text-sm text-muted-foreground">Очки всего: <span className="font-medium text-foreground">{totalPoints}</span></div>
      </div>

      {/* Bets list styled like admin cards, mobile friendly */}
      <div className="space-y-3">
        {currentBets.map((bet, idx) => (
          <Card key={bet.id} className="p-4 sm:p-6 border border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded bg-muted flex items-center justify-center text-xs sm:text-sm text-muted-foreground">#{startIndex + idx + 1}</div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {bet.match.match_date} • {bet.match.match_time} (МСК)
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-foreground">
                    {bet.match.home_team} <span className="text-muted-foreground">vs</span> {bet.match.away_team}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {bet.match.league}{typeof bet.match.tour === 'number' ? ` • ${bet.match.tour} ТУР` : ''}
                  </div>
                </div>
              </div>
              <Badge variant={getStatusVariant(bet)} className="px-2.5 py-1 text-xs sm:text-sm">
                {bet.is_calculated ? `ОЧКИ: ${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0}` : getStatusText(bet)}
              </Badge>
            </div>

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-stretch">
              <div className="text-center p-3 sm:p-4 border border-border rounded">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">Мой прогноз</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {bet.predicted_home_score}-{bet.predicted_away_score}
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 border border-border rounded">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">Результат</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null ? `${bet.match.home_score}-${bet.match.away_score}` : '—'}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <Badge variant={
                bet.match.status === 'finished' ? 'default' :
                bet.match.status === 'live' ? 'destructive' : 'secondary'
              }>
                {bet.match.status === 'finished' ? 'Завершен' : bet.match.status === 'live' ? 'Идет' : 'Ожидается'}
              </Badge>
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
