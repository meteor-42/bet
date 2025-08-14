import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useBets } from "@/hooks/useBets";
import { useAllBets } from "@/hooks/useAllBets";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { bets: myBets, isLoading: myBetsLoading } = useBets(user?.id);
  const { allBets, isLoading: allBetsLoading } = useAllBets();

  const [currentTab, setCurrentTab] = useState("my");
  const [currentPage, setCurrentPage] = useState(1);
  const [allBetsCurrentPage, setAllBetsCurrentPage] = useState(1);
  const [selectedTour, setSelectedTour] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const betsPerPage = 7; // Изменено с 10 на 7

  // Фильтрация всех ставок
  const filteredAllBets = allBets.filter(bet => {
    const tourMatch = selectedTour === "all" || bet.match.tour?.toString() === selectedTour;
    const searchMatch = !searchTerm ||
      bet.match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return tourMatch && searchMatch;
  });

  // Получить уникальные туры
  const uniqueTours = Array.from(
    new Set(allBets.map(bet => bet.match.tour).filter(tour => tour !== null && tour !== undefined))
  ).sort((a, b) => a - b);

  // Пагинация для моих ставок
  const myBetsTotalPages = Math.ceil(myBets.length / betsPerPage);
  const myBetsStartIndex = (currentPage - 1) * betsPerPage;
  const currentMyBets = myBets.slice(myBetsStartIndex, myBetsStartIndex + betsPerPage);

  // Пагинация для всех ставок
  const allBetsTotalPages = Math.ceil(filteredAllBets.length / betsPerPage);
  const allBetsStartIndex = (allBetsCurrentPage - 1) * betsPerPage;
  const currentAllBets = filteredAllBets.slice(allBetsStartIndex, allBetsStartIndex + betsPerPage);

  const totalPoints = myBets
    .filter(bet => bet.is_calculated)
    .reduce((sum, bet) => sum + (bet.points_earned || 0), 0);

  const getStatusText = (bet: typeof myBets[0]) => {
    if (!bet.is_calculated) return "Не рассчитано";
    if ((bet.points_earned || 0) === 3) return "Точный счет";
    if ((bet.points_earned || 0) === 1) return "Исход";
    return "Промах";
  };

  const getStatusVariant = (bet: typeof myBets[0]) => {
    if (!bet.is_calculated) return "secondary";
    if ((bet.points_earned || 0) > 0) return "default";
    return "outline";
  };

  const resetFilters = () => {
    setSelectedTour("all");
    setSearchTerm("");
    setAllBetsCurrentPage(1);
  };

  const renderCompactBetsList = (bets: typeof myBets | typeof allBets, showPlayer = false, currentPageNum = 1, indexOffset = 0) => {
    if (bets.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {showPlayer ? "Ставки не найдены" : "У вас пока нет ставок"}
          </p>
          {!showPlayer && (
            <p className="text-sm text-muted-foreground mt-2">Сделайте ставку на предстоящий матч!</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {bets.map((bet, idx) => (
          <Card key={bet.id} className="p-3 border border-border">
            {/* Desktop view - one line */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="shrink-0 w-6 h-6 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  #{indexOffset + idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {bet.match.match_date} {bet.match.match_time}
                    </span>
                    <span className="font-medium text-foreground">
                      {bet.match.home_team} vs {bet.match.away_team}
                    </span>
                    {bet.match.tour && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        ТУР {bet.match.tour}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Прогноз: {bet.predicted_home_score}-{bet.predicted_away_score}
                    </span>
                    {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Результат: {bet.match.home_score}-{bet.match.away_score}
                      </span>
                    )}
                    {showPlayer && 'player' in bet && (
                      <span className="text-xs text-muted-foreground">• {bet.player.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={
                  bet.match.status === 'finished' ? 'default' :
                  bet.match.status === 'live' ? 'destructive' : 'secondary'
                } className="text-xs whitespace-nowrap">
                  {bet.match.status === 'finished' ? 'Завершен' : bet.match.status === 'live' ? 'Идет' : 'Ожидается'}
                </Badge>
                <Badge variant={getStatusVariant(bet)} className="text-xs whitespace-nowrap">
                  {bet.is_calculated ? `${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0}` : getStatusText(bet)}
                </Badge>
              </div>
            </div>

            {/* Mobile view - column layout */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="shrink-0 w-6 h-6 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    #{indexOffset + idx + 1}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {bet.match.match_date} {bet.match.match_time}
                  </span>
                </div>
                {bet.match.tour && (
                  <span className="text-xs font-medium text-muted-foreground">
                    ТУР {bet.match.tour}
                  </span>
                )}
              </div>

              <div className="font-medium text-sm text-foreground">
                {bet.match.home_team} vs {bet.match.away_team}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Прогноз: <span className="font-medium">{bet.predicted_home_score}-{bet.predicted_away_score}</span>
                </span>
                {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null && (
                  <span className="text-xs text-muted-foreground">
                    Результат: <span className="font-medium">{bet.match.home_score}-{bet.match.away_score}</span>
                  </span>
                )}
              </div>

              {showPlayer && 'player' in bet && (
                <div className="text-xs text-muted-foreground">
                  Игрок: {bet.player.name}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant={
                  bet.match.status === 'finished' ? 'default' :
                  bet.match.status === 'live' ? 'destructive' : 'secondary'
                } className="text-xs">
                  {bet.match.status === 'finished' ? 'Завершен' : bet.match.status === 'live' ? 'Идет' : 'Ожидается'}
                </Badge>
                <Badge variant={getStatusVariant(bet)} className="text-xs">
                  {bet.is_calculated ? `${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0}` : getStatusText(bet)}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my">Мои ставки</TabsTrigger>
          <TabsTrigger value="all">Все ставки</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-6">
          {/* Header summary для моих ставок */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-medium text-foreground">Мои ставки</h3>
              <p className="text-sm text-muted-foreground">Всего: {myBets.length} • Рассчитано: {myBets.filter(b => b.is_calculated).length}</p>
            </div>
            <div className="text-sm text-muted-foreground">Очки всего: <span className="font-medium text-foreground">{totalPoints}</span></div>
          </div>

          {myBetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
            </div>
          ) : (
            <>
              {renderCompactBetsList(currentMyBets, false, currentPage, myBetsStartIndex)}

              {/* Пагинация для моих ставок */}
              {myBetsTotalPages > 1 && (
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

                    {Array.from({ length: myBetsTotalPages }, (_, i) => i + 1).map((page) => (
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
                          if (currentPage < myBetsTotalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === myBetsTotalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {/* Фильтры для всех ставок */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по командам или игроку..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedTour} onValueChange={setSelectedTour}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите тур" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все туры</SelectItem>
                    {uniqueTours.map((tour) => (
                      <SelectItem key={tour} value={tour.toString()}>
                        Тур {tour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedTour !== "all" || searchTerm) && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Сбросить
                </Button>
              )}
            </div>
          </Card>

          {/* Статистика для всех ставок */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{filteredAllBets.length}</div>
              <div className="text-sm text-muted-foreground">Всего ставок</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {Array.from(
                  new Map(allBets.map(bet => [bet.player.id, bet.player])).values()
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Игроков</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {filteredAllBets.filter(bet => bet.is_calculated).length}
              </div>
              <div className="text-sm text-muted-foreground">Рассчитано</div>
            </Card>
          </div>

          {allBetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
            </div>
          ) : (
            <>
              {renderCompactBetsList(currentAllBets, true, allBetsCurrentPage, allBetsStartIndex)}

              {/* Пагинация для всех ставок */}
              {allBetsTotalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (allBetsCurrentPage > 1) setAllBetsCurrentPage(allBetsCurrentPage - 1);
                        }}
                        className={allBetsCurrentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: allBetsTotalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setAllBetsCurrentPage(page);
                          }}
                          isActive={allBetsCurrentPage === page}
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
                          if (allBetsCurrentPage < allBetsTotalPages) setAllBetsCurrentPage(allBetsCurrentPage + 1);
                        }}
                        className={allBetsCurrentPage === allBetsTotalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
